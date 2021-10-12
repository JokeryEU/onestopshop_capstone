import nc from 'next-connect'
import User from '../../../models/User'
import { auth } from '../../../utils/auth'
import db from '../../../utils/db'

const handler = nc()

handler.post(async (req, res) => {
  await db.connect()
  const newUser = await User.create({
    ...req.body,
    role: 'User',
  })
  if (newUser) {
    const user = await User.checkCredentials(req.body.email, req.body.password)
    const tokens = await auth(user)
    const { accessToken } = tokens

    await db.disconnect()
    res.status(201).send({
      accessToken,
      wishlist: user.wishlist,
      role: newUser.role,
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    })
  } else {
    await db.disconnect()
    res.status(400).send({ message: 'User already exists' })
  }
})

export default handler
