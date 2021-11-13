import nc from 'next-connect'
import Order from '../../../models/Order'
import Product from '../../../models/Product'
import Coupon from '../../../models/Coupon'
import { isAuth } from '../../../utils/auth'
import db from '../../../utils/db'
import { onError } from '../../../utils/error'

const handler = nc({ onError })
handler.use(isAuth)

handler.post(async (req, res) => {
  await db.connect()
  if (req.body.orderItems && req.body.orderItems.length === 0) {
    return res.status(404).send('No order items')
  } else {
    const transaction = {
      user: req.user._id,
      userName: req.user.firstName + ' ' + req.user.lastName,
      transactionType: 'CREATED',
    }

    let discount = 0
    if (req.body.usedCoupon) {
      const coupon = await Coupon.findOne({
        name: req.body.usedCoupon,
        expiry: { $gt: Date.now() },
      })
      if (coupon) discount = coupon.discount
    }

    const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100
    let itemsPrice = 0
    for (const index in req.body.orderItems) {
      const item = req.body.orderItems[index]
      const product = await Product.findById(item._id)
      itemsPrice += product.price * item.quantity
    }
    const shippingPrice = itemsPrice >= 200 ? 0 : 15
    const taxPrice = round2(itemsPrice * 0.19)
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)
    const discountPrice = round2((totalPrice * discount) / 100)
    const netPrice = round2(totalPrice - discountPrice)

    const createOrder = new Order({
      orderItems: req.body.orderItems,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: itemsPrice,
      shippingPrice: shippingPrice,
      taxPrice: taxPrice,
      totalPrice: totalPrice,
      netPrice: netPrice,
      discountPrice: discountPrice,
      usedCoupon: req.body.usedCoupon,
      transactions: transaction,
      user: req.user._id,
    })

    const newOrder = await createOrder.save()

    await db.disconnect()
    res.status(201).send(newOrder)
  }
})

export default handler
