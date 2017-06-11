var models = require("../models");
var Sequelize = require('sequelize');

var paginate = require('../helpers/paginate').paginate;

// Autoload el quiz asociado a :quizId
exports.load = function (req, res, next, quizId) {

    models.Quiz.findById(quizId, {
        include: [
            {model: models.Tip, include: [{model: models.User, as: 'Author'}]},
            {model: models.User, as: 'Author'}

        ]
    })
    .then(function (quiz) {
                     if (quiz) {
                        req.quiz = quiz;
                        next();
                      } else {
                    throw new Error('No existe ningún quiz con id=' + quizId);
                }
    }).catch(function (error) {
                next(error);
    });
};


// MW que permite acciones solamente si al usuario logeado es admin o es el autor del quiz.
exports.adminOrAuthorRequired = function(req, res, next){

    var isAdmin  = req.session.user.isAdmin;
    var isAuthor = req.quiz.AuthorId === req.session.user.id;
    var isTipAuthor= req.tip.AuthorId=== req.session.user.id;

    if (isAdmin || isAuthor || isTipAuthor) {//añadimos a la or que si eres el autor de la tip también estas autorizado
        next();
    } else {
        console.log('Operación prohibida: El usuario logeado no es el autor del quiz, ni un administrador.');
        res.send(403);
    }
};


// GET /quizzes
exports.index = function (req, res, next) {

    var countOptions = {
        where: {}
    };

    var title = "Preguntas";

    // Busquedas:
    var search = req.query.search || '';
    if (search) {
        var search_like = "%" + search.replace(/ +/g,"%") + "%";

        countOptions.where.question = { $like: search_like };
    }

    // Si existe req.user, mostrar solo sus preguntas.
    if (req.user) {
        countOptions.where.AuthorId = req.user.id;
        title = "Preguntas de " + req.user.username;
    }

    models.Quiz.count(countOptions)
    .then(function (count) {

        // Paginacion:

        var items_per_page = 10;

        // La pagina a mostrar viene en la query
        var pageno = parseInt(req.query.pageno) || 1;

        // Crear un string con el HTML que pinta la botonera de paginacion.
        // Lo añado como una variable local de res para que lo pinte el layout de la aplicacion.
        res.locals.paginate_control = paginate(count, items_per_page, pageno, req.url);

        var findOptions = countOptions;

        findOptions.offset = items_per_page * (pageno - 1);
        findOptions.limit = items_per_page;
        findOptions.include = [{model: models.User, as: 'Author'},
            {model: models.Tip, include: [{model: models.User, as: 'Author'}]},
                                ];

        return models.Quiz.findAll(findOptions);
    })
    .then(function (quizzes) {
        res.render('quizzes/index.ejs', {
            quizzes: quizzes,
            search: search,
            title: title
        });
    })
    .catch(function (error) {
        next(error);
    });
};


// GET /quizzes/:quizId
exports.show = function (req, res, next) {

    res.render('quizzes/show', {quiz: req.quiz});
};


// GET /quizzes/new
exports.new = function (req, res, next) {

    var quiz = {question: "", answer: ""};

    res.render('quizzes/new', {quiz: quiz});
};


