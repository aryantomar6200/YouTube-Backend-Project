import dotenv from "dotenv";
import "dotenv/config";  
// dotenv.config();
import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB()
  .then(() => {
    app.on("on_errorrr!!", (err) => {
      console.log(err);
      throw err;
    });

    app.listen(process.env.PORT || 3000, () => {
      console.log("app is running on port: ", process.env.PORT);
    });
  })
  .catch((err) => {
    console.log("DB connection failed !!!", err);
  });
