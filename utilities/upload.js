const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationDir = __dirname + "/../uploads";
        cb(null, destinationDir);
    },
    filename: function (req, file, cb) {
        uidSafe(24)
            .then(uid => cb(null, uid + path.extname(file.originalname)));
    }
});

module.exports.uploader = multer({
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    storage: diskStorage
});