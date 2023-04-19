// External Modules:
const createError = require('http-errors')

// Internal Modules:
const BlogModel = require('../models/Blog')
const { regxSearchQuery } = require('../utils/mongoose')

/**
 * @description Create single Data
 * @Route [POST]- /api/blogs/
 * @Access protected - [auth]
 * @returns {Object} - Single User Object
 */
const create = async (req, res, next) => {
  try {
    let newData = new BlogModel({
      ...req.body,
      user: req.user._id,
      banner: req.file.link,
    })

    await newData.save()

    let result = {
      ...newData?._doc,
      banner: `${req.files_path}/blogs/${newData?.banner}`,
      user: {
        _id: req?.user?._id,
        name: req?.user?.name,
        avatar: `${req.files_path}/users/${req?.user?.avatar}`,
      },
    }
    res.status(200).json(result)
  } catch (error) {
    next(createError(500, error))
  }
}

/**
 * @description Retrive Single data by id
 * @Route [GET]- /api/blogs/:id
 * @Access protected - [auth]
 * @returns {Object} - Single User Object
 */
const getOneById = async (req, res, next) => {
  try {
    // Retrive User By Id
    let query = { _id: req.params.id }
    let projection = { updatedAt: 0 }

    let data = await BlogModel.findById(query, projection).populate({
      path: 'user',
      select: 'name avatar',
    })

    let result = {
      ...data?._doc,
      banner: `${req.files_path}/blogs/${data?._doc?.banner}`,
      user: {
        ...data?._doc?.user?._doc,
        avatar: `${req.files_path}/users/${data?._doc?.user?.avatar}`,
      },
    }

    res.status(200).json(result)
  } catch (error) {
    next(createError(500, error.message))
  }
}

/**
 * @description Retrive All All Data
 * @Route [GET]- /api/blogs?search='abc'&page=1&limit=10
 * @Access protected - [auth]
 * @returns {Array} - All User Array.
 */
const allData = async (req, res, next) => {
  try {
    const { search } = req.query
    const query = search ? regxSearchQuery(search, ['title', 'category']) : {}
    const projection = { updatedAt: 0 }

    const data = await BlogModel.find(query, projection).populate({
      path: 'user',
      select: 'name avatar',
    })

    let shaped = data.map((d) => ({
      ...d._doc,
      banner: `${req.files_path}/blogs/${d?.banner}`,
      user: {
        ...d._doc.user._doc,
        avatar: `${req.files_path}/users/${d?.user?.avatar}`,
      },
    }))

    res.status(200).json(shaped)
  } catch (error) {
    console.log({ error })
    next(createError(500, 'Data Failed to Fetch'))
  }
}

/**
 * @description Update Single Data
 * @Route [PUT]- /api/blogs/:id
 * @Access protected - [auth]
 * @returns {Object} - Updated User.
 */
const updateOne = async (req, res, next) => {
  try {
    let query = { _id: req.params.id }
    let options = { new: true }

    const data = await BlogModel.findOneAndUpdate(
      query,
      req.body,
      options
    ).populate({
      path: 'user',
      select: 'name avatar',
    })

    let result = {
      ...data?._doc,
      banner: `${req.files_path}/blogs/${data?._doc?.bannea}`,
      user: {
        ...data?._doc?.user?._doc,
        avatar: `${req.files_path}/users/${data?._doc?.user?.avatar}`,
      },
    }

    res.status(200).json(result)
  } catch (error) {
    next(createError(500, error.message))
  }
}

/**
 * @description Delete Single Date
 * @Route [DELETE]- /api/blogs/:id
 * @Access protected - [auth]
 * @returns {Object} - Deleted Status.
 */
const deleteOne = async (req, res, next) => {
  try {
    let query = { _id: req.params.id }
    await BlogModel.deleteOne(query)
    res.status(200).json({ deletedCount: 1 })
  } catch (error) {
    next(createError(500, 'Data Failed to Fetch'))
  }
}

// Module Exports:
module.exports = {
  create,
  getOneById,
  allData,
  updateOne,
  deleteOne,
}
