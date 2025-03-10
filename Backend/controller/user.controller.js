import User from "../model/user.model.js";
import Post from "../model/post.model.js";
import Comment from "../model/comment.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from "../service/multer.js";
//Controller to register user

export const register = async (req, res) => {
  try {
    const { fullname, email, password, username } = req.body;

    if (!fullname || !email || !password || !username) {
      return res.json({
        success: false,
        message: "all fields are required",
      });
    }
    const user = await User.find({ email: email });
   
    if (user.length > 0) {
      return res.status(500).json({
        success: false,
        message: "user already exist",
      });
    }
    try {
      const hashedpass = await bcrypt.hash(password, 10);
    
      const createduser = await User.insertOne({
        fullname,
        email,
        password: hashedpass,
        username,
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: `error saving user : ${err}`,
      });
    }
    return res.status(200).json({
      success: true,
      message: "user registered succesfully",
    });
  } catch (err) {
    console.log("error registering user :", err);
    return res.status(400).json({
      success: false,
      message: `something went wrong : ${err}`,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(500).json({
        success: false,
        message: "all fields are required",
      });
    }
    const user = await User.find({ email: email });

    if (user.length == 0) {
      return res.status(401).json({
        success: false,
        message: "email or password wrong",
      });
    }
    try {
      const matchpass = await bcrypt.compare(password, user[0].password);
      if (matchpass) {
        const token = jwt.sign(
          { id: user[0]._id, email: user[0].email },
          process.env.JWT_SECRET
        );
        return res.cookie("token", token).status(200).json({
          success: true,
          message: "user logged in succesfully",
          token: token,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: "email or password wrong",
        });
      }
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log("error logging in user :", err);
    return res.status(400).json({
      success: false,
      message: `something went wrong : ${err}`,
    });
  }
};

export const editprofile = async (req, res) => {
  try {
    const userid = req.id;

    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
    }
    const user = await User.findOne({ _id: userid }).select("-password");
    if(user){
    const { bio, gender } = req.body;

    const url = await uploadToCloudinary(req.file.path);

    const data = await User.findOneAndUpdate(
      { _id: userid },
      { bio: bio, gender: gender, profile: url }
    );

    res.status(200).json({ message: "edited succesfully" });
}else{
    return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
  }
  } catch (err) {
    console.log(err);
  }
};

export const getprofile = async (req, res) => {
  try {
    const userid = req.id;

    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
    }

    const user = await User.findOne({ _id: userid }).select("-password");
    if(user){
    res.status(200).json({
      success: true,
      user: user,
    });
}
else{
    return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
  }
  } catch (err) {
    console.log(err);
  }
};

////
export const getothersprofile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
    }

    const user = await User.findOne({ _id: username }).select("-password");
    if(user){
    res.status(200).json({
      success: true,
      user: user,
    });
}
else{
    return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
  }
  } catch (err) {
    console.log(err);
  }
};
///

export const uploadpost = async (req, res) => {
  try {
    const userid = req.id;
    const { caption } = req.body;
    if (!caption) {
      caption = "";
    }
    if (!req.file) {
      return res.status(500).json({ message: "image is compulsary" });
    }

    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
    }

    const user = await User.findOne({ _id: userid });

    if (user) {
    
      const url = await uploadToCloudinary(req.file.path);
    const postdata=  await Post.insertOne({
        caption: caption,
        image: url,
        author: user._id,
      });
      await User.findOneAndUpdate(
        { _id: user._id },
        { $push: { posts: postdata._id } }
      );

      res.status(200).json({success:true, message: "post uploaded succesfully",post:postdata });
    }
    else{
        return res.status(401).json({
            success: false,
            message: "user not authenticated",
          });
      }
  } catch (err) {
    console.log(err);
  }
};

/////

