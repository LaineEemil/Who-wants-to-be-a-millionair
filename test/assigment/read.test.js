/* eslint-disable no-console */
/* eslint-disable babel/no-invalid-this */
'use strict';

const http = require('http');
const Browser = require('zombie');
const assert = require('assert');
const app = require('../../app.js');

const port = 3333;

require('dotenv').config();
const config = require('config');
const admin = config.get('admin');
const User = require('../../models/user');
//const Questionnaire = require('../../models/questionnaire');

// Zombie.js documentation can be found at: https://www.npmjs.com/package/zombie

const testUser = {
    name: 'Metkunen',
    email: 'zombie@underworld.fi',
    password: 'jopasjotakin12345'
};

describe('Management view testing...', function() {
    let server;
    let browser;

    this.beforeAll(async function() {
        server = http.createServer(app).listen(port);
        Browser.localhost('bwa', port);
        browser = new Browser();
    });

    this.afterAll(async function() {
        await User.deleteOne({ email: testUser.email }, function(err) {
            if (err) console.log(err);
            else console.log('Users cleanup provided');
        });

        server.close();
    });

    it('Management view should not open with out login', async function() {
        await browser.visit('/users/logout');

        await browser.visit('/questionnaires');
        browser.assert.text('.alert.alert-danger', 'Teacher rights required: login');
    });

    it('Should be register and login testUser', async function() {
        
        // Register testUser.
        await browser.visit('/users/register');
        browser.fill('name', testUser.name);
        browser.fill('email', testUser.email);
        browser.fill('password', testUser.password);
        browser.fill('passwordConfirmation', testUser.password);
        await browser.pressButton('#btnRegister');

        //Login with testUser.
        await browser.visit('/users/login');
        browser.fill('email', testUser.email);
        browser.fill('password', testUser.password);
        await browser.pressButton('#btnLogin');

        //Assert outcome.
        browser.assert.url({ pathname: '/users/me' });
    });

    it('Open one of the available games', async function() {

        await browser.visit('/games');

        //Find all ids for questionnaires in list.
        const id_all = browser.html('a');
        var ids = id_all.split('"');
        var id = [];

        for (var i= 0; i < ids.length; i++) {
            var split = ids[i].split('/');
            if (split.length >= 2 && split[1] == "games") {
                id.push(ids[i]);
            }
            split = [];
        }

        // Visit desired questionnaires delete questionnaire page.
        await browser.visit(id[0]);

        //Check if questionnaire was removed from DB.
        browser.assert.success();
    });
});