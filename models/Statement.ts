import mongoose, { Schema, Document, models } from "mongoose";

const StatementSchema = new Schema(
  {
    // Reference to the User model
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    month: {
      type: String,
    },
    year: {
      type: Number,
    },
    pdf: {
      type: String,
    },
  },

  { timestamps: true }
);

const Statement =
  models.Statement || mongoose.model("Statement", StatementSchema);

export default Statement;
