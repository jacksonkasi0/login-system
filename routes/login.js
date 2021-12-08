const User = require("../models/user");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        if (user.verified) {
          const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
            expiresIn: "10",
          });
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

module.exports = router;
