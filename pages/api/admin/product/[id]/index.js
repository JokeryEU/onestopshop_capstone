import nc from 'next-connect'
import { isAdmin, isAuth } from '../../../../../utils/auth'
import Product from '../../../../../models/Product'
import db from '../../../../../utils/db'

const handler = nc()
handler.use(isAuth, isAdmin)

handler.get(async (req, res) => {
  await db.connect()
  const product = await Product.findById(req.query.id)
  await db.disconnect()
  res.send(product)
})

handler.put(async (req, res) => {
  await db.connect()
  const product = await Product.findById(req.query.id)
  if (product) {
    product.name = req.body.name || product.name
    product.slug = req.body.slug || product.slug
    product.price = req.body.price || product.price
    product.category = req.body.category || product.category
    product.image =
      req.files.length > 0 ? req.files.map((img) => img.path) : product.image
    product.brand = req.body.brand || product.brand
    product.countInStock = req.body.countInStock || product.countInStock
    product.description = req.body.description || product.description
    await product.save()
    await db.disconnect()
    res.send('Product Updated Successfully')
  } else {
    await db.disconnect()
    res.status(404).send('Product Not Found')
  }
})

handler.delete(async (req, res) => {
  await db.connect()
  const product = await Product.findById(req.query.id)
  if (product) {
    await product.remove()
    await db.disconnect()
    res.send('Product Deleted')
  } else {
    await db.disconnect()
    res.status(404).send('Product Not Found')
  }
})

export default handler
