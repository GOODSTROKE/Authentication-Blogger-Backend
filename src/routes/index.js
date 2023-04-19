const router = require('express').Router()
const userRoutes = require('./user')
const authRoutes = require('./auth')
const blogRoutes = require('./blogs')
const authenticate = require('../middlewares/auth/authenticate')

//Health Checker
router.use('/health', (_req, res) => res.status(200).json({ status: 'ok' }))

// Application Routes
router.use('/api/v1/auth', authRoutes)
router.use('/api/v1/users', authenticate, userRoutes)
router.use('/api/v1/blogs', authenticate, blogRoutes)

// Module Exports
module.exports = router
