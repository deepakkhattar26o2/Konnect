require("dotenv").config();
import { Request, Response } from "express";

import { TokenRequestBody } from "../../TypeDefs";

//validating token request body!
const getAccessTokenValidator = (
  body: TokenRequestBody
): [boolean, string] => {
  if (!body.roomName) {
    return [false, "room name"];
  }
  if (!body.userName) {
    return [false, "user name"];
  }
  return [true, "valid"];
};

//generates token with video access!
const getAccessTokenHandler = (req: Request, res: Response) => {
  const body: TokenRequestBody = req.body;
  const validation = getAccessTokenValidator(body);

  if (!validation[0]) {
    return res.status(400).json({ message: `Missing ${validation[1]}` });
  }
  try {
    const AccessToken = require("twilio").jwt.AccessToken;

    const VideoGrant = AccessToken.VideoGrant;

    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;

    const identity = body.userName;

    const videoGrant = new VideoGrant({
      room: body.roomName,
    });
    const token = new AccessToken(
      twilioAccountSid,
      twilioApiKey,
      twilioApiSecret,
      { identity: identity }
    );
    token.addGrant(videoGrant);

    let jwtoken = token.toJwt();

    return res.status(200).json({ token: jwtoken });
  } catch (err) {
    return res.status(409).json({message : err});
  }
};

export { getAccessTokenHandler };
