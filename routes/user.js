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
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
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
        <a style="background-color:yellow"color:white" href="http://127.0.0.1:3000/user/verify/${token}">Verify Email</a>
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

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        if (user.verified) {
          const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
          return res.json(token);
        } else {
          return res.json({ msg: "Please verify your account" });
        }
      } else {
        return res.json({ msg: "Wrong Password" });
      }
    }
    return res.json({ msg: "No user found! :(" });
  } catch (error) {
    console.log(error);
    return res.json({ msg: error.message });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return;
      } else {
        const user = await User.findByIdAndUpdate(
          { _id: decoded.id },
          { verified: true },
          { new: true }
        );
        res.json(user);
      }
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: error.message });
  }
});

router.post("/forget", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
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
        html: `
        <div>
            <p><span style="font-weight:bold"> ${user.name}</span>,reset your password.</p>
            <a style="background-color:yellow"color:white" href="http://127.0.0.1:3000/user/forget/${token}">Reser Password</a>
            <div style="backround-color:yellow;">
            <p>from Meta :)</p>
            </div>
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
        return;
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
