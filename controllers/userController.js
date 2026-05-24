const bcrypt=require('bcrypt')
const {User}=require("../models/user")

async function handleUserDashboard(req,res){
    const {email}=req.session.user;
    const user=await User.findOne({email});
    return res.render("dashboard",{user:user});
    
}

function handleUserLogout(req,res){
    req.session.destroy((err)=>{
        if(err){
            console.log("some error during logout");
        }
         res.clearCookie("connect.sid");
    return res.redirect('/')
    }); 

}

function handleGetUserDeposit(req,res){
    res.render("deposit",{message:null});
}

async function handlePostUserDeposit(req,res){
    const {amount,password}=req.body;
    const {email}=req.session.user;
    const user=await User.findOne({email:email});

    bcrypt.compare(password,user.password,async function(err,result){
        if(result==true)
        {
            if(isNaN(amount) || amount<=0)
            {
                return res.render("deposit",{message:"Enter valid Amount"});
            }
            const depamt=Number(amount);
            const newbal=(user.balance||0)+depamt;
           await User.updateOne({email:email},{balance:newbal});
            return res.redirect('/user/dashboard');
        }
        else
        {
            return res.render("deposit",{message:"password not matched. try again "});
        }
    })
}

function handleGetUserWithdraw(req,res){
    res.render("withdraw",{message:null});
}

async function handlePostUserWithdraw(req,res){
    const {amount,password}=req.body;

    if(isNaN(amount) || amount<=0)
            {
                return res.render("withdraw",{message:"Enter valid Amount"});
            }
    const {email}=req.session.user;
    const user=await User.findOne({email:email});

    bcrypt.compare(password,user.password,async function(err,result){
        if(result==true)
        {
            const depamt=Number(amount);
            const newbal=(user.balance||0)-depamt;

            if(newbal<0)
            {
                return res.render("withdraw",{message:"insufficient balance"});
            }
           await User.updateOne({email:email},{balance:newbal});
            return res.redirect('/user/dashboard');
        }
        else
        {
            return res.render("withdraw",{message:"password not matched. try again "});
        }
    })
}


module.exports={handleUserDashboard,handleUserLogout,handleGetUserDeposit,handlePostUserDeposit,handleGetUserWithdraw,handlePostUserWithdraw};