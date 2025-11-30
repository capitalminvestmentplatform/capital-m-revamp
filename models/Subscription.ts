import mongoose, { Schema, Document, models } from "mongoose";

const SubscriptionSchema = new Schema(
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

    terms: {
      type: String,
    },
    statements: {
      type: String,
    },
    sign: {
      type: String,
    },
    capitalCall: {
      type: Boolean,
      default: false,
    },
    send: {
      type: Boolean,
      default: false,
    },
    signedSubscription: {
      type: String,
    },
  },

  { timestamps: true }
);

const Subscription =
  models.Subscription || mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
