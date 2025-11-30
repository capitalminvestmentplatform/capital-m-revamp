import mongoose, { Schema, Document, models } from "mongoose";

const ImageSchema = new Schema(
  {
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true }, // To delete from Cloudinary if needed
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Image = models.Image || mongoose.model("Image", ImageSchema);

export default Image;
