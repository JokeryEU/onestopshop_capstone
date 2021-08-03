import nc from 'next-connect'
import User from '../../../models/User'
import { auth } from '../../../utils/auth'
import db from '../../../utils/db'

const handler = nc()

handler.post(async (req, res) => {
  await db.connect()
  const { email, password } = req.body
  const user = await User.checkCredentials(email, password)
  const tokens = await auth(user)
  const { accessToken } = tokens
  await db.disconnect()
  res.send({
    accessToken,
    role: user.role,
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  })
})

export default handler
