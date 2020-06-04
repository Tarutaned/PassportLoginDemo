const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./customer')


// ==========================================================
// Create Schema
// ==========================================================
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trip: true,
        minlenght: 8,
        validate(value) {
            if (value.length < 6) {
                throw new Error('The password must be at least 6 characters long.')
            }
            if (value.toLowerCase().includes('password')){
                throw new Error('The password cannot contain "password".')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    // tokens will be used to store an array of login tokens for the user
    tokens: [{
        token: {
            type: String,
            require: true,
        }
    }]
}, {
    timestamps: true,
    
})

// ==========================================================
// Virtual Property
// ==========================================================
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})


// ==========================================================
// Middleware
// ==========================================================

// Instance method
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()
    // delete sensitive info from the userObject before sending it back
    delete userObject.tokens
    delete userObject.password
    delete userObject.avatar
    return userObject
}

// Instance Method
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    
    // Add token to the user model
    user.tokens = user.tokens.concat({ token })
    // Save user model to DB
    await user.save()
    // return the token value - it'll be sent to the API consumer
    return token
}

// Model Method
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if (!user || user.length == 0) {
        throw new Error('Unable to login.')
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login.')
    }

    // if the user is found and passwords match
    return user
}

// Save method for the User Schema
// This will be used any time that "Save" is called on the User model
// it will run before the actuall 'save' function
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    // Need to call next() to cmplete saving
    next()
})


// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany( { owner: user._id})
    next()
})

// ==========================================================
// User Model
// ==========================================================
const User = mongoose.model('User', userSchema)

// Export the User object
module.exports = User