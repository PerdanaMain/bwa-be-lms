import mongoose from "mongoose";

const courseModel = mongoose.Schema(
  {
    name: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    thumbnail: {
      type: mongoose.Schema.Types.String,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    tagline: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    description: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    students: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseDetail",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Course", courseModel);
