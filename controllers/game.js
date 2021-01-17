'use strict';

const Questionnaire = require('../models/questionnaire');

function shuffle(sourceArray) {
    for (var i = 0; i < sourceArray.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (sourceArray.length - i));

        var temp = sourceArray[j];
        sourceArray[j] = sourceArray[i];
        sourceArray[i] = temp;
    }
    return sourceArray;
}

module.exports = {

    /**
     * Prints questionnaire page
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async list(request, response) {
        const questionnaires = await Questionnaire.find()
            .sort('title')
            .select('title questions submissions')
            .exec();
        response.render('question/questionnaires', { questionnaires: questionnaires });
    },


    /**
     * Shows questionnaire
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */
    async showQuestionnaire(request, response) {
        // let questionnaire = {
        //     title: 'Who wants to be a millionaire?',
        //     submissions: 0,
        //     questions: [
        //         {
        //             title: 'Who is the strongest?',
        //             maxPoints: 100,
        //             options: [
        //                 {
        //                     option: 'Jaakko',
        //                     hint: 'Might be Jaakko',
        //                     correctness: true
        //                 },
        //                 {
        //                     option: 'Mikko',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 },
        //                 {
        //                     option: 'Eemil',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 },
        //                 {
        //                     option: 'Joku muu',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 }
        //             ]
        //         },
        //         {
        //             title: 'Who is the mightiest?',
        //             maxPoints: 15000,
        //             options: [
        //                 {
        //                     option: 'Mikko',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 },
        //                 {
        //                     option: 'Joku muu',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 },
        //                 {
        //                     option: 'Eemil',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 },
        //                 {
        //                     option: 'Jaakko',
        //                     hint: 'Might be Jaakko',
        //                     correctness: true
        //                 }
        //             ]
        //         },
        //         {
        //             title: 'Who is the bravest?',
        //             maxPoints: 200000,
        //             options: [
        //                 {
        //                     option: 'Eemil',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 },
        //                 {
        //                     option: 'Jaakko',
        //                     hint: 'Might be Jaakko',
        //                     correctness: true
        //                 },
        //                 {
        //                     option: 'Mikko',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 },
        //                 {
        //                     option: 'Joku muu',
        //                     hint: 'Might be Jaakko',
        //                     correctness: false
        //                 }
        //             ]
        //         },
        //     ]
        // };
        const questionnaire = await Questionnaire.findById(request.params.id).exec();
        let question = questionnaire.questions[0];

        question.options = shuffle(question.options);
        
        let maxPoints = 0;
        for (let i = 0; i < questionnaire.questions.length; i++) {
            maxPoints += questionnaire.questions[i].maxPoints;
        }

        response.render('question/question', { question, points: 0, maxPoints: maxPoints, status: 'Empty', description: 'Game on', title: 'Games' });
    },

    /**
     * Grades answered question and returns next one if correct
     * @param {Object} request is express request object
     * @param {Object} response is express response object
     */

    async gradeQuestion(request, response) {
        const questionnaire = await Questionnaire.findById(request.params.id).exec();

        let maxPoints = 0;
        for (let i = 0; i < questionnaire.questions.length; i++) {
            maxPoints += questionnaire.questions[i].maxPoints;
        }

        let usedLifeLine1 = Boolean(request.body.usedLifeLine1);
        let usedLifeLine2 = Boolean(request.body.usedLifeLine2);
        let usedLifeLine3 = Boolean(request.body.usedLifeLine3);

        let questionIndex;
        if (request.body.questionIndex) {
            questionIndex = Number(request.body.questionIndex);
        } else {
            questionIndex = 0;
        }

        let points = 0;
        for (let i = 0; i < questionIndex; i++) {
            points += questionnaire.questions[i].maxPoints;
        }

        if (request.body.usingLifeLine === 'false' && request.body.answer) {
            // Answer is given
            let answer = (request.body.answer === questionnaire.questions[questionIndex].options.find((opt) => { return opt.correctness === true }).option);

            if (answer) {
                points += questionnaire.questions[questionIndex].maxPoints;
                // Correct answer
                questionIndex++;
                if (questionIndex < questionnaire.questions.length) {
                    let question = JSON.parse(JSON.stringify(questionnaire.questions[questionIndex]));
                    let retMsg = 'Correct! Next question:';
                    question.options = shuffle(question.options);
                    response.render('question/question', { successMessage: retMsg, question, questionIndex, usedLifeLine1, usedLifeLine2, usedLifeLine3, points: points, maxPoints: maxPoints, status: 'Empty', description: 'Game on', title: 'Games' });
                } else {
                    response.render('question/questionnaire-won', {
                        points: points, maxPoints: maxPoints, status: 'Empty', description: 'Game on', title: 'Games'
                    });
                }
            } else {
                response.render('question/question-failed', {
                    points: points, maxPoints: maxPoints, status: 'Empty', description: 'Game on', title: 'Games'
                });
            }
        } else {
            // No answer given, using lifelines
            let question = JSON.parse(JSON.stringify(questionnaire.questions[questionIndex]));

            if (usedLifeLine1 && request.body.removedOption1 && request.body.removedOption2) {
                // Lifeline1 is used already, hide removed options
                let newOptions = [];
                for (let i = 0; i < question.options.length; i++) {
                    if (question.options[i].option != request.body.removedOption1 && question.options[i].option != request.body.removedOption2) {
                        newOptions.push(question.options[i]);
                    }
                }
                question.options = newOptions;
            }

            let removedOption1 = null;
            let removedOption2 = null;
            if (request.body.removedOption1) {
                removedOption1 = request.body.removedOption1;
            }

            if (request.body.removedOption2) {
                removedOption2 = request.body.removedOption2;
            }

            // Used lifeline
            if (Number(request.body.usingLifeLine) === 1) {
                usedLifeLine1 = true;

                let removedOptions = [];
                let removed = 0;
                for (let i = 0; i < question.options.length; i++) {
                    if (question.options[i].correctness === false) {
                        removedOptions.push(question.options[i]);
                        removed++;
                        if (removed === 2) {
                            break;
                        }
                    }
                }

                let newOpts = [];
                for (let i = 0; i < question.options.length; i++) {
                    let found = false;
                    for (let k = 0; k < removedOptions.length; k++) {
                        if (removedOptions[k].option === question.options[i].option) {
                            found = true;
                        }
                    }
                    if (!found) {
                        newOpts.push(question.options[i]);
                    }
                }

                question.options = newOpts;
                removedOption1 = removedOptions[0].option;
                removedOption2 = removedOptions[1].option;

                let retMsg = 'Removed two false options!';

                response.render('question/question', { successMessage: retMsg, question, questionIndex, usedLifeLine1, usedLifeLine2, usedLifeLine3, removedOption1, removedOption2, points: points, maxPoints: maxPoints, status: 'Empty', description: 'Game on', title: 'Games' });
            } else if (Number(request.body.usingLifeLine) === 2) {
                usedLifeLine2 = true;

                let retMsg = 'Audience informs the following: ';

                let randOpt1 = (Math.floor(Math.random() * question.options.length) + 1) - 1;

                let randOpt2 = randOpt1;
                while (randOpt2 === randOpt1) {
                    randOpt2 = (Math.floor(Math.random() * question.options.length) + 1) - 1;
                }

                let randOpt3 = randOpt2;
                while (randOpt3 === randOpt2 || randOpt3 === randOpt1) {
                    randOpt3 = (Math.floor(Math.random() * question.options.length) + 1) - 1;
                }

                retMsg += 'Person 1 says: "' + question.options[randOpt1].hint  + '". ';
                retMsg += 'Person 2 says: "' + question.options[randOpt2].hint  + '". ';
                retMsg += 'Person 3 says: "' + question.options[randOpt3].hint  + '". ';

                response.render('question/question', { successMessage: retMsg, question, questionIndex, usedLifeLine1, usedLifeLine2, usedLifeLine3, removedOption1, removedOption2, points: points, maxPoints: maxPoints, status: 'Empty', description: 'Game on', title: 'Games' });
            } else if (Number(request.body.usingLifeLine) === 3) {
                usedLifeLine3 = true;

                let randOpt = (Math.floor(Math.random() * question.options.length) + 1) - 1;

                let retMsg = 'Your friend tells you the following: "' + question.options[randOpt].hint + '".';

                response.render('question/question', { successMessage: retMsg, question, questionIndex, usedLifeLine1, usedLifeLine2, usedLifeLine3, removedOption1, removedOption2, points: points, maxPoints: maxPoints, status: 'Empty', description: 'Game on', title: 'Games' });
            } else {
                request.flash('errorMessage', 'Erroneous post request');
                return response.redirect('/');
            }
        }

    }
};
