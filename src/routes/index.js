const express       = require('express')
const User          = require('../models/user')
const router        = new express.Router()
const authMiddleware      = require('../middleware/passport')
const cookie        = require('cookie');

// =============================================
// Display Index Page
// =============================================
router.get('/', function (req, res) {
  res.render('index.ejs'); 
})


// =============================================
// Get Session Info
// =============================================
router.get('/sessioninfo', function(req, res, next) {
  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p>Session ID: ' + req.sessionID + '</p>')
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.write('<p>isAuthenticated: ' + req.isAuthenticated() + '</p>')
     // Parse the cookies on the request
    var cookies = cookie.parse(req.headers.cookie || '');
    // Show the authToken from the cookie
    res.write('<p>AuthToken: ' + cookies.authToken + '</p>')
    res.end()
  } else {
    req.session.views = 1
    res.redirect('/sessioninfo')
  }
})


// =============================================
// Login Page
// =============================================
router.get('/login', function (req, res) {
   // render the page and pass in any flash data if it exists
   res.render('login.ejs', { message: req.flash('loginMessage') }); 
})


// =============================================
// Process the Login form
// =============================================
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
  
    // Set a new authToken cookie
    res.setHeader('Set-Cookie', cookie.serialize('authToken', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }));
    req.session.user = user
    const hour = 3600000
    req.session.cookie.maxAge = hour
    res.redirect('/profile')
    res.end()
    return
    
  } catch (e) {
    console.log("[-] Login Failed:")
    console.log(e)
    res.render('login.ejs', { message: "Login Failed" });
  }
});


// =============================================
// Logout
// =============================================
router.get('/logout', function(req, res) {
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
// Display Signup Page
// =============================================
router.get('/signup', function (req, res) {
  res.render('signup.ejs', { message: req.flash('signupMessage') }); 
})


// =============================================
// process the signup form
// =============================================
router.post('/signup', async (req, res) => {
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


// =============================================
// View User Profile
// =============================================
router.get('/profile', function(req, res) {
  // Check if the user is logged in
  if(req.session.user) {
    console.log('[+] View Profile.  User: ' + req.session.user.email + ' session id ' + req.sessionID)
    res.render('profile.ejs', {
      user : req.session.user // get the user out of session and pass to template
  });
  }
  else {
    res.render('login.ejs', { message: 'Please login.' }); 
  }
});


// =============================================
// Export the router
// =============================================
module.exports = router 