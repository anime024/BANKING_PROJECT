const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const {Transaction}=require("../models/transaction")

async function handleUserDashboard(req, res) {
  const { email } = req.session.user;
  const user = await User.findOne({ email });
  return res.render("dashboard", { user: user });
}

function handleUserLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.log("some error during logout");
    }
    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
}

function handleGetUserDeposit(req, res) {
  res.render("deposit", { message: null });
}

async function handlePostUserDeposit(req, res) {
  const { amount, password } = req.body;
  const { email } = req.session.user;
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.redirect("/login");
  }

  const depamt = Number(amount);
  if (isNaN(depamt) || depamt <= 0) {
    return res.render("deposit", { message: "Enter valid Amount" });
  }

  bcrypt.compare(password, user.password, async function (err, result) {
    if (result == true) {
      const newbal = (user.balance || 0) + depamt;
      await User.updateOne({ email: email }, { balance: newbal });
      await Transaction.create({sender:user.email,receiver:user.email,amount:depamt,type:"Deposit"})
      return res.redirect("/user/dashboard");
    } else {
      return res.render("deposit", {
        message: "password not matched. try again ",
      });
    }
  });
}

function handleGetUserWithdraw(req, res) {
  res.render("withdraw", { message: null });
}

async function handlePostUserWithdraw(req, res) {
  const { amount, password } = req.body;

  const { email } = req.session.user;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.redirect("/login");
  }

  const withamt = Number(amount);
  if (isNaN(withamt) || withamt <= 0) {
    return res.render("withdraw", { message: "Enter valid Amount" });
  }

  bcrypt.compare(password, user.password, async function (err, result) {
    if (result == true) {
      const newbal = (user.balance || 0) - withamt;

      if (newbal < 0) {
        return res.render("withdraw", { message: "insufficient balance" });
      }
      await User.updateOne({ email: email }, { balance: newbal });
     await Transaction.create({sender:user.email,receiver:user.email,amount:withamt,type:"WithDraw"})

      return res.redirect("/user/dashboard");
    } else {
      return res.render("withdraw", {
        message: "password not matched. try again ",
      });
    }
  });
}

async function handleUserTransactions(req, res) {
    const userEmail=req.session.user.email;
    const Transactions=await Transaction.find({$or:[{sender:userEmail},{receiver:userEmail}]}).sort({createdAt:-1});
    const user=await User.findOne({email:userEmail});
  res.render("transactions",{transactions:Transactions,user:userEmail,balance:user.balance});
}

module.exports = {
  handleUserDashboard,
  handleUserLogout,
  handleGetUserDeposit,
  handlePostUserDeposit,
  handleGetUserWithdraw,
  handlePostUserWithdraw,
  handleUserTransactions,
};
