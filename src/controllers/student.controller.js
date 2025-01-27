import UserModel from "../models/user.model.js";

export const getStudents = async (req, res) => {
  try {
    const students = await UserModel.find({
      role: "student",
      manager: req?.user?._id,
    });

    return res.status(200).json({
      message: "Get students successfully",
      data: students,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      detail: error?.message,
    });
  }
};
