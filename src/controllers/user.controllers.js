import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log("existing user --> by findByID() -->", user);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

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

  const userData = req.body;

  const { fullname, email, username, password } = req.body;

  if (username.trim() === "") {
    throw new ApiError(401, "Please enter a valid username");
  }
  if (fullname.trim() === "") {
    throw new ApiError(401, "Please enter a valid fullname");
  }
  if (email.trim() === "") {
    throw new ApiError(401, "Please enter a valid email");
  }
  if (password.trim() === "") {
    throw new ApiError(401, "Please enter a valid password");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    throw new ApiError(402, "user already exists");
  }

  console.log("images -- ", req.files);
  const avaratLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avaratLocalPath) {
    throw new ApiError(404, "please select an avatar");
  }
  const avaratCloudUrl = await uploadOnCloudinary(avaratLocalPath);
  const coverImgCloudUrl = await uploadOnCloudinary(coverImageLocalPath);

  const user = await User.create({
    username: username.toLowerCase(),
    fullname,
    email,
    password,
    avatar: avaratCloudUrl,
    coverImage: coverImgCloudUrl || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(501, "server fault!!!!!!");
  }

  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  //user data
  //does user exist in the db using either username or email or both
  //check password
  //access and refresh token
  //send cookies
  console.log(req.body);

  const { email, username, password } = req.body;

  if (username.trim() === "") {
    throw new ApiError(401, "Please enter a valid username");
  }
  if (email.trim() === "") {
    throw new ApiError(401, "Please enter a valid email");
  }
  if (password.trim() === "") {
    throw new ApiError(401, "Please enter a valid password");
  }

  const user = await User.findOne({
    $or: [{ email, username }],
  });

  if (!user) {
    throw new ApiError(404, "user not found!!");
  }
  console.log("existing user --> by findOne() -->", user);

  const isPasswordValid = user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "please enter a valid password");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        201,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user Logged in successfully",
      ),
    );
});

const logOut = asyncHandler(async (req, res) => {
  //remove refresh toke from DB - created a middleware for
  //remove cookies

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    { returnDocument: "after" },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logged out successfully"));
});

export { registerUser, login, logOut };
