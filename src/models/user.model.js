import mongoose from "mongoose";

const userModel = new mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    photo: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    email: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    password: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.String,
      enum: ["manager", "student"],
      default: "manager",
    },
  },
  {
    timestamp: true,
  }
);

export default mongoose.model("User", userModel);
