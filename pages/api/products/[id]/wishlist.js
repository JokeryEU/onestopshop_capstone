import nc from 'next-connect'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import Product from '../../../../models/Product'
import User from '../../../../models/User'
import { isAuth } from '../../../../utils/auth'

const handler = nc({
  onError,
})
handler.use(isAuth)

handler.post(async (req, res) => {
  await db.connect()
  const product = await Product.findById(req.query.id)
  if (product) {
    const user = await User.findById(req.user._id)
    const existItem = user.wishlist.find(
      (product) => product._id.toString() === req.query.id
    )

    if (existItem) {
      await db.disconnect()
      return res
        .status(400)
        .send({ message: 'Product is already in the wishlist' })
    }
    const wish = req.query.id
    user.wishlist.push(wish)

    await user.save()
    await db.disconnect()
    res.status(201).send({ message: 'Product added to the wishlist' })
  } else {
    await db.disconnect()
    res.status(404).send({ message: 'Product not found' })
  }
})

handler.delete(async (req, res) => {
  await db.connect()
  const user = await User.findById(req.user._id)
  if (user) {
    const filterWishProduct = user.wishlist.filter(
      (product) => product._id.toString() !== req.query.id
    )
    user.wishlist = filterWishProduct

    await user.save()
    await db.disconnect()
    res.status(204).send()
  }
})

export default handler
