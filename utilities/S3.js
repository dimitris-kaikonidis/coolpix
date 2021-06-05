const fs = require("fs");
const aws = require("aws-sdk");

let secrets = process.env.NODE_ENV === "production" ? process.env : require("../secrets.json");

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

module.exports.uploadFile = fileToUpload => {
    const { filename, mimetype, size, path } = fileToUpload;
    return s3
        .putObject({
            Bucket: "imageboard-dim",
            ACL: "public-read",
            Key: filename,
            Body: fs.createReadStream(path),
            ContentType: mimetype,
            ContentLength: size
        })
        .promise();
};

module.exports.getS3URL = filename => "https://imageboard-dim.s3.us-east-1.amazonaws.com/" + filename;
