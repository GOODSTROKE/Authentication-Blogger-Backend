const colors = require('colors')
const { mongooseConnection } = require('./db')
const { Users, Blogs } = require('./data')
const {
  randomValueFromArray,
  randomMultipleFromArray,
} = require('../utils/array')

// Configuration
require('dotenv').config()
mongooseConnection()

//Models
const UserModel = require('../models/People')
const BlogModel = require('../models/Blog')
const SessionModel = require('../models/Session')

// Import Data Seeder:
const importData = async () => {
  try {
    //Destroy All
    await UserModel.deleteMany()
    await BlogModel.deleteMany()
    await SessionModel.deleteMany()

    //Import Users
    const usersArray = await UserModel.create(Users)
    const usersIds = usersArray.map((user) => user._id)

    // Imports Blogs
    const prepareBlogs = Blogs.map((b) => ({ ...b, user: usersIds[0] }))
    const blogsArray = await BlogModel.create(prepareBlogs)

    console.log('Data Inserted'.magenta.inverse)
    process.exit()
  } catch (error) {
    console.log(`Error: ${error}`.red.inverse)
    process.exit(1)
  }
}

// Destroy Data Seeder:
const destroyData = async () => {
  try {
    await UserModel.deleteMany()
    await BlogModel.deleteMany()
    await SessionModel.deleteMany()

    console.log('Data Destroyed Successfully'.rainbow.bold)
    process.exit()
  } catch (error) {
    console.log(`Error ${error.message}`.red.bold)
    process.exit(1)
  }
}

// Manage Seeder Command:
if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
