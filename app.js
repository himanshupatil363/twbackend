const express = require("express");
require("dotenv").config();
const createError = require("http-errors");
const calender = require("./routes/calender");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", calender);
app.use((req, res, next) => {
  next(createError.NotFound());
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message,
  });
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("server started"));
mongoose.connect(process.env.DBURI,(err)=>{if(err){console.log(err)}})