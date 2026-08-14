import { Router } from "express";
import { login, logOut, refreshAccessToken, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser,
);
router.route("/login").post(upload.none(), login)

//secured Routs
router.route("/logout").post( verifyJWT ,logOut)
router.route("/refresh-token").post(refreshAccessToken)

export default router;
