import CourseModel from "../models/course.model.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({
      manager: req.user?._id,
    })
      .select("name thumbnail")
      .populate({
        path: "category",
        select: "name -_id", // exclude _id
      })
      .populate({
        path: "students",
        select: "name",
      });
    res.status(200).json({
      message: "Get all courses successfully",
      data: courses,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};
