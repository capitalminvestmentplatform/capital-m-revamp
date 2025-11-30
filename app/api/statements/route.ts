import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import Statement from "@/models/Statement";
import User from "@/models/User";
import { statementEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

const allowedSort = new Set(["createdAt", "month", "year", "clientCode"]);

// ───────────────────────── search helper (unchanged) ─────────────────────────
function buildMonthYearSearch(search: string) {
  if (!search) return {};
  const s = search.trim();
  const tokens = s.split(/\s+/);

  const m: Record<string, [string, string]> = {
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
    const key = t.toLowerCase();
    if (m[key]) {
      const [abbr, full] = m[key];
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

export async function GET(req: NextRequest) {
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

    // ────────────── ADMIN: grouped by user (clientCode + month/year search + sort + pagination) ──────────────
    if (isAdmin) {
      const orFilters: any[] = [];

      if (search) {
        const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matchedUsers = await User.find(
          { clientCode: { $regex: safe, $options: "i" } },
          { _id: 1 }
        ).lean();
        if (matchedUsers.length) {
          orFilters.push({ userId: { $in: matchedUsers.map((u) => u._id) } });
        }
      }

      const monthYear = buildMonthYearSearch(search);
      if (Object.keys(monthYear).length) orFilters.push(monthYear);

      const match = orFilters.length ? { $or: orFilters } : {};

      const totalUsers = (await Statement.distinct("userId", match)).length;
      const totalPages = Math.max(1, Math.ceil(totalUsers / limit));
      const safePage = Math.min(page, totalPages);
      const skip = (safePage - 1) * limit;

      // We'll compute a month index for the user's latest statement for proper sorting.
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

      const pipeline: any[] = [
        { $match: match },
        { $sort: { createdAt: -1 } }, // ensure $first is latest
        {
          $group: {
            _id: "$userId",
            latest: { $first: "$$ROOT" },
            statementsCount: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            statementsCount: 1,
            latestStatementId: "$latest._id",
            latestMonth: "$latest.month",
            latestYear: "$latest.year",
            latestCreatedAt: "$latest.createdAt",
            latestPdf: "$latest.pdf",
            username: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: ["$user.firstName", ""] },
                    " ",
                    { $ifNull: ["$user.lastName", ""] },
                  ],
                },
              },
            },
            email: "$user.email",
            clientCode: "$user.clientCode",
          },
        },
        // Compute a numeric index for latestMonth so sorting is calendar-correct
        {
          $addFields: {
            _latestMonthKey: {
              $toLower: { $substrCP: ["$latestMonth", 0, 3] },
            },
          },
        },
        {
          $addFields: {
            _latestMonthIndex: {
              $indexOfArray: [months, "$_latestMonthKey"],
            },
          },
        },
        {
          $sort:
            sortBy === "createdAt"
              ? { latestCreatedAt: sortOrder }
              : sortBy === "month"
                ? {
                    _latestMonthIndex: sortOrder,
                    latestYear: sortOrder,
                    latestCreatedAt: -1,
                  }
                : sortBy === "year"
                  ? {
                      latestYear: sortOrder,
                      _latestMonthIndex: sortOrder,
                      latestCreatedAt: -1,
                    }
                  : sortBy === "clientCode"
                    ? { clientCode: sortOrder, latestCreatedAt: -1 }
                    : { latestCreatedAt: sortOrder },
        },
        { $skip: skip },
        { $limit: limit },
        { $unset: ["_latestMonthKey", "_latestMonthIndex"] },
      ];

      const rows = await Statement.aggregate(pipeline).exec();
      return sendSuccessResponse(200, "Users with latest statements fetched!", {
        mode: "latest",
        items: rows,
        pagination: { total: totalUsers, page: safePage, limit, totalPages },
      });
    }

    // ────────────── CLIENT: own statements with full filters ──────────────
    const myUserId = decoded?._id || decoded?.id;
    if (!myUserId) return sendErrorResponse(401, "Unauthorized");

    const filter: any = { userId: myUserId, ...buildMonthYearSearch(search) };

    const total = await Statement.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    // For calendar-correct ordering, aggregate only when sorting by month or year.
    if (sortBy === "month" || sortBy === "year") {
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

      const pipeline: any[] = [
        {
          $match: {
            userId: myUserId,
            ...buildMonthYearSearch(search),
          },
        },
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
        {
          $sort:
            sortBy === "month"
              ? { _monthIndex: sortOrder, year: sortOrder, createdAt: -1 }
              : sortBy === "year"
                ? { year: sortOrder, _monthIndex: sortOrder, createdAt: -1 }
                : sortBy === "clientCode"
                  ? { clientCode: sortOrder, createdAt: -1 }
                  : { createdAt: sortOrder },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "_user",
          },
        },
        { $unwind: { path: "$_user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            month: 1,
            year: 1,
            createdAt: 1,
            pdf: 1,
            username: {
              $trim: {
                input: {
                  $concat: [
                    { $ifNull: ["$_user.firstName", ""] },
                    " ",
                    { $ifNull: ["$_user.lastName", ""] },
                  ],
                },
              },
            },
            email: { $ifNull: ["$_user.email", ""] },
            clientCode: { $ifNull: ["$_user.clientCode", ""] },
          },
        },
      ];

      const items = await Statement.aggregate(pipeline).exec();

      return sendSuccessResponse(200, "My statements fetched!", {
        mode: "user",
        items,
        pagination: { total, page: safePage, limit, totalPages },
      });
    }

    // Default path (createdAt): simple find() is fine
    const list = await Statement.find(filter)
      .sort({ [sortBy]: sortOrder }) // only 'createdAt' lands here
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email",
      })
      .lean();

    const items = list.map((doc: any) => {
      const { userId, ...rest } = doc;
      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        email: userId?.email || "",
        clientCode: userId?.clientCode || "",
      };
    });

    return sendSuccessResponse(200, "My statements fetched!", {
      mode: "user",
      items,
      pagination: { total, page: safePage, limit, totalPages },
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const { userId, month, year, pdf } = await req.json();

    let user = null;

    user = await User.findById(userId);

    // 🔒 Prevent duplicate statements
    const existingStatement = await Statement.findOne({ userId, month, year });
    if (existingStatement) {
      return sendErrorResponse(
        400,
        `Statement for ${month} ${year} already exists.`
      );
    }

    const { email, clientCode, firstName, lastName } = user;

    const statement = new Statement({
      userId,
      month,
      year,
      pdf,
    });

    await statement.save();

    const notify = {
      title: "You've Got a New Statement",
      message: `New statement is added for Month: ${month} ${year}`,
      type: "info",
    };

    await sendNotification(email, notify);

    await pusherServer.trigger(`user-${email}`, "new-notification", {
      ...notify,
      timestamp: new Date(),
    });

    const date = new Date();
    const formattedDate = date.toLocaleString("en-US", {
      month: "short", // "Jan", "Feb", etc.
      year: "numeric", // 2025
    }); // e.g., "Jun 2025"

    const id = statement.id;

    await statementEmail(
      {
        firstName,
        lastName,
        email,
        clientCode,
        month,
        year,
        id,
        attachment: {
          file: pdf,
          name: `Statement - ${formattedDate}.pdf`,
        },
      },
      `Statement - ${formattedDate} - Capital M`
    );

    return sendSuccessResponse(201, "Statement added successfully!", statement);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
