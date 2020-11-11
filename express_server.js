const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//update url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  console.log(`updating ${req.params.shortURL} to ${req.body.newURL}`)
  urlDatabase[req.params.shortURL] = req.body.newURL;
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.redirect(`/urls/${shortURL}`, templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(`added ${JSON.stringify(req.body)} to database as ${shortURL}`);  // Log the POST request body to the console
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  console.log(`deleted ${req.params.shortURL} from database`)
  res.redirect(`/urls`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = {
    greeting: 'Hello World!',
    username: req.cookies["username"]
  };
  res.render("hello_world", templateVars);
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

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  console.log(req.cookies.username + " signed in");
  res.redirect(`/urls`);
});

//logout (clear username cookie)
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('urls');
});

//used to generate short URLs
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}
