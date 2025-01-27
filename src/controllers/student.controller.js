import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import { uploadToCloudinary, getUrlCloudinary } from "../utils/cloudinary.js";
import { mutateStudentSchema } from "../utils/schema.js";

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
