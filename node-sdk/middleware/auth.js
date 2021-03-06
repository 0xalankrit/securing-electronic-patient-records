const jwt = require("jsonwebtoken");
const config = process.env;

const verifyToken = (req, res, next) => {
    const accessToken =
      req.body.token || req.query.token || req.headers["access-token"];
  
    if (!accessToken) {
      return res.status(403).send("A token is required for authentication");
    }
    try {
      const decoded = jwt.verify(accessToken, config.TOKEN_KEY);
      console.log(decoded)
    
      req.user = decoded;
    } catch (err) {
      return res.status(401).send("Invalid Token");
    }
    return next();
  };
  
  module.exports = verifyToken;