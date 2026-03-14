const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));



// MongoDB Connection


mongoose.connect("mongodb+srv://shwetabot:Shweta999@cluster0.buahg9p.mongodb.net/?appName=Cluster0")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


// USER MODEL


const userSchema = new mongoose.Schema({
email:String,
password:String,
otp:String
});

const User = mongoose.model("User", userSchema);


// PRODUCT MODEL


const productSchema = new mongoose.Schema({

name:String,
sku:String,
category:String,
unit:String,

stock:{
type:Number,
default:0
}

});

const Product = mongoose.model("Product", productSchema);

// LEDGER MODEL


const ledgerSchema = new mongoose.Schema({

product:String,
type:String,
quantity:Number,
location:String,

date:{
type:Date,
default:Date.now
}

});

const Ledger = mongoose.model("Ledger", ledgerSchema);


// EMAIL TRANSPORTER


const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:"snehajadejatest01@gmail.com",
pass:"wkji jmsk ttmr vltv"
}

});


// HOME


app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"public","login.html"));
});


// SIGNUP


app.post("/signup", async (req,res)=>{

const {email,password} = req.body;

const user = new User({
email,
password
});

await user.save();

res.send("Signup successful");

});


// LOGIN


app.post("/login", async (req,res)=>{

const {email,password} = req.body;

const user = await User.findOne({email,password});

if(!user){
return res.send("Invalid credentials");
}

res.redirect("/dashboard.html");

});



// SEND OTP


app.post("/send-otp", async (req,res)=>{

const {email} = req.body;

const user = await User.findOne({email});

if(!user){
return res.send("User not found");
}

const otp = otpGenerator.generate(6,{
digits:true,
alphabets:false,
upperCase:false,
specialChars:false
});

user.otp = otp;
await user.save();

const resetLink =
`http://localhost:3000/reset.html?email=${email}&otp=${otp}`;

await transporter.sendMail({

from:"snehajadejatest01@gmail.com",
to:email,
subject:"Reset Password",

html:`
<h3>Password Reset</h3>
<p>Click below link:</p>
<a href="${resetLink}">Reset Password</a>
<p>OTP: <b>${otp}</b></p>
`

});

res.send("Password reset link sent to your email");

});



// RESET PASSWORD


app.post("/reset-password", async (req,res)=>{

const {email,otp,password} = req.body;

const user = await User.findOne({email});

if(!user){
return res.send("User not found");
}

if(user.otp !== otp){
return res.send("Invalid OTP");
}

user.password = password;
user.otp = "";

await user.save();

res.send("Password reset successful");

});


// CREATE PRODUCT
app.post("/products/create", async (req,res)=>{

const {name, sku, category, unit, stock} = req.body

try{

await Product.create({
name,
sku,
category,
unit,
stock
})

res.redirect("/products.html")

}catch(err){

console.log(err)
res.send("Error creating product")

}

});


// GET PRODUCTS
app.get("/products", async(req,res)=>{

const products = await Product.find();

res.json(products);

});


// RECEIPTS
app.post("/receipts/create", async(req,res)=>{

const {product,qty} = req.body;

await Product.updateOne(
{name:product},
{$inc:{stock:Number(qty)}}
);

await Ledger.create({

product,
type:"receipt",
quantity:Number(qty),
location:"warehouse"

});

res.send("Receipt completed");

});


// DELIVERIES
app.post("/deliveries/create", async(req,res)=>{

const {product,qty} = req.body;

await Product.updateOne(
{name:product},
{$inc:{stock:-Number(qty)}}
);

await Ledger.create({

product,
type:"delivery",
quantity:-Number(qty),
location:"warehouse"

});

res.send("Delivery completed");

});


// TRANSFER
app.post("/transfer", async(req,res)=>{

const {product,from,to} = req.body;

await Ledger.create({

product,
type:"transfer",
quantity:0,
location:`${from} -> ${to}`

});

res.send("Transfer logged");

});


// ADJUSTMENT
app.post("/adjust", async(req,res)=>{

const {product,counted} = req.body;

const item = await Product.findOne({name:product});

const diff = Number(counted) - item.stock;

item.stock = Number(counted);

await item.save();

await Ledger.create({

product,
type:"adjustment",
quantity:diff,
location:"warehouse"

});

res.send("Stock adjusted");

});


// LEDGER
app.get("/ledger", async(req,res)=>{

const logs = await Ledger.find().sort({date:-1});

res.json(logs);

});


// START SERVER
app.listen(3000,()=>{
console.log("Server running on http://localhost:3000");
});