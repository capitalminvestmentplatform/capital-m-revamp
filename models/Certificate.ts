import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificate extends Document {
  userId: mongoose.Types.ObjectId | null; // ref to User — null for guests
  userName: string; // firstName + lastName (from User) OR guest full name
  email: string; // from User OR guest email
  googleDriveUrl: string; // editable by admin — changing this never affects QR
  qrToken: string; // stable UUID embedded in QR URL — never changes
  qrCode: string; // base64 PNG generated once at creation
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: {
      type: String,
      required: [true, "userName is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
    },
    googleDriveUrl: {
      type: String,
      required: [true, "Google Drive URL is required"],
      trim: true,
    },
    qrToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
