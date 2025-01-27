import fs from "fs";
import CategoryModel from "../models/category.model.js";
import CourseDetailModel from "../models/course-detail.model.js";
import CourseModel from "../models/course.model.js";
import UserModel from "../models/user.model.js";
import {
  uploadToCloudinary,
  getUrlCloudinary,
  destroyImageCloudinary,
} from "../utils/cloudinary.js";
import { mutateCourseSchema } from "../utils/schema.js";

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
        thumbnailUrl: getUrlCloudinary(course?.thumbnail),
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

export const getCourseById = async (req, res) => {
  try {
    const { preview } = req.query;
    const course = await CourseModel.findById(req.params.id)
      .populate({
        path: "category",
        select: "name _id",
      })
      .populate({
        path: "students",
        select: "name",
      })
      .populate({
        path: "details",
        select:
          preview === "true" ? "title type youtubeId text " : "title type",
      });

    const response = {
      ...course.toObject(),
      thumbnailUrl: getUrlCloudinary(course?.thumbnail),
      total_students: course.students.length,
    };

    return res.json({
      message: "Get course by id successfully",
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

    const thumbnailInfo = await uploadToCloudinary(req?.file?.buffer);

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

    await destroyImageCloudinary(oldCourse?.thumbnail);

    if (req?.file?.buffer) {
      const thumbnailInfo = await uploadToCloudinary(req?.file?.buffer);
      updateData.thumbnail = thumbnailInfo.public_id;
    }

    const course = await CourseModel.findByIdAndUpdate(courseId, updateData, {
      new: true,
    });

    return res.status(200).json({
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

    await destroyImageCloudinary(course?.thumbnail);

    await CourseModel.findByIdAndDelete(id);

    return res.status(200).json({
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

export const getContentCourse = async (req, res) => {
  try {
    const { id } = req?.params;

    const content = await CourseDetailModel.findById(id);

    return res.status(200).json({
      message: "Get content course successfully",
      data: content,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error?.message,
    });
  }
};

export const postContentCourse = async (req, res) => {
  try {
    const body = req.body;

    const course = await CourseModel.findById(body.courseId);

    const content = new CourseDetailModel({
      title: body.title,
      type: body.type,
      course: course._id,
      youtubeId: body.youtubeId,
      text: body.text,
    });

    await content.save();
    await CourseModel.findByIdAndUpdate(
      course._id,
      {
        $push: { details: content._id },
      },
      { new: true }
    );

    return res.status(201).json({
      message: "Content created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
};

export const updateContentCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const course = await CourseModel.findById(body.courseId);

    await CourseDetailModel.findByIdAndUpdate(
      id,
      {
        title: body.title,
        type: body.type,
        course: course._id,
        youtubeId: body.youtubeId,
        text: body.text,
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Content updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
};

export const deleteContentCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await CourseDetailModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Content deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error.message,
    });
  }
};
