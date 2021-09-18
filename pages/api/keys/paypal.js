import nc from 'next-connect'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth).get(async (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'nokey')
})

export default handler
