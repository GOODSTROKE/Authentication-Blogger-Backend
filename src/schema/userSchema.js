const yup = require('yup')
const { user } = require('../utils/constants')
const { email, mobile, password } = require('./regexp')

const createUserSchema = yup.object().shape({
  name: yup.string().required('Name is Required!'),
  email: yup
    .string()
    .matches(email, 'Invalid Email Address!')
    .required('Email is Required!'),
  mobile: yup
    .string()
    .matches(mobile, 'Invalid Mobile Number!')
    .required('Mobile Number is Required!'),
  password: yup
    .string()
    .matches(password, 'Invalid Password!')
    .required('Password Is Required!'),
})

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .matches(email, 'Authentication Failed')
    .required('Email is Required!'),
  password: yup
    .string()
    .matches(password, 'Authentication Failed')
    .required('Password Is Required!'),
})

const updateUserSchema = yup.object().shape({
  name: yup.string().optional(),
  email: yup.string().optional().matches(email, 'Invalid Email Address!'),
  mobile: yup.string().optional().matches(mobile, 'Invalid Mobile Number!'),
})

const updatePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Old Password is Required!')
    .matches(password, 'Invalid Password!')
    .min(8, 'Invalid Password!')
    .max(50, 'Invalid Password!'),
  newPassword: yup
    .string()
    .required('New Password is Required!')
    .notOneOf([yup.ref('currentPassword')], 'Nothing to change!')
    .matches(password, 'Uppercase Lowercase Special char Required')
    .min(8, 'Password Should be minimum 8 character')
    .max(50, 'Too long'),
  confirmPassword: yup
    .string()
    .required('Confirm Password is Required!')
    .when('newPassword', (password, field) =>
      password ? field.required() : field
    )
    .oneOf([yup.ref('newPassword')], 'Password does not matched'),
})

const userRolesSehema = yup.object().shape({
  roles: yup
    .array()
    .typeError('Roles must be array')
    .of(yup.mixed().oneOf(user.role)),
})

module.exports = {
  createUserSchema,
  loginSchema,
  updateUserSchema,
  updatePasswordSchema,
  userRolesSehema,
}
