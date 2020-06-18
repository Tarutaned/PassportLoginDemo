// **************************************************
// ./routes/index.js
// **************************************************
const express             = require('express')
const app                 = new express.Router()
const connectEnsureLogin  = require('connect-ensure-login');
const passport            = require('passport')
const User                = require('../models/user')


// ==================================================
// Passport LDAP Strategy
// ==================================================
passport.serializeUser(function(user, done) {
  console.log("[+] Serialize the User: " + user)
  done(null, user);
});
passport.deserializeUser(function(id, done) {
  // all the user info is currently stored in the "id" in the session
  // The session info is store in the Mongo DB
  return done(null, id);
});
var LdapStrategy = require('passport-ldapauth')
var OPTS = {
  server: {
    url: process.env.LDAP_URL,
    bindDN: 'CN=Martin Engineer,OU=Proofpoint Staff,DC=archiveadmin,DC=com',
    bindCredentials: 'Winter1949',
    searchBase: process.env.LDAP_searchBase,
    searchFilter: process.env.LDAP_searchFilter
    // '(sAMAccountName={{username}})'
  }
}
passport.use(new LdapStrategy(OPTS))




// ==================================================
// Display the index page page
// ==================================================
app.get('/', (req, res) => {
  res.render('index.ejs', {user: req.user})
})


// ==================================================
// Display the Login page
// ==================================================
app.get('/login', (req, res) => {
  // Check if the user is already logged in
  if(!(typeof req.user == 'undefined')) {
    console.log("[+] " + req.user.username + " is already logged in.")
    return res.render('index.ejs', {user: req.user})
  }
  res.render('login.ejs')
})


// ==================================================
// Process the Login Form
// ==================================================
app.post('/login', passport.authenticate('ldapauth', {session: true}), function(req, res) {
  console.log("[+] Processing login form")
  return res.redirect('/');
});

// =============================================
// Process the Login form
// =============================================
// app.post('/login', async (req, res) => {
//   try {
//     const user = await User.findByCredentials(req.body.email, req.body.password)
//     const token = await user.generateAuthToken()
  
//     // Set a new authToken cookie
//     res.setHeader('Set-Cookie', cookie.serialize('authToken', token, {
//       httpOnly: true,
//       maxAge: 60 * 60 * 24 * 7 // 1 week
//     }));
//     req.session.user = user
//     const hour = 3600000
//     req.session.cookie.maxAge = hour
//     res.redirect('/profile')
//     res.end()
//     return
    
//   } catch (e) {
//     console.log("[-] Login Failed:")
//     console.log(e)
//     res.render('login.ejs', { message: "Login Failed" });
//   }
// });



// =============================================
// Display Signup Page
// =============================================
app.get('/signup', function (req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage') }); 
})


// =============================================
// Process the signup form
// =============================================
app.post('/signup', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.render('login.ejs', { message: 'Your account is created - please login.' }); 
  } catch (e) {
    // Deal with each Error Code Individually
      if(e.code == 11000){
        res.render('signup.ejs', {message: req.body.email + ' already exists in the system.'})
      }
      else {
        console.log('[-] ERROR !')
        console.log(e)
        res.render('signup.ejs', {message: 'Sorry, we cannot create the account due to a system error.'})
        // res.status(400).send(e)
      }
}
})


// ==================================================
// Display the Profile page
// ==================================================
app.get('/profile', connectEnsureLogin.ensureLoggedIn(),(req, res) => {
  res.render('profile.ejs', {user: req.user})
})


// ==================================================
// Return the current User info
// ==================================================
app.get('/user', connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
)


// =============================================
// Logout
// =============================================
app.get('/logout', function(req, res) {
  console.log("[+] Logging out ")
  req.logout()


  // if the user is logged in, then logout
  if(req.session.user){
    console.log('[+] Logout. User: ' + req.session.user.email + ' session id ' + req.sessionID)
    try {
      req.session.destroy()
    }
    catch (e) {
      console.log("[-] Logout Error: " + e)
    }
    // double check
    if(typeof req.session === 'undefined') {
      console.log('[+] The user was logged out.')
    }
  }
  res.redirect('/')
})





// =============================================
// Export the router
// =============================================
module.exports = app 