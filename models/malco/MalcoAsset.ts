import mongoose, { Schema, Document, models } from "mongoose";

const MalcoAssetSchema = new Schema(
  {
    assetName: { type: String, required: true },
    assetNameNormalized: { type: String, index: true }, // <-- add this
    longName: { type: String, default: "" },
    category: {
      type: Schema.Types.ObjectId,
      ref: "MalcoCategory",
      required: true,
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "MalcoSubcategory",
      required: true,
    },
    isin: { type: String, default: "" },
    pandaId: { type: Number, default: "" },
    byAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// normalize helper (lowercase + collapse spaces)
function normalizeName(s: string) {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

MalcoAssetSchema.pre("insertMany", function (next, docs: any[]) {
  docs.forEach((doc) => {
    if (doc.assetName && !doc.assetNameNormalized) {
      doc.assetNameNormalized = normalizeName(doc.assetName);
    }
  });
  next();
});

MalcoAssetSchema.pre("validate", function (next) {
  // @ts-ignore
  if (this.assetName) {
    // @ts-ignore
    this.assetNameNormalized = normalizeName(this.assetName as string);
  }
  next();
});

const MalcoAsset =
  models.MalcoAsset || mongoose.model("MalcoAsset", MalcoAssetSchema);

export default MalcoAsset;
