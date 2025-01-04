import CourseModel from "../models/course.model.js";
import { mutateCourseSchema } from "../utils/schema.js";
import CategoryModel from "../models/category.model.js";
import fs from "fs";
import UserModel from "../models/user.model.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({
      manager: req.user?._id,
    })
      .select("name thumbnail")
      .populate({
        path: "category",
        select: "name", // exclude _id
      })
      .populate({
        path: "students",
        select: "name",
      });

    const image_url = process.env.APP_URL + "/uploads/courses/";
    const response = courses.map((course) => {
      return {
        ...course.toObject(),
        thumbnail_url: image_url + course.thumbnail,
        total_students: course.students.length,
      };
    });

    res.status(200).json({
      message: "Get all courses successfully",
      data: response,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

export const postCourse = async (req, res) => {
  try {
    const body = req.body;
    const parse = mutateCourseSchema.safeParse(body);

    console.log(req.file);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      // remove the file already uploaded
      if (req?.file?.path && fs.existsSync(req?.file?.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        message: "Invalid input",
        detail: errorMessages,
      });
    }

    const category = await CategoryModel.findById(parse.data.categoryId);

    if (!category) {
      return res.status(404).json({
        message: "categoryId not found",
      });
    }

    const course = new CourseModel({
      name: parse.data.name,
      categoryId: parse.data.categoryId,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: req?.file?.filename,
      manager: req.user._id,
    });

    await course.save();
    await CategoryModel.findByIdAndUpdate(
      category._id,
      {
        // push to courses array
        $push: { courses: course._id },
      },
      { new: true }
    );
    await UserModel.findByIdAndUpdate(
      req.user?._id,
      {
        // push to courses array
        $push: { courses: course._id },
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Course created successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};
