require('dotenv').config()
import mongoose from "mongoose"
const userName : string = encodeURIComponent(String(process.env.MONGODB_USERNAME));
const password : string = encodeURIComponent(String(process.env.MONGODB_PASSWORD));
const local_uri  = String(process.env.DATABASE_URL)
const atlas_uri = `mongodb+srv://${userName}:${password}@cluster0.arrb0cj.mongodb.net/?retryWrites=true&w=majority`
const connect = async () =>{
    try{
        await mongoose.connect(atlas_uri||local_uri)
        console.log('DB Connected!!')
    }
    catch(err){
        console.error(err)
        process.exit(1)
    }
}
export default connect