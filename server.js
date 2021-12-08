const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const userRouter = require("./routes");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.set("view engine", "ejs");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use("/user", userRouter);

connectDB();

app.get("/", (req, res) => {
  res.send("Login system is working! ");
});

app.listen( PORT, () => {
  console.log("server is up and running...");
});
