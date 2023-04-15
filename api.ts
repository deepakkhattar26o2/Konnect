import { Router } from "express";
import userRouter from "./src/Routes/User";
import twilioRouter from "./src/Routes/Twilio";

const apiRouter = Router();

apiRouter.use("/user", userRouter);

apiRouter.use("/twilio", twilioRouter)

export default apiRouter;