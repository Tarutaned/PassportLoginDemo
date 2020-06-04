
const passport = async (req, res, next) => { 
    console.log("[+] Running Middleware")
    next()
}

module.exports = passport