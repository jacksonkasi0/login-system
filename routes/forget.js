const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

router.post("/forget", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user.verified) {
      if (user) {
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
        const info = await transporter.sendMail({
          from: process.env.MAIL,
          to: req.body.email,
          subject: "Reset your passoword - Meta",
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
               ${user.name}</span>,confirm to reset your password.
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
                
                href="https://logn-syst.herokuapp.com/user/forget/${token}"
                >Reser Password</a>
        
              <p style="margin-top: 20px; color: gray;">
              This link expire in 10 minutes</p>
        
              <div style="margin-top: 50px;">&copy; 2021 Meta</div>
            </div>
         
        `,
        });
        if (info) {
          console.log(info);
        }
        res.json(user);
      } else {
        return res.json({ msg: "no user found" });
      }
    } else {
      return res.json({ msg: "Please verify your account" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ msg: error.message });
  }
});

router.get("/forget/:token", (req, res) => {
  res.render("forget", {
    token: req.params.token,
  });
});

router.post("/forget/:token", async (req, res) => {
  try {
    const token = await req.params.token;
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.json({ msg: err.message });
      } else {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(req.body.password, salt).then(async (hash) => {
            const user = await User.findByIdAndUpdate(
              { _id: decoded.id },
              { password: hash },
              { new: true }
            );
            res.json("your password changed successfully, please go to login!");
          });
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: error.message });
  }
});

module.exports = router;
