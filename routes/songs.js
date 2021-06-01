const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const requireLogin = require("../middlewares/requireLogin");

//Adding a friend
router.post("/addFriend", requireLogin, (req, res) => {
    const { friendId } = req.body;

    Users.findByIdAndUpdate(
        {
            _id: req.user._id,
        },
        {
            $push: {
                friends: friendId,
            },
        }
    )
        .populate("friends", ["_id", "name"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

//Remove a friend
router.post("/removeFriend", requireLogin, (req, res) => {
    const { friendId } = req.body;

    Users.findByIdAndUpdate(
        {
            _id: req.user._id,
        },
        {
            $pull: {
                friends: friendId,
            },
        }
    )
        .populate("friends", ["_id", "name"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

//List all friends
router.get("/getAllFriends", requireLogin, (req, res) => {
    const { friendId } = req.body;

    Users.findByIdAndUpdate(
        {
            _id: req.user._id,
        },
        {
            $pull: {
                friends: friendId,
            },
        }
    )
        .populate("friends", ["_id", "name"])
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

//Create a new playlist
router.post("/newPlaylist", (req, res) => {
    const { playlistName } = req.body;

    const user = Users.findByIdAndUpdate({
        _id: req.user._id,
    });

    const playlist = user.playlist.filter(
        (playlist) => playlist.name === playlistName
    );

    if (!playlist) {
        Users.findOneAndUpdate(
            {
                _id: req.user._id,
            },
            {
                $push: {
                    playlists: {
                        name: playlistName,
                    },
                },
            }
        )
            .then((user) => {
                res.status(200).json(user);
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    }
});

//Add song to playlist
router.post("/addSong", requireLogin, (req, res) => {
    const { songId, playlistName } = req.body;

    let user = Users.findByIdAndDelete({
        _id: req.user._id,
    });

    let playlistIndex = user.playlists.findIndex((playlist) => {
        playlist.name === playlistName;
    });

    console.log(playlistIndex, "index");

    const playlist = user.playlists[playlistIndex];

    playlist.songs.push(songId);

    user.playlists = playlist;

    user.save()
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

module.exports = router;
