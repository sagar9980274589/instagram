import express from 'express'
import { auth } from '../middleware/auth.middleware.js';
import {upload} from '../service/multer.js';
const router=express.Router();
import { sendmessage,getmessage } from '../controller/message.controller.js';
import { login, register, editprofile,bookmark ,getprofile,getothersprofile,getbookmark,getsuggested,uploadpost,comment,getallpost,likeorunlike,followorunfollow,getpostcontent,getcomments,deletecomment,deletepost} from '../controller/user.controller.js';
router.post('/register',register)
router.post('/login',login)
router.post('/editprofile',auth,upload.single('profile'),editprofile)
router.get('/getprofile',auth,getprofile)
router.get('/getothersprofile/:username',getothersprofile)
router.post('/uploadpost',auth,upload.single('image'),uploadpost)
router.post('/addcomment/:post',auth,comment)
router.get('/like/:post',auth,likeorunlike)
router.get('/followorunfollow/:targetid',auth,followorunfollow)
router.get('/getpost',auth,getpostcontent)
router.get('/getcomments/:postid',getcomments)
router.post('/deletecomment/:commentid',deletecomment)
router.get('/deletepost/:postid',deletepost)
router.get('/getallpost',auth,getallpost)
router.get('/getsuggested',auth,getsuggested)
router.get('/bookmark/:postid',auth,bookmark)
router.get('/getbookmarks',auth,getbookmark)
router.post('/sendmessage/:receiverId',auth,sendmessage)
router.get('/getmessages/:receiverId',auth,getmessage)
export default router