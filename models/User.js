import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const { Schema, model, models } = mongoose

const userSchema = new Schema(
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
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    profilePic: String,
    resetPasswordToken: String,
    refreshToken: String,
    googleId: String,
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      parseInt(process.env.SALT_ROUNDS)
    )
  }
  next()
})

userSchema.statics.checkCredentials = async function (email, enteredPassword) {
  const user = await this.findOne({ email })
  if (user) {
    const isMatch = await bcrypt.compare(enteredPassword, user.password)
    if (isMatch) return user
    else throw new Error('Invalid email or password')
  } else throw new Error('Invalid email or password')
}

userSchema.methods.toJSON = function () {
  const user = this

  const userObject = user.toObject()

  delete userObject.password
  delete userObject.__v
  delete userObject.refreshToken
  delete userObject.resetPasswordToken
  return userObject
}

const User = models.User || model('User', userSchema)
export default User
