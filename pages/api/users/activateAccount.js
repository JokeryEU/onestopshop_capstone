import nc from 'next-connect'
import PendingUser from '../../../models/PendingUser'
import User from '../../../models/User'
import db from '../../../utils/db'

const handler = nc()

handler.post(async (req, res) => {
  const { id } = req.body
  await db.connect()
  const user = await PendingUser.findOne({
    _id: id,
    expiry: { $gt: Date.now() },
  })

  if (user) {
    const newUser = new User({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      role: user.role,
      profilePic: user.profilePic,
    })
    await newUser.save()
    await user.remove()
    await db.disconnect()
    return res.status(201).send({ message: `Your account has been activated` })
  }
  await db.disconnect()
  res.status(400).send({ message: `Your link has expired` })
})

export default handler
