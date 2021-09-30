import nc from 'next-connect'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import Product from '../../../../models/Product'

const handler = nc({ onError })
handler.use(isAuth)

handler.put(async (req, res) => {
  await db.connect()
  const order = await Order.findById(req.query.id)
  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.payer.email_address,
      update_time: req.body.update_time,
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
    res.send('Order paid', { order: paidOrder })
  } else {
    await db.disconnect()
    res.status(404).send('Order not found')
  }
})

export default handler
