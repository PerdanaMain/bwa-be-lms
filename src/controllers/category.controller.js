import CategoryModel from "../models/category.model.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find();
    res.status(200).json({
      message: "Success Get Categories",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postCategory = async (req, res) => {
  try {
    const category = new CategoryModel({
      name: req.body.name,
    });
    await category.save();
    res.status(201).json({
      message: "Success Create Category",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
