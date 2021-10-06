import nc from 'next-connect'
import { onError } from '../../../../../utils/error'
import db from '../../../../../utils/db'
import Coupon from '../../../../../models/Coupon'
import { isAdmin, isAuth } from '../../../../../utils/auth'

const handler = nc({
  onError,
})

handler.use(isAuth, isAdmin)

handler.get(async (req, res) => {
  await db.connect()
  const coupon = await Coupon.findById(req.query.id)
  await db.disconnect()
  res.send(coupon)
})

handler.put(async (req, res) => {
  await db.connect()
  const coupon = await Coupon.findById(req.query.id)
  if (coupon) {
    coupon.name = req.body.name || coupon.name
    coupon.expiry = req.body.expiry || coupon.expiry
    coupon.discount = req.body.discount || coupon.discount
    const updatedCoupon = await coupon.save()
    await db.disconnect()
    res.send('Coupon Updated By Admin', { coupon: updatedCoupon })
  } else {
    await db.disconnect()
    res.status(404).send('Coupon Not Found')
  }
})

handler.delete(async (req, res) => {
  await db.connect()
  const coupon = await Coupon.findById(req.query.id)
  if (coupon) {
    const deletedCoupon = await coupon.remove()
    await db.disconnect()
    res.send('Coupon Deleted', { coupon: deletedCoupon })
  } else {
    await db.disconnect()
    res.status(404).send('Coupon Not Found')
  }
})

export default handler
