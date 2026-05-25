require('dotenv').config();
const express=require("express")
const mongoose=require("mongoose");
const path=require("path")
const session=require("express-session");

const {authRouter}=require("./routes/authRoutes")
const {UserRouter}=require("./routes/userRoutes")
const {transferRouter}=require("./routes/transferRoutes")
const bodyParser=require('body-parser');
const app=express();
app.set("view engine",'ejs')
app.set("views",path.join(__dirname,"views"));
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
    secret:process.env.session_secret,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:1000*300
    }
}))


mongoose.connect('mongodb://127.0.0.1:27017/mdg_pro')
.then(()=>{
    console.log("mongoose connected succesfully");
}).catch((err)=>{
    console.log(`error occured during connecting mongoose,${err}`)
})

app.use("/",authRouter);
app.use("/user",UserRouter);
app.use('/bank',transferRouter);


app.listen(process.env.port,()=>{
    console.log("server started at 8000");
})