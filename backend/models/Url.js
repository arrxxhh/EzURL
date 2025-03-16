const mongoose= require('mongoose');
const urlSchema = new mongoose.Schema({
    short_url:{type:String,unique:true,required:true},
    long_url:{type:String,required:true},
    clicks: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    last_accessed: { type: Date },
    created_at:{type:Date,default:Date.now},
});

module.exports=mongoose.model("Url",urlSchema);
