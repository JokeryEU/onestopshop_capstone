import nc from 'next-connect'
import Order from '../../../../models/Order'
import { isAuth, isAdmin } from '../../../../utils/auth'
import db from '../../../../utils/db'

const handler = nc()
handler.use(isAuth)

handler.get(async (req, res) => {
  await db.connect()
  const order = await Order.findById(req.query.id)
  await db.disconnect()
  res.send(order)
})

handler.use(isAdmin).delete(async (req, res) => {
  await db.connect()
  const order = await Order.findById(req.query.id)
  if (order.isPaid) {
    await db.disconnect()
    return res.status(400).send('Order is already paid, use refund option')
  }
  if (order) {
    const deletedOrder = await order.remove()
    await db.disconnect()
    res.send({ message: 'Order Deleted', order: deletedOrder })
  } else {
    await db.disconnect()
    res.status(404).send('Order Not Found')
  }
})

export default handler
