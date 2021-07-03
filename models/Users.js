const mongoose = require("mongoose");

const schema = mongoose.Schema;

const { ObjectId } = schema.Types;

const usersSchema = new schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    password: {
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
            songs: [
                {
                    type: Number,
                    unqiue: true,
                },
            ],
        },
    ],
});

const Users = mongoose.model("Users", usersSchema);

module.exports = Users;
