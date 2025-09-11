import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export default async function conectdb(){
    const URL = process.env.MONGO_URL;
    try{
        const conn = await mongoose.connect(URL);
        console.log(`Mongodb is running ${conn.connection.name} database`);
    }catch(error){
        console.log("Error connecting Db", error);
        process.exit(1);
    }
}