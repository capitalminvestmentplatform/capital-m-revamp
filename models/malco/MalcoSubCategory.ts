import mongoose, { Schema, Document, models } from "mongoose";

const MalcoSubcategorySchema = new Schema(
  {
    name: { type: String },
    category: { type: Schema.Types.ObjectId, ref: "MalcoCategory" },
  },
  { timestamps: true }
);

const MalcoSubcategory =
  models.MalcoSubcategory ||
  mongoose.model("MalcoSubcategory", MalcoSubcategorySchema);

export default MalcoSubcategory;
