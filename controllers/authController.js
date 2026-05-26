const bcrypt=require('bcrypt')
const saltRounds=10;


const path=require("path")
const {User}=require("../models/user");


function handleHomePage(req,res){
    res.render('homepage',{message:null});
}

function handleLoginPage(req,res){
    const message=req.query.msg||null;
    res.render('login',{message})
}

async function handleGetSignUpPage(req,res){
    const message=req.query.msg||null;
    res.render('signup',{message})
}


async function handlePostSignUpPage(req,res){
    // console.log(req);
    const {name,email,phone,password}=req.body;

    const user=await User.findOne({email:email});

    if(user)
    {
        return res.redirect('/signup?msg=Email Already Exist ');
    }
    bcrypt.genSalt(saltRounds,function(err,salt){
        bcrypt.hash(password,salt,async function(err,hash){
            
            try{
                const result=await User.create({name:name,email:email,phone:phone,password:hash,salt:salt})
                console.log("Result:" ,result);
    return res.redirect('/login?msg=SignUp Succesfull. Login to go to Dashboard');
            } catch (error) {
                console.log("Error occured in database while connecting");
                return res.redirect('/');
            }
    
        })
    })
    
}

async function handlePostLogin(req,res){
    const {email,password}=req.body;
    console.log(email,password);
    if(!email || !password)
    {
        console.log("no email or password ")
        return res.render('login',{message:null});
    }

    const user=await User.findOne({email:email});
    if(!user)
    {
        
        return res.redirect('/signup?msg=No Such User Found. SignUp First')
    }

    bcrypt.compare(password,user.password,function(err,result){
        if(result==true)
    {
        req.session.user={
            name:user.name,
            email:user.email,
            id:user._id,
        };
        console.log(`user found ${user}`)
        return res.redirect('/user/dashboard');
    }
    else
    {
        console.log("wrong password");
        return res.redirect('/login?msg=Wrong Password');
    }
    })
    
}
module.exports={handleHomePage,handleLoginPage,handleGetSignUpPage,handlePostSignUpPage,handlePostLogin}