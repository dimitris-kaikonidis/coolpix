const aws = require("aws-sdk");

let secrets = process.env.NODE_ENV === "production" ? process.env : require("../secrets.json");

const rek = new aws.Rekognition({
    apiVersion: '2016-06-27',
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "us-east-1"
});

module.exports.analyzeImg = imgUrl => {
    const params = {
        Image: {
            S3Object: {
                Bucket: 'imageboard-dim',
                Name: imgUrl.replace("https://imageboard-dim.s3.us-east-1.amazonaws.com/", ""),
            }
        },
        MaxLabels: '5',
        MinConfidence: '70'
    };

    return rek
        .detectLabels(params)
        .promise();
};

