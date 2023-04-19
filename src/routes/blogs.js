// External Modules:
const router = require('express').Router()

// Controller:
const {
  create,
  getOneById,
  allData,
  updateOne,
  deleteOne,
} = require('../controllers/blogs')
const { singleUploader } = require('../middlewares/upload/imageUploader')

//Routes:
router.post('/', singleUploader('banner', 'blogs'), create)
router.get('/:id', getOneById)
router.put('/:id', updateOne)
router.delete('/:id', deleteOne)
router.get('/', allData)

// Exports
module.exports = router
