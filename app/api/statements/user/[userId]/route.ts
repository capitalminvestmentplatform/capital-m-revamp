import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { loggedIn } from "@/utils/server";
import Statement from "@/models/Statement";
import { sendSuccessResponse, sendErrorResponse } from "@/utils/apiResponse";
import { Types } from "mongoose";
import User from "@/models/User";

const allowedSort = new Set(["createdAt", "month", "year"]);

/**
 * Month/Year search:
 *  - "Dec", "December"
 *  - "2022"
 *  - "Dec 2022" / "December 2022" (any order)
 *
 * IMPORTANT: When using $regexMatch we pass a PLAIN STRING + options (no RegExp with flags),
 * to avoid Mongo's "regex option(s) specified in both 'regex' and 'options'" error.
 */
function buildMonthYearSearch(search: string) {
  if (!search) return {};
  const s = search.trim();
  const tokens = s.split(/\s+/);

  const monthMap: Record<string, [string, string]> = {
    jan: ["Jan", "January"],
    feb: ["Feb", "February"],
    mar: ["Mar", "March"],
    apr: ["Apr", "April"],
    may: ["May", "May"],
    jun: ["Jun", "June"],
    jul: ["Jul", "July"],
    aug: ["Aug", "August"],
    sep: ["Sep", "September"],
    sept: ["Sep", "September"],
    oct: ["Oct", "October"],
    nov: ["Nov", "November"],
    dec: ["Dec", "December"],
    january: ["Jan", "January"],
    february: ["Feb", "February"],
    march: ["Mar", "March"],
    april: ["Apr", "April"],
    june: ["Jun", "June"],
    july: ["Jul", "July"],
    august: ["Aug", "August"],
    september: ["Sep", "September"],
    october: ["Oct", "October"],
    november: ["Nov", "November"],
    december: ["Dec", "December"],
  };

  let monthRegex: RegExp | null = null;
  let yearNum: number | null = null;

  for (const t of tokens) {
    const k = t.toLowerCase();
    if (monthMap[k]) {
      const [abbr, full] = monthMap[k];
      monthRegex = new RegExp(`^(${abbr}|${full})$`, "i");
    } else if (/^\d{4}$/.test(t)) {
      yearNum = Number(t);
    }
  }

  const and: any[] = [];
  if (monthRegex) and.push({ month: monthRegex });
  if (yearNum !== null) and.push({ year: yearNum });
  if (and.length) return { $and: and };

  const safe = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    $or: [
      { month: { $regex: safe, $options: "i" } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: "$year" },
            regex: safe,
            options: "i",
          },
        },
      },
    ],
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    const isAdmin = String(decoded?.role || "").toLowerCase() === "admin";

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limit = Math.max(1, Math.min(100, Number(sp.get("limit") || 10)));
    const search = (sp.get("search") || "").trim();

    const sortByParam = sp.get("sortBy") || "createdAt";
    const sortBy = (
      allowedSort.has(sortByParam) ? sortByParam : "createdAt"
    ) as "createdAt" | "month" | "year";
    const sortOrder: 1 | -1 = sp.get("sortOrder") === "asc" ? 1 : -1;

    const { userId } = await params;
    const myUserId = decoded?._id || decoded?.id;

    if (!isAdmin && String(userId) !== String(myUserId)) {
      return sendErrorResponse(403, "Forbidden");
    }

    const filter: any = { userId, ...buildMonthYearSearch(search) };

    const total = await Statement.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    // Helper to build the shared aggregation (for month/year sorts)
    const buildMonthAwarePipeline = (
      match: any,
      sortStage: Record<string, 1 | -1>
    ) => {
      const months = [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec",
      ];
      return [
        { $match: match },
        // derive month index 0..11 from month string ("Sep"/"September" -> 8)
        {
          $addFields: {
            _monthKey: { $toLower: { $substrCP: ["$month", 0, 3] } },
          },
        },
        {
          $addFields: {
            _monthIndex: { $indexOfArray: [months, "$_monthKey"] },
          },
        },
        { $sort: sortStage },
        { $skip: skip },
        { $limit: limit },
        { $unset: ["_monthKey", "_monthIndex"] },
        {
          $project: {
            _id: 1,
            month: 1,
            year: 1,
            createdAt: 1,
            pdf: 1,
          },
        },
      ] as any[];
    };

    // We need aggregation for month and year to get calendar-correct month order
    if (sortBy === "month" || sortBy === "year") {
      if (!Types.ObjectId.isValid(userId)) {
        return sendErrorResponse(400, "Invalid userId");
      }

      const match = {
        userId: new Types.ObjectId(userId),
        ...buildMonthYearSearch(search),
      };

      const sortStage =
        sortBy === "month"
          ? // Group by month across years, then year within the month
            { _monthIndex: sortOrder, year: sortOrder, createdAt: -1 }
          : // Sort by year, then by month within each year
            { year: sortOrder, _monthIndex: sortOrder, createdAt: -1 };

      const pipeline = buildMonthAwarePipeline(match, sortStage);
      const items = await Statement.aggregate(pipeline).exec();

      const user = await User.findById(userId)
        .select("firstName lastName clientCode")
        .lean();
      const username = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : "";
      const clientCode = user ? user.clientCode : "";

      return sendSuccessResponse(200, "User statements fetched!", {
        username,
        items,
        clientCode,
        pagination: { total, page: safePage, limit, totalPages },
      });
    }

    // Default path (createdAt)
    const list = await Statement.find({
      userId,
      ...buildMonthYearSearch(search),
    })
      .sort({ [sortBy]: sortOrder }) // only hits when sortBy === "createdAt"
      .skip(skip)
      .limit(limit)
      .lean();

    const user = await User.findById(userId)
      .select("firstName lastName clientCode")
      .lean();
    const username = user
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "";
    const clientCode = user ? user.clientCode : "";

    return sendSuccessResponse(200, "User statements fetched!", {
      username,
      items: list,
      clientCode,
      pagination: { total, page: safePage, limit, totalPages },
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
