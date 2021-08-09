import nc from 'next-connect'
import { isAdmin, isAuth } from '../../../../../utils/auth'
import User from '../../../../../models/User'
import db from '../../../../../utils/db'

const handler = nc()
handler.use(isAuth, isAdmin)

handler.get(async (req, res) => {
  await db.connect()
  const user = await User.findById(req.query.id)
  await db.disconnect()
  res.send(user)
})

handler.put(async (req, res) => {
  await db.connect()
  const user = await User.findById(req.query.id)
  if (user) {
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.email = req.body.email || user.email
    user.role = req.body.role || user.role
    await user.save()
    await db.disconnect()
    res.send('User Updated Successfully')
  } else {
    await db.disconnect()
    res.status(404).send('User Not Found')
  }
})

handler.delete(async (req, res) => {
  await db.connect()
  const user = await User.findById(req.query.id)
  if (user) {
    await user.remove()
    await db.disconnect()
    res.send('User Deleted')
  } else {
    await db.disconnect()
    res.status(404).send('User Not Found')
  }
})

export default handler
