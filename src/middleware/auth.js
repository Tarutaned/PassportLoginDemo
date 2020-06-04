const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        // TO DO 
        // need to handle lower case 'bearer'
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne( { _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }

        // User has authenticated correctly
        req.token = token
        req.user = user
        next()

    } catch (e) {
        console.log('[-] Auth Error: ' + e)
        res.status(401).send({ error: 'Please authenticate.'})
    }
}

module.exports = auth