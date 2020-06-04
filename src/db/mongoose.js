const mongoose = require('mongoose')
const validator = require('validator')

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