// Required Packeges
let mongoose = require('mongoose')

const sessionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'people', required: true },
    valid: { type: Boolean, default: true },
    userAgent: { type: String },
  },
  { timestamps: true, versionKey: false }
)

// Make User Modelresult
const Session = mongoose.model('Session', sessionSchema)

// Export User Model
module.exports = Session
