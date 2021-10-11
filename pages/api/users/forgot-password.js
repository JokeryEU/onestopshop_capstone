import nc from 'next-connect'
import User from '../../../models/User'
import db from '../../../utils/db'
import jwt from 'jsonwebtoken'
import sendgrid from '@sendgrid/mail'
import { forgotPwEmailTemplate } from '../../../utils/emailTemplates'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

const handler = nc()

handler.post(async (req, res) => {
  await db.connect()
  const { email } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    await db.disconnect()
    return res.status(401).send({
      message:
        'The email address ' +
        email +
        ' is not associated with any account. Double-check your email address and try again.',
    })
  }
  const token = await new Promise((res, rej) =>
    jwt.sign(
      { email },
      process.env.FORGOT_PASSWORD_TOKEN,
      { expiresIn: '60m' },
      (error, token) => {
        if (error) rej(error)
        res(token)
      }
    )
  )

  await user.updateOne({ resetPasswordToken: token })
  await db.disconnect()

  const link = 'http://' + req.headers.host + '/reset-password/' + token
  const emailReady = forgotPwEmailTemplate(email, link, user.lastName)

  await sendgrid.send(emailReady)

  res.send({
    message: `Email has been sent to ${email}. The reset link is valid in 1 hour.`,
  })
})

export default handler
