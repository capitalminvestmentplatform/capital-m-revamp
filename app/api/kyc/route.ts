import { connectToDatabase } from "@/lib/db";
import { pusherServer } from "@/lib/pusher-server";
import KYC from "@/models/KYC";
import User from "@/models/User";
import { kycEmail } from "@/templates/emails";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { loggedIn, sendNotification } from "@/utils/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all products and populate the category field (only 'name')
    const kycDocs = await KYC.find()
      .populate({
        path: "userId",
        select: "firstName lastName clientCode email", // grab raw fields
      })
      .lean();

    const formattedKycDocs = kycDocs.map((c) => {
      const { userId, pId, ...rest } = c;

      return {
        ...rest,
        username: `${userId?.firstName || ""} ${userId?.lastName || ""}`.trim(),
        email: userId?.email || "",
        clientCode: userId?.clientCode || "",
        userId: userId?._id || "",
      };
    });

    return sendSuccessResponse(
      200,
      "Kyc docs fetched successfully!",
      formattedKycDocs
    );
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const decoded: any = await loggedIn();
    const { userId, nationalId, nationalPassport, residenceProof } =
      await req.json();

    let user = null;

    user = await User.findById(userId);

    const { email, clientCode, firstName, lastName } = user;

    const kyc = new KYC({
      userId,
      nationalId,
      nationalPassport,
      residenceProof,
    });

    await kyc.save();

    const notify = {
      title: "KYC Added",
      message: `New kyc documents is added by ${decoded.role !== "Admin" ? `${firstName} ${lastName}` : "admin"}.`,
      type: "info",
    };

    let name = `${firstName} ${lastName}`.trim();
    if (decoded.role === "Admin") {
      await sendNotification(email, notify);

      await pusherServer.trigger(`user-${email}`, "new-notification", {
        ...notify,
        timestamp: new Date(),
      });
      await kycEmail(
        {
          name,
          email,
          isAdmin: decoded.role === "Admin" ? true : false,
        },
        `KYC Documents - Capital M`
      );
    } else {
      const users = await User.find({
        role: "Admin",
      });

      for (const user of users) {
        await sendNotification(user.email, notify);

        await pusherServer.trigger(`user-${user.email}`, "new-notification", {
          ...notify,
          timestamp: new Date(),
        });

        await kycEmail(
          {
            name,
            email: user.email,
            isAdmin: decoded.role === "Admin" ? true : false,
          },
          `KYC Documents - Capital M`
        );
      }
    }

    return sendSuccessResponse(201, "Kyc docs added successfully!", kyc);
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
