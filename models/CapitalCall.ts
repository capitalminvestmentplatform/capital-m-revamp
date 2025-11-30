import mongoose, { Schema, Document, models } from "mongoose";

const CapitalCallSchema = new Schema(
  {
    commitmentId: {
      type: Schema.Types.ObjectId,
      ref: "Commitment",
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

    message: {
      type: String,
      default: "",
    },
    pdf: {
      type: String,
    },
    send: {
      type: Boolean,
      default: false,
    },
    receipt: {
      type: Boolean,
      default: false,
    },

    bankName: {
      type: String,
    },
    accountName: {
      type: String,
    },
    IBAN: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    swiftCode: {
      type: String,
    },
    branch: {
      type: String,
    },
  },

  { timestamps: true }
);

const CapitalCall =
  models.CapitalCall || mongoose.model("CapitalCall", CapitalCallSchema);

export default CapitalCall;
