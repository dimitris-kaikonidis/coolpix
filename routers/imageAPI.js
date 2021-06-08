const fs = require("fs/promises");
const { getFirstImages, getNextImages, getImage, storeImage } = require("../utilities/db");
const { uploader } = require("../utilities/upload");
const { uploadFile, getS3URL } = require("../utilities/S3");
const { analyzeImg } = require("../utilities/rekognition");
const express = require("express");
const router = express.Router();

router.get("/api/images/first", (req, res) =>
    getFirstImages()
        .then(result => res.json(result.rows))
        .catch(error => console.log(error))
);

router.get("/api/images/next/:id", (req, res) => {
    const { id } = req.params;
    getNextImages(id)
        .then(result => res.json(result.rows))
        .catch(error => console.log(error));
});

router.get("/api/images/:id", (req, res) => {
    const { id } = req.params;
    getImage(id)
        .then(result => {
            const image = result.rows[0];
            if (image) {
                res.json({ success: true, image });
            } else {
                res.json({ success: false });
            }
        })
        .catch(error => console.log(error));
});

router.post("/api/upload", uploader.single("file"), (req, res) => {
    if (!req.file) res.redirect("/");
    else
        uploadFile(req.file)
            .then(() => {
                fs.rm("./uploads/" + req.file.filename);
                const url = getS3URL(req.file.filename);
                const { title, description, username } = req.body;
                // analyzeImg(url).then(result => {
                //     const tags = [];
                //     result.Labels.forEach(Label => tags.push(Label.Name));
                //     console.log(tags);
                // });
                storeImage(url, username, title, description)
                    .then(result => res.json({ success: true, images: result.rows }))
                    .catch(error => {
                        res.json({ success: false });
                        console.log(error);
                    });
            })
            .catch(error => console.log(error));
});

module.exports = router;