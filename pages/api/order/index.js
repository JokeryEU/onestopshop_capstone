import nc from 'next-connect'
import Order from '../../../models/Order'
import { isAuth } from '../../../utils/auth'
import db from '../../../utils/db'
import { onError } from '../../../utils/error'

const handler = nc({ onError })
handler.use(isAuth)

handler.post(async (req, res) => {
  await db.connect()
  if (req.body.orderItems && req.body.orderItems.length === 0) {
    throw new Error('No order items')
  } else {
    const transaction = {
      user: req.user._id,
      userName: req.user.firstName + ' ' + req.user.lastName,
      transactionType: 'CREATED',
    }
    const newOrder = await Order.create({
      ...req.body,
      transactions: transaction,
      user: req.user._id,
    })

    await db.disconnect()
    res.status(201).send(newOrder)
  }
})

export default handler
