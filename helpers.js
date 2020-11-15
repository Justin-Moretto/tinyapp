//loops through e-mails, returns a user ID if email is found in the database, else returns false
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email.toString())
      return database[user].id;
  };
  return undefined;
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

//create template Vars
const createTempVars = (user_id, url_id, userDatabase, urlDatabase) => {
  const templateVars = {
    urls: urlsForUser(user_id, urlDatabase),
    users: userDatabase,
    currentUser: undefined,
  };
  if (user_id) {
    templateVars.currentUser = userDatabase[user_id].id;
    templateVars.userEmail = userDatabase[user_id].email;
  }
  if (url_id) {
    templateVars.shortURL = url_id;
    templateVars.longURL = urlDatabase[url_id].longURL;
  }
  return templateVars;
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString, createTempVars };