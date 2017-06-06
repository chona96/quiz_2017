var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// Pagina de creditos
router.get('/author', function(req, res, next) {
    res.render('author');
});


// Pagina de jugar
//router.get('/quizzes/randomcheck/:quizId?answer=respuesta', function(req, res, next) {
  //  res.render('random_play');




// Autoload de rutas que usen :quizId
router.param('quizId', quizController.load);


// Definición de rutas de /quizzes
router.get('/quizzes',                     quizController.index);
router.get('/quizzes/:quizId(\\d+)',       quizController.show);
router.get('/quizzes/new',                 quizController.new);
router.post('/quizzes',                    quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',  quizController.edit);
router.put('/quizzes/:quizId(\\d+)',       quizController.update);
router.delete('/quizzes/:quizId(\\d+)',    quizController.destroy);

router.get('/quizzes/:quizId(\\d+)/play',  quizController.play);
router.get('/quizzes/:quizId(\\d+)/check', quizController.check);
router.get('/quizzes/randomplay',  quizController.random_play);
router.get('/quizzes/randomcheck/:quizId?',  quizController.random_check);



router.get('/help', function(req,res,next){
	res.render('ayuda');
});

module.exports = router;
