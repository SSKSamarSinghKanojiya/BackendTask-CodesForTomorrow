const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const authRoutes = require("./routes/authRoutes")
require("dotenv").config();

const app = express();


app.use(cors())
app.use(bodyParser.json())


app.use("/api/auth",authRoutes);

// const PORT = process.env.PORT || 5011;
const PORT = 5000;

app.listen(PORT,()=>{
  console.log("Server is running on PORT "+PORT);
  
})