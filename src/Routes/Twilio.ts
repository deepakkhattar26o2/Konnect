import { Router } from "express";
import { getAccessTokenHandler } from "../Controllers/TwilioController";
const twilioRouter = Router();

twilioRouter.post('/video/token', getAccessTokenHandler);

export default twilioRouter;