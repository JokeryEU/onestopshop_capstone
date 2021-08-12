import mongoose from 'mongoose'

const { Schema, model, models } = mongoose

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: [
          {
            type: String,
            required: true,
          },
        ],
        price: {
          type: Number,
          required: true,
        },
      },
    ],
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
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
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
  },
  { timestamps: true }
)

const Order = models.Order || model('Order', orderSchema)
export default Order
