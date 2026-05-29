const express=require("express");
const {handleHomePage,handleLoginPage,handleGetSignUpPage,handlePostSignUpPage,handlePostLogin,handleGetChangePassword,handlePostChangePassword,handleGetForgotPassword,handlePostForgotPassword,handleGetResetPassword,handlePostResetPassword}=require("../controllers/authController");
const authRouter=express.Router();
const {isLoggedIn}=require("../middleware/authorization")

authRouter.get("/",handleHomePage)

authRouter.get("/login",handleLoginPage)
authRouter.get("/signup",handleGetSignUpPage)
authRouter.post("/login",handlePostLogin)
authRouter.post('/signup',handlePostSignUpPage)
authRouter.get('/change-password',isLoggedIn,handleGetChangePassword)
authRouter.post('/change-password',isLoggedIn,handlePostChangePassword)
authRouter.get('/forgot-password',handleGetForgotPassword)
authRouter.post('/forgot-password',handlePostForgotPassword)
authRouter.get('/reset-password/:token',handleGetResetPassword)
authRouter.post('/reset-password/:token',handlePostResetPassword)

module.exports={authRouter};