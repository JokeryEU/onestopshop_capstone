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

  const order = await Order.findById(req.query.id)
  if (order) {
    if (order.isPaid) return res.send({ message: 'Order is already paid' })
    const sessionId = order.paymentResult.id
    const session = await stripeK.checkout.sessions.retrieve(sessionId)

    if (
      !session ||
      session.payment_status !== 'paid' ||
      session.status !== 'complete'
    ) {
      await db.disconnect()
      return res
        .status(400)
        .send({ message: 'Theres a problem with your payment.' })
    }

    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: order.paymentResult.id,
      email_address: session.customer_details.email,
      status: session.status,
    }
    order.transactions.push({
      user: req.user._id,
      userName: req.user.firstName + ' ' + req.user.lastName,
      transactionType: 'PAID',
    })
    await order.save()

    await db.disconnect()
    res.send({ message: 'Order has been paid' })
  } else {
    await db.disconnect()
    res.status(404).send({ message: 'Order not found' })
  }
})

export default handler
