const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {body,validationResult} = require("express-validator");
const User = require("../models/User");

const router= express.Router();

router.post("/register", 
    [body("email").isEmail(), body("password").isLength({min:6})],
    async(req,res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});

        try{
            let user=await User.findOne({email:req.body.email});
            if(user) return res.status(400).json({msg:"User already exists"});
            
            user=new User(req.body);
            await user.save();

            const token=jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:"1h"});
            res.json({token});
        }catch(err){
            res.status(500).json({msg:"Server error"});
        }
    }
);

router.post("/login",
    [body("email").isEmail(),body("password").exists()],
    async(req,res)=>{
        const errors=  validationResult(req);
        if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
        try{
            let user= await User.findOne({email:req.body.email});
            if(!user) return res.status(400).json({msg:"Invalid credentials"});

            const isMatch = await bcrypt.compare(req.body.password,user.password);
            if(!isMatch) return res.status(400).json({msg:"Invalid credentials"});


            const token=jwt.sign({userId:user.id},process.env.JWT_SECRET,{expiresIn:"1h"});
            res.json({token});

        }catch (err){
            res.status(500).json({msg:"Server error"});
        }
    }
);

module.exports=router;
