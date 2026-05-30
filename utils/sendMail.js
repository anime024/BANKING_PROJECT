require("dotenv").config();


const nodemailer=require("nodemailer")

const transporter=nodemailer.createTransport({
    service:"gmail",
    pool: true,
    connectionTimeout: 10000,
    socketTimeout: 10000,

    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

async function sendMail(to,subject,text){
    try{
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:to,
            subject:subject,
            text:text,
        })
        console.log("Email sent succesfully ");
    }catch(error){
        console.log("Email error :  ",error);
    }
}
module.exports = {sendMail};