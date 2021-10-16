import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const { Schema, model, models } = mongoose

const pendingUserSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Minimum length must be at least 8 chars'],
    },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'User'],
      default: 'User',
    },
    profilePic: String,
    expiry: { type: Date, required: true, default: Date.now() + 86400000 },
  },
  { timestamps: true }
)

pendingUserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      parseInt(process.env.SALT_ROUNDS)
    )
  }
  next()
})

const PendingUser =
  models.PendingUser || model('PendingUser', pendingUserSchema)
export default PendingUser
