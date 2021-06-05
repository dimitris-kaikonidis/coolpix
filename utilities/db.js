const spicedPG = require('spiced-pg');

const db = spicedPG(process.env.DATABASE_URL || "postgres:dim107:postgres@localhost:5432/imageboard");

module.exports.getImages = () => db.query(`SELECT * FROM images ORDER BY created_at DESC`);

module.exports.storeImage = (url, username, title, description) => db.query(
    `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *;`
    , [url, username, title, description]
);