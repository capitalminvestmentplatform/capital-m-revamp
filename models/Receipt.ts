import mongoose, { Schema, Document, models } from "mongoose";

const ReceiptSchema = new Schema(
  {
    receiptId: {
      type: String,
    },
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

    pdf: {
      type: String,
    },
    commitmentAmount: {
      type: Number,
    },
    send: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

const Receipt = models.Receipt || mongoose.model("Receipt", ReceiptSchema);

export default Receipt;
