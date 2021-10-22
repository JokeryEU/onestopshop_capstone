import nc from 'next-connect'
import User from '../../../models/User'
import db from '../../../utils/db'
import jwt from 'jsonwebtoken'
import {
  forgotPwEmailTemplate,
  forgotPwEmailSuccessTemplate,
} from '../../../utils/emailTemplates'
import bcrypt from 'bcrypt'

const handler = nc()

handler.post(async (req, res) => {
  const { email } = req.body
  await db.connect()
  const user = await User.findOne({ email })

  if (user.resetPasswordToken) {
    await new Promise((res, rej) =>
      jwt.verify(
        user.resetPasswordToken,
        process.env.FORGOT_PASSWORD_TOKEN,
        (error, decoded) => {
          if (error) {
            db.disconnect()
            rej(error)
          }
          res(decoded)
        }
      )
    )
    db.disconnect()
    return res.status(400).send({
      message:
        'Your link its still valid please wait 1 hour or use the link you got from your email',
    })
  }
  if (!user) {
    await db.disconnect()
    return res.status(401).send({
      message: `The email address ${email} is not associated with any account. Double-check your email address and try again.`,
    })
  }
  const token = await new Promise((res, rej) =>
    jwt.sign(
      { email },
      process.env.FORGOT_PASSWORD_TOKEN,
      { expiresIn: '1h' },
      (error, token) => {
        if (error) rej(error)
        res(token)
      }
    )
  )

  await user.updateOne({ resetPasswordToken: token })
  await db.disconnect()

  const link = 'http://' + req.headers.host + '/user/reset-password/' + token
  await forgotPwEmailTemplate(email, link, user.lastName)

  res.send({
    message: `Email has been sent to ${email}. The reset link is valid in 1 hour.`,
  })
})

handler.put(async (req, res) => {
  const { resetPasswordToken, newPassword } = req.body
  if (resetPasswordToken) {
    await new Promise((res, rej) =>
      jwt.verify(
        resetPasswordToken,
        process.env.FORGOT_PASSWORD_TOKEN,
        (error, decoded) => {
          if (error) {
            rej(error)
          }
          res(decoded)
        }
      )
    )
    await db.connect()
    const user = await User.findOne({ resetPasswordToken })

    if (!user) {
      await db.disconnect()
      return res.status(401).send({ message: 'Invalid token' })
    }
    const hashedPw = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUNDS)
    )
    user.resetPasswordToken = ''
    user.password = hashedPw
    await user.save()
    await db.disconnect()

    await forgotPwEmailSuccessTemplate(user.email, user.lastName)

    return res.send({
      message: 'Success! You can now login with your new password',
    })
  }

  res.status(400).send({ message: 'No valid token provided' })
})

export default handler
