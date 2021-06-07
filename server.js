const chalk = require("chalk");
const fs = require("fs/promises");
const { getImages, storeImage } = require("./utilities/db");
const { uploader } = require("./utilities/upload");
const { uploadFile, getS3URL } = require("./utilities/S3");
const { analyzeImg } = require("./utilities/rekognition");
//const cookieSession = require("cookie-session");
const express = require("express");

const app = express();

app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// app.use(cookieSession({
//     secret: sessionSecret,
//     maxAge: 1000 * 60 * 60 * 24 * 30
// }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

app.get("/images", (req, res) =>
    getImages()
        .then(result => res.json(result.rows))
        .catch(error => console.log(error))
);

app.post("/api/upload", uploader.single("file"), (req, res) => {
    if (!req.file) res.redirect("/");
    else
        uploadFile(req.file)
            .then(result => {
                fs.rm("./uploads/" + req.file.filename);
                const url = getS3URL(req.file.filename);
                const { title, description, username } = req.body;
                analyzeImg(url).then(result => {
                    const tags = [];
                    result.Labels.forEach(Label => tags.push(Label.Name));
                    console.log(tags);
                });
                storeImage(url, title, description, username)
                    .then(result => res.json({ success: true, images: result.rows }))
                    .catch(error => {
                        res.json({ success: false });
                        console.log(error);
                    });
            })
            .catch(error => console.log(error));
});

if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));
}

module.exports = app;
