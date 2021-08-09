import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { v2 as cloudinaryV2 } from 'cloudinary'

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,
  params: {
    allowed_formats: ['png', 'jpg', 'gif', 'bmp', 'jpeg'],
    folder: 'productImg',
  },
})

const uploadToCloudinary = multer({
  storage: cloudinaryStorage,
})

export const multerImageArray = uploadToCloudinary.array('prodImage', 4)
