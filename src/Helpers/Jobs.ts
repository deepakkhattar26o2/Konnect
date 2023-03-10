import Bull, { Job } from "bull";
import { sendVerificationMail } from "../Controllers/EmailController";
require('dotenv').config()
const emailProcess = async (job : Job)=>{
    if(job.data.name=="verification" && job.data.otp && job.data.emailId){
        sendVerificationMail(job.data.emailId, job.data.otp);
    }
}

const emailQueue = new Bull('email', {
    redis: {
        host : String(process.env.REDIS_HOST),
        port : Number(process.env.REDIS_PORT)
    }
})

emailQueue.process(emailProcess);