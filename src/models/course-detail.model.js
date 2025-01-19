import mongoose from "mongoose";
import CourseModel from "./course.model.js";

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
    youtubeId: mongoose.Schema.Types.String, // optional
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

courseDetailModel.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await CourseModel.findByIdAndUpdate(doc.course, {
      $pull: { details: doc._id },
    });
  }
});

export default mongoose.model("CourseDetail", courseDetailModel);
