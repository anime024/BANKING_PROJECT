const bcrypt=require('bcrypt')
const saltRounds=10;


const path=require("path")
const {User}=require("../models/user");


function handleHomePage(req,res){
    res.render('homepage');
}

function handleLoginPage(req,res){
    res.render('login')
}

async function handleGetSignUpPage(req,res){
    res.render('signup')
}


async function handlePostSignUpPage(req,res){
    // console.log(req);
    const {name,email,phone,password}=req.body;
    bcrypt.genSalt(saltRounds,function(err,salt){
        bcrypt.hash(password,salt,async function(err,hash){
            const result=await User.create({name:name,email:email,phone:phone,password:hash,salt:salt});
    console.log("Result:" ,result);
    return res.redirect('/login');
        })
    })
    
}

async function handlePostLogin(req,res){
    const {email,password}=req.body;
    console.log(email,password);
    if(!email || !password)
    {
        console.log("no email or password ")
        return res.render('login');
    }

    const user=await User.findOne({email:email});
    if(!user)
    {
        console.log("no user with such email")
        return res.render('signup')
    }

    bcrypt.compare(password,user.password,function(err,result){
        if(result==true)
    {
        console.log(`user found ${user}`)
        return res.json({message:"success",user:user});
    }
    else
    {
        console.log("wrong password");
        return res.render("login");
    }
    })
    
}
module.exports={handleHomePage,handleLoginPage,handleGetSignUpPage,handlePostSignUpPage,handlePostLogin}