const mongoose=require("mongoose")

const transactionSchema=new mongoose.Schema({
    sender:{
        type:String
    },
    receiver:{
        type:String,
    },
    amount:{
        type:Number,
    },
    type:{
        type:String,
    }

},{timestamps:true});

const Transaction=mongoose.model("transaction",transactionSchema);

module.exports={Transaction};