const {handleUserDashboard,handleUserLogout,handleGetUserDeposit,handlePostUserDeposit,handleGetUserWithdraw,handlePostUserWithdraw}=require("../controllers/userController")
const express=require("express")
const {isLoggedIn}=require("../middleware/authorization")
const UserRouter=express.Router();

UserRouter.get('/dashboard',isLoggedIn,handleUserDashboard);
UserRouter.get('/logout',isLoggedIn,handleUserLogout)
UserRouter.get('/deposit',isLoggedIn,handleGetUserDeposit)
UserRouter.post('/deposit',isLoggedIn,handlePostUserDeposit)
UserRouter.get('/withdraw',isLoggedIn,handleGetUserWithdraw)
UserRouter.post('/withdraw',isLoggedIn,handlePostUserWithdraw)

module.exports={UserRouter}