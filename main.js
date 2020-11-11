const express = require('express');
const path = require('path');

const websocket = require('./modules/websocket');

/** @type {import('express').Express} */
var app;

/**
 * Initialize this web app; setup function calls steps that need to be performed before any other settings are set
 * @param {function(app)} setupFunction 
 */
function Initialize(setupFunction)
{
    //Create the app if it doesn't exist
    app = app || express();
    //Call the first setup steps
    setupFunction(app);

    //Load all the router objects
    //TODO: Make this automatically pull all router objects in the directory
    const indexRouter = require('./routes/index');
    const simulatorRouter = require('./routes/simulator');
    const dataRouter = require('./routes/data');
    const apiRouter = require('./routes/api');

    //Set views (HTML page snippets)
    app.set('views', path.join(__dirname, './views'));
    app.set('view engine', 'ejs');

    //Expose styles, scripts, and images directories
    app.use('/styles', express.static(path.join(__dirname, './styles')));
    app.use('/scripts', express.static(path.join(__dirname, './scripts/public')));
    app.use('/images', express.static(path.join(__dirname, '../../images')));

    //Set the sub-URL that each router will handle
    app.use('/', indexRouter);
    app.use('/simulator', simulatorRouter);
    app.use('/data', dataRouter);
    app.use('/api', apiRouter);

    //If it fails all routers, the handler will land here
    //Catch Error 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    //Error handlers

    //Development error handler
    //Will print stacktrace
    //TODO: Ensure that the full website can never hit here.
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.status(err.status || 500);
            res.render('pages/error', {
                message: err.message,
                error: err
            });
        });
    }

    //Production error handler
    //No stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('pages/error', {
            message: err.message,
            error: {}
        });
    });

    return app;
}
//Export the initialization function
module.exports.Initialize = Initialize;