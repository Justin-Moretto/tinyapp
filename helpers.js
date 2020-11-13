//loops through e-mails, returns a user ID if email is found in the database, else returns false
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email.toString())
      return database[user].id;
  };
  return undefined;
}

module.exports = getUserByEmail;