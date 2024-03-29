const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.post("/signup", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt).then(async (hash) => {
        const user = new User({
          name: req.body.name,
          email: req.body.email,
          password: hash,
        });
        const result = await user.save();
        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
          expiresIn: "10m",
        });
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
          attachments: [
            {
              filename: "meta.png",
              path: __dirname + "/meta.png",
              cid: "meta@",
            },
          ],
          html: `
          <div style=" text-align: center;" >
              <img src="cid:meta@" alt="meta"  
              style=" width: 100%; height: 100px; margin-top: 10px;" />
              <br />
              <hr />
              <br />
              <p>
              <span style=" color: rgb(99, 99, 99); font-weight: bold;">
              ${req.body.name}</span>,we welcome to our platform :)
               </p>
               
              <br />    
              <a
                style=" color:white !important;
                padding:15px;
                font-weight: 500;
                background: rgb(0, 102, 255);
                text-decoration: none;
                border-radius: 10px;
                box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;"
                
                href="https://logn-syst.herokuapp.com/user/verify/${token}"
                >Verify Email</a>
        
              <p style="margin-top: 20px; color: gray;">
              This link expire in 10 minutes</p>
        
              <p>Thanks and Regards</p>

              <div style="margin-top: 50px;">&copy; 2021 Meta</div>
            </div>
          `,
        });
        if (info) {
          console.log(info);
        }
        return res.json(result);
      });
    });
  } else if (!user.verified) {
    return res.json({
      msg: "This user is already try to Signup. Please verify your email.",
      link: "https://logn-syst.herokuapp.com/user/verify",
    });
  } else {
    return res.json({
      msg: "This user is already here! Go to the login page. Otherwise try another email.",
    });
  }
});

router.post("/verify", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user.verified) {
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
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
      attachments: [
        {
          filename: "meta.png",
          path: __dirname + "/meta.png",
          cid: "meta@",
        },
      ],
      html: `
          <div style=" text-align: center;" >
              <img src="cid:meta@" alt="meta"  
              style=" width: 100%; height: 100px; margin-top: 10px;" />
              <br />
              <hr />
              <br />
              <p>
              <span style=" color: rgb(99, 99, 99); font-weight: bold;">
              ${req.body.name}</span>,we welcome to our platform :)
               </p>
              <br />    
              <a
                style=" color:white !important;
                padding:15px;
                font-weight: 500;
                background: rgb(0, 102, 255);
                text-decoration: none;
                border-radius: 10px;
                box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;"
                
                href="https://logn-syst.herokuapp.com/user/verify/${token}"
                >Verify Email</a>
        
              <p style="margin-top: 20px; color: gray;">
              This link expire in 10 minutes</p>
        
              <p>Thanks and Regards</p>

              <div style="margin-top: 50px;">&copy; 2021 Meta</div>
            </div>
          `,
    });
    if (info) {
      console.log(info);
    }
    return res.json({
      msg: "Please check your mail and click the verify link",
    });
  }
  else if (!user) {
    return res.json({
      msg: "This user not exist! Please Go to the Signup page.",
    });
  }
  else {
    return res.json({
      msg: "This user is already here! Go to the Login page.",
    });
  }
  
});

module.exports = router;
