// External Modules:
const createError = require('http-errors')

// Internal Modules:
const UserModel = require('../models/People')
const { unlinkSingleImage, emptyDirectory } = require('../utils/files')
const { regxSearchQuery } = require('../utils/mongoose')

/**
 * @description Retrive Single User Info By UserID
 * @Route [GET]- /api/users/:userID
 * @Access protected - [admin]
 * @returns {Object} - Single User Object
 */
const getSingleUser = async (req, res, next) => {
  try {
    // Retrive User By Id
    let query = { _id: req.params.id }
    let projection = { password: 0, createdAt: 0, updatedAt: 0 }

    let user = await UserModel.aggregate([
      { $match: query },
      { $project: projection },
      {
        $lookup: {
          from: 'address',
          localField: '_id',
          foreignField: 'user',
          as: 'address',
        },
      },
    ])

    res.status(200).json(user)
  } catch (error) {
    next(createError(500, 'Internal Server Error!'))
  }
}

/**
 * @description Retrive All Users
 * @Route [GET]- /api/users?search='abc'&page=1&limit=10
 * @Access protected - [admin]
 * @returns {Array} - All User Array.
 */
const allUsers = async (req, res, next) => {
  try {
    const { search, page = 0, limit = 0 } = req.query
    const query = search
      ? regxSearchQuery(search, ['name', 'email', 'mobile'])
      : {}

    const totalCount = await UserModel.countDocuments(query)

    const skippedData = Number(page) && Number(limit) ? limit * (page - 1) : 0
    const dataLimit = Number(limit) ? Number(limit) : totalCount
    const projection = { password: 0 }

    const users = await UserModel.aggregate([
      { $match: query },
      { $project: projection },
      { $skip: skippedData },
      { $limit: dataLimit },
      {
        $lookup: {
          from: 'address',
          localField: '_id',
          foreignField: 'user',
          pipeline: [
            { $match: {} },
            { $project: { user: 0, createdAt: 0, updatedAt: 0 } },
          ],
          as: 'address',
        },
      },
    ])
    res.set('x-total-count', totalCount)
    res.status(200).json(users)
  } catch (error) {
    next(createError(500, 'Data Failed to Fetch'))
  }
}

/**
 * @description Update user By UserID
 * @Route [PUT]- /api/users/:userID
 * @Access protected - [user, admin]
 * @returns {Object} - Updated User.
 */
const updateUser = async (req, res, next) => {
  try {
    let query = { _id: req.params.id }
    let options = { new: true, select: 'name email mobile avatar roles' }
    const existedUser = await UserModel.findById(query)

    let updatedData = {
      ...req.body,
      roles: existedUser.roles,
    }
    const result = await UserModel.findOneAndUpdate(query, updatedData, options)

    let user = {
      ...result._doc,
      avatar: `${req.files_path}/users/${result?.avatar}`,
    }

    const accessToken = result.generateJwtToken({ user, session: req.session })
    res.cookie('accessToken', accessToken, {
      maxAge: process.env.ACCESS_TOKEN,
      httpOnly: true,
    })

    res.status(200).json({ ...user, session: req.session?._id })
  } catch (error) {
    console.log({ error })

    if (error?._message) {
      let message = error?.message?.split(':').pop()
      next(createError(422, message))
    } else {
      next(createError(500, error))
    }
  }
}

/**
 * @description Update User Password
 * @Route [PUT]- /api/users/password/:userID
 * @Access protected - [user, admin]
 * @returns {Object} - Updated Boolean Status
 */
const updatePassword = async (req, res, next) => {
  try {
    let query = { _id: req.params.id }
    let options = { new: true }
    const { currentPassword, newPassword } = req.body

    const user = await UserModel.findById(query)
    let isMatch = await user.checkPassword(currentPassword)

    if (user && isMatch) {
      const password = await user.makeHash(newPassword)
      let updatedData = {
        password,
      }
      await UserModel.findOneAndUpdate(query, updatedData, options)
      res.status(200).json({ message: 'Password Updated' })
    } else {
      next(createError(400, "Password dosen't Match"))
    }
  } catch (error) {
    console.log({ error })

    if (error?._message) {
      let message = error?.message?.split(':').pop()
      next(createError(422, message))
    } else {
      next(createError(500, error))
    }
  }
}

/**
 * @description Update user Roles By UserID
 * @Route [PUT]- /api/users/roles/:userID
 * @Access protected - [admin]
 * @returns {Object} - Updated User.
 */
const updateRoles = async (req, res, next) => {
  try {
    console.log({ roles: req.body })
    let query = { _id: req.params.id }
    let options = { new: true }
    let updatedData = {
      $set: { roles: req.body.roles },
    }
    const user = await UserModel.findOneAndUpdate(query, updatedData, options)
    res.status(200).json(user)
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
 * @description Delete User By UserID
 * @Route [DELETE]- /api/users/:userID
 * @Access protected - [admin]
 * @returns {Object} - Deleted Status.
 */
const deleteUser = async (req, res, next) => {
  try {
    let query = { _id: req.params.id }
    await UserModel.deleteOne(query)
    res.status(200).json({ deletedCount: 1 })
  } catch (error) {
    next(createError(500, 'Data Failed to Fetch'))
  }
}

/**
 * @description Upload Avatar By UserID.
 * @Route [POST]- /api/users/:userID/upload
 * @Access protected - logged in user only
 * @returns {Object} - Updated User Information and JWT Token after modifing avatar url.
 */
const avatarUpload = async (req, res, next) => {
  try {
    let query = { _id: req.params.id }
    let options = { new: true, select: 'name email mobile avatar roles' }

    const result = await UserModel.findById(query)

    // Check Prvious Image is Default or not if not unlink previous
    const isDemo = result?.avatar.split('.').includes('demo')
    if (result?.avatar && !isDemo && req.file) {
      let removeOldOne = unlinkSingleImage(result.avatar)
      if (removeOldOne) result.avatar = req.file.link
    }

    if (req.file) result.avatar = req.file.link

    const updated = await UserModel.findByIdAndUpdate(
      query,
      { avatar: result.avatar },
      options
    )

    let user = {
      ...updated._doc,
      avatar: `${req.files_path}/users/${updated?.avatar}`,
    }

    const accessToken = updated.generateJwtToken({ user, session: req.session })
    res.cookie('accessToken', accessToken, {
      maxAge: process.env.ACCESS_TOKEN,
      httpOnly: true,
    })
    res.status(200).json({ ...user, session: req.session?._id })
  } catch (error) {
    console.log({ error })
    next(createError(500, 'Internal Server Error!'))
  }
}

/**
 * @description Delete All Data
 * @Route [DELETE]- /api/users/destroy
 * @Access protected - [-]
 * @returns {status, deletedCount} - Deleted Status.
 */
const deleteAllUsers = async (req, res, next) => {
  try {
    const users = await UserModel.deleteMany()
    const avatars = emptyDirectory('users')

    res.status(200).json({
      deletedCount: users?.deletedCount,
    })
  } catch (error) {
    next(createError(500, 'Something went wrong!'))
  }
}

// Module Exports:
module.exports = {
  getSingleUser,
  allUsers,
  updateUser,
  updatePassword,
  updateRoles,
  deleteUser,
  avatarUpload,
  deleteAllUsers,
}
