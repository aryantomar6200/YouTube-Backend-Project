import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async (req, res) => {
    
    //get user data
    //validate required fields - empty fields
    //does user already exist
    //check for images mainly avatar
    //upload files on server
    //upload serverfiles on cloudinary
    //save user in database
    //got response from DB
    //remove pass and accesstoken from there
    //check for user creation 
    //return rest

    const userData = req.body
    console.log(userData);
    console.log(req.files);

    const {fullname, email, username, password } = req.body
    
    if (username.trim() === "") {
        throw new ApiError(401, "Please enter a valid username")
    }
    if (fullname.trim() === "") {
        throw new ApiError(401, "Please enter a valid fullname")
    }
    if (email.trim() === "") {
        throw new ApiError(401, "Please enter a valid email")
    }
    if (password.trim() === "") {
        throw new ApiError(401, "Please enter a valid password")
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existingUser) {
        throw new ApiError(402,"user already exists")
    }

    console.log("images -- ",req.files)
    const avaratLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avaratLocalPath) {
        throw new ApiError( 404, "please select an avatar")
    }
    const avaratCloudUrl = await uploadOnCloudinary(avaratLocalPath)
    const coverImgCloudUrl = await uploadOnCloudinary(coverImageLocalPath)

    

    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        email,
        password,
        avatar: avaratCloudUrl,
        coverImage: coverImgCloudUrl || "",
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(501, "server fault!!!!!!")
    }

    res.status(201).json(
        new ApiResponse(200, createdUser, "user registered successfully")
    )
    
})

export {registerUser}