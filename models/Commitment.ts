import mongoose, { Schema, Document, models } from "mongoose";

const CommitmentSchema = new Schema(
  {
    phone: { type: String },
    commitmentAmount: { type: Number },
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

const Commitment =
  models.Commitment || mongoose.model("Commitment", CommitmentSchema);

export default Commitment;
