import mongoose, { Schema, models } from "mongoose";

const PandaConnectInvestmentsSchema = new Schema(
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

const PandaConnectInvestments =
  models.PandaConnectInvestments ||
  mongoose.model("PandaConnectInvestments", PandaConnectInvestmentsSchema);

export default PandaConnectInvestments;
