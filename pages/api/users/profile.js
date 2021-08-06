import nc from 'next-connect'
import User from '../../../models/User'
import db from '../../../utils/db'
import { auth, isAuth } from '../../../utils/auth'

const handler = nc()
handler.use(isAuth)

handler.put(async (req, res) => {
  await db.connect()

  const user = await User.findById(req.user._id)
  const tokens = await auth(user)
  const { accessToken } = tokens
  user.firstName = req.body.firstName || user.firstName
  user.lastName = req.body.lastName || user.lastName
  user.email = req.body.email || user.email
  if (req.body.password) {
    user.password = req.body.password
  }

  await user.save()
  await db.disconnect()

  if (req.body.password) {
    res.send()
  } else {
    res.send({
      accessToken,
      role: user.role,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
  }
})

export default handler
