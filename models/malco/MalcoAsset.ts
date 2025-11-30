import mongoose, { Schema, Document, models } from "mongoose";

const MalcoAssetSchema = new Schema(
  {
    assetName: { type: String, required: true, trim: true },
    longName: { type: String, default: "", trim: true },
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
    isin: { type: String, default: "", trim: true },
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

// keep normalized in sync
MalcoAssetSchema.pre("validate", function (next) {
  // @ts-ignore
  if (this.assetName) {
    // @ts-ignore
    this.assetNameNormalized = normalizeName(this.assetName);
  }
  next();
});

MalcoAssetSchema.index(
  { subCategory: 1, assetNameNormalized: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

const MalcoAsset =
  models.MalcoAsset || mongoose.model("MalcoAsset", MalcoAssetSchema);

export default MalcoAsset;
