import { Router } from "express";
import { GetAuth, signUpRequestHandler, loginRequestHandler, verifyEmail } from "../Controllers/UserController";
const userRouter = Router();

userRouter.post('/signup', signUpRequestHandler);

userRouter.post('/login', loginRequestHandler);

userRouter.post('/verify/:email', verifyEmail);

userRouter.post('/test', GetAuth);

export default userRouter;