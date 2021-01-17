'use strict';

const Questionnaire = require('../models/questionnaire');

module.exports = {

    /**
     * Prints questionnaires page
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async list(request, response) {
        const questionnaires = await Questionnaire.find()
            .sort('title')
            .select('title questions submissions')
            .exec();
        response.render('questionnaire/questionnaires', { questionnaires: questionnaires });
    },

    async show(request, response) {
        const questionnaire = await Questionnaire.findById(request.params.id).exec();

        if (!questionnaire) {
            request.flash(
                'errorMessage',
                `Questionnaire not found (id: ${request.params.id})`
            );
            return response.redirect('/questionnaires');
        }

        response.render('questionnaire/questionnaire_editor', { questionnaire });
    },

    async create(request, response) {
        response.render('questionnaire/questionnaire_editor');
    },

    async processCreate(request, response) {
        let questionnaire = new Questionnaire();
        questionnaire.title = request.body.title;
        questionnaire.questions = request.body.questions;
        questionnaire.submissions = request.body.submissions;

        const { error } = Questionnaire.validateQuestionnaire(request.body);
        
        if (error) {
            if (request.is('json')) {
                return response.status(400).json({ error });
            }

            return response.render('questionnaire/questionnaire_editor', { questionnaire, errors: error });
        }

        await questionnaire.save();
        
        response.redirect('/questionnaires');
    },

    async update(request, response) {
        const questionnaire = await Questionnaire.findById(request.params.id).exec();

        if (!questionnaire) {
            request.flash(
                'errorMessage',
                `Questionnaire not found (id: ${request.params.id})`
            );
            return response.redirect('/questionnaires');
        }

        response.render('questionnaire/questionnaire_editor', { questionnaire });
    },

    async processUpdate(request, response) {
        let questionnaire = await Questionnaire.findById(request.params.id).exec();

        if(!questionnaire) {
            if (request.is('json')) {
                return response.status(400).json({ error: "Questionnaire not found!" });
            }
        }

        questionnaire.title = request.body.title;
        questionnaire.questions = request.body.questions;
        questionnaire.submissions = request.body.submissions;

        const { error } = Questionnaire.validateQuestionnaire(request.body);
        
        if (error) {
            if (request.is('json')) {
                return response.status(400).json({ error });
            }

            return response.render('questionnaire/questionnaire_editor', { questionnaire, errors: error });
        }

        await questionnaire.save();
        
        response.redirect('/questionnaires');
    },

    async delete(request, response) {
        const questionnaire = await Questionnaire.findById(request.params.id).exec();

        if (!questionnaire) {
            request.flash(
                'errorMessage',
                `Questionnaire not found (id: ${request.params.id})`
            );
            return response.redirect('/questionnaires');
        }

        response.render('questionnaire/delete', {
            questionnaire,
            //csrfToken: request.csrfToken()
        });
    },

    async processDelete(request, response) {
        await Questionnaire.findByIdAndDelete(request.params.id).exec();
        request.flash('successMessage', 'Questionnaire removed successfully.');
        response.redirect('/questionnaires');
    }
};
