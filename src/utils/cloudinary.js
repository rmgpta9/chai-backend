import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_API,
})

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })
    // file has already been uploaded
    console.log("File has been uploaded on cloudinary", response.url)
    return response
  } catch (error) {
    fs.unlinkSync(localFilePath)
    return null
  }
}

export { uploadOnCloudinary }
