const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { Transaction } = require("../models/transaction");

const PDFDocument = require("pdfkit");

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
      await Transaction.create({
        user: user.email,
        amount: depamt,
        type: "Deposit",
      });
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
      await Transaction.create({
        user: user.email,
        amount: withamt,
        type: "Withdraw",
      });

      return res.redirect("/user/dashboard");
    } else {
      return res.render("withdraw", {
        message: "password not matched. try again ",
      });
    }
  });
}

async function handleUserTransactions(req, res) {

  const userEmail = req.session.user.email;
  let filter = {};
  const { type, minAmount, maxAmount } = req.query;
  if (type) {
    filter.type = type;
  }

  if (minAmount || maxAmount) {
    filter.amount = {};
  }

  if (minAmount) {
    filter.amount.$gte = Number(minAmount);
  }
  if (maxAmount) {
    filter.amount.$lte = Number(maxAmount);
  }

  const Transactions = await Transaction.find({...filter,$or:[{sender:userEmail},{receiver:userEmail},{user:userEmail}]}).sort({ createdAt: -1 });
  const user = await User.findOne({ email: userEmail });
  res.render("transactions", {
    transactions: Transactions,
    user: userEmail,
    balance: user.balance,
  });
}

async function handleGetUserStatement(req, res) {
  try {
    const doc = new PDFDocument({margin: 50});

    res.setHeader("Content-Disposition", "attachment; filename=statement.pdf");

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    const userEmail = req.session.user.email;

    const Transactions = await Transaction.find({
      $or: [
        { sender: userEmail },
        { receiver: userEmail },
        { user: userEmail },
      ],
    }).sort({ createdAt: -1 });
    const user = await User.findOne({ email: userEmail });

    doc.fontSize(20).text("MDG Bank Statement", {
      align: "center",
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    doc.moveDown();

    doc.fontSize(15).text(`Name: ${user.name}`);

    doc.text(`Email: ${user.email}`);

    doc.text(`Balance: ${user.balance}`);


    doc.moveDown();

    doc.fontSize(12).text("Transactions");


    doc.moveDown();

    doc.table({
      rowStyles: (i) => {
        if (i === 0) return { backgroundColor: "#f84b4b" };
        if (i % 2 === 0 && i !== 0) return { backgroundColor: "#ccc" };
      },
      data: [
        ["S.No", "Type", "Amount", "Created At","FLOW"],
        ...Transactions.map((tx, i) => {
          let flow = "";

      if (tx.type === "Deposit") {
        flow = "Credit";
      } else if(tx.type==="Withdraw") {
        flow = "Debit";
      }else if(tx.type==="Transfer" && tx.sender===userEmail){
        flow="Debit";
      }
      else if(tx.type==="Transfer" && tx.receiver===userEmail){
        flow="Credit";
      }
          return [
          
          `${i + 1}`,
          `${tx.type}`,
          `${tx.amount}`,
          `${new Date(tx.createdAt).toLocaleString()}`,
          `${flow}`
        ]}),
      ],
    });

    doc.end();
  } catch (error) {
    console.log("Error in statement", error);
    return res.send("Error inn statement downloading");
  }
}

module.exports = {
  handleUserDashboard,
  handleUserLogout,
  handleGetUserDeposit,
  handlePostUserDeposit,
  handleGetUserWithdraw,
  handlePostUserWithdraw,
  handleUserTransactions,
  handleGetUserStatement,
};
