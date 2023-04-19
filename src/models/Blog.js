// Required Packeges
let mongoose = require('mongoose')

const blogSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'People',
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Travel',
        'Animation',
        'Personal Development',
        'Food and Recipe',
        'Technology',
        'Fitness',
        'Business',
        'Other',
      ],
      required: true,
    },
    banner: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
)

// Make User Modelresult
const Blog = mongoose.model('Blog', blogSchema)

// Export User Model
module.exports = Blog
