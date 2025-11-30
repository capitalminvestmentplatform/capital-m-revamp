import mongoose, { Schema, Document, models } from "mongoose";

const NewsLetterSchema = new Schema(
  {
    // Reference to the User model
    userId: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    pId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    cId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    subject: {
      type: String,
    },
    description: {
      type: String,
    },
  },

  { timestamps: true }
);

const NewsLetter =
  models.NewsLetter || mongoose.model("NewsLetter", NewsLetterSchema);

export default NewsLetter;
