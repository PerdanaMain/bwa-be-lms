import CourseModel from "../models/course.model.js";
import { mutateCourseSchema } from "../utils/schema.js";
import CategoryModel from "../models/category.model.js";
import fs from "fs";
import UserModel from "../models/user.model.js";
import path from "path";

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
        category: {
          name: "programming",
        },
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
export const updateCourse = async (req, res) => {
  try {
    const body = req.body;
    const parse = mutateCourseSchema.safeParse(body);
    const courseId = req.params.id;

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
    const oldCourse = await CourseModel.findById(courseId);

    if (!category) {
      return res.status(404).json({
        message: "categoryId not found",
      });
    }

    await CourseModel.findByIdAndUpdate(
      {
        _id: courseId,
      },
      {
        name: parse.data.name,
        categoryId: parse.data.categoryId,
        description: parse.data.description,
        tagline: parse.data.tagline,
        thumbnail: req?.file ? req?.file?.filename : oldCourse.thumbnail,
        manager: req.user._id,
      }
    );

    return res.status(201).json({
      message: "Course updated successfully",
      data: await CourseModel.findById(courseId),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findById(id);
    const filePath = path.join(
      path.resolve(),
      "public/uploads/courses",
      course.thumbnail
    );

    if (fs.existsSync(path)) {
      fs.unlinkSync(filePath);
    }

    await CourseModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};
