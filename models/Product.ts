import mongoose, { Schema, Document, models } from "mongoose";

const ProjectedReturnSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["percentage", "amount"], // % or AED
      required: true,
    },
    mode: {
      type: String,
      enum: ["fixed", "range"], // single value or range
      required: true,
    },
    fixedValue: {
      type: Number, // e.g. 20 (% or AED depending on type)
    },
    minValue: {
      type: Number, // e.g. 10 (% or AED)
    },
    maxValue: {
      type: Number, // e.g. 20 (% or AED)
    },
    currency: {
      type: String,
      default: "AED", // only relevant if type === "amount"
    },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    productId: {
      type: String,
    },
    title: { type: String },
    tagline: { type: String },
    description: { type: String },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    status: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    currentValue: {
      type: Number,
    },
    expectedValue: {
      type: Number,
    },
    projectedReturn: ProjectedReturnSchema,

    minInvestment: {
      type: Number,
    },
    subscriptionFee: {
      type: Number,
    },
    managementFee: {
      type: Number,
    },
    performanceFee: {
      type: Number,
    },
    activationDate: {
      type: Date,
    },
    expirationDate: {
      type: Date,
    },
    commitmentDeadline: {
      type: Date,
    },
    investmentDuration: {
      type: Number,
    },
    state: {
      type: String,
    },
    area: {
      type: String,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },

    // ✅ Media fields
    galleryImages: [{ type: String }], // multiple image URLs
    featuredImage: { type: String }, // main image URL
    video: { type: String }, // video URL or path
    docs: [{ type: String }], // document URLs or file paths
    terms: { type: String }, // terms and conditions URL or path
    faqs: [
      {
        question: { type: String },
        answer: { type: String },
      },
    ],
  },

  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", ProductSchema);

export default Product;
