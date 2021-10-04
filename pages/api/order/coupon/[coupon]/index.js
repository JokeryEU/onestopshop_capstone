import nc from 'next-connect'
import { onError } from '../../../../../utils/error'
import db from '../../../../../utils/db'
import Coupon from '../../../../../models/Coupon'
import { isAuth } from '../../../../../utils/auth'

const handler = nc({
  onError,
})

handler.use(isAuth).get(async (req, res) => {
  await db.connect()
  const coupon = await Coupon.findOne({ name: req.query.coupon })
  if (coupon) {
    await db.disconnect()
    res.send({ discount: coupon.discount })
  } else {
    await db.disconnect()
    res.status(400).send({ message: 'Invalid Coupon' })
  }
})

export default handler
