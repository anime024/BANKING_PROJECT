require('dotenv').config();

console.log(process.env.uri);

const express=require("express")
const mongoose=require("mongoose");
const {User}=require("./models/user")
const path=require("path")
const session=require("express-session");
const {MongoStore} = require('connect-mongo');

const {authRouter}=require("./routes/authRoutes")
const {UserRouter}=require("./routes/userRoutes")
const {transferRouter}=require("./routes/transferRoutes")


const bodyParser=require('body-parser');
const app=express();
app.set("view engine",'ejs')
app.set("views",path.join(__dirname,"views"));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}))


mongoose.connect(process.env.uri)
.then(async()=>{
    console.log("mongoose connected succesfully");
    await User.init();
}).catch((err)=>{
    console.log(`error occured during connecting mongoose,${err}`)
})

app.use(session({
    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: process.env.uri,
        collectionName: "sessions"
    }),

    cookie: {
        maxAge: 1000 * 60 * 5
    }
}));

// app.get("/", (req, res) => {
//   res.send("API running");
// });

app.use("/",authRouter);
app.use("/user",UserRouter);
app.use('/bank',transferRouter);

const PORT=process.env.port||5000;
app.listen(PORT,()=>{
    console.log("server started at 8000");
})