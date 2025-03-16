const auth = require("../middlewares/auth");
const Url = require("../models/Url");
const express = require("express");
const shortid = require("shortid"); 
const router= express.Router();

router.post("/shorten",auth,async(req,res)=>{
    const {long_url,custom_short}=req.body;
    let short_url=custom_short || shortid.generate();
    
    const existingUrl=await Url.findOne({short_url});
    if(existingUrl){
        return res.status(400).json({msg:"Custom shor turl already taken"});
    }
    const url=new Url({
        short_url,
        long_url,
        user:req.user.userId,
    });

    await url.save();
    res.json({short_url,long_url});
});





//get
router.get("/",auth,async (req,res)=>{
    try{
        const userId = req.user.id;
        const urls=await Url.find({user:userId}).sort({created_at:-1});

        res.json(urls);

    }catch(err){
        res.status(500).json({message:"server error"});
    }
})
router.get("/:short_url", async (req, res) => {
    const url = await Url.findOne({ short_url: req.params.short_url });
  
    if (!url) return res.status(404).json({ error: "URL not found" });
    

    url.clicks+=1;
    url.last_accessed=new Date();
    await url.save();
    res.redirect(url.long_url);
  });


  router.get("/analytics/:short_url",async(req,res)=>{
    const url = await Url.findOne({ short_url: req.params.short_url });

    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.json({
      short_url: url.short_url,
      long_url: url.long_url,
      clicks: url.clicks,
      last_accessed: url.last_accessed,
      created_at: url.created_at,
    });
  });

// Get all URLs created by the logged-in user
router.get("/user-urls", auth, async (req, res) => {
    try {
        const urls = await Url.find({ user: req.user.id });
        res.json(urls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

//delete
router.delete("/:id", auth, async (req, res) => {
    try {
        const url = await Url.findById(req.params.id);

        if (!url) {
            return res.status(404).json({ message: "URL not found" });
        }

        // Check if the logged-in user owns the URL
        if (url.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await url.deleteOne();
        res.json({ message: "URL deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});
module.exports=router;
