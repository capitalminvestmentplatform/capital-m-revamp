import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { loggedIn, parseForm } from "@/utils/server";
import { sendErrorResponse, sendSuccessResponse } from "@/utils/apiResponse";
import { uploadFileToCloudinary } from "@/lib/upload";
import { NextRequest } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const decoded: any = await loggedIn();
    const userId = decoded.id;

    // Parse form data (multipart/form-data)
    const { files } = await parseForm(req);
    const file = files?.image?.[0] || files?.image;

    if (!file) {
      return sendErrorResponse(400, "No image file uploaded");
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadFileToCloudinary(
      file,
      "capital-m-revamp/user/profile"
    );

    // Find and update user
    const user = await User.findById(userId);
    if (!user) {
      return sendErrorResponse(404, "User not found");
    }

    user.image = imageUrl; // assuming you have this field in your User model
    await user.save();

    return sendSuccessResponse(200, "Profile image updated successfully", {
      profileImage: imageUrl,
    });
  } catch (error) {
    return sendErrorResponse(500, "Internal server error", error);
  }
}
