import nc from 'next-connect'
import Order from '../../../../models/Order'
import Coupon from '../../../../models/Coupon'
import { isAuth } from '../../../../utils/auth'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import stripe from 'stripe'

const stripeK = stripe(process.env.STRIPE_SECRET_KEY)

const handler = nc({ onError })
handler.use(isAuth)

handler.put(async (req, res) => {
  await db.connect()

  const order = await Order.findById(req.query.id)
  if (order) {
    if (order.isPaid) return res.send({ message: 'Order is already paid' })
    let discount = 0
    if (order.usedCoupon) {
      const coupon = await Coupon.findOne({
        name: order.usedCoupon,
        expiry: { $gt: Date.now() },
      })
      if (coupon) discount = coupon.discount
    }
    const link = 'http://' + req.headers.host + '/order/' + req.query.id
    const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100

    const session = await stripeK.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: link + '?result=success',
      cancel_url: link + '?result=cancel',
      line_items: order.orderItems.map((item) => {
        const itemPrice = round2(item.price)
        const taxPrice = round2(item.price * 0.19)
        const totalPrice = round2(itemPrice + taxPrice)
        const discountPrice = round2((totalPrice * discount) / 100)
        const netPrice = round2((totalPrice - discountPrice) * 100)
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.name,
            },
            unit_amount: netPrice,
          },
          quantity: item.quantity,
        }
      }),
    })

    order.paymentResult = {
      id: session.id,
    }
    await order.save()
    await db.disconnect()

    res.send({ url: session.url })
  } else {
    await db.disconnect()
    res.status(404).send({ message: 'Order not found' })
  }
})

export default handler
