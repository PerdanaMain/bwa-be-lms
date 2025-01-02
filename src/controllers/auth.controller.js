import bcrypt from "bcrypt";
import UserModel from "../models/user.model.js";
import TransactionModel from "../models/transaction.model.js";
import jwt from "jsonwebtoken";

export const signUpAction = async (req, res) => {
  const midtransUrl = process.env.MIDTRANS_URL;
  const midtransAuthString = process.env.MIDTRANS_AUTH_STRING;
  const midtransCallbackUrl = process.env.MIDTRANS_CALLBACK_URL;

  try {
    const { name, email, password } = req.body;

    const hashPassword = bcrypt.hashSync(password, 12);

    const user = new UserModel({
      name,
      email,
      photo: "default.jpg",
      password: hashPassword,
      role: "manager",
    });

    // action payment gateway: midtrans
    const transaction = new TransactionModel({
      user: user._id,
      price: 280000,
    });

    const midtrans = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + midtransAuthString,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: transaction._id.toString(),
          gross_amount: transaction.price,
        },
        customer_details: {
          email: user.email,
        },
        callback: {
          finish: `${midtransCallbackUrl}/success-checkout`,
        },
      }),
    });

    const resMidtrans = await midtrans.json();

    await user.save();
    await transaction.save();

    return res.status(201).json({
      message: "Sign Up Successfully",
      data: {
        midtrans_payment_url: resMidtrans.redirect_url,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", details: error.message });
  }
};

export const signInAction = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await UserModel.findOne().where("email").equals(email);
    const comparePassword = bcrypt.compareSync(password, existingUser.password);

    if (!existingUser || !comparePassword)
      return res.status(400).json({ message: "Invalid Email or Password" });

    const isValidUser = await TransactionModel.findOne({
      user: existingUser._id,
      status: "success",
    });

    if (existingUser.role != "student" && !isValidUser)
      return res.status(400).json({ message: "User not verified" });

    const token = jwt.sign(
      {
        data: {
          id: existingUser._id,
          role: existingUser.role,
        },
      },
      process.env.SECRET_KEY_JWT,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      message: "Sign In Successfully",
      data: {
        name: existingUser.name,
        email: existingUser.email,
        token,
        role: existingUser.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};
