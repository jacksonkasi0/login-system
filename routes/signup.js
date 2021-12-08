const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");


router.post("/signup", async (req, res) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt).then(async (hash) => {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
        });
        const result = await user.save();
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY,{expiresIn:"10m"});
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.MAIL,
            pass: process.env.PASS,
          },
        });
        let info = await transporter.sendMail({
          from: process.env.MAIL,
          to: req.body.email,
          subject: "Verify your email - Meta",
          html: `
          <div>
          <p><span style="font-weight:bold"> ${req.body.name}</span>,we welcome to our platform.</p>
          <a style="background-color:yellow"color:white" href="https://logn-syst.herokuapp.com/user/verify/${token}">Verify Email</a>
          <div style="backround-color:yellow;">
          <p>Thanks and Regards</p>
          <p>from google :)</p>
    
          </div>
          </div>
          `,
        });
        if (info) {
          console.log(info);
        }
        res.json(result);
      });
    });
  });
  

module.exports = router;
