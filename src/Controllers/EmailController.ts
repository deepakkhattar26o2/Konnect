require('dotenv').config();
const nodemailer = require('nodemailer')
const smtpTransport = require("nodemailer-smtp-transport");

const transporter = nodemailer.createTransport(
    smtpTransport({
        service : "gmail",
        host : "smtp.gmail.com",
        auth : {
            user : String(process.env.MAIL_ID),
            pass : String(process.env.MAIL_PASS)
        }
    })
);


const sendVerificationMail = async (to : string, otp : string) =>{
    const mailOptions = {
        from : "collegeconnection2cu@gmail.com",
        to : to,
        subject : "Email verification",
        text : `Your verification code is ${otp}`
    }
    await transporter.sendMail(mailOptions, (err : Error, info : any)=>{
        if(err) {
            //LOG ERROR!
            console.log("DEVLOG_MAIL_ERROR", err)
        }
    })
}

export {sendVerificationMail}
