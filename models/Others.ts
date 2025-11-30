import mongoose, { Schema, models } from "mongoose";

const OthersSchema = new Schema(
  {
    others: { type: Number },
    email: { type: String },
    clientCode: { type: String },
  },
  { timestamps: true }
);

const Others = models.Others || mongoose.model("Others", OthersSchema);

export default Others;
