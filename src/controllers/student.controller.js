import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import {
  uploadToCloudinary,
  getUrlCloudinary,
  destroyImageCloudinary,
} from "../utils/cloudinary.js";
import { mutateStudentSchema } from "../utils/schema.js";
import CourseModel from "../models/course.model.js";

export const getStudents = async (req, res) => {
  try {
    const students = await UserModel.find({
      role: "student",
      manager: req?.user?._id,
    });

    const data = students?.map((item) => {
      return {
        ...item.toObject(),
        photoUrl: getUrlCloudinary(item?.photo),
      };
    });

    return res.status(200).json({
      message: "Get students successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error?.message,
    });
  }
};

export const getStudent = async (req, res) => {
  try {
    const { id } = req?.param;

    const student = await UserModel.findById(id);

    return res.status(200).json({
      message: "Get students successfully",
      student,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error?.message,
    });
  }
};

export const postStudent = async (req, res) => {
  try {
    const body = req.body;
    const parse = mutateStudentSchema.safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      return res.status(500).json({
        message: "Invalid input",
        detail: errorMessages,
      });
    }

    const photo = await uploadToCloudinary(req?.file?.buffer);
    const hashPassword = bcrypt.hashSync(body?.password, 12);

    const student = new UserModel({
      name: parse?.data?.name,
      email: parse?.data?.email,
      password: hashPassword,
      photo: photo?.public_id,
      manager: req?.user?._id,
      role: "student",
    });

    await student.save();

    return res.status(200).json({
      message: "Create student successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error?.message,
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req?.params;
    const body = req?.body;
    const parse = mutateStudentSchema
      .partial({
        password: true,
      })
      .safeParse(body);

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      return res.status(500).json({
        message: "Invalid input",
        detail: errorMessages,
      });
    }

    const oldStudent = await UserModel.findById(id);
    const photoInfo = {
      public_id: oldStudent?.photo || "",
    };

    if (req?.file) {
      const photo = await uploadToCloudinary(req?.file?.buffer);
      photoInfo.public_id = photo?.public_id;
    }

    const hashPassword = parse?.data?.password
      ? bcrypt.hashSync(body?.password, 12)
      : oldStudent?.password;

    await UserModel.findByIdAndUpdate(id, {
      name: parse?.data?.name,
      email: parse?.data?.email,
      password: hashPassword,
      photo: photoInfo.public_id,
    });

    return res.status(200).json({
      message: "Update student successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error?.message,
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req?.params;
    const student = await UserModel.findById(id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found!",
        data: null,
      });
    }

    await CourseModel.findOneAndUpdate(
      {
        students: student?._id,
      },
      {
        $pull: {
          students: student?._id,
        },
      }
    );

    await destroyImageCloudinary(student?.photo);
    await UserModel.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Delete student successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error?.message,
    });
  }
};
