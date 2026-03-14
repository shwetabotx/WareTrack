const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname,"public")));


// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/waretrack")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


// User schema
const userSchema = new mongoose.Schema({
email:String,
password:String,
otp:String
});

const User = mongoose.model("User",userSchema);


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "snehajadejatest01@gmail.com",
      pass: "wkji jmsk ttmr vltv"
    }
  });


// Home
app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"public","login.html"));
});


// Signup
app.post("/signup",async(req,res)=>{

const {email,password}=req.body;

const user=new User({email,password});

await user.save();

res.send("Signup successful");

});


// Login
app.post("/login",async(req,res)=>{

const {email,password}=req.body;

const user=await User.findOne({email,password});

if(!user){
return res.send("Invalid credentials");
}

res.redirect("/dashboard.html");

});


// Send OTP
app.post("/send-otp",async(req,res)=>{

const {email}=req.body;

const user=await User.findOne({email});

if(!user){
return res.send("User not found");
}

const otp=otpGenerator.generate(6,{
digits:true,
alphabets:false,
upperCase:false,
specialChars:false
});

user.otp=otp;
await user.save();

console.log("OTP:",otp);

await transporter.sendMail({
from:"YOUR_EMAIL@gmail.com",
to:email,
subject:"Password Reset OTP",
text:`Your OTP is ${otp}`
});

res.redirect("/otp.html");

});


// Verify OTP
app.post("/verify-otp",async(req,res)=>{

const {email,otp}=req.body;

const user=await User.findOne({email,otp});

if(!user){
return res.send("Invalid OTP");
}

res.redirect("/reset.html");

});


// Reset password
app.post("/reset-password",async(req,res)=>{

const {email,password}=req.body;

await User.updateOne(
{email},
{password,otp:""}
);

res.send("Password reset successful");

});


app.listen(3000,()=>{
console.log("Server running on http://localhost:3000");
});