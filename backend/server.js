const dotenv=require("dotenv");
const express=require("express");
const mongoose=require("mongoose");
const cors=require("cors");
const shortid=require("shortid");
const Url=require("./models/Url");
const rateLimit = require("express-rate-limit");
const urlRoutes = require("./routes/url");
const authRoutes = require("./routes/auth"); 

dotenv.config();
const app=express();

app.use(express.json());
app.use(cors());

app.use("/url", urlRoutes);
app.use("/auth", authRoutes);

const limiter = rateLimit({
    windowMs:1*60*1000,
    max:5,
    message:"Too amny requests,please try again later."
});

app.use(limiter);

mongoose.connect(process.env.MONGO_URI).then(()=>
    console.log("MongoDB Connected")
).catch(err=>console.error(err));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT,()=> console.log(`Server running on port ${PORT}`));