import jwt from 'jsonwebtoken'
import User from '../models/User'

const generateJWT = (user) =>
  new Promise((res, rej) =>
    jwt.sign(
      user,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1d' },
      (error, token) => {
        if (error) rej(error)
        res(token)
      }
    )
  )

const verifyJWT = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
      if (error) rej(error)
      res(decoded)
    })
  )

const generateRefreshJWT = (user) =>
  new Promise((res, rej) =>
    jwt.sign(
      user,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' },
      (error, token) => {
        if (error) rej(error)
        res(token)
      }
    )
  )

const verifyRefreshToken = (token) =>
  new Promise((res, rej) =>
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
      if (error) rej(error)
      res(decoded)
    })
  )

export const auth = async (user) => {
  const newAccessToken = await generateJWT({ _id: user._id })
  const newRefreshToken = await generateRefreshJWT({ _id: user._id })
  user.refreshToken = newRefreshToken
  await user.save()
  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export const refreshJWT = async (oldRefreshToken) => {
  const decoded = await verifyRefreshToken(oldRefreshToken)

  const user = await User.findOne({ _id: decoded._id })

  if (!user) {
    throw new Error('Sign in again')
  }
  const refreshToken = user.refreshToken

  if (refreshToken !== oldRefreshToken) {
    throw new Error('Sign in again')
  }

  const newAccessToken = await generateJWT({ _id: user._id })
  const newRefreshToken = await generateRefreshJWT({ _id: user._id })

  user.refreshToken = newRefreshToken
  await user.save()
  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

export const isAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const decoded = await verifyJWT(token)
    const user = await User.findOne({ _id: decoded._id })
    if (!user) {
      throw new Error(`Please login`)
    }
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next()
  } else {
    const error = new Error('Admin Only')
    next(error)
  }
}
