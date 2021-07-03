const express = require("express");
const requireLogin = require("../middlewares/requireLogin");
const router = express.Router();
const Messages = require("../routes/messages");

//Send a new message
router.post("/send",requireLogin,(req,res) => {

    const {to} = req.body;

    const {trackName,albumArt,trackUrl,artistName} = req.body; 

    const messageData = {
        trackName,
        albumArt,
        trackUrl,
        artistName
    }

    Messages.findOne({
        $or:[
            {
                $and:[{user : req.user._id},{to}]
            },
            {
                $and:[{user:to},{to:req.user._id}]
            }
        ]
    }).then((res) => {
        if(res.data){
            Message.findOneAndUpdate({
                $or:[{
                    user:req.user._id,to:req.user._id
                }]
            },{
                $addToSet :{
                    chats: {user: req.user._id, message:messageData}
                }
            })
            .populate("user",["name"]);
        }
        else {
            const data = {
                user:req.user._id,
                to,
                chat:[
                    {
                        user:req.user._id,
                        message:messageData
                    }
                ]
            }

            const newChat = new Message(data);
            
            newChat.save()
            .then((chat) => {
                res.status(200)
                .json(chat)
            }).catch((err) => {
                res.status(400).json(err);
            })
        }
    })  
})

//Get the users' chat list
router.post("/getChatlist",(req,res) => {
    
})