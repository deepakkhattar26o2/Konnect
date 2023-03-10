import { Router } from "express";
import userRouter from "./src/Routes/User";
const apiRouter = Router();

apiRouter.use("/user", userRouter);

export default apiRouter;