import nc from 'next-connect'
import Order from '../../../../models/Order'
import Product from '../../../../models/Product'
import Coupon from '../../../../models/Coupon'
import { isAuth } from '../../../../utils/auth'
import db from '../../../../utils/db'
import { onError } from '../../../../utils/error'
import paypal from '@paypal/checkout-server-sdk'

const Environment = paypal.core.SandboxEnvironment
//   process.env.NODE_ENV === 'production'
//     ? paypal.core.LiveEnvironment
//     : paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
)

const handler = nc({ onError })
handler.use(isAuth)

handler.get(async (req, res) => {
  await db.connect()
  const request = new paypal.orders.OrdersCreateRequest()
  const order = await Order.findById(req.query.id)
  if (order.isPaid) return res.send({ message: 'Order is already paid' })
  let discount = 0
  if (order.usedCoupon) {
    const coupon = await Coupon.findOne({
      name: order.usedCoupon,
      expiry: { $gt: Date.now() },
    })
    if (coupon) discount = coupon.discount
  }

  let itemsPrice = 0
  for (const index in order.orderItems) {
    const item = order.orderItems[index]
    const product = await Product.findById(item._id)
    if (product.countInStock < item.quantity) {
      return res.status(400).send({
        message: `There are only ${product.countInStock} instance of ${product.name}`,
      })
    }
    itemsPrice += product.price * item.quantity
  }

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100

  const shippingPrice = itemsPrice >= 200 ? 0 : 15
  const taxPrice = round2(itemsPrice * 0.19)
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)
  const discountPrice = round2((totalPrice * discount) / 100)
  const netPrice = round2(totalPrice - discountPrice)

  request.prefer('return=representation')

  const currency = 'EUR'

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: String(netPrice),
          breakdown: {
            tax_total: {
              currency_code: currency,
              value: String(taxPrice),
            },
            shipping: {
              currency_code: currency,
              value: String(shippingPrice),
            },
            discount: {
              currency_code: currency,
              value: String(discountPrice),
            },
            item_total: {
              currency_code: currency,
              value: String(itemsPrice),
            },
          },
        },
        items: order.orderItems.map((item) => {
          return {
            name: item.name,
            unit_amount: {
              currency_code: currency,
              value: String(item.price),
            },
            quantity: String(item.quantity),
          }
        }),
      },
    ],
  })

  const paypalOrder = await paypalClient.execute(request)

  await db.disconnect()
  res.status(201).send({ id: paypalOrder.result.id })
})

export default handler
