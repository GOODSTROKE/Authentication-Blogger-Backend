// External Modules:
const router = require('express').Router()

// Controller:
const {
  getSingleUser,
  allUsers,
  updateUser,
  deleteUser,
  avatarUpload,
  updateRoles,
  updatePassword,
} = require('../controllers/user')

// Middlewares
const authorize = require('../middlewares/auth/authorize')
const authorizeSelf = require('../middlewares/auth/authorizeSelf')
const validateRequest = require('../middlewares/validateRequest')
const { singleConvertToWebp } = require('../middlewares/upload/imageConverter')
const { singleUploader } = require('../middlewares/upload/imageUploader')
const {
  updateUserSchema,
  userRolesSehema,
  updatePasswordSchema,
} = require('../schema/userSchema')

//Routes:
router.put(
  '/roles/:id',
  validateRequest(userRolesSehema),
  authorize(['admin']),
  updateRoles
)
router.put(
  '/password/:id',
  validateRequest(updatePasswordSchema),
  updatePassword
)
router.post(
  '/:id/upload',
  authorize(['admin', 'user']),
  authorizeSelf,
  singleUploader('avatar', 'users'),
  singleConvertToWebp('users'),
  avatarUpload
)
router.get('/:id', authorize(['admin', 'user']), authorizeSelf, getSingleUser)
router.put(
  '/:id',
  validateRequest(updateUserSchema),
  authorize(['admin', 'user']),
  authorizeSelf,
  updateUser
)
router.delete('/:id', authorize(['admin']), deleteUser)
router.get('/', allUsers)

// Exports
module.exports = router
