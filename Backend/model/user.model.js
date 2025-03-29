import mongoose from "mongoose";

// Define user schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  gender: { type: String, enum: ["m", "f"] },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bio: { type: String, default: "" },
  profile: { type: String, default: "" },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] }],
  
  // ✅ Added Facial Embeddings Field
  facialEmbeddings: {
    type: [Number], // Array of numbers (128D face vector)
    default: [],
  },

}, { timestamps: true });

export default mongoose.model("User", userSchema);
