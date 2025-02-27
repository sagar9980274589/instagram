import mongoose from "mongoose";
// user model

const userSchema= new mongoose.Schema({
    email:{type:String,require:true},
    password:{type:String,require:true},
    username:{type:String,require:true},
    fullname:{type:String,require:true},
    gender:{type:String, enum:["m","f"]},
    posts:[{type:mongoose.Schema.Types.ObjectId, ref:"Post"}],
    following:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
    followers:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
    bio:{type:String,default:''},
    profile:{type:String,default:''},
    bookmarks:[{type:mongoose.Schema.ObjectId,ref:'Post',default:[]}]
},{timestamps:true})
export default mongoose.model('User',userSchema);