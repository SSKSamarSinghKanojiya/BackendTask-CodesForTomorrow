const mysql = require("mysql2")

const pool =  mysql.createPool({
  host:"localhost",
  user:"root",
  password:"882717",
  database:"codefortomorrow"
})

module.exports = pool.promise();