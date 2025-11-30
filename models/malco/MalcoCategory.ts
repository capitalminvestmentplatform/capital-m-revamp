import mongoose, { Schema, Document, models } from "mongoose";

const MalcoCategorySchema = new Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

const MalcoCategory =
  models.MalcoCategory || mongoose.model("MalcoCategory", MalcoCategorySchema);

export default MalcoCategory;
