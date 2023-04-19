// External Modules:
const router = require('express').Router()

// Controller:
const {
  register,
  login,
  loggedInInfo,
  logout,
  activeSessions,
  deactiveSession,
} = require('../controllers/auth')

// Middlewares
const validateRequest = require('../middlewares/validateRequest')
const { createUserSchema, loginSchema } = require('../schema/userSchema')
const authenticate = require('../middlewares/auth/authenticate')

//Routes:
router.get('/sessions/:userId', authenticate, activeSessions)
router.put('/sessions/:sessionId', authenticate, deactiveSession)

router.post('/register', validateRequest(createUserSchema), register)
router.post('/login', validateRequest(loginSchema), login)

router.get('/logout', authenticate, logout)
router.get('/login_info', authenticate, loggedInInfo)

// Exports
module.exports = router
