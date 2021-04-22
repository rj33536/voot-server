const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const firebase = require("firebase");

firebase.initializeApp({
    apiKey: "AIzaSyAg9wWi7OccQPxDYWWKIeNMdcOvds-3_iE",
    authDomain: "workout-clock.firebaseapp.com",
    databaseURL: "https://workout-clock.firebaseio.com",
    projectId: "workout-clock",
    storageBucket: "workout-clock.appspot.com",
    messagingSenderId: "563160271644",
    appId: "1:563160271644:web:c939c10fd327bd27d508d9"
})


let videos = [];
let allVideos = [];
firebase.database().ref("videos").once("value").then((snapshot) => {
    let rv = snapshot.val();
    allVideos = rv;
    Object.keys(rv).map((obj) => {

        const video = rv[obj];
        video.id = obj;
        videos.push(video)
    })
    //console.log(videos);
})


const app = express();
app.use(cors({ origin: "*" }));
app.get('/videos', (req, res) => res.json(videos));

app.get('/category/:category', (req, res) => {
    const filtered = videos.filter((video) => {
        return video.categories === req.params.category;
        //return video.categories.includes(req.params.category);
    })

    res.json(filtered)
});

// add after app.get('/video/:id/data', ...) route

const thumbsupply = require('thumbsupply');

app.listen(process.env.PORT || 4000, () => {
    console.log('Listening on port 4000!')
});

app.get('/video/:id/poster', (req, res) => {
    thumbsupply.generateThumbnail(`assets/${req.params.id}.mp4`)
        .then(thumb => res.sendFile(thumb))
        .catch(err => {
            //console.log(err);
            res.send("something wrong with thumbnail")
        });
});

app.get('/rate', (req, res) => {
    let movieId = req.query.movieId, userId = req.query.userId, rating = req.query.rating;

    firebase.database().ref("ratings")
        .orderByChild("userId")
        .equalTo(userId)
        .once("value").then((snapshot) => {
            console.log();
            let isMatched = false;
            snapshot.forEach((snp) => {
                let obj = snp.val();
                console.log(obj);
                if (obj.movieId === movieId) {
                    //do something here
                    isMatched = true;

                }
            })
            if (!isMatched) {
                firebase.database().ref("ratings").push({
                    rating: rating,
                    movieId: movieId,
                    userId: userId
                })
            }


        })

    firebase.database().ref("ratings").push({
        movieId,
        userId,
        rating
    }).then((data) => {
        console.log(data);
    })

    res.send("");
})

app.get('/video/:id/data', (req, res) => {
    res.json(allVideos[req.params.id]);
})
// add after the app.get('/video/:id/poster', ...) route

app.get('/video/:id/caption', (req, res) => res.sendFile('assets/captions/sample.vtt', { root: __dirname }));
