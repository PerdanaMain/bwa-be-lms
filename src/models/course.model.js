import mongoose from "mongoose";
import categoryModel from "./category.model.js";
import courseDetailModel from "./course-detail.model.js";

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
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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

// Cascade delete course details when course is deleted
courseModel.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await categoryModel.findByIdAndUpdate(doc.category, {
      $pull: { courses: doc._id },
    });

    await courseDetailModel.deleteMany({ course: doc._id });

    doc.students?.map(async (std) => {
      await userModel.findByIdAndUpdate(std._id, {
        $pull: { courses: doc._id },
      });
    });
  }
});

export default mongoose.model("Course", courseModel);
