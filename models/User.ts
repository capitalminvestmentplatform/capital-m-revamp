import mongoose, { Schema, Document, models } from "mongoose";

// Define the User schema
const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^\d{4}$/.test(v); // Ensures password is exactly 4 digits
        },
        message: "Password must be a 4-digit PIN",
      },
    },
    role: {
      type: String,
      enum: ["Admin", "User"],
      default: "User",
    },
    clientCode: {
      type: String,
      sparse: true,
    },
    portfolioId: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
      default: null, // Stores the hashed reset token
    },
    resetPasswordExpires: {
      type: Date,
      default: null, // Expiry time for the reset token
    },
    image: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    invite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent model re-compilation in Next.js
const User = models.User || mongoose.model("User", UserSchema);

export default User;
