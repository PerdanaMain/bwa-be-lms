import mongoose from "mongoose";

export default async function connectDB() {
  const DATABASE_URL = process.env.DATABASE_URL ?? "";

  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "bwaLmsDatabase",
    });
  } catch (error) {
    console.log("Database connection failed", error.message);
    process.exit(1);
  }

  const dbConn = mongoose.connection;

  dbConn.once("open", (_) => {
    console.log(`Database connected: ${DATABASE_URL}`);
  });

  dbConn.once("error", (err) => {
    console.log(`Database error: ${err}`);
  });
}
