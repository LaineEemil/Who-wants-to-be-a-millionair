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
        
        // Register testUser
        await browser.visit('/users/register');
        browser.fill('name', testUser.name);
        browser.fill('email', testUser.email);
        browser.fill('password', testUser.password);
        browser.fill('passwordConfirmation', testUser.password);
        await browser.pressButton('#btnRegister');

        //Login with testUser
        await browser.visit('/users/login');
        browser.fill('email', testUser.email);
        browser.fill('password', testUser.password);
        await browser.pressButton('#btnLogin');

        //Assert outcome
        browser.assert.url({ pathname: '/users/me' });
    });

    it('Management view should not open with student role', async function() {
        //Expecting that the test above passed
        await browser.visit('/questionnaires');
        browser.assert.url({ pathname: '/' });
    });

    it('Login to admin account', async function() {
        //Expecting that the first test passed
        await browser.visit('/users/logout');

        await browser.visit('/users/login');
        browser.fill('email', admin.email);
        browser.fill('password', admin.password);
        await browser.pressButton('#btnLogin');
    });

    it('Change testUsers role from student to teacher', async function() {

        await browser.visit('/users');
        const id_all =  browser.html('a');
        var ids = id_all.split('"');
        var id = [];
        for (var i = 0; i < ids.length; i++) {
            var split = ids[i].split('/');
            if (split.length > 3 && split[1] == "users" && split[2] == "change-role") {
                id.push(ids[i]);
            }
            split = [];
        }
        await browser.visit(id[0]);

        browser.select('select', 'teacher');
        await browser.pressButton('.btn.btn-primary');
        browser.assert.url({ pathname: '/users' });
    });

    it('Management view should open with teacher account', async function() {
        await browser.visit('/users/logout');

        await browser.visit('/users/login');
        browser.fill('email', testUser.email);
        browser.fill('password', testUser.password);
        await browser.pressButton('#btnLogin');

        await browser.visit('/questionnaires');
        browser.assert.url({ pathname: '/questionnaires' });
    });

    it('Open questionnaire editor and change option and hint values and try to save questionnaire', async function() {

        await browser.visit('/questionnaires');

        //Find all ids for questionnaires in list.
        const id_all = browser.html('a');
        var ids = id_all.split('"');
        var id = [];

        for (var i= 0; i < ids.length; i++) {
            var split = ids[i].split('/');
            if (split.length >= 2 && split[1] == "questionnaires" && split[2] == "edit") {
                id.push(ids[i]);
            }
            split = [];
        }

        // Visit desired questionnaires delete questionnaire page.
        await browser.visit(id[0]);

        // Get number of questions and remove all but one
        const button_all = browser.html('button');
        var buttons = button_all.split(" ");
        var button = [];

        for (var i = 0; i < buttons.length; i++) {
            var split = buttons[i].split('"');
            if (split.length >= 2 && split[0] == "id=" && split[1] == "removeQuestionbtn") {
                button.push(split[1]);
            }
        }

        if (button.length > 1) {
            for (var i = 0; i < button.length - 1; i++) {
                await browser.pressButton('#removeQuestionbtn');
            }
        }

        //Get id values for all added options.
        const option_all = browser.html('tr');
        var ids = option_all.split('"');
        var id = [];

        for (var i = 0; i < ids.length; i++) {
            var split = ids[i].split('-');
            if (split.length >= 2 && split[0] == "option" && split[1].length > 2) {
                id.push(split[1]);
            }
            split = [];
        }

        //Add values for option and hint titles for all the options.
        for (var i = 0; i < id.length; i++) {
            browser.fill("#add-option-" + id[i], 'Option' + i);
            browser.fill("#add-hint-" + id[i], 'Hint' + i);
        }

        //Choose one right answer.
        browser.choose(id[0]);
        await browser.pressButton('#btnSave');

        //Check if questionnaire was added.
        browser.assert.success();

    });
});