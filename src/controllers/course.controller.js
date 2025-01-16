import CourseModel from "../models/course.model.js";
import { mutateCourseSchema } from "../utils/schema.js";
import CategoryModel from "../models/category.model.js";
import fs from "fs";
import UserModel from "../models/user.model.js";
import path from "path";
import cloudinary from "../utils/cloudinary.js";

export const getCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({
      manager: req.user?._id,
    })
      .select("name thumbnail")
      .populate({
        path: "category",
        select: "name -_id",
      })
      .populate({
        path: "students",
        select: "name",
      });

    const response = courses.map((course) => {
      return {
        ...course.toObject(),
        thumbnailUrl: cloudinary.url(course.thumbnail),
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

    const thumbnailInfo = await cloudinary.uploader.upload(req?.file?.path, {
      folder: "bwa-lms",
    });

    const course = new CourseModel({
      name: parse.data.name,
      category: category._id,
      description: parse.data.description,
      tagline: parse.data.tagline,
      thumbnail: thumbnailInfo.public_id,
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

    if (req?.file?.path && fs.existsSync(req?.file?.path)) {
      fs.unlinkSync(req.file.path);
    }

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
    const courseId = req.params.id;

    const parse = mutateCourseSchema.safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      return res.status(500).json({
        message: "Error Validation",
        data: null,
        errors: errorMessages,
      });
    }

    const category = await CategoryModel.findById(parse.data.categoryId);
    const oldCourse = await CourseModel.findById(courseId);

    if (!category) {
      return res.status(500).json({
        message: "Category Id not found",
      });
    }

    const updateData = {
      name: req.body.name,
      category: req.body.categoryId,
      description: req.body.description,
      tagline: req.body.tagline,
      manager: req.user._id,
    };

    if (req?.file?.path && fs.existsSync(req?.file?.path)) {
      await cloudinary.uploader.destroy(oldCourse.thumbnail);

      const thumbnail = await cloudinary.uploader.upload(req?.file?.path, {
        folder: "bwa-lms",
      });
      updateData.thumbnail = thumbnail.public_id;

      fs.unlinkSync(req.file.path);
    }

    const course = await CourseModel.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.json({
      message: "Update Course Success",
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await CourseModel.findById(id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    await cloudinary.uploader.destroy(course.thumbnail);
    await CourseModel.findByIdAndDelete(id);

    return res.json({
      message: "Delete course success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
};
