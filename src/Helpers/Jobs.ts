import Bull, { Job } from "bull";
import { sendVerificationMail } from "./Mail";
require('dotenv').config()
const emailProcess = async (job : Job)=>{
    if(job.data.jobName=="verification" && job.data.otp && job.data.emailId){
        await sendVerificationMail(job.data.emailId, job.data.otp);
    }
}

const emailQueue = new Bull('email', {
    redis: {
        host : "localhost",
        port : 6379
    }
})

emailQueue.process(emailProcess);

export default emailQueue