import User from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import jwt from "jsonwebtoken";
import { accountVerificationEmail, welcomeEmail } from "@/templates/emails";
import { loggedIn, sendNotification } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { NextRequest } from "next/server";
import { pusherServer } from "@/lib/pusher-server";

export async function getUsers(req: NextRequest) {
  try {
    await connectToDatabase();

    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Number(sp.get("page") || 1));
    const limitParam = Number(sp.get("limit") || 10);
    const limit = Math.max(1, Math.min(100, limitParam));
    const search = (sp.get("search") || "").trim();
    const sortBy = sp.get("sortBy") || "createdAt";
    const sortOrder = sp.get("sortOrder") === "asc" ? 1 : -1;

    const all = sp.get("all") === "true";

    // ✅ If all=true → return ALL users, no search/pagination
    if (all) {
      const users = await User.find({}, "-password")
        .sort({ createdAt: -1 }) // always sort by createdAt desc
        .lean();

      return sendSuccessResponse(200, "Users fetched successfully", {
        users,
        pagination: {
          total: users.length,
          page: 1,
          limit: users.length,
          totalPages: 1,
          all: true,
        },
      });
    }

    // ✅ Normal mode: with search & pagination
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let filter: Record<string, any> = {};
    if (search) {
      const rx = new RegExp(esc(search), "i");
      filter = {
        $or: [{ clientCode: rx }, { firstName: rx }, { lastName: rx }],
      };
    }

    const total = await User.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const users = await User.find(filter, "-password")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return sendSuccessResponse(200, "Users fetched successfully", {
      users,
      pagination: {
        total,
        page: safePage,
        limit,
        totalPages,
        all: false,
      },
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

const getPandaConnectPortfolios = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}api/panda-connect/portfolio`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "3114" }),
      },
    );

    const response = await res.json();
    if (!res.ok) {
      throw new Error(response.message || "Failed to fetch portfolios");
    }
    const portfolios = response.data;
    return portfolios;
  } catch (error) {
    console.error("Email API Error:", error);
  }
};

export async function createUser(req: NextRequest) {
  try {
    await connectToDatabase();
    const {
      firstName,
      lastName,
      username,
      phone,
      clientCode,
      email,
      password,
      confirmPassword,
      role,
    } = await req.json();

    const decoded: any = await loggedIn();

    // Check if the user is an admin
    if (decoded.role !== "Admin") {
      return sendErrorResponse(403, "Access denied");
    }

    // Validate PIN format (exactly 4 digits)
    if (!/^\d{4}$/.test(password)) {
      return sendErrorResponse(400, "Password must be a 4-digit PIN");
    }

    // Ensure password and confirmPassword match
    if (password !== confirmPassword) {
      return sendErrorResponse(400, "Passwords do not match");
    }
    // Check if the user already exists
    let existingUser = null;
    if (role === "Admin") {
      existingUser = await User.findOne({
        $or: [{ email }],
      });
    } else {
      existingUser = await User.findOne({
        $or: [{ email }, { clientCode }],
      });
    }

    if (existingUser) {
      return sendErrorResponse(409, "User already exists");
    }
    let portfolios;
    let portfolio;
    if (role !== "Admin") {
      portfolios = await getPandaConnectPortfolios();
      if (!portfolios) {
        return sendErrorResponse(500, "Failed to fetch portfolios");
      }
      portfolio = portfolios.find((p: any) => p.name.includes(clientCode));
    }

    // if (!portfolio) {
    //   return sendErrorResponse(
    //     404,
    //     "Portfolio against provided client code not found"
    //   );
    // }

    const jwtSecret = process.env.JWT_SECRET as string;
    const verificationToken = jwt.sign(
      { email, id: "userId", role: "User" },
      jwtSecret,
      {
        expiresIn: "24h",
      },
    );

    const newUser = new User({
      firstName,
      lastName,
      username,
      clientCode: clientCode ? clientCode : undefined,
      phone,
      email,
      password, // Store PIN as plain text (ensure database security measures)
      role,
      verificationToken,
      isVerified: true,
      portfolioId: portfolio.portfolio_id ? portfolio.portfolio_id : undefined,
    });

    await newUser.save();

    await welcomeEmail(
      { firstName, lastName, email, verificationToken, password },
      "Welcome to Capital M Investment Platform",
    );

    const admins = await User.find({
      role: "Admin",
      email: { $ne: decoded.email },
    });

    for (const admin of admins) {
      const notify = {
        title: "Say Hello to a New Member",
        message: `A new user ${firstName} ${lastName} has been registered.`,
        type: "info",
      };
      await sendNotification(admin.email, notify);

      await pusherServer.trigger(`user-${admin.email}`, "new-notification", {
        ...notify,
        timestamp: new Date(),
      });
    }

    return sendSuccessResponse(201, "User created successfully!", newUser);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
