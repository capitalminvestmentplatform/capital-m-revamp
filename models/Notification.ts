import mongoose, { Schema, Document, models } from "mongoose";

interface INotification extends Document {
  to: string; // Email of the recipient
  title: string;
  message: string;
  type: "info" | "alert" | "warning";
  read: boolean;
  createdAt: Date;
  url: string;
}

const NotificationSchema = new Schema<INotification>(
  {
    to: { type: String, required: true }, // Recipient email
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "alert", "warning"], default: "info" },
    read: { type: Boolean, default: false }, // Read status
    url: { type: String, default: "" }, // Optional URL for more details
  },
  { timestamps: true }
);

const Notification =
  models.Notification || mongoose.model("Notification", NotificationSchema);

export default Notification;
