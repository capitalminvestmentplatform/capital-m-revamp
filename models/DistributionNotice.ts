import mongoose, { Schema, Document, models } from "mongoose";

const DistributionNoticeSchema = new Schema(
  {
    // Reference to the User model
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    commitmentName: {
      type: String,
    },
    distributionDate: {
      type: Date,
    },
    distributionAmount: {
      type: Number,
    },
    description: {
      type: String,
    },
    pdf: {
      type: String,
    },
  },

  { timestamps: true }
);

const DistributionNotice =
  models.DistributionNotice ||
  mongoose.model("DistributionNotice", DistributionNoticeSchema);

export default DistributionNotice;
