import nc from 'next-connect'
import { onError } from '../../../../utils/error'
import db from '../../../../utils/db'
import Product from '../../../../models/Product'
import { isAuth } from '../../../../utils/auth'

const handler = nc({
  onError,
})

handler.get(async (req, res) => {
  db.connect()
  const product = await Product.findById(req.query.id)
  db.disconnect()
  if (product) {
    res.send(product.reviews)
  } else {
    res.status(404).send('Product not found')
  }
})

handler.use(isAuth).post(async (req, res) => {
  await db.connect()
  const product = await Product.findById(req.query.id)
  if (product) {
    const existReview = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    )
    if (existReview) {
      await Product.updateOne(
        { _id: req.query.id, 'reviews._id': existReview._id },
        {
          $set: {
            'reviews.$.comment': req.body.comment,
            'reviews.$.rating': Number(req.body.rating),
          },
        }
      )

      const updatedProduct = await Product.findById(req.query.id)
      updatedProduct.numReviews = updatedProduct.reviews.length
      updatedProduct.rating =
        updatedProduct.reviews.reduce((a, review) => review.rating + a, 0) /
        updatedProduct.reviews.length
      await updatedProduct.save()

      await db.disconnect()
      return res.send('Review updated')
    } else {
      const review = {
        user: req.user._id,
        name: req.user.firstName + ' ' + req.user.lastName,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      }
      product.reviews.push(review)
      product.numReviews = product.reviews.length
      product.rating =
        product.reviews.reduce((a, review) => review.rating + a, 0) /
        product.reviews.length
      await product.save()
      await db.disconnect()
      res.status(201).send('Review submitted')
    }
  } else {
    await db.disconnect()
    res.status(404).send('Product not found')
  }
})

export default handler
