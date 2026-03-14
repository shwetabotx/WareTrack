require("./db")
const express = require("express");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const User = require("./models/User")

app.post("/register", async (req,res)=>{

const {email,password} = req.body

const user = new User({
email,
password
})

await user.save()

res.json({message:"User created"})

})

app.post("/login", async (req,res)=>{

const {email,password} = req.body

const user = await User.findOne({email,password})

if(user){
res.json({success:true})
}else{
res.json({success:false})
}

})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});