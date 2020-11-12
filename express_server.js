const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {

}

//user class
class user {
  constructor() {
    this.id = generateRandomString();
  }
}

//used to generate short URLs and user IDs
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
};

const verifyEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email.toString())
      return users[user].id;
  };
  return false;
}


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



//displaying urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: null,
  };
  if (req.cookies["user_id"]) {
    templateVars.currentUser = JSON.stringify(users[req.cookies["user_id"]].id)
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    currentUser: null
  };
  if (req.cookies["user_id"]) {
    templateVars.currentUser = JSON.stringify(users[req.cookies["user_id"]].id)
  };
  res.render("urls_new", templateVars);
});

//update existing url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  console.log(`updating ${req.params.shortURL} to ${req.body.newURL}`)
  urlDatabase[req.params.shortURL] = req.body.newURL;
  const templateVars = {
    urls: urlDatabase,
    users: users
  };
  res.redirect(`/urls/${shortURL}`, templateVars);
});

//adding a new url to db
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(`added ${JSON.stringify(req.body)} to database as ${shortURL}`);  // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//deleting a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(`deleted ${req.params.shortURL} from database`)
  res.redirect(`/urls`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users: users
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  console.log(`updating ${req.params.shortURL} to ${req.body.newURL}`)
  urlDatabase[req.params.shortURL] = req.body.newURL;
  res.redirect(`/urls/${shortURL}`);
});

//go to login page
app.get('/login', (req, res) => {

  res.render('account_login');
})

//loging in
//update this to work with user_id
app.post("/login", (req, res) => {
  const registeredUser = verifyEmail(req.body.email);
  if (registeredUser) {
    if (users[registeredUser].password === req.body.password) {
      console.log(`${JSON.stringify(registeredUser)} logged in`);
      res.cookie("user_id", registeredUser);
      res.redirect(`/urls`);
    }
    return res.send('403');
  };
  return res.send('403');
});

//logout (clear username cookie)
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('urls');
});

//go to registration page
app.get("/register", (req, res) => {
  res.render("account_registration");
});

//register new account
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.send('400');
  };

  if (verifyEmail(req.body.email)) {
    return res.send('400');
  };

  if (req.body.email && req.body.password) {
    let newUser = new user();
    newUser['email'] = req.body.email;
    newUser['password'] = req.body.password;
    users[newUser.id] = newUser;
    console.log(`New user registered: ${JSON.stringify(newUser)}`);
    res.cookie("user_id", newUser.id);
    res.redirect(`/urls`);
  }

});



