const mongoose = require("mongoose");

const schema = mongoose.Schema;

const { ObjectId } = schema.Types;

const usersSchema = new schema({
    username:{
        type:String
    },
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    photo: {
        type: String,
    },
    friends: [
        {
            type:ObjectId,
            ref:"Users"
        },
    ],
    pending:[
        {
            type:ObjectId,
            ref:"Users"
        }
    ],
    playlists: [
        {
            name: {
                type: String,
            },
            songs: [{
                trackName:{
                    type:String
                },
                artistName:{
                    type:String
                },
                albumArt:{
                    type:String
                },
                trackUrl:{
                    type:String
                }
            }]
        },
    ],
});

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
