import mongoose from "mongoose";
import dns from "node:dns";
dns.setServers(["8.8.8.8"]);

// mongoose.connect(process.evv.MONGO_URI)

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error("Mongo DB Connection error", error);
    process.exit(1);
  }
};

export default connectDB;