export const comment = async (req, res) => {
  try {
    const userid = req.id;
    const { comment } = req.body;
    const { post } = req.params;
  
    if (!comment || !post) {
      return res
        .status(500)
        .json({ message: "comment is compulsary or post error" });
    }

    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
    }

    const user = await User.findOne({ _id: userid });

    if (user) {
      const addedcomment = await Comment.insertOne({
        author: user._id,
        comment: comment,
        post: post,
      })
      await Post.findOneAndUpdate(
        { _id: post },
        { $push: { comments: addedcomment._id } }
      );

      res.status(200).json({ message: "comment added succesfully" });
    }
    else{
        return res.status(401).json({
            success: false,
            message: "user not authenticated",
          });
      }
  } catch (err) {
    console.log(err);
  }
};
///

export const likeorunlike = async (req, res) => {
    try {
      const userid = req.id;
     
      const { post } = req.params;
      if ( !post) {
        return res
          .status(500)
          .json({  success: false, message: " post error" });
      }
  
      if (!userid) {
        return res.status(401).json({
          success: false,
          message: "user not authenticated",
        });
      }
  
      const user = await User.findOne({ _id: userid });
  
      if (user) {
        const postdata= await Post.findOne({_id:post})
        if( postdata.likes.includes(userid))
        {
          await Post.findOneAndUpdate(
            { _id: post },
            { $pull: { likes: user._id } }
          );
    
          res.status(200).json({  success: true, message: "liked" });
        }
        else{
          await Post.findOneAndUpdate(
            { _id: post },
            { $push: { likes: user._id } }
          );
    
          res.status(200).json({  success: true, message: "disliked" });
        }
       


      }
      else{
        return res.status(401).json({
            success: false,
            message: "user not authenticated",
          });
      }
    } catch (err) {
      console.log(err);
    }
  };
  ///
  
export const followorunfollow = async (req, res) => {
    try {
      const userid = req.id;
     const {targetid}=req.params;
     
      if ( !targetid) {
        return res
          .status(500)
          .json({  success: false, message: " some error" });
      }
  
      if (!userid) {
        return res.status(401).json({
          success: false,
          message: "user not authenticated",
        });
      }
      if(userid==targetid){
        return res.status(500).json({
            success: false,
            message: "you cant follow or unfollow yourself",
          });

      }
  
      const user = await User.findOne({ _id: userid });
      const targetuser= await User.findOne({ _id: targetid });
  
      if (user&&targetuser) {
       if(user.following.includes(targetuser._id))
       {
        await User.findOneAndUpdate(
            { _id: user._id },
            { $pull: { following: targetuser._id } }
          );
          await User.findOneAndUpdate(
            { _id: targetuser._id },
            { $pull: { followers: user._id } }
          );

        res.status(200).json({  success: true, message: "unfollowed succesfully" });
       }
       else{
        await User.findOneAndUpdate(
            { _id: user._id },
            { $push: { following: targetuser._id } }
          );
          await User.findOneAndUpdate(
            { _id: targetuser._id },
            { $push: { followers: user._id } }
          );

        res.status(200).json({  success: true, message: "followed succesfully" });
       }
  
       

      }
      else{
        return res.status(401).json({
            success: false,
            message: "user or other not found",
          });
      }
    } catch (err) {
      console.log(err);
    }
  };
  //////

  export const getpostcontent = async (req, res) => {
    try {
     
      const userid = req.id;

      if (!userid) {
        return res.status(401).json({
          success: false,
          message: "user id not found",
        });
      }
  
      const post = await Post.find({ author: userid });
     
      if(post){
      res.status(200).json({
        success: true,
        post: post,
      });
  }
  else{
      return res.status(401).json({
          success: false,
          message: "post not found",
        });
    }
    } catch (err) {
      console.log(err);
    }
  };

  
  export const getcomments = async (req, res) => {
    try {
      const { postid } = req.params;
     
      if (!postid) {
        return res.status(401).json({
          success: false,
          message: "post id not found",
        });
      }
  
      const comments = await Comment.find({ post: postid }).populate('author','profile username');
     
      if(comments){
      res.status(200).json({
        success: true,
        comments: comments,
      });
  }
  else{
      return res.status(401).json({
          success: false,
          message: "comments not found",
        });
    }
    } catch (err) {
      console.log(err);
    }
  };
  //
  export const deletecomment = async (req, res) => {
    try {
      const { commentid } = req.params;
     
      if (!commentid) {
        return res.status(401).json({
          success: false,
          message: "comment id not found",
        });
      }
  
      const comment = await Comment.findOne({ _id: commentid });
     
      if(comment){
        await Comment.deleteOne({ _id: commentid });
        await Post.updateOne({$pull:{comments:commentid}})
        res.status(200).json({
          success: true,
          message:"comment deleted"
        })
  }
  else{
      return res.status(401).json({
          success: false,
          message: "comments not found",
        });
    }
    } catch (err) {
      console.log(err);
    }
  };

