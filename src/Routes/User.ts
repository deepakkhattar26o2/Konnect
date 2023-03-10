import { Router } from "express";
import { GetAuth, signUpRequestHandler, loginRequestHandler } from "../Controllers/UserController";
const userRouter = Router();

userRouter.post('/signup', signUpRequestHandler);

userRouter.post('/login', loginRequestHandler)
userRouter.post('/test', GetAuth);

export default userRouter;