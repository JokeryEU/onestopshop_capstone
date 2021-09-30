import nc from 'next-connect'
import Order from '../../../../models/Order'
import { isAuth, isAdmin } from '../../../../utils/auth'
import db from '../../../../utils/db'

const handler = nc()

handler
  .use(isAuth)
  .get(async (req, res) => {
    await db.connect()
    const order = await Order.findById(req.query.id)
    await db.disconnect()
    res.send(order)
  })
  .use(isAuth, isAdmin)
  .delete(async (req, res) => {
    await db.connect()
    const order = await Order.findById(req.query.id)
    if (order) {
      const deletedOrder = await order.remove()
      await db.disconnect()
      res.send({ message: 'Order Deleted', order: deletedOrder })
    } else {
      await db.disconnect()
      res.status(404).send({ message: 'Order Not Found' })
    }
  })

export default handler
