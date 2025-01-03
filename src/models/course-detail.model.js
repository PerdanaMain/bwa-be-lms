import mongoose from "mongoose";

const courseDetailModel = mongoose.Schema(
  {
    title: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.String,
      enum: ["video", "text"],
      default: "video",
    },
    videoId: mongoose.Schema.Types.String, // optional
    text: mongoose.Schema.Types.String, // optional
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("CourseDetail", courseDetailModel);
