import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const orderItemSchema = new Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  slug: { type: String, required: true },
  image: [{ type: String, required: true }],
  price: { type: Number, required: true },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
  },
})

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    transactionType: {
      type: String,
      enum: ['CREATED', 'PAID', 'SENT', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
      required: true,
    },
    description: { type: String },
  },
  { timestamps: true }
)

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    orderItems: [orderItemSchema],
    transactions: [transactionSchema],
    shippingAddress: {
      fullName: { type: String, trim: true, required: true },
      address: { type: String, trim: true, required: true },
      city: { type: String, trim: true, required: true },
      country: { type: String, trim: true, required: true },
      postalCode: { type: String, trim: true, required: true },
      phoneNumber: { type: String, trim: true, required: true },
      location: {
        lat: String,
        lng: String,
        address: String,
        name: String,
        vicinity: String,
        googleAddressId: String,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    isSent: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
    refundedAt: {
      type: Date,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

const Order = models.Order || model('Order', orderSchema)
export default Order
