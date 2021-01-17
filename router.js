'use strict';

// load routers
const UsersRouter = require('./routes/users');
const QuestionnaireRouter = require('./routes/questionnaire');
const GameRouter = require('./routes/game');
const HomeRouter = require('./routes/home');

// Setup Routes
module.exports = function (app) {
    app.use('/users', UsersRouter);
    app.use('/questionnaires', QuestionnaireRouter);
    app.use('/games', GameRouter);
    app.use('/', HomeRouter);
};
