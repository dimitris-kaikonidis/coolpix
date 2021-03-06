const spicedPG = require('spiced-pg');

const db = spicedPG(process.env.DATABASE_URL || "postgres:dim107:postgres@localhost:5432/imageboard");

module.exports.getFirstImages = () => db.query(
    `SELECT *,
    (SELECT COUNT(id) FROM images)
    FROM images ORDER BY created_at DESC LIMIT 16;`
);

module.exports.getNextImages = (lastId) => db.query(`SELECT * FROM images WHERE id < $1 ORDER BY created_at DESC LIMIT 16;`, [lastId]);

module.exports.getImage = (id) => db.query(
    `SELECT *,
    (SELECT id AS prev_id FROM images WHERE id > $1 ORDER BY id ASC LIMIT 1),
    (SELECT id AS next_id FROM images WHERE id < $1 ORDER BY id DESC LIMIT 1)
    FROM images WHERE id = $1;
    `, [id]
);

module.exports.deleteImage = (id) => db.query(`DELETE FROM images WHERE id = $1 RETURNING url`, [id]);

module.exports.storeImage = (url, username, title, description, tags) => db.query(
    `INSERT INTO images (url, username, title, description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *;`, [url, username, title, description, tags]
);

module.exports.getImageComments = (imageId) => db.query(`SELECT * FROM comments WHERE imageId = $1 ORDER BY created_at DESC;`, [imageId]);

module.exports.addComment = (comment, username, imageId) => db.query(
    `INSERT INTO comments (comment, username, imageId) VALUES ($1, $2, $3) RETURNING *;`, [comment, username, imageId]
);

module.exports.setTags = (tags, imageId) => db.query(`UPDATE images SET tags = $1 WHERE id = $2 RETURNING tags;`, [tags, imageId]);
