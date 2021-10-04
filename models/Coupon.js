import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const couponSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: true,
      minlength: [6, 'Too short'],
      maxlength: [12, 'Too long'],
    },
    expiry: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const Coupon = models.Coupon || model('Coupon', couponSchema)
export default Coupon
