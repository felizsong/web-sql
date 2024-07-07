const mysql = require('mysql2');

const pool = mysql.createPool(
  process.env.JAWSDB_URL ?? {
    host: 'localhost',
    user: 'root',
    database: 'movies',
    password: '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
);
const promisePool = pool.promise();

const sql = {

  getGenre : async () => {
    const [rows] = await promisePool.query(`
      SELECT * FROM genre
    `)
    return rows
  },

  getMoviesJoined : async (query) => {
    const sqlQuery = `
      SELECT * FROM genre S
      LEFT JOIN movies B
        ON S.genre_id = B.fk_genre_id
      WHERE TRUE
        ${query.genre
          ? ('AND genre_id = ' + query.genre) : ''}
         ${query.age
          ? (`AND age = '${query.age}'`) : ''}
         ${query.screen
          ? (`AND screen = '${query.screen}'`) : ''}
         ${query.OTT ? `AND OTT = '${query.OTT}'` : ''}
      ORDER BY
         ${query.order 
          ? query.order : 'movie_id'}
    `
    console.log(sqlQuery)

    const [rows] = await promisePool.query(sqlQuery)
    return rows
  },
  getSingleMovieJoined : async (movie_id) => {
    const [rows] = await promisePool.query(`
      SELECT * FROM genre S
      LEFT JOIN movies B
        ON S.genre_id = B.fk_genre_id
      WHERE movie_id = ${movie_id}
    `)
    return rows[0]
  },
  // 영화별 배급사 정보 얻기
  getBusinessesOfMovie : async (movie_id) => {
    const [rows] = await promisePool.query(`
      SELECT * FROM businesses
      WHERE fk_movie_id = ${movie_id}
    `)
    return rows
  },
  // 좋아요 증감
  updateMovieLikes : async (id, like) => {
    return await promisePool.query(`
      UPDATE movies
      SET likes = likes + ${like}
      WHERE movie_id = ${id}
    `)
  },
    // 평점 정보
    getRatingsOfMovie : async (movie_id) => {
        const [rows] = await promisePool.query(`
          SELECT rating_id, stars, comment,
          DATE_FORMAT(
            created, '%y년 %m월 %d일'
          ) AS created_fmt
          FROM ratings
          WHERE fk_movie_id = ${movie_id}
        `)
        return rows
      },
    // 평균 평점 구하기
    getAverageRating : async (movie_id) => {
        const [rows] = await promisePool.query(`
          SELECT ROUND(AVG(stars), 1) AS avg FROM ratings
          WHERE fk_movie_id = ${movie_id}
        `)
        return rows[0].avg;
    },
    // 평점 등록하기
    addRating : async (movie_id, stars, comment) => {
      return await promisePool.query(`
      INSERT INTO ratings
      (fk_movie_id, stars, comment)
      VALUES
      (${movie_id}, '${stars}', '${comment}')
    `)
    },
    // 평점 지우기
    removeRating : async (rating_id) => {
      return await promisePool.query(`
      DELETE FROM ratings
      WHERE rating_id = ${rating_id}
    `)
    }
}

module.exports = sql