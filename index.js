/*  EXPRESS */
const express = require('express');
const app = express();
const session = require('express-session');
app.use(express.static(`${__dirname}/uploads/images`))

/* Multer */
const multer = require('multer');
const upload = multer({dest: __dirname + '/uploads/images'});

var posts;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://user2:coolpassword@cluster0.flkio.mongodb.net/firstdb?retryWrites=true&w=majority";
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.post('/upload', upload.single('photo'), (req, res) => {
    if(req.file) {
        //res.json(req.file);
		
		MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("mydb");
		  var myobj = { name: userProfile.displayName, text: req.body.text,img: req.file.filename,link:req.body.link};
		  dbo.collection("posts").insertOne(myobj, function(err, data) {
			if (err) throw err;
			console.log(userProfile);
			console.log("1 document inserted");
			db.close();
			res.redirect("/success");
		  });
		});
    }
    else throw 'error';
});

app.get('/', function(req, res) {
   
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("posts").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
	posts=result;
    db.close();
	res.render('pages/auth',{posts:posts});
  });
});

});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));


var passport = require('passport');
var userProfile;
 
app.use(passport.initialize());
app.use(passport.session());
 
app.get('/success', (req, res) => {     
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("posts").find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
	posts=result;
    db.close();
	res.render('pages/success', {user: userProfile,posts:posts});
	console.log(userProfile.displayName);
  });
});
  
});
app.get('/error', (req, res) => res.send("error logging in"));
 
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
 
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/* Test */
app.get('/test', function (req, res) {
	res.write("dsfdsf");
	res.end();
	
})

/*  Google AUTH  */
 
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '118028452917-euet4ah5nhl5ga1a8tfc9qq2lovqa4ft.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });

app.get('/logout', function(req, res){
  req.session.destroy(function (err) {
    res.redirect('/'); //Inside a callback… bulletproof!
  });
});