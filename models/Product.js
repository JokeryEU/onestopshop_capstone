import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    comment: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
)

const productSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    slug: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    image: [
      {
        type: String,
        required: true,
      },
    ],
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      trim: true,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema],
    isFeatured: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
)

const Product = models.Product || model('Product', productSchema)

export default Product
