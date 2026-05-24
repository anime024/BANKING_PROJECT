const express=require("express");
const {handleHomePage,handleLoginPage,handleGetSignUpPage,handlePostSignUpPage,handlePostLogin}=require("../controllers/authController");
const authRouter=express.Router();

authRouter.get("/",handleHomePage)

authRouter.get("/login",handleLoginPage)
authRouter.get("/signup",handleGetSignUpPage)
authRouter.post("/login",handlePostLogin)
authRouter.post('/signup',handlePostSignUpPage)

module.exports={authRouter};