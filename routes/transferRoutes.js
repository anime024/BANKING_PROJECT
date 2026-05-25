const express=require("express");
const {isLoggedIn}=require("../middleware/authorization")


const {handleGetTransfer,handlePostTransfer}=require("../controllers/transferController")

const transferRouter=express.Router();

transferRouter.get('/transfer',isLoggedIn,handleGetTransfer)
transferRouter.post('/transfer',isLoggedIn,handlePostTransfer)

module.exports={transferRouter};
