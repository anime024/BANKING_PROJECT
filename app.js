const express=require("express")
const mongoose=require("mongoose");
const path=require("path")

const {authRouter}=require("./routes/authRoutes")
const bodyParser=require('body-parser');
const app=express();
app.set("view engine",'ejs')
app.set("views",path.join(__dirname,"views"));
app.use(bodyParser.urlencoded({extended:true}))


mongoose.connect('mongodb://127.0.0.1:27017/mdg_pro')
.then(()=>{
    console.log("mongoose connected succesfully");
}).catch((err)=>{
    console.log(`error occured during connecting mongoose,${err}`)
})

app.use("/",authRouter);


app.listen(8000,()=>{
    console.log("server started at 8000");
})