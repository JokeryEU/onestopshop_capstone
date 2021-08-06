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
      if (error) {
        const err = new Error("Token isn't valid")
        err.httpStatusCode = 401
        rej(err)
      }
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
      if (error) {
        const err = new Error('Sign in again')
        err.httpStatusCode = 403
        rej(err)
      }
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
    const error = new Error('Sign in again')
    error.httpStatusCode = 401
    throw error
  }
  const refreshToken = user.refreshToken

  if (refreshToken !== oldRefreshToken) {
    const error = new Error('Sign in again')
    error.httpStatusCode = 401
    throw error
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
      const error = new Error(`Please sign in again`)
      error.httpStatusCode = 400
      throw error
    }
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next()
  } else {
    const error = new Error('Admin Only')
    error.httpStatusCode = 403
    next(error)
  }
}