///
export const deletepost = async (req, res) => {
  try {
    const { postid } = req.params;
   
    if (!postid) {
      return res.status(401).json({
        success: false,
        message: "post id not found",
      });
    }

    const post = await Post.findOne({ _id: postid });
   
    if(post){
      await Post.deleteOne({ _id: postid });
      await User.updateOne({ _id: post.author }, { $pull: { posts: postid } }); 
      await Comment.deleteMany({post:postid})
      res.status(200).json({
        success: true,
        message:"post deleted"
      })
}
else{
    return res.status(401).json({
        success: false,
        message: "post not found",
      });
  }
  } catch (err) {
    console.log(err);
  }
};

export const getallpost = async(req,res)=>{
  try{
    const Posts = await Post.find()
  .sort({ createdAt: -1 }) // Sorts newest first
  .populate('author', 'username profile') // Populate author details
  .populate({
    path: 'comments',
    populate: { path: 'author', select: 'username profile' }, // Populate author inside comments
  });

  
res.status(200).json({
  success: true,
  posts:Posts});

  }
  catch(err){
    console.log(err)
  }
}
//
export const getsuggested=async(req,res)=>{
  


  try{
    const userid = req.id;
    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
    }
  
    const suggested = await User.find({ id: { $ne: userid } });

res.status(200).json({ success: true,suggested});
  }
  catch(err){

  }
}
//

export const bookmark=async(req,res)=>{
  


  try{
  
    const userid = req.id;
    if (!userid) {
      return res.status(401).json({
        success: false,
        message: "user not authenticated",
      });
    }
    
      const { postid } = req.params;
     
      if (!postid) {
        return res.status(401).json({
          success: false,
          message: "post id not found",
        });
      }
     
      const user = await User.findOne({ _id:  userid } );

if(user){
if(user.bookmarks.includes(postid))
{
  await User.updateOne({_id:userid},{$pull:{bookmarks:postid}})
  res.status(200).json({ success: true,message:"bookmark removed "})
}else{


await User.updateOne({_id:userid},{$push:{bookmarks:postid}})
res.status(200).json({ success: true,message:"bookmark added "})
}
}
else{
  return res.status(401).json({
      success: false,
      message: "user not found",
    });

  }
}
  catch(err){
console.log(err)
  }
  
}


export const getbookmark = async (req, res) => {
  try {
    const userId = req.id;  // Get the user ID from the request (assumed to be attached)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found",
      });
    }

    // Find the user by ID and populate the bookmarks field with actual Post documents
    const user = await User.findById(userId)
                            .populate({
                              path: "bookmarks",   // Populate the bookmarks field
                              select: "image caption likes comments author", // Select fields from the Post model you need
                              populate: { 
                                path: "author",   // Optional: populate the 'author' field to get user details
                                select: "username profile"  // Select fields from the User model
                              }
                            });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return the list of bookmarked posts with full details
    return res.status(200).json({
      success: true,
      bookmarkedPosts: user.bookmarks,  // Send the bookmarked posts with full details
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching bookmarked posts.",
    });
  }
};
