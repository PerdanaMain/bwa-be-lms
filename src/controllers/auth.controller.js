import bcrypt from "bcrypt";
import userModel from "../models/user.model.js";

export const signUpAction = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashPassword = bcrypt.hashSync(password, 12);

    const user = new userModel({
      name,
      email,
      photo: "default.jpg",
      password: hashPassword,
      role: "manager",
    });

    // action payment gateway: midtrans

    await user.save();

    return res.status(201).json({
      message: "Sign Up Successfully",
      data: {
        midtrans_payment_url: "https://www.google.com",
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};
