const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://shwetabot:Shweta999@cluster0.buahg9p.mongodb.net/?appName=Cluster0")
.then(()=>{
    console.log("MongoDB Connected")
})
.catch((err)=>{
    console.log(err)
})