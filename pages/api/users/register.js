import nc from 'next-connect'
import PendingUser from '../../../models/PendingUser'
import User from '../../../models/User'
import { auth } from '../../../utils/auth'
import db from '../../../utils/db'
import sendgrid from '@sendgrid/mail'
import { userRegisteredTemplate } from '../../../utils/emailTemplates'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

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
  const link = 'http://' + req.headers.host + '/user/activation/' + newUser._id
  const emailReady = userRegisteredTemplate(email, link, lastName)

  await sendgrid.send(emailReady)

  await db.disconnect()
  res
    .status(201)
    .send({ message: 'An email was sent to you to complete your registration' })
})

export default handler
