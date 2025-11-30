import mongoose, { Schema, Document, models } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

const Category = models.Category || mongoose.model("Category", CategorySchema);

export default Category;
