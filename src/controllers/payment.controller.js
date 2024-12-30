import TransactionModel from "../models/transaction.model.js";

export const handlePayment = async (req, res) => {
  try {
    const { order_id, transaction_status } = req.body;

    switch (transaction_status) {
      case "capture":
        break;
      case "settlement":
        await TransactionModel.findByIdAndUpdate(order_id, {
          status: "success",
        });
        break;
      case "deny":
        break;
      case "cancel":
        break;
      case "expire":
        break;
      case "failure":
        await TransactionModel.findByIdAndUpdate(order_id, {
          status: "failed",
        });
        break;
      default:
        break;
    }

    return res
      .status(200)
      .json({ message: "Handle payment success", data: null });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal Server Error", detail: error.message });
  }
};
