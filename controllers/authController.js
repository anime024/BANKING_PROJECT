const bcrypt = require("bcrypt");
const saltRounds = 10;

const crypto=require("crypto")

const path = require("path");
const { User } = require("../models/user");
const { sendMail } = require("../utils/sendMail");

function handleHomePage(req, res) {
  res.render("homepage", { message: null });
}

function handleLoginPage(req, res) {
  const message = req.query.msg || null;

  res.render("login", { message });
}

async function handleGetSignUpPage(req, res) {
  const message = req.query.msg || null;
  res.render("signup", { message });
}

async function handlePostSignUpPage(req, res) {
  
  const { name, email, phone, password } = req.body;

  const user = await User.findOne({ email: email });

  if (user) {
    return res.redirect("/signup?msg=Email Already Exist ");
  }
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      try {
        const result = await User.create({
          name: name,
          email: email,
          phone: phone,
          password: hash,
          salt: salt,
        });

        await sendMail(
          result.email,
          "SIGN_UP",
          `Hello ${result.name}!.Account Created Succesfully`,
        );
        console.log("Result:", result);
        return res.redirect(
          "/login?msg=SignUp Succesfull. Login to go to Dashboard",
        );
      } catch (error) {
        console.log("Error occured in database while connecting");
        return res.redirect("/");
      }
    });
  });
}

async function handlePostLogin(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    console.log("no email or password ");
    return res.render("login", { message: null });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.redirect("/signup?msg=No Such User Found. SignUp First");
  }

  bcrypt.compare(password, user.password, async function (err, result) {
    if (result == true) {
      req.session.user = {
        name: user.name,
        email: user.email,
        id: user._id,
      };
      // console.log(`user found ${user}`);
      await sendMail(
        user.email,
        "Login_Succesfull",
        `Hello ${user.name}!.loggin Succesfully`,
      );
      return res.redirect("/user/dashboard");
    } else {
      console.log("wrong password");
      return res.redirect("/login?msg=Wrong Password");
    }
  });
}

function handleGetChangePassword(req, res) {
  const message = req.query.msg || null;
  return res.render("changePassword", { message });
}
async function handlePostChangePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log(req.session.user);
    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    // console.log(`User is ${user}`);
    const hashedPassword = user.password;
    
    const match = await bcrypt.compare(currentPassword, hashedPassword);
    if (match) {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(newPassword, salt);
      await User.findByIdAndUpdate(req.session.user.id, { password: hash });
      await sendMail(
        req.session.user.email,
        "Password Modification",
        "Your password changed successfully."
      );

      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      res.clearCookie("connect.sid");
      return res.redirect("/");

    }
    else if (!match) {
      await sendMail(
        req.session.user.email,
        "Password Modification",
        "Your password change failed due to incorrect credentials."
      );

      return res.render("changePassword", {
        message: "Current Password Not Matched",
      });
    }
  } catch (error) {
    console.error("Error in handlePostChangePassword:", error);
    return res.status(500).json({ message: "Some internal error occurred" });
  }
}

function handleGetForgotPassword(req,res){
    const message = req.query.msg || null;
  return res.render("forgotPassword", { message });
}


async function handlePostForgotPassword(req,res){
    try{
    const {formEmail}=req.body;

    const passwordToken=crypto.randomBytes(32).toString("hex");

    
    const user=await User.findOne({email:formEmail});

    if(!user){
        return res.render('forgotPassword',{message:"No account with that email address "})
    }

    await User.findOneAndUpdate({email:formEmail},{resetPasswordToken:passwordToken,resetPasswordExpires:Date.now()+24*60*60*1000})
    await sendMail(user.email,"Passowrd Reset ",`You can reset your password by going to http://localhost:8000/reset-password/${passwordToken} `)

    return res.render('forgotPassword',{message:"MAIL SENT TO EMAIL. RESET PASSWORD FROM THERE "})
}
catch(error){
    return res.json({message:`Some error occured during  handlePostForgotPassword ${error}`})
}

}

function handleGetResetPassword(req,res){
    const token=req.params.token;
    const message=req.query.msg||null;
    return res.render("resetPassword",{message,token});


}

async function handlePostResetPassword(req,res){
    try{
        
        const newPassword=req.body.password;
        const token=req.params.token;
        const user=await User.findOne({resetPasswordToken:token});
        if(!user)
        {
            return res.json({message:"No user found with this token "});

        }

        if(user.resetPasswordExpires<Date.now())
        {
            return res.json({message:"TOKEN EXPIRED. GENERATE NEW TOKEN "});
        }

        bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(newPassword, salt, async function(err, hash) {
        await User.findByIdAndUpdate(user._id,{password:hash,resetPasswordExpires:null,resetPasswordToken:null});
        await sendMail(user.email,"Password Reset Succesfully ","You have sucessfuly created new password")
        return res.redirect('/login?msg=Login Now with your created new password')
    });
});

    }
    catch(error){
        res.json(`Some Error during handlePostResetPassword ${error}`)
    }

}


module.exports = {
  handleHomePage,
  handleLoginPage,
  handleGetSignUpPage,
  handlePostSignUpPage,
  handlePostLogin,
  handleGetChangePassword,
  handlePostChangePassword,
  handleGetForgotPassword,
  handlePostForgotPassword,
  handleGetResetPassword,
  handlePostResetPassword

};
