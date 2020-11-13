const { assert } = require('chai');

const getUserByEmail  = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail - valid email', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert(user === expectedOutput, 'function returns a valid email');
  });
});

describe('getUserByEmail - email not in db', function() {
  it('should return undefined if email not found in database', function() {
    const user = getUserByEmail("user99@example.com", testUsers);
    const expectedOutput = undefined;
    assert(user === expectedOutput, 'function returns undefined');
  });
});