var express = require('express');
var router = express.Router();
var sql = require('../database/sql');
var path = require('path');

// 정적 파일 경로 설정
router.use(express.static(path.join(__dirname, 'public')));
// 장르별 아이콘
const genreIcons = [
  '🤼‍♀️', '🎭', '🧠', '🎶', '❤️', '🪐', '👻', '👑', '😂', '🧙'
]
// 스크린 준말
const screenMap = {
  NOW: '상영중', 
  END: '종영',
  REL: '개봉예정'
}
// OTT 서비스 준말
const ottMap = {
  COP : '쿠팡플레이',
  NET : 'Netflix',
  ATV : 'Apple TV',
  DPL : 'Disney+',
  TBD : '추후결정'
}
// 기본 페이지
router.get('/', async function(req, res, next) {

  const genre = await sql.getGenre()
  genre.map((item) => {
    item.icon = genreIcons[item.genre_id - 1]
  })

  res.render('genre', { 
    title: '영화 장르 목록',
    genre
  });
});
// 단순 영화 페이지 목록
router.get('/biz-simple', async function(req, res, next) {
  var title = '전체 영화 목록';
  if (req.query.genre === '1')  title = '액션 영화 목록';
  else if (req.query.genre === '2') title = '드라마 영화 목록';
  else if (req.query.genre === '3') title = '미스테리 영화 목록';
  else if (req.query.genre === '4') title = '뮤지컬 영화 목록';
  else if (req.query.genre === '5') title = '로맨스 영화 목록';
  else if (req.query.genre === '6') title = 'SF 영화 목록';
  else if (req.query.genre === '7') title = '공포 영화 목록';
  else if (req.query.genre === '8') title = '애니메이션 영화 목록';
  else if (req.query.genre === '9') title = '코미디 영화 목록';
  else if (req.query.genre === '10') title = '판타지 영화 목록';

  const movies = await sql.getMoviesJoined(req.query)
  movies.map((item) => {
    item.can_screen = screenMap[item.screen]
    item.ott = ottMap[item.OTT]
    item.icon = genreIcons[item.genre_id - 1]
    return item
  })

  res.render('biz-simple', { 
    title: title,
    movies
  });
});

// 고급 영화 페이지 목록
router.get('/biz-adv', async function(req, res, next) {
  var title = '전체 영화 목록';
  if (req.query.genre === '1')  title = '액션 영화 목록';
  else if (req.query.genre === '2') title = '드라마 영화 목록';
  else if (req.query.genre === '3') title = '미스테리 영화 목록';
  else if (req.query.genre === '4') title = '뮤지컬 영화 목록';
  else if (req.query.genre === '5') title = '로맨스 영화 목록';
  else if (req.query.genre === '6') title = 'SF 영화 목록';
  else if (req.query.genre === '7') title = '공포 영화 목록';
  else if (req.query.genre === '8') title = '애니메이션 영화 목록';
  else if (req.query.genre === '9') title = '코미디 영화 목록';
  else if (req.query.genre === '10') title = '판타지 영화 목록';

  const movies = await sql.getMoviesJoined(req.query)
  movies.map((item) => {
    item.can_screen = screenMap[item.screen]
    item.ott = ottMap[item.OTT]
    return item
  })

  res.render('biz-adv', { 
    title: title,
    q: req.query,
    movies
  });
});

// 상세 페이지
router.get('/movie/:id', async function(req, res, next) {
  const biz = await sql.getSingleMovieJoined(req.params.id)
  biz.can_screen = screenMap[biz.screen]
  biz.icon = genreIcons[biz.genre_id - 1]
  biz.ott = ottMap[biz.OTT]

  const businesses = await sql.getBusinessesOfMovie(req.params.id)
  const businessName = businesses.map(business => business.business_name)
  const ratings = await sql.getRatingsOfMovie(req.params.id)
  const avg = await sql.getAverageRating(req.params.id);
 
  res.render('detail', { 
    biz,
    businessName,
    ratings,
    avg,
  });
});
router.put('/movie/:id', async function(req, res, next) {
  const result = await sql.updateMovieLikes(req.params.id, req.body.like)
  res.send(result)
});
router.post('/ratings', async function(req, res, next) {
  const result = await sql.addRating(
    req.body.movie_id,
    req.body.stars,
    req.body.comment
  )
  res.send(result)
});

router.delete('/ratings/:id', async function(req, res, next) {
  const result = await sql.removeRating(req.params.id)
  res.send(result)
});

module.exports = router;
