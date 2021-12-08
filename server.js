const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRouter = require("./routes");
require("dotenv").config();
const path = require("path")

app.set("view engine", "ejs");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('/'));
app.use("/user", userRouter);

connectDB();

app.get("/", (req, res) => {
  res.send("Login system is working!");
});

app.listen(3000, () => {
  console.log("server is up and running...");
});
