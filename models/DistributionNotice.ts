import mongoose, { Schema, Document, models } from "mongoose";

const DistributionNoticeSchema = new Schema(
  {
    // Reference to the User model
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    commitmentName: {
      type: String,
      default: null,
    },
    distributionDate: {
      type: Date,
      required: true,
    },
    distributionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
    pdf: {
      type: String,
      default: null,
    },
  },

  { timestamps: true }
);

const DistributionNotice =
  models.DistributionNotice ||
  mongoose.model("DistributionNotice", DistributionNoticeSchema);

export default DistributionNotice;
