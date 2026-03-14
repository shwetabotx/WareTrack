const express = require("express");
const path = require("path");
const User = require("./models/User");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

require("./db");

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"public","login.html"));
});


// SIGNUP
app.post("/signup", async(req,res)=>{
  const {email,password} = req.body;

  const user = new User({email,password});
  await user.save();

  res.send("Signup successful. Go to login.");
});


// LOGIN
app.post("/login", async(req,res)=>{
  const {email,password} = req.body;

  const user = await User.findOne({email,password});

  if(!user){
    return res.send("Invalid credentials");
  }

  res.redirect("/dashboard.html");
});


// SEND OTP
app.post("/send-otp", async(req,res)=>{

  const {email} = req.body;

  const user = await User.findOne({email});

  if(!user){
    return res.send("User not found");
  }

  const otp = otpGenerator.generate(6,{digits:true,alphabets:false});

  user.otp = otp;
  await user.save();

  const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
      user:"YOUR_EMAIL@gmail.com",
      pass:"APP_PASSWORD"
    }
  });

  await transporter.sendMail({
    from:"YOUR_EMAIL@gmail.com",
    to:email,
    subject:"Password Reset OTP",
    text:`Your OTP is ${otp}`
  });

  res.send("OTP sent to email");
});


// VERIFY OTP
app.post("/verify-otp", async(req,res)=>{

  const {email,otp} = req.body;

  const user = await User.findOne({email,otp});

  if(!user){
    return res.send("Invalid OTP");
  }

  res.redirect("/reset.html");
});


// RESET PASSWORD
app.post("/reset-password", async(req,res)=>{

  const {email,password} = req.body;

  await User.updateOne({email},{password,otp:""});

  res.send("Password reset successful");
});


app.listen(3000,()=>{
  console.log("Server running on http://localhost:3000");
});