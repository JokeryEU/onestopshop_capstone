import nc from 'next-connect'
import Order from '../../../../models/Order'
import Product from '../../../../models/Product'
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
      order.transactions.push({
        user: req.user._id,
        userName: req.user.firstName + ' ' + req.user.lastName,
        transactionType: 'PAID',
      })
      const paidOrder = await order.save()

      for (const index in paidOrder.orderItems) {
        const item = paidOrder.orderItems[index]
        const product = await Product.findById(item._id)
        product.countInStock -= item.quantity
        product.sold += item.quantity
        product.transactions.push({
          user: req.user._id,
          qty: -item.quantity,
          transactionType: 'SOLD',
          description: `Sold to ${
            req.user.firstName + ' ' + req.user.lastName
          } on order ${paidOrder._id}`,
        })
        await product.save()
      }
      await db.disconnect()
      res.send(paidOrder)
    } else {
      await db.disconnect()
      res.status(404).send({ message: 'Order not found' })
    }
  } else {
    await db.disconnect()
    res.status('400').send({ message: 'Payment Failed' })
  }
})

export default handler
