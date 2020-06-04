const express       = require('express')
const http          = require('http')
const path          = require('path')
const flash         = require('connect-flash')
const session       = require('express-session')
const MongoStore    = require('connect-mongo')(session)
const FileStore     = require('session-file-store')(session);
const passport      = require('passport')


const mongoose = require('mongoose')
const validator = require('validator')

// ===========================================================
// Mongoose Connection
// Should be placed into an external file
// Moving to an exteranl file breaks the session mongoose.connection
// ===========================================================
const connectionURL = process.env.MONGODB_URL
console.log("[+] Mongo URL: " + connectionURL)
console.log('[+] Attempting to connect to Mongo')
mongoose.connect(connectionURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then( (result) => {
    console.log('[+] Connected to Mongo')
}).catch( (error) => {
    console.log("[-] Failed to connect to MongoDB.")
    console.log("[-] connectionURL = " + connectionURL)
    console.log(error)
})


// ===========================================================
// Setup Express
// ===========================================================
const app = express()                   // create an express object
const port = process.env.PORT || 80     // get port from .env file or use a default

// Setup express-session
app.use(session({
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    secret: 'supersecretcode',
    resave: false,
    saveUninitialized: true,
    clear_interval: 3600
}));
app.use(flash())                                // allow express to flash messages 
app.set("view engine", "ejs")                   // set the view engine
app.use(express.json())                         // parse JSON bodies that are sent by API cliens
app.use(express.urlencoded({ extended: true })) // parse URL-encoded bodies sent by HTML forms

// ===========================================================
// Setup Passport JS
// ===========================================================
app.use(passport.initialize())
app.use(passport.session())




// ===========================================================
// Setup Routes
// ===========================================================
const indexRoute    = require('./routes/index')
app.use(indexRoute)



// ===========================================================
// Run the Server
// ===========================================================
app.listen(port, () => {
    console.log('[+] Server is up on port: ' + port)
})