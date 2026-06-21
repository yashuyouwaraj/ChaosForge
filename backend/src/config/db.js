const mongoose = require("mongoose");

const redactMongoUri = (uri) => {
  try {
    const parsed = new URL(uri);
    if (parsed.password) {
      parsed.password = "***";
    }
    return parsed.toString();
  } catch {
    return uri;
  }
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB Connected 🚀");
  } catch (err) {
    const mongoUri = process.env.MONGO_URI || "not configured";
    const isLocalMongo =
      mongoUri.includes("127.0.0.1:27017") ||
      mongoUri.includes("localhost:27017");

    console.error("MongoDB connection failed:", err.message);

    if (isLocalMongo) {
      console.error(
        "Local MongoDB is not reachable. Start it with: docker compose up -d mongo"
      );
    }

    console.error(`MONGO_URI=${redactMongoUri(mongoUri)}`);
    throw err;
  }
};

module.exports = connectDB;
