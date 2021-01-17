'use strict';

const express = require('express');
const router = express.Router();
const GameController = require('../controllers/game');

const auth = require('../middleware/auth');
const csurf = require('csurf');
const csrfProtection = csurf({ cookie: false });

router.use(auth.ensureAuthenticated);

router.all(
    csrfProtection
).get('/', GameController.list);

router.all(
    csrfProtection
).get('/:id([a-f0-9]{24})', GameController.showQuestionnaire);

router.all(
    csrfProtection
).post('/:id([a-f0-9]{24})', GameController.gradeQuestion);

module.exports = router;
