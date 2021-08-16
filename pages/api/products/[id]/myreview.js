import nc from 'next-connect'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import Product from '../../../../models/Product'
import { isAuth } from '../../../../utils/auth'

const handler = nc({
  onError,
})
handler.use(isAuth).get(async (req, res) => {
  await db.connect()
  const userId = req.user._id
  const productId = req.query.id
  const product = await Product.findById(productId)
  await db.disconnect()
  if (product) {
    const userReview = product.reviews.find(
      (review) => review.user.toString() === userId.toString()
    )
    if (userReview) {
      res.send({ review: userReview })
    } else {
      res.send('Review not found')
    }
  } else {
    res.send('Product not found')
  }
})
export default handler
