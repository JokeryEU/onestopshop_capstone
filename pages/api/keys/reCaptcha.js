import nc from 'next-connect'
import axios from 'axios'

const handler = nc()

handler.post(async (req, res) => {
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${req.body.captcha}`
  const { data } = await axios.post(verifyUrl, {})
  if (!data.success && data.success === undefined) {
    return res.send({ success: false, message: 'Captcha verification failed' })
  } else if (data.score < 0.7) {
    return res.send({
      success: false,
      message: 'You might be a bot, sorry!',
      score: data.score,
    })
  }

  return res.send({
    success: true,
    message: 'Captcha verification passed',
    score: data.score,
  })
})

export default handler
