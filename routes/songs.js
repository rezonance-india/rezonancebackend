const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const requireLogin = require("../middlewares/requireLogin");

//Create a new playlist
router.post("/newPlaylist", (req, res) => {
    const { playlistName,userId } = req.body;

    Users.findByIdAndUpdate({
        _id: userId,
    }).then((user) => {
        console.log(user,"user");

        const playlist = user.playlists.filter(
            (playlist) => playlist.name === playlistName
        );

        if (playlist.length === 0) {
            Users.findOneAndUpdate(
                {
                    _id: userId,
                },
                {
                    $push: {
                        playlists: {
                            name: playlistName,
                        },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            )
                .populate("friends",["_id","name","username"])
                .populate("pending",["_id","name","username"])
                .then((user) => {
                    res.status(200).json(user);
                })
                .catch((err) => {
                    res.status(400).json(err);
                });
        } else {
            res.status(400).json({
                message: "Playlist with same name already exists",
            });
        }
    });
});

//Add song to playlist
router.post("/addSong", (req, res) => {
    const { trackName,trackUrl,albumArt,artistName,playlistName,userId } = req.body;

    console.log(playlistName,userId);

    Users.findById({
        _id: userId,
    }).then((user) => {
        let playlistIndex = user.playlists.findIndex(
            (playlist) => playlist.name === playlistName
        );

        console.log(playlistIndex, "index");

        if (playlistIndex === -1) {
            res.status(400).json({
                message: "Playlist doesnt exists",
            });
        } else {

            user.playlists[playlistIndex].songs.push({
                trackName,
                trackUrl,
                albumArt,
                artistName
            });

            console.log(user.playlists,"playlist");

            user.save()
                .then((user) => {
                    res.status(200).json(user);
                })
                .catch((err) => {
                    res.status(400).json(err);
                });
        }
    });
});

//Add to liked songs
router.post("/addToLikedSongs",(req,res) => {
    
    const {trackName,trackUrl,albumArt,artistName,userId} = req.body;

    const playlistName = "Liked Songs";

    Users.findById({
        _id:userId
    }).then((user) => {
        
        let playlistIndex = user.playlists.findIndex(
            (playlist) => playlist.name === playlistName
        );      

        //If playlist of liked songs doesnt exist create it
        if (playlistIndex === -1) {
            Users.findOneAndUpdate(
                {
                    _id: userId,
                },
                {
                    $push: {
                        playlists: {
                            name: playlistName,
                        },
                    },
                },
                {
                    new: true,
                    runValidators: true,
                }
            )
                .then((user) => {
                    
                    let playlistIndex = user.playlists.findIndex(
                        (playlist) => playlist.name === playlistName
                    );

                    user.playlists[playlistIndex].songs.push({
                        trackName,
                        trackUrl,
                        albumArt,
                        artistName
                    });

                    user.save()
                        .then((user) => {
                            res.status(200).json(user);
                        })
                        .catch((err) => {
                            res.status(400).json(err);
                        });
                })
                .catch((err) => {
                    res.status(400).json(err);
                });
        } else {

            Users.findById({
                _id:userId
            }).then((user) => {
        
                let playlistIndex = user.playlists.findIndex(
                    (playlist) => playlist.name === playlistName
                );

                const playlist = user.playlists[playlistIndex];

                console.log(playlist, "playlist");

                playlist.songs.push({
                    trackName,
                    trackUrl,
                    albumArt,
                    artistName
                });

                user.playlists = playlist;

                user.save()
                    .then((user) => {
                        res.status(200).json(user);
                    })
                    .catch((err) => {
                        res.status(400).json(err);
                    });
            })
        }
    })
})


module.exports = router;
