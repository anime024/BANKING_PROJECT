const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const {sendMail}=require('../utils/sendMail')



const { Transaction } = require("../models/transaction");

function handleGetTransfer(req, res) {
  res.render("transfer", { message: null });
}

async function handlePostTransfer(req, res) {
  const session = await mongoose.startSession();
  
  // Keep track of email data outside the transaction scope
  let successEmailData = null; 

  try {
    await session.withTransaction(async () => {
      const { receiverEmail, amount, password } = req.body;
      const transferAmount = Number(amount);
      const senderEmail = req.session?.user?.email;

      if (!senderEmail) {
        throw new Error("AUTH_REQUIRED");
      }

      // 1. Structural & Input Validation
      if (isNaN(transferAmount) || transferAmount <= 0) {
        throw new Error("INVALID_AMOUNT");
      }

      // Fetch users attached to the current session
      const senderUser = await User.findOne({ email: senderEmail }).session(session);
      if (!senderUser) {
        throw new Error("SENDER_NOT_FOUND");
      }

      const receiverUser = await User.findOne({ email: receiverEmail }).session(session);
      if (!receiverUser) {
        throw new Error("RECEIVER_NOT_FOUND");
      }

      if (receiverUser._id.toString() === senderUser._id.toString()) {
        throw new Error("SELF_TRANSFER");
      }

      // 2. Balance & Security Validation
      if (senderUser.balance < transferAmount) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const passwordMatch = await bcrypt.compare(password, senderUser.password);
      if (!passwordMatch) {
        throw new Error("PASSWORD_MISMATCH");
      }

      // 3. Database Operations (All or Nothing)
      await User.updateOne(
        { email: senderEmail },
        { $inc: { balance: -transferAmount } },
        { session }
      );

      await User.updateOne(
        { email: receiverEmail },
        { $inc: { balance: transferAmount } },
        { session }
      );

      await Transaction.create([{
        sender: senderEmail,
        receiver: receiverEmail,
        amount: transferAmount,
        type: "Transfer",
      }], { session });

      successEmailData = {
        to: senderUser.email,
        senderName: senderUser.name,
        receiverName: receiverUser.name,
        newBalance: senderUser.balance - transferAmount
      };
    });

    res.redirect("/user/dashboard");

    if (successEmailData) {
      sendMail(
        successEmailData.to,
        "Transfer Successful",
        `Hello ${successEmailData.senderName}! Money transferred successfully to ${successEmailData.receiverName}. Your updated balance is ${successEmailData.newBalance}`
      ).catch(err => console.error("Transfer email failed to send:", err));
    }

  } catch (error) {
    console.log("Transfer rejected: ", error.message);

    switch (error.message) {
      case "AUTH_REQUIRED":
      case "SENDER_NOT_FOUND":
        return res.redirect("/login");
      case "INVALID_AMOUNT":
        return res.render("transfer", { message: "Invalid Amount" });
      case "RECEIVER_NOT_FOUND":
        return res.render("transfer", { message: "Receiver Not Found" });
      case "SELF_TRANSFER":
        return res.render("transfer", { message: "Cannot Transfer to Self" });
      case "INSUFFICIENT_FUNDS":
        return res.render("transfer", { message: "INSUFFICIENT AMOUNT" });
      case "PASSWORD_MISMATCH":
        return res.render("transfer", { message: "password not matched. try again" });
      default:
        return res.status(500).render("transfer", { message: "An unexpected database error occurred." });
    }
  } finally {
    await session.endSession();
  }
}

async function handlePostFindUser(req, res) {
  const { email } = req.body;

  const senderEmail = req.session.user.email;
  const user = await User.findOne({ email });

  if (!user) {
    return res.json({ success: false });
  }

  res.json({
    success: true,
    user: { name: user.name, email: user.email },
    senderEmail,
  });
}
module.exports = { handleGetTransfer, handlePostTransfer, handlePostFindUser };
