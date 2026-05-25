const {User}=require("../models/user")
const bcrypt=require("bcrypt")
const {Transaction}=require("../models/transaction")

function handleGetTransfer(req,res){
    res.render("transfer",{message:null});
}

async function handlePostTransfer(req,res){
    console.log("handlePostTransfer")
    const {receiverEmail,amount,password}=req.body;
    const transferAmount=Number(amount);
    const senderEmail=req.session.user.email;
    const senderUser=await User.findOne({email:senderEmail});
    if(!senderUser)
    {
        console.log(" !senderUser ")
        return res.redirect('/login');
    }

    const receiverUser=await User.findOne({email:receiverEmail});
    if(!receiverUser)
    {
        console.log(" !receiverUser ")
        return res.render('transfer',{message:"Receiver Not Found"});
    }
    if(isNaN(transferAmount)|| transferAmount<=0)
    {
        console.log(" isNaN(transferAmount)|| transferAmount<=0 ")
        return res.render('transfer',{message:"Invalid Amount"}); 
    }

    if(senderUser.balance<transferAmount)
    {
        console.log(" senderUser.balance<transferAmount ")
        return res.render('transfer',{message:"INSUFFICIENT AMOUNT "});
    }

    if(receiverUser._id.toString==senderUser._id.toString)
    {
        return res.render('transfer',{message:"Cannot Transfer to Self "});
    }

    bcrypt.compare(password,senderUser.password,async function(err,result){
            if(result==true)
            {
                const newbalSender=(senderUser.balance||0)-transferAmount;
                await User.updateOne({email:senderEmail},{balance:newbalSender});
                const newbalReceiver=(receiverUser.balance||0)+transferAmount;
                await User.updateOne({email:receiverEmail},{balance:newbalReceiver});

                await Transaction.create({
                    sender:senderEmail,
                    receiver:receiverEmail,
                    amount:transferAmount,
                    type:"Transfer"
                })
                return res.redirect('/user/dashboard');
            }
            else
            {
                return res.render("transfer",{message:"password not matched. try again "});
            }
        })

}
module.exports={handleGetTransfer,handlePostTransfer};