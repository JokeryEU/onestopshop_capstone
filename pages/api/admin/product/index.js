import nc from 'next-connect'
import { isAdmin, isAuth } from '../../../../utils/auth'
import Product from '../../../../models/Product'
import db from '../../../../utils/db'

const handler = nc()
handler.use(isAuth, isAdmin)

handler.post(async (req, res) => {
  await db.connect()
  const newProduct = new Product({
    user: req.user._id,
    name: 'sample name',
    slug: 'sample-slug-' + Math.random(),
    image: 'https://via.placeholder.com/250.jpg',
    price: 0,
    category: 'sample cat.',
    brand: 'sample brand',
    countInStock: 0,
    description: 'sample description',
    rating: 0,
    numReviews: 0,
  })

  const product = await newProduct.save()

  await db.disconnect()
  res.status(201).send(product)
})

export default handler
