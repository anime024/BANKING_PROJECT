const express=require("express");
const {isLoggedIn}=require("../middleware/authorization")


const {handleGetTransfer,handlePostTransfer,handlePostFindUser}=require("../controllers/transferController")

const transferRouter=express.Router();

transferRouter.get('/transfer',isLoggedIn,handleGetTransfer)
transferRouter.post('/transfer',isLoggedIn,handlePostTransfer)
transferRouter.post("/find-user",handlePostFindUser);
module.exports={transferRouter};
