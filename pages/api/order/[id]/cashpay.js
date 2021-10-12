import nc from 'next-connect'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import Order from '../../../../models/Order'
import Product from '../../../../models/Product'
import { isAdmin, isAuth } from '../../../../utils/auth'

const handler = nc({
  onError,
})
handler.use(isAuth, isAdmin)

handler.put(async (req, res) => {
  await db.connect()

  const order = await Order.findById(req.query.id)
  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    }
    order.transactions.push({
      user: req.user._id,
      userName: req.user.firstName + ' ' + req.user.lastName,
      transactionType: 'PAID',
    })

    const updatedOrder = await order.save()

    for (const index in updatedOrder.orderItems) {
      const item = updatedOrder.orderItems[index]
      const product = await Product.findById(item._id)
      product.countInStock -= item.quantity
      product.sold += item.quantity
      product.transactions.push({
        user: req.user._id,
        qty: -item.quantity,
        transactionType: 'SOLD',
        description: `Sold to ${
          req.user.firstName + ' ' + req.user.lastName
        } on order ${updatedOrder._id}`,
      })
      await product.save()
    }

    await db.disconnect()
    res.send(updatedOrder)
  } else {
    await db.disconnect()
    res.status(404).send({ message: 'Order Not Found' })
  }
})

export default handler
