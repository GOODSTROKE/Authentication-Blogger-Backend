// External Modules:
const createError = require('http-errors')
let bcrypt = require('bcrypt')

// Internal Modules:
const UserModel = require('../models/People')
const SessionModel = require('../models/Session')
const detectDevice = require('../utils/detectDevice')

/**
 * @description Register A New User
 * @Route [POST]- /api/auth/register
 * @Access Public
 * @returns {Object} - Created User.
 */
const register = async (req, res, next) => {
  try {
    let newUser = new UserModel(req.body)
    let user = await newUser.save()
    let userData = {
      _id: user?._id,
      name: user?.name,
      email: user?.email,
      mobile: user?.mobile,
      roles: user?.roles,
      avatar: `${req.files_path}/users/${user?.avatar}`,
    }
    let session = await SessionModel.create({
      user: user?._id,
      userAgent: detectDevice(req.headers['user-agent']),
    })
    let accessToken = user.generateJwtToken({ user: userData, session })
    let refreshToken = user.generateJwtToken(
      { session },
      process.env.REFRESH_TOKEN
    )
    res.cookie('accessToken', accessToken, {
      maxAge: process.env.ACCESS_TOKEN,
      httpOnly: true,
    })
    res.cookie('refreshToken', refreshToken, {
      maxAge: process.env.REFRESH_TOKEN,
      httpOnly: true,
    })
    res.status(200).json({ ...userData, session: session?._id })
  } catch (error) {
    if (error?._message) {
      let message = error?.message?.split(':').pop()
      next(createError(422, message))
    } else {
      next(createError(500, error))
    }
  }
}

/**
 * @description User Login
 * @Route [POST]- /api/auth/login
 * @Access Public
 * @returns {Object} - Logged in User.
 */
const login = async (req, res, next) => {
  try {
    let { email, password } = req.body
    let user = await UserModel.findOne({ email })
    // let isMatch = await user.checkPassword(password)
    let isMatch = await bcrypt.compare(password, user?.password)

    if (user && isMatch) {
      let session = await SessionModel.create({
        user: user?._id,
        userAgent: detectDevice(req.headers['user-agent']),
      })
      let userData = {
        _id: user._id,
        name: user?.name,
        email: user?.email,
        mobile: user?.mobile,
        roles: user?.roles,
        avatar: `${req.files_path}/users/${user?.avatar}`,
      }
      let accessToken = user.generateJwtToken({ user: userData, session })

      let refreshToken = user.generateJwtToken(
        { session },
        process.env.REFRESH_TOKEN
      )
      res.cookie('accessToken', accessToken, {
        maxAge: process.env.ACCESS_TOKEN,
        httpOnly: true,
      })
      res.cookie('refreshToken', refreshToken, {
        maxAge: process.env.REFRESH_TOKEN,
        httpOnly: true,
      })

      res.status(200).json({ ...userData, session: session?._id })
    } else {
      next(createError(401, 'Authentication Failed!'))
    }
  } catch (error) {
    next(createError(500, 'Internal Server Error!'))
  }
}

/**
 * @description Retrive Logged User Information
 * @Route [GET]- /api/auth/login-info
 * @Access Public
 * @returns {Object} - Logged in User Data
 */
const loggedInInfo = async (req, res, next) => {
  const { user, session } = req
  const data = user?._doc ? user._doc : user
  data.session = session._id.toString()
  res.status(200).json(data)
}

/**
 * @description Retrive All Logged In user's Sessions
 * @Route [GET]- /api/auth/sessions/:userId
 * @Access Public
 * @returns {Array} - All Active Session
 */
const activeSessions = async (req, res, next) => {
  try {
    let query = { user: req.params.userId, valid: true }
    let projection = {}
    const data = await SessionModel.find(query, projection).sort({
      updatedAt: -1,
    })
    res.status(200).json(data)
  } catch (error) {
    next(createError(500, 'Internal Server Error!'))
  }
}

/**
 * @description Deactive Session by Sessin Id
 * @Route [PUT]- /api/auth/sessions/:sessionId
 * @Access Public
 * @returns {Object} - Deactivate Session Details
 */
const deactiveSession = async (req, res, next) => {
  try {
    let query = { _id: req.params.sessionId }
    let updatedData = { valid: false }
    let options = { new: true }
    const data = await SessionModel.findOneAndUpdate(
      query,
      updatedData,
      options
    )
    res.status(200).json(data)
  } catch (error) {
    next(createError(500, 'Internal Server Error!'))
  }
}

/**
 * @description Logout User
 * @Route [POST]- /api/users/auth/logout
 * @Access Private
 * @returns {Object} - logout
 */
const logout = async (req, res, next) => {
  try {
    let query = { _id: req.session._id }
    let update = {
      valid: false,
    }
    await SessionModel.findOneAndUpdate(query, update)

    res.cookie('accessToken', '', {
      maxAge: 0,
      httpOnly: true,
    })

    res.cookie('refreshToken', '', {
      maxAge: 0,
      httpOnly: true,
    })
    res.status(200).json({ data: true })
  } catch (error) {
    next(createError(500, 'Internal Server Error!'))
  }
}

// Module Exports:
module.exports = {
  register,
  login,
  loggedInInfo,
  logout,
  activeSessions,
  deactiveSession,
}
