import { NextFunction, Request, Response } from "express";
import { User } from "../Models/User";
import emailQueue from "../Helpers/Jobs";
const bcr = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomString = require('randomstring')
require("dotenv").config();
import { CurrentUser, IUser, SignUpRequest, LoginRequest } from "../../TypeDefs";

// returns user details of current user from jwt token
const GetAuth = (req: Request): CurrentUser => {
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  return decoded.data;
};

// verifies if the jwt token is valid
const VerifyAuth = (req: Request, res: Response, next: NextFunction) => { 
  try {
    const token = req.headers.authorization;
    // in case of invalid token, token verification throws error
    jwt.verify(token, process.env.TOKEN_KEY);
    next();
  } 
  catch (err) {
    return res.status(500).json({ message: "Auth Failed!" });
  }
};

// request validator for sign up request
const signUpRequestValidator = (body: SignUpRequest): [boolean, string] => {
  if (!body.email) return [false, "email"];
  if (!body.firstName) return [false, "firstName"];
  if (!body.lastName) return [false, "lastName"];
  if (!body.password) return [false, "password"];
  return [true, "valid"];
};

// request handler for sign up
const signUpRequestHandler = async (req: Request, res: Response) => {
  const body: SignUpRequest = req.body;
  //validating request contents
  const validation: [boolean, string] = signUpRequestValidator(body);
  if (!validation[0])
    return res.status(400).json({ message: `Missing ${validation[1]}` });

  //checking for existing user
  const existingUser: IUser | null = await User.findOne({ email: body.email });
  if (existingUser != null)
    return res.status(409).json({ message: "Account already exists!" });
  const saltRounds = Number(process.env.SALT_ROUNDS) || 11;

  //encrypting password
  bcr.hash(body.password, saltRounds, async (err: Error, hash: string) => {
    if (err) return res.status(500).json({ message: err.message });
    body.password = hash;
    //creating and saving user doc in db
    const query = await User.create(body);
    const user: IUser = await query.save();
    //deleting password for safe responses
    let responseUser: any = Object.assign({}, user);
    responseUser = responseUser._doc;
    delete responseUser.password;
    //signing jwt token
    jwt.sign(
      { data: responseUser },
      String(process.env.TOKEN_KEY) || "AvadaKedavara",
      { expiresIn: "24h" },
      (err: Error, token: string) => {
        if (err) return res.status(500).json({ message: err.message });
        return res.status(200).json({ token: token, user: responseUser });
      }
    );
  });
};

// request validator for login request
const loginRequestValidator = (body: LoginRequest): [boolean, string] => {
  if (!body.email) return [false, "email"];
  if (!body.password) return [false, "password"];
  return [true, "valid"];
};

// request handler for login
const loginRequestHandler = async (req: Request, res: Response) => {
  const body: LoginRequest = req.body;

  //validating request contents
  const validation: [boolean, string] = loginRequestValidator(body);
  if (!validation[0]) return res.status(400).json({ message: validation[1] });

  //checking for existing user!
  const existingUser: IUser | null = await User.findOne({ email: body.email });
  if (existingUser == null)
    return res.status(404).json({ message: "User doesn't exist!" });

  //comparing passwords
  bcr.compare(
    body.password,
    existingUser.password,
    (err: Error, match: boolean) => {
      if (err || !match)
        return res.status(409).json({ message: "Invalid Credentials" });
      
        //deleting password for safer response
      let responseUser: any = Object.assign({}, existingUser);
      responseUser = responseUser._doc;
      delete responseUser.password;

      //signing jwt token
      jwt.sign(
        { data: responseUser },
        String(process.env.TOKEN_KEY) || "AvadaKedavara",
        { expiresIn: "24h" },
        (err: Error, token: string) => {
          if (err) return res.status(500).json({ message: err.message });
          return res.status(200).json({ token: token, user: responseUser });
        }
      );
    }
  );
};

//verifyig email by sending an otp
const verifyEmail = (req : Request, res : Response) =>{
  if(!req.params.email){
    return res.status(400).json({message : "Missing Email Address!"});
  }
  const email = req.params.email;
  const otp: string = randomString.generate(6);

  //adding process to background worker queue on redis
  emailQueue.add(
    { jobName : "verification" , emailId : email, otp : otp },
    {
      attempts: 5,
      delay: 5000,
    }
  );

  res.status(200).json({ email: email, otp: otp });
}
export { signUpRequestHandler, GetAuth, VerifyAuth, loginRequestHandler, verifyEmail};