// POST /quizzes/create
exports.create = function (req, res, next) {

    var authorId = req.session.user && req.session.user.id || 0;

    var quiz = models.Quiz.build({
        question: req.body.question,
        answer: req.body.answer,
        AuthorId: authorId
    });

    // guarda en DB los campos pregunta y respuesta de quiz
    quiz.save({fields: ["question", "answer", "AuthorId"]})
    .then(function (quiz) {
        req.flash('success', 'Quiz creado con éxito.');
        res.redirect('/quizzes/' + quiz.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('quizzes/new', {quiz: quiz});
    })
    .catch(function (error) {
        req.flash('error', 'Error al crear un Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/edit
exports.edit = function (req, res, next) {

    res.render('quizzes/edit', {quiz: req.quiz});
};


// PUT /quizzes/:quizId
exports.update = function (req, res, next) {

    req.quiz.question = req.body.question;
    req.quiz.answer = req.body.answer;

    req.quiz.save({fields: ["question", "answer"]})
    .then(function (quiz) {
        req.flash('success', 'Quiz editado con éxito.');
        res.redirect('/quizzes/' + req.quiz.id);
    })
    .catch(Sequelize.ValidationError, function (error) {

        req.flash('error', 'Errores en el formulario:');
        for (var i in error.errors) {
            req.flash('error', error.errors[i].value);
        }

        res.render('quizzes/edit', {quiz: req.quiz});
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar el Quiz: ' + error.message);
        next(error);
    });
};


// DELETE /quizzes/:quizId
exports.destroy = function (req, res, next) {

    req.quiz.destroy()
    .then(function () {
        req.flash('success', 'Quiz borrado con éxito.');
        res.redirect('/goback');
    })
    .catch(function (error) {
        req.flash('error', 'Error al editar el Quiz: ' + error.message);
        next(error);
    });
};


// GET /quizzes/:quizId/play
exports.play = function (req, res, next) {

    var answer = req.query.answer || '';

    res.render('quizzes/play', {
        quiz: req.quiz,
        answer: answer
    });
};
// GET /quizzes/random_play
exports.random_play = function (req, res, next) {

    if(!req.session.score) req.session.score=0;
    if(!req.session.questions) req.session.questions=[-1];
    var answer = req.query.answer || '';
    var preguntas;
    var tiempo;
    models.Quiz.count().then(function (count){

		var  findOptions={where:{'id': {$notIn: req.session.questions}}};
		 preguntas=count;

    return models.Quiz.findAll(findOptions);
	}).then(function (quizzes) {

        if (quizzes.length !== 0) {


            var  quizzz=quizzes[parseInt(Math.round(Math.random() * (quizzes.length)))];

            if(quizzz ) {

                req.quiz = quizzz;

                    res.render('quizzes/random_play', {
                        quiz: req.quiz,
                        answer: answer,
                        score: req.session.score,
                        question: preguntas + 1 - req.session.questions.length

                    });

            }

        }else{
                score=req.session.score;
                req.session.score=0;
                req.session.questions=[-1];

                res.render('quizzes/random_nomore', {
                    score: score
                 });

        }
})
    .catch(function (error) {
        next(error);
    });
};

// GET /quizzes/random_play
exports.random_vs = function (req, res, next) {

    if(!req.session.score1) req.session.score1=0;
    if(!req.session.score2) req.session.score2=0;
    if(!req.session.questions) req.session.questions=[-1];
    if(!req.session.oponentes) req.session.oponentes=[-1];
    if(!req.session.oponente1 && !req.session.oponente2){

        var  findOptions1={where:{'id': {$notIn: req.session.oponentes}}};

            models.User.findAll(findOptions1).then(function (usuarios) {

                if (usuarios.length >= 2) {

                    oponente1 = usuarios[parseInt(Math.round(Math.random() * (usuarios.length)))];
                    oponente2 = usuarios[parseInt(Math.round(Math.random() * (usuarios.length)))];

                    while(oponente1.username===oponente2.username){
                        oponente2 = usuarios[parseInt(Math.round(Math.random() * (usuarios.length)))];

                    }


                    if (oponente1 && oponente2) {
                        req.session.oponente1=oponente1;
                        req.session.oponente2=oponente2;
                        req.session.oponentes.push(oponente1.id);
                        req.session.oponentes.push(oponente2.id);

                        if(!req.session.turno)req.session.turno=oponente1;

                    } else {
                        req.flash('error', "no hay usuarios");
                    }
                } else {
                    req.flash('error', "no hay usuarios");
                }

            });


    }



    var answer = req.query.answer || '';
    var score;

  //  req.session.turno=models.User.findById(req.session.oponentes[parseInt(Math.round(Math.random() * (req.session.oponentes.length)))]);

    models.Quiz.count().then(function (count){

        var  findOptions={where:{'id': {$notIn: req.session.questions}}};
        preguntas=count;

        return models.Quiz.findAll(findOptions);
    }).then(function (quizzes) {

        if (quizzes.length !== 0) {


            var  quizzz=quizzes[parseInt(Math.round(Math.random() * (quizzes.length)))];



         var turnoo=((req.session.turno.username===req.session.oponente1.username) ? req.session.oponente1 : req.session.oponente2);
         req.session.turno=turnoo;

           // var turnoo=req.session.oponentes[parseInt(Math.round(Math.random() * (req.session.oponentes.length)))];

            if(quizzz && oponente1 && oponente2 ) {

                req.quiz = quizzz;


                if(turnoo && turnoo.username === oponente1.username) {

                    score =req.session.score1;

                }  else if(turnoo && turnoo.username === oponente2.username){

                    score = req.session.score2;

                }

                res.render('quizzes/random_OneToOne', {
                    quiz: req.quiz,
                    answer: answer,
                    score: score,
                    question: preguntas + 1 - req.session.questions.length,
                    oponente1:oponente1.username,
                    oponente2:oponente2.username,
                    turno: req.session.turno.username
                });

            }

        }else{
            if(req.session.score1> req.session.score2) {

                score=req.session.score1;
                ganador=oponente1;

            }  else{

                score = req.session.score2;
                ganador=oponente2;
            }

            req.session.score=0;
            req.session.questions=[-1];

            res.render('quizzes/random_no', {
                score: score,
                ganador: ganador
            });

        }
    })
        .catch(function (error) {
            next(error);
        });
};

// GET /quizzes/:quizId/check
exports.check = function (req, res, next) {

    var answer = req.query.answer || "";

    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();

    res.render('quizzes/result', {
        quiz: req.quiz,
        result: result,
        answer: answer
    });
};

// GET /quizzes/:quizId/check
exports.random_check = function (req, res, next) {

	if(!req.session.score) req.session.score=0;
    if(!req.session.questions) req.session.questions=[-1];

    var score=req.session.score;

    req.session.questions.push(req.quiz.id);

   	 var answer = req.query.answer || "";
  	 var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();


    if(result){

            score=++req.session.score;
    }else{
            req.session.score=0;
            req.session.questions=[-1];
        }
             res.render('quizzes/random_result', {
                 result: result,
                 answer: answer,
                 score:score
            });
};

// GET /quizzes/:quizId/check
exports.OneTo_check = function (req, res, next) {

    if(!req.session.score1) req.session.score1=0;
    if(!req.session.score2) req.session.score2=0;
    if(!req.session.turno) req.session.turno=req.session.oponente2;
    if(!req.session.questions) req.session.questions=[-1];
    if(!req.session.oponentes) req.session.oponentes=[-1];

    var score1=req.session.score1;
    var score2=req.session.score2;

    req.session.questions.push(req.quiz.id);

    var answer = req.query.answer || "";
    var result = answer.toLowerCase().trim() === req.quiz.answer.toLowerCase().trim();


    if(result && req.session.turno.username === req.session.oponente1.username) {

        score1 = ++req.session.score1;
        req.session.turno=req.session.oponente2;

    }  else if(result && req.session.turno.username === req.session.oponente2.username){

        score2 = ++req.session.score2;
        req.session.turno=req.session.oponente1;

    }else{
        req.session.oponente1=false;
        req.session.oponente2=false;
        req.session.score1=0;
        req.session.score2=0;
        req.session.score=0;
        req.session.questions=[-1];
        req.session.oponentes=[-1];

    }
    res.render('quizzes/duelo', {
        result: result,
        answer: answer,
        score1:score1,
        score2:score2,
        oponente1:req.session.oponente1.username,
        oponente2:req.session.oponente2.username



    });
};

