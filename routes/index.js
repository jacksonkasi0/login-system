const router = require("express").Router()
const forgetRouter = require("./forget")
const loginRouter = require("./login")
const signupRouter = require("./signup")

router.use("/", forgetRouter,loginRouter,signupRouter)



module.exports = router;
