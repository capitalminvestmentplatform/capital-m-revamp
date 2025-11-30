import mongoose, { Schema, models } from "mongoose";

const AdminInvestmentsSchema = new Schema(
  {
    category: { type: String },
    subCategory: { type: String },
    userAsset: { type: String },
    costPrice: { type: Number },
    marketValue: { type: Number },
    initialCost: { type: Number },
    email: { type: String },
    clientCode: { type: String },
  },
  { timestamps: true }
);

const AdminInvestments =
  models.AdminInvestments ||
  mongoose.model("AdminInvestments", AdminInvestmentsSchema);

export default AdminInvestments;
