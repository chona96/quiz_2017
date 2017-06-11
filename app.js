var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var partials = require('express-partials');
var flash = require('express-flash');
var methodOverride = require('method-override');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "Quiz 2017",
    resave: false,
    saveUninitialized: true}));
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());
app.use(flash());

// Helper dinamico:
app.use(function(req, res, next) {

    // Hacer visible req.session en las vistas
    res.locals.session = req.session;

    next();
});

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


/*
 *--------Streaming de audio simple de bienvenida ------*
 *
 *require se usa para "importar" los modulos que vamos a usar con Nodejs
 *
 */

var http = require('http'); //Linea para poder usar el protocolo http
var	fs = require('fs'); // Para abrir archivos del sistema se usa fs
var path = '/home/chona/Documentos/CORE/53/quiz_2017/audio/WELCOME TO TRIVIAL PURSUIT! (Trivial Pursuit #1).mp3'; //Variable para guardar el path del mp3
var cancion1 = fs.statSync(path);

http.createServer(function(request, response) {//Levantamos el servidor

    response.writeHead(200, { //Cuando reciba una peticion GET, reponde un codigo 200 y establece conexion
        'Content-Type': 'audio/mp3', //defino la cabecera como multimedia
        'Content-Length': cancion1.size //tamaño del tema
    });
    fs.createReadStream(path).pipe(response);//Comienza el streaming
    console.log('Cliente conectado de bienvenida!');
})

    .listen(2001);//Establecemos el puerto
console.log("Servidor a la escucha de bienvenida!");


/*
 *--------Streaming de audio simple de inicio ------*
 *
 *require se usa para "importar" los modulos que vamos a usar con Nodejs
 *
 */

var http = require('http'); //Linea para poder usar el protocolo http
var	fs = require('fs'); // Para abrir archivos del sistema se usa fs
var path1 = '/home/chona/Documentos/CORE/53/quiz_2017/audio/inicio.mp3'; //Variable para guardar el path del mp3
var cancion = fs.statSync(path1);

http.createServer(function(request, response) {//Levantamos el servidor

    response.writeHead(200, { //Cuando reciba una peticion GET, reponde un codigo 200 y establece conexion
        'Content-Type': 'audio/mp3', //defino la cabecera como multimedia
        'Content-Length': cancion.size //tamaño del tema
    });
    fs.createReadStream(path1).pipe(response);//Comienza el streaming
    console.log('Cliente conectado y jugando!');
})

    .listen(8000);//Establecemos el puerto
console.log("Servidor a la escucha de jugar!");



/*
 *--------Streaming de audio simple de preguntas------*
 *
 *require se usa para "importar" los modulos que vamos a usar con Nodejs
 *
 */
var http = require('http'); //Linea para poder usar el protocolo http
var	fs = require('fs'); // Para abrir archivos del sistema se usa fs
var path2 = '/home/chona/Documentos/CORE/53/quiz_2017/audio/LEADING EVERYONE TO VICTORY! (Trivial Pursuit Live PS4 w Ze, Chilled, GaLm, & Smarty).mp3'; //Variable para guardar el path del mp3
var cancion2 = fs.statSync(path2);

http.createServer(function(request, response) {//Levantamos el servidor

    response.writeHead(200, { //Cuando reciba una peticion GET, reponde un codigo 200 y establece conexion
        'Content-Type': 'audio/mp3', //defino la cabecera como multimedia
        'Content-Length': cancion.size //tamaño del tema
    });
    fs.createReadStream(path2).pipe(response);//Comienza el streaming
    console.log('Cliente conectado y jugando!');
})

    .listen(8001);//Establecemos el puerto
console.log("Servidor a la escucha de jugar!");


/*
 *--------Streaming de audio simple de preguntas------*
 *
 *require se usa para "importar" los modulos que vamos a usar con Nodejs
 *
 */
var http = require('http'); //Linea para poder usar el protocolo http
var	fs = require('fs'); // Para abrir archivos del sistema se usa fs
var path3 = '/home/chona/Documentos/CORE/53/quiz_2017/audio/misc198.mp3'; //Variable para guardar el path del mp3
var cancion3 = fs.statSync(path3);

http.createServer(function(request, response) {//Levantamos el servidor

    response.writeHead(200, { //Cuando reciba una peticion GET, reponde un codigo 200 y establece conexion
        'Content-Type': 'audio/mp3', //defino la cabecera como multimedia
        'Content-Length': cancion.size //tamaño del tema
    });
    fs.createReadStream(path3).pipe(response);//Comienza el streaming
    console.log('Cliente conectado y jugando!');
})

    .listen(8002);//Establecemos el puerto
console.log("Servidor a la escucha de jugar!");
