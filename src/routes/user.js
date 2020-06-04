const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
//const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')




// =============================================
// Create User
// =============================================
router.post('/users', async (req, res) =>{
    // Create Model Instance
    const user = new User(req.body)
    try {
        console.log("[+] Saving User")
        await user.save()
        //sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send(e)
    }
})

// =============================================
// Login User
// =============================================
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        res.status(400).send()
    }
})


// =============================================
// Log Out
// =============================================
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send({ logout: true})
    } catch (e) {
        res.status(500).send()
    }
})

// =============================================
// Log Out All Sessions
// =============================================
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send( {logout: true})
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// =============================================
// Get User
// =============================================
router.get('/users/me', auth ,async (req, res) =>{
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// =============================================
// Update User
// =============================================
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    // for every item in the "updates" array run a check ...
    // if one iteration returns false, then "isValidOperation" will be false
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {
        // The 'auth' middleware adds req.user
        updates.forEach( (update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        // return the updated user object
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// =============================================
// Delete User
// =============================================
router.delete('/users/me', auth, async (req, res) => {
    try {
        // note that the 'auth' middleware adds 'user' to the 'req' object
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
        console.log(e)
    }
})

// =============================================
// Setup multer for the Upload endpoint
// =============================================
const upload = multer( { 
    //dest: 'avatars', // save to this directory
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error ('The file must be an image.'))
        }
        
        cb(undefined, true)
    }
})

// =============================================
// Upload Avatar
// =============================================
router.post('/users/me/avatar', auth, upload.single("avatar"), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize( {width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send( {status: "success"} )
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

// =============================================
// Delete Avatar
// =============================================
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
            req.user.avatar = undefined
            req.user.save()
            res.send({status: "success"})
    } catch (e) {
        res.status(500).send(e)
    }
})

// =============================================
// Get Avatar Image
// =============================================
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        // usre was not found or empty avatar
        if(!user || !user.avatar) {
            throw new Error()
        }

        // set a response header
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }
    catch (e) {
        res.status(404).send()
    }
})

// =============================================
// Export the User Router
// =============================================
module.exports = router