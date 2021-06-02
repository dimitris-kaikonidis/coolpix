const chalk = require("chalk");

const { getImages } = require("./utilities/db");
const cookieSession = require("cookie-session");
const express = require("express");


const app = express();

app.use(express.static("public"));

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

if (require.main === module) {
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Running Server @ ${chalk.blue(`http://localhost:${PORT}`)}`));
}

module.exports = app;
