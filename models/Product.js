import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    comment: { type: String, required: true, trim: true, minLength: 4 },
  },
  {
    timestamps: true,
  }
)
const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transactionType: {
      type: String,
      enum: ['BOUGHT', 'SOLD', 'REFUND', 'CANCELLED'],
      required: true,
    },
    qty: { type: Number, required: true },
    description: String,
  },
  { timestamps: true }
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
      lowercase: true,
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
    transactions: [transactionSchema],
    brand: {
      type: String,
      trim: true,
      required: true,
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
    sold: { type: Number, default: 0 },
    isFeatured: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
)

const Product = models.Product || model('Product', productSchema)

export default Product
