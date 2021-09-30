import nc from 'next-connect'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import Order from '../../../../models/Order'
import Product from '../../../../models/Product'
import { isAuth } from '../../../../utils/auth'

const handler = nc({
  onError,
})

handler.use(isAuth)

handler.put(async (req, res) => {
  await db.connect()
  const order = await Order.findById(req.query.id)
  if (order) {
    order.isCanceled = true
    order.canceledAt = Date.now()
    order.transactions.push({
      user: req.user._id,
      userName: req.user.firstName + ' ' + req.user.lastName,
      transactionType: 'CANCELLED',
    })

    const updatedOrder = await order.save()
    if (updatedOrder.isPaid) {
      for (const index in updatedOrder.orderItems) {
        const item = updatedOrder.orderItems[index]
        const product = await Product.findById(item.product)
        product.countInStock += item.quantity

        product.sold -= item.quantity
        product.transactions.push({
          user: req.user._id,
          qty: -item.quantity,
          transactionType: 'CANCELLED',

          description: `Cancelled order ${updatedOrder._id}`,
        })

        await product.save()
      }
    } else {
      for (const index in updatedOrder.orderItems) {
        const item = updatedOrder.orderItems[index]
        const product = await Product.findById(item.product)

        product.transactions.push({
          user: req.user._id,
          qty: 0,
          transactionType: 'CANCELLED',

          description: `Cancelled order ${updatedOrder._id} . No payment has been made.`,
        })

        await product.save()
      }
    }

    await db.disconnect()
    res.send({ message: 'Order Cancelled', order: updatedOrder })
  } else {
    await db.disconnect()
    res.status(404).send({ message: 'Order Not Found' })
  }
})

export default handler
