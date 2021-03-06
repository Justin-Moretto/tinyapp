const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

//npm packages
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');

//importing functions from helpers.js
const getUserByEmail = require('./helpers').getUserByEmail;
const generateRandomString = require('./helpers').generateRandomString;
const createTempVars = require('./helpers').createTempVars;

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//set view engine to ejs
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

//my 'databases' which are really just objects
const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: '1qw23r' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: '1qw23e' }
};
const userDatabase = {};

//user class
class user {
  constructor(email) {
    this.id = generateRandomString();
    this.email = email;
  }
}

//url class
class url {
  constructor(longURL, user_id) {
    this.longURL = longURL;
    this.userID = user_id;
  }
}


//////////////
//  ROUTES: //
//////////////

//redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

//create new tiny url
app.get('/urls/new', (req, res) => {
  const templateVars = createTempVars(req.session['user_id'], null, userDatabase, urlDatabase);
  if (req.session['user_id']) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//navigate to tiny url's page to edit it
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = createTempVars(req.session['user_id'], shortURL, userDatabase, urlDatabase);
  templateVars.urlOwner = urlDatabase[shortURL].userID;
  res.render('urls_show', templateVars);
});

//update existing url
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = createTempVars(req.session['user_id'], null, userDatabase, urlDatabase);
  if (templateVars['urls'][shortURL]['userID'] === req.session['user_id']) {
    urlDatabase[shortURL].longURL = req.body.newURL;
  }
  res.redirect(`/urls`);
});

//display all my urls (if signed in)
app.get('/urls', (req, res) => {
  const templateVars = createTempVars(req.session['user_id'], null, userDatabase, urlDatabase);
  res.render('urls_index', templateVars);
});

//add a new url to db
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  if (req.session['user_id']) {
    let longURL = req.body.longURL;
    if (!(longURL.startsWith('http://') || longURL.startsWith('https://'))) {
      longURL = "http://" + longURL;
    }
    urlDatabase[shortURL] = new url(longURL, req.session['user_id']);
  }
  res.redirect(`/urls/${shortURL}`);
});

//delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]['userID'] === req.session['user_id']) {
    delete urlDatabase[shortURL];
  }
  res.redirect(`/urls`);
});

//redirect to the true, long URL when tiny url is clicked
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
  res.redirect('/urls');
});

//go to login page
app.get('/login', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = createTempVars(req.session['user_id'], null, userDatabase, urlDatabase);
  res.render('account_login', templateVars);
});

//log in
app.post('/login', (req, res) => {
  const registeredUser = getUserByEmail(req.body.email, userDatabase);
  if (registeredUser) {
    if (bcrypt.compareSync(req.body.password, userDatabase[registeredUser].password)) {
      req.session['user_id'] = registeredUser;
      res.redirect(`/urls`);
    }
    return res.status(403).send('403 - incorrect password');
  }
  return res.status(403).send('403 - no account with this e-mail exists; try registering instead');
});

//go to registration page
app.get('/register', (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  }
  const templateVars = createTempVars(req.session['user_id'], null, userDatabase, urlDatabase);
  res.render('account_registration', templateVars);
});

//register new account
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('400 - please enter an e-mail and password');
  }

  if (getUserByEmail(req.body.email, userDatabase)) {
    return res.status(400).send('400 - that e-mail is already registered with tinyApp');
  }

  if (req.body.email && req.body.password) {
    let newUser = new user(req.body.email);
    const salt = bcrypt.genSaltSync(10);
    newUser['password'] = bcrypt.hashSync(req.body.password, salt);
    userDatabase[newUser.id] = newUser;
    req.session['user_id'] = newUser.id;
    res.redirect(`/urls`);
  }
});

//logout (clear user_id cookie)
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('urls');
});


//listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
