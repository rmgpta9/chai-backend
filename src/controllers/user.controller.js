import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  // getuser details from frontend

  const { fullName, email, username, password } = req.body
  console.log("email", email)

  // validations - non-empty

  if (
    [fullName, email, username, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required")
  }

  // check if user already exists

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  })

  if (existedUser) {
    throw new ApiError(409, "User already exists with same username or email")
  }
  // check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required")
  }

  // upload them to cloudinary, avatar

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {
    throw new ApiError(400, "Avatar is required")
  }

  // create user object - create entry in DB

  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  })

  // remove password and refresh token fields from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  
  //check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user")
  }

  // return response

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"))
})

export { registerUser }
