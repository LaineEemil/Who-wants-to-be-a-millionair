'use strict';

const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/home');

router.get('/', HomeController.showHome);

module.exports = router;
