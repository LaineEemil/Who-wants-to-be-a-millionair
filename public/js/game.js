'use strict';

loadGameData();

async function loadGameData() {
    const data_uri = `/game/data/${document.location.pathname.split('/').pop()}`;
    try {
        const response = await fetch(data_uri);
        const gameData = await handleResponse(response);
        playNextRound(gameData.questions);
    } catch (error) {
        handleError(error + " " + data_uri);
    }
}

/**
 * Play next round of game
 * @param {Array} questions array of game questions
 * @param {number} currentRound number of current game round (zero based)
 * @returns {void}
 */
function playNextRound(questions, currentRound = 0) {
    if (!Array.isArray(questions)) throw new Error('Questions is not an array');
    if (currentRound >= questions.length) throw new Error('No more questions!');
    const isLastRound = currentRound + 1 >= questions.length;
    registerEventHandlers(questions, currentRound, isLastRound);
}

/**
 * Destroy and remove bubble from the dom
 * @param {HTMLElement} bubble
 * @returns {void}
 */
function destroyBubble(bubble) {
    clearInterval(bubble.dataset.moveId);
    bubble.style.display = 'none';
    bubble.parentNode.removeChild(bubble);
}

/**
 * Drops new bubble into the document
 * @param {HTMLElement} bubble
 * @returns {void}
 */
function dropBubble(bubble) {
    const xPos = Math.ceil(Math.random() * 400) + 30; // random x coordinate
    let yPos = 30;

    // set bubble start position, do not display yet
    bubble.style.left = `${xPos}px`;
    bubble.style.top = `${yPos}px`;

    // update bubble position every few milliseconds
    bubble.dataset.moveId = setInterval(function() {
        bubble.style.top = `${yPos}px`;
        bubble.style.display = 'block';
        yPos *= 1.01; // speed multiplier

        if (yPos > 600 || bubble.style.display === 'none') {
            destroyBubble(bubble);
        }
    }, 20);
}

/**
 * Init new game with the given question and return a function
 * that starts the game. Call this function inside an event handler
 *
 * @param {object} question
 * @returns {function(): void} game starter function
 */
function getGameStarter(question) {
    const createBubble = getBubbleCreator();
    const numberOfBubbles = question.options.length;
    let counter = 0;

    return function () {
        // drop a new bubble every 2.3 seconds
        const intervalId = setInterval(function () {
            if (counter >= numberOfBubbles) {
                clearInterval(intervalId);
                return;
            }

            const bubbleData = question.options[counter];
            dropBubble(createBubble(bubbleData));
            counter += 1;
        }, 2300);
    };
}

/**
 * Create a function that creates new bubbles and appends them to the DOM
 * @returns {function(bubbleData): HTMLElement} creates a new bubble based on the given data
 */
function getBubbleCreator() {
    const bubbles = document.getElementById('bubbles');
    const cssClass = ['red', 'yellow', 'blue', 'green'];

    return function(bubbleData) {
        const bubbleDiv = document.createElement('div');
        bubbleDiv.classList.add('bubble');
        bubbleDiv.classList.add(cssClass[Math.floor(Math.random() * 4)]);

        // data attributes
        bubbleDiv.dataset.id = bubbleData.id;
        bubbleDiv.dataset.speech = bubbleData.text;

        // hide bubble initially
        bubbleDiv.style.display = 'none';
        bubbleDiv.innerText = bubbleData.text;
        bubbles.appendChild(bubbleDiv);
        return bubbleDiv;
    };
}

/**
 * Get an event handler for new question. Handler records answers to question.
 * @param {object} question question data
 * @param {number} currentQuestion number of current question (zero based)
 * @returns {function(evt): void} event handler (for click events)
 */
function getBubbleClickHandler(question, currentQuestion) {
    const correctCounter = document.getElementById('correct');
    const wrongCounter = document.getElementById('wrong');
    const correctAnswers = question.answers;

    // Create input for answers of current round
    const answersInput = document.createElement('input');
    answersInput.type = 'hidden';
    answersInput.id = `answers${currentQuestion}`;
    answersInput.name = 'answers[]';

    const gameForm = document.getElementById('game-form');
    gameForm.appendChild(answersInput);

    return function(evt) {
        if (evt.target !== evt.currentTarget) {
            // console.table(evt.target.dataset);
            answersInput.value += ` ${evt.target.dataset.id}`;

            if (correctAnswers.includes(evt.target.dataset.id)) {
                correctCounter.textContent =
                    Number.parseInt(correctCounter.textContent) + 1;
                evt.target.dataset.speech = 'correct';
            } else {
                wrongCounter.textContent =
                    Number.parseInt(wrongCounter.textContent) + 1;
                evt.target.dataset.speech = 'oops';
            }

            // eslint-disable-next-line no-undef
            responsiveVoice.speak(
                evt.target.dataset.speech,
                //'English Female'
                'Finnish Female'
            );

            destroyBubble(evt.target);
        }
    };
}

/**
 * Register all event handlers for the current game round and remove old hanlers
 * @param {Array} questions all question objects in an array
 * @param {number} currentQuestion number of current question (zero based)
 * @param {boolean} submitOnGameStop whether to submit the form on game stoppage or not
 * @returns {void}
 */
function registerEventHandlers(questions, currentQuestion, submitOnGameStop = false) {
    const question = questions[currentQuestion];
    const bubbleClickHandler = getBubbleClickHandler(question, currentQuestion);

    const gameForm = document.getElementById('game-form');
    const startGame = getGameStarter(question);
    const startButton = document.getElementById('start-game');
    const submitButton = document.getElementById('grade');
    const bubbleContainer = document.getElementById('bubbles');
    const questionTitle = document.getElementById('question-title');

    // Activate and unhide start button
    startButton.disabled = false;
    startButton.classList.remove('hidden');

    // Disable and hide submit button
    submitButton.disabled = true;
    submitButton.classList.add('hidden');

    // Show question title text
    questionTitle.textContent = question.title;
    questionTitle.classList.add('h3');
    questionTitle.classList.remove('hidden');

    startButton.onclick = function (evt) {
        // Activate and unhide submit button
        submitButton.disabled = false;
        submitButton.classList.remove('hidden');

        // Disable and hide start button
        startButton.disabled = true;
        startButton.classList.add('hidden');
        startButton.onclick = undefined;

        // unhide bubbleContainer and start listening clicks
        bubbleContainer.classList.remove('hidden');
        bubbleContainer.onclick = bubbleClickHandler;

        startGame();
    };

    gameForm.onsubmit = function (evt) {
        if (submitOnGameStop) return;

        evt.preventDefault();
        document.querySelectorAll('.bubble').forEach((bubble) => { destroyBubble(bubble); });
        playNextRound(questions, currentQuestion + 1);
        return false;
    }
}

async function handleResponse(response) {
    const contentType = response.headers.get('content-type');

    if (!contentType.includes('application/json')) {
        throw new Error(`Sorry, content-type '${contentType}' not supported`);
    }

    if (!response.ok) {
        return Promise.reject({
            status: response.status,
            statusText: response.statusText
        });
    }

    return await response.json();
}

function handleError(error) {
    const alertContainer = document.getElementById('alert');
    alertContainer.classList.add('alert', 'alert-danger');
    alertContainer.classList.remove('hidden');
    alertContainer.textContent = 'The loading of the exercise failed!';
}
