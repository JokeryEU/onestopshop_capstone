import nc from 'next-connect'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import stripe from 'stripe'

const stripeK = stripe(process.env.STRIPE_SECRET_KEY)

const handler = nc({ onError })
handler.use(isAuth)

handler.put(async (req, res) => {
  await db.connect()
  const { amount, id } = req.body

  const payment = await stripeK.paymentIntents.create({
    amount: parseInt(amount),
    currency: 'eur',
    payment_method: id,
    payment_method_types: ['card'],
    confirm: true,
  })

  if (payment.status === 'succeeded') {
    const order = await Order.findById(req.query.id)
    if (order) {
      order.isPaid = true
      order.paidAt = Date.now()
      order.paymentResult = {
        id: payment.id,
        status: payment.status,
      }
      const paidOrder = await order.save()
      await db.disconnect()
      res.send('Order paid', { order: paidOrder })
    } else {
      await db.disconnect()
      res.status(404).send('Order not found')
    }
  } else {
    await db.disconnect()
    res.status('400').send('Payment Failed')
  }
})

export default handler
