import express from "express";
import { helloWorld } from "../controllers/global.controller.js";

const globalRouter = express.Router();

globalRouter.get("/hello-world", helloWorld);

export default globalRouter;
