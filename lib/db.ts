import mongoose from "mongoose";

if (!process.env.MONGO_URI) {
  throw new Error("process.env.MONGO_URI is missing in .env.local");
}

// Use global object to track connection across hot reloads (useful for Next.js)
declare global {
  var mongooseConnection: Promise<typeof mongoose> | undefined;
}

export const connectToDatabase = async () => {
  if (global.mongooseConnection) {
    return global.mongooseConnection;
  }

  try {
    global.mongooseConnection = mongoose.connect(process.env.MONGO_URI!);
    return global.mongooseConnection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

// Ensure connection runs only once when the server starts
connectToDatabase();
