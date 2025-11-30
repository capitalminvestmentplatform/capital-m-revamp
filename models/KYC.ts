import mongoose, { Schema, Document, models } from "mongoose";

const KYCSchema = new Schema(
  {
    // Reference to the User model
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    nationalId: {
      type: String,
    },
    nationalPassport: {
      type: String,
    },
    residenceProof: {
      type: String,
    },
  },

  { timestamps: true }
);

const KYC = models.KYC || mongoose.model("KYC", KYCSchema);

export default KYC;
