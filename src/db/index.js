import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

async function connectDB(){
    try {
        
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`)
        console.log(`\n MONGODB CONNECTED: DB HOSTt !! ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("DB connection FAILED: ", error);
        throw error
    }
}

export default connectDB