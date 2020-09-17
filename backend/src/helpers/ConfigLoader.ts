import appConfig from '../configs/app.json'
import JWTConfig from '../configs/JWT.json'
import mongodbConfig from '../configs/mongodb.json'

let ENVIRONMENT   = appConfig.env || "prod";

let JWT_SECRET    = JWTConfig.secret || "dev";
let JWT_ALGORITHM = JWTConfig.algorithm || "HS256";

let MONGODB_URL   = mongodbConfig.MONGODB_URL || "mongodb://localhost";

export { ENVIRONMENT, MONGODB_URL, JWT_SECRET, JWT_ALGORITHM };