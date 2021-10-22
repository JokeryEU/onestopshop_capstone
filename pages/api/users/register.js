import nc from 'next-connect'
import PendingUser from '../../../models/PendingUser'
import User from '../../../models/User'
import db from '../../../utils/db'
import { userRegisteredTemplate } from '../../../utils/emailTemplates'

const handler = nc()

handler.post(async (req, res) => {
  const { email, lastName } = req.body
  await db.connect()

  const regUser = await User.findOne({ email })
  const pendUser = await PendingUser.findOne({ email })
  const date = Date.now()

  if (pendUser && pendUser.expiry < date) await pendUser.remove()

  if ((pendUser && pendUser.expiry > date) || regUser) {
    await db.disconnect()
    return res.status(422).send('Email already registered!')
  }

  const newUser = await PendingUser.create({
    ...req.body,
    role: 'User',
    expiry: date + 86400000,
  })
  await db.disconnect()
  const link = 'http://' + req.headers.host + '/user/activation/' + newUser._id
  await userRegisteredTemplate(email, link, lastName)

  res.status(201).send({
    message: `An email was sent to ${email} to complete your registration`,
  })
})

export default handler
