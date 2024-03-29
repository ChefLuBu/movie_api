/** 
 * @constant @type {string} JWT_SECRET  
 * This is received as an ENV Variable 
 * @constant @type {string} passport
 * This is the return value of instantiating the passport package
 * */

const {JWT_SECRET}=require("./config")

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); 

/**This returns a JWT and the parameters that it takes are a user 
 * & a secret
 * @param {string} user 
 * @param {string} JWT_SECRET
 * @returns {string}
 */

let generateJWTToken = (user) => {
  return jwt.sign(user, JWT_SECRET, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256' 
  });
}

/**
 * @exports {function} 
 * @param {object} router 
 * This fuction creates a new endpoint for logging in and
 * uses the local strategy of passport 
 */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false, failureMessage:true }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user, 
          error
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
