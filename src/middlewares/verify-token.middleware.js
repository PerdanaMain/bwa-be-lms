import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
export const verifyToken = async (req, res, next) => {
  const secretKey = process.env.SECRET_KEY_JWT ?? "";

  //  Authorization: JWT <token>
  const headerPrefix = req?.headers?.authorization?.split(" ")[0];
  if (headerPrefix === "JWT") {
    const token = req?.headers?.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, secretKey);

    const user = await UserModel.findById(
      decoded.data.id,
      "_id name email role"
    );

    if (!user) {
      return res.status(401).json({ message: "Token expired" });
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } else {
    return res.status(400).json({ message: "Unauthorization" });
  }
};
