const mongoose=require("mongoose")

const transactionSchema=new mongoose.Schema({
    user:{
        type:String,
    },
    sender:{
        type:String
    },
    receiver:{
        type:String,
    },
    amount:{
        type:Number,
        required:true,
    },
    type:{
        type:String,
        enum:["Deposit","Withdraw","Transfer"],
        required:true,
    }

},{timestamps:true});

const Transaction=mongoose.model("transaction",transactionSchema);

module.exports={Transaction};