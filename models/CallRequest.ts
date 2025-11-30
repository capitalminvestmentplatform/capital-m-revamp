import mongoose, { Schema, Document, models } from "mongoose";

const CallRequestSchema = new Schema(
  {
    phone: { type: String },
    message: {
      type: String,
    },

    // Reference to the Product model
    pId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },

    // Reference to the User model
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },

  { timestamps: true }
);

const CallRequest =
  models.CallRequest || mongoose.model("CallRequest", CallRequestSchema);

export default CallRequest;
