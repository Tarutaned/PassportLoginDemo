const mongoose = require('mongoose')
const validator = require('validator')

// ==========================================================
// Schema
// ==========================================================
const customerSchema = new mongoose.Schema({
    customer_name:{
        type: String,
        trim: true,
        required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    
},{
    timestamps: true
})


// ==========================================================
// Model
// ==========================================================
const Customer = mongoose.model('Customer', customerSchema)

// ==========================================================
// Export the Customer object
// ==========================================================
module.exports = Customer