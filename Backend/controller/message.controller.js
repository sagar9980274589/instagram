import Message from "../model/message.model";
import Converstaion from "../model/converstaion.model";
export const sendmessage = async (req, res) => {
    try{
const senderId=req.id;
const receiverId=req.params.id;
const {message}=req.body;


const converstaion=await Converstaion.findOne({
    participants:{$all:[senderId,receiverId]}
})
if(!converstaion){
    await Converstaion.create({
        participants:[senderId,receiverId]
    })
};

const newMessage=await Message.create({
    senderId,
    receiverId,
    message
})
if(newMessage){
    converstaion.messages.push(newMessage._id);
}
await Promise.all([converstaion.save(),newMessage()]);

const receiverSocketId=getsocketid(receiverId);
return res.status(201).json({sucess:true,newMessage})


    }





    catch(err){
        console.log(err);
    }
}