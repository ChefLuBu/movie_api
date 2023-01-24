const config = {

CONNECTION_URI: process.env.CONNECTION_URI || "mongodb://localhost:27017/myFlixDB",
JWT_SECRET: process.env.JWT_SECRET || "jwtSecret"

}
module.exports=config 