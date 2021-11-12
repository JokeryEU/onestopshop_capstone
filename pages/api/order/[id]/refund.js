import nc from 'next-connect'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import Order from '../../../../models/Order'
import { isAuth } from '../../../../utils/auth'
import Product from '../../../../models/Product'

const handler = nc({
  onError,
})

handler.use(isAuth)

handler.put(async (req, res) => {
  await db.connect()
  const order = await Order.findById(req.query.id)
  if (order) {
    order.isRefunded = true
    order.refundedAt = Date.now()
    const updatedOrder = await order.save()
    order.transactions.push({
      user: req.user._id,
      userName: req.user.name,
      transactionType: 'REFUNDED',
    })
    for (const index in updatedOrder.orderItems) {
      const item = updatedOrder.orderItems[index]
      const product = await Product.findById(item._id)
      product.countInStock += item.quantity
      product.sold -= item.quantity
      product.transactions.push({
        user: req.user._id,
        qty: -item.quantity,
        transactionType: 'REFUND',
        description: `Order ${updatedOrder._id} refunded by ${req.user.name} with id ${req.user._id}`,
      })

      await product.save()
    }
    await db.disconnect()
    res.send({ message: 'Order Refunded', order: updatedOrder })
  } else {
    await db.disconnect()
    res.status(404).send({ message: 'Order Not Found' })
  }
})

export default handler
