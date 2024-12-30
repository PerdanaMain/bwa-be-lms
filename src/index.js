import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import globalRouter from "./routes/global.route.js";

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello World!" });
});

app.use("/api", globalRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
