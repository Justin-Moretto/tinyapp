const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

const getUserByEmail = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "1qw23r"},
  "9sm5xK": { longURL:"http://www.google.com", userID: "1qw23e"}
};

const users = {

};

//user class
class user {
  constructor() {
    this.id = generateRandomString();
  }
}

//url class
class url {
  constructor(longURL, user_id) {
    this.longURL = longURL;
    this.userID = user_id;
  }
}

//filters out urls from database which aren't tied to current user
const urlsForUser = (id, db) => {
  const urls = {};
  for (const url in db) {
    if (db[url].userID === id) {
      urls[url] = db[url];
    }
  }
  return urls;
};

//used to generate short URLs and user IDs
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

//create template Vars (DRY)
const createTempVars = (user_id) => {
  const templateVars = {
    urls: urlsForUser(user_id, urlDatabase),
    users: users,
    currentUser: undefined,
  };
  if (user_id) {
    templateVars.currentUser = JSON.stringify(users[user_id].id);
  }
  return templateVars;
};

//
//  ROUTES:
//

//learning & testing material; not really relevant to tinyApp
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  const templateVars = {
    greeting: 'Hello World!',
  };
  res.render("hello_world", templateVars);
});

//JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//create new tiny url
app.get("/urls/new", (req, res) => {
  const templateVars = createTempVars(req.session['user_id']);
  if (req.session['user_id']) {
    templateVars.currentUser = JSON.stringify(users[req.session['user_id']].id);
    templateVars.userEmail = users[req.session['user_id']].email;
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
  
});

//update existing url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = createTempVars(req.session['user_id']);
  if (templateVars['urls'][req.params.shortURL]['userID'] === req.session['user_id']) {
    console.log(`updating ${req.params.shortURL} to ${req.body.newURL}`);
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect(`/urls`);
  }
  
});

//display all my urls (if signed in)
app.get("/urls", (req, res) => {
  const templateVars = createTempVars(req.session['user_id']);
  if (req.session['user_id']) {
    templateVars.userEmail = users[req.session['user_id']].email;
  }
  res.render("urls_index", templateVars);
});

//add a new url to db
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = new url(req.body.longURL, req.session['user_id']);

  console.log(`added ${JSON.stringify(req.body)} to database as ${shortURL}`);  // Log the POST request body to the console
  console.log("current database: " + JSON.stringify(urlDatabase));

  res.redirect(`/urls/${shortURL}`);
});

//delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  // const templateVars = createTempVars(req.session['user_id']);
  console.log(urlDatabase[req.params.shortURL]);
  if (urlDatabase[req.params.shortURL]['userID'] === req.session['user_id']) {
    delete urlDatabase[req.params.shortURL];
    console.log(`deleted ${req.params.shortURL} from database`);
  }
  res.redirect(`/urls`);
});

//
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = createTempVars(req.session['user_id']);
  templateVars.shortURL = req.params.shortURL;
  templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
  if (req.session['user_id']) {
    templateVars.userEmail = users[req.session['user_id']].email;
  }
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(`updating ${req.params.shortURL} to ${req.body.newURL}`);
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
});

//go to login page
app.get('/login', (req, res) => {
  const templateVars = createTempVars(req.session['user_id']);
  res.render('account_login', templateVars);
});

//log in
app.post("/login", (req, res) => {
  const registeredUser = getUserByEmail(req.body.email, users);
  if (registeredUser) {
    if (bcrypt.compareSync(req.body.password, users[registeredUser].password)) {
      console.log(`${JSON.stringify(registeredUser)} logged in`);
      req.session["user_id"] = registeredUser;
      res.redirect(`/urls`);
    }
    console.log('incorrect password');
    return res.send('403');
  }
  console.log('not a valid email');
  return res.send('403');
});

//logout (clear user_id cookie)
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('urls');
});

//go to registration page
app.get("/register", (req, res) => {
  const templateVars = createTempVars(req.session['user_id']);
  res.render("account_registration", templateVars);
});

//register new account
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.send('400');
  }

  if (getUserByEmail(req.body.email, users)) {
    return res.send('400');
  }

  if (req.body.email && req.body.password) {
    let newUser = new user();
    newUser['email'] = req.body.email;
    newUser['password'] = bcrypt.hashSync(req.body.password, 10);
    users[newUser.id] = newUser;
    console.log(`New user registered: ${JSON.stringify(newUser)}`);
    req.session["user_id"] = newUser.id;
    res.redirect(`/urls`);
  }
});



