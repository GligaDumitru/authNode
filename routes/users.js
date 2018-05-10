var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var passport = require('passport');
var LocalStrategy = require('passport-local');
var User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});


router.get('/login', function (req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/login',
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username or password' }),
  function (req, res) {
    req.flash('success', 'You ar now loged in');
    res.redirect('/');
  });

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy((username, password, done) => {
  console.log('am ajuns la passport');
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'Unknown user' });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      console.log('am ajuns la compare password');
      if (err) return done(err);

      if (isMatch) {
        console.log('am ajuns is mathc');
        return done(null, user);
      } else {
        console.log('cica parola nu e la fel');
        return done(null, false, { message: 'Invalid Password' });
      }

    });
  });


}));
//post router
router.post('/register', upload.single('profileImage'), function (req, res, next) {


  let name = req.body.name;
  let email = req.body.email;
  let username = req.body.username;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;

  if (req.file) {
    console.log("uploading file");
    var profileImage = req.file.filename;
  } else {
    var profileImage = 'noImg.jpg';
  }

  //Form Validator

  req.checkBody('name', 'Name Field id Required').notEmpty();
  req.checkBody('email', 'Email Field id Required').notEmpty();
  req.checkBody('username', 'Username Field id Required').notEmpty();
  req.checkBody('password', 'Password Field id Required').notEmpty();
  req.checkBody('confirmPassword', 'Confirm Password Field id Required').notEmpty();
  req.checkBody('confirmPassword', 'confirmPassword is not the same').equals(req.body.password);

  // check errors 
  var errors = req.validationErrors();

  if (errors) {
    console.log('Errors');
    res.render('register', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileImage: profileImage
    });

    User.createUser(newUser, (err, user) => {
      if (err) throw err;
      console.log(user);
    });

    req.flash('success', 'You are now registered and can login');
    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success','You are now logged out');
  res.redirect('/users/login');
});

module.exports = router;
