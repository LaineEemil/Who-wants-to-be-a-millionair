# BWA/TIETA12 coursework assignment

In the assignment, we gamify multi-choice questionnaire.
The assignment consists of three parts: the game, management view, and testing/documentation.

1. game - some mechanism for selecting the right answers

2. management implies CRUD operations: questions can be created, queried, modified, and deleted.

3. test your modifications, that is game and management view in particular, other tests can be implemented as well.

In the beginning of December, we will meet all the groups to check that each
group has some idea how to proceed.
In addition, we promote MIT licensing:
if you grant the license, your game may be integrated in the LukioPlussa project;
the project is funded by the Ministry of Education. Its aim is to provide free learning material
for high-school students, especially for the domains of mathematics and computer science.

### The project structure

```
.
├── app.js                  	--> express app
├── index.js                	--> bwa app
├── package.json            	--> app info and dependencies
├── router.js                  	--> load routers
├── LICENSE                	    --> MIT license
├── README.md            	    --> Information about project
├── controllers                 --> controllers (handle e.g. routing)
│   ├── game.js             	           --> controller between game and questionnaire
│	├── home.js             	           --> shows homepage
│	├── questionnaire.js    	           --> controller between models and management view
│   ├── hello.js            	           --> the same as "minimal viable grader"
├── models                      --> models that reflect the db schemes
│   │                           and take care of storing data
│   ├── db.js                              --> controller between game and questionnaire
│	├── hello.js                           --> shows homepage
│	├── pagination.js                      --> controller between models and management view
│   ├── questionnaire.input.js             --> the same as "minimal viable grader"
│   ├── quesationnaire.js                  --> controller between game and questionnaire
│	├── user.js                            --> shows homepage
│	├── validator.js                       --> controller between models and management view
├── public                      --> location for public (static) files
│   ├── img                                --> for images
│   ├── js                                 --> for javascript
│   ├── css                                --> for styles
├── routes                      --> a dir for router modules
│   ├── home.js            	               --> / (root) router
│   ├── game.js                	           --> Routes for game
│   ├── questionnaire.js                   --> Routes for management view
│   ├── users.js                           --> Routes for user management
├── views                       --> views - visible parts
│   ├── error.hbs                          --> error view
│   ├── hello.hbs                          --> main view - "minimal viable grader"
│   ├── layouts                 --> layouts - handlebar concept
│   │   ├── default.hbs                    --> layout view, "template" to be rendered
│	│	└── grader_reply.hbs               --> layout view for given points 
│   ├── partials                --> smaller handlebar components to be included in views
│   │	├── bootstrap_scripts.hbs          --> implement bootstrap css into project
│	│	├── csrf.hbs                       --> implement csrf protection into project using Tokens
│	│	├── grader_meta.hbs                --> get grading information
│   │	├── messages.hbs                   --> implementing error messages into project
│   │	├── navigation.hbs                 --> layout for navigation bar
│	│	├── options_editor.hbs             --> layout for options editor in question editor
│	│	├── pagination.hbs                 --> responsive pagination using bootstrap
│   │	├── question_editor.hbs            --> layout view for editing/adding questions
│   │	├── questionnaire_list_item        --> layout for listing questions
│	│	├── questionnaire_listing.hbs      --> layout for listing all questionnaires found from DB
│	│	├── questionnaire_select_item.hbs  --> select invidual questionnaire
│   │	├── questionnaire_selecting.hbs    --> layout for selecting invidual questionnaire
│	│	├── scripts.hbs                    --> implement scripts using HBS
│	│	├── stylesheets.hbs                --> implement css/fonts to page using HBS
│   │	├── user_info.hbs                  --> layout for user info
│   │	└── user_listing.hbs               --> clayout for listing all users found from DB
│   ├── question                --> layouts - for game/question view
│   │   ├── question-failed.hbs            --> controller between game and questionnaire
│	│	├── question-graded.hbs            --> shows homepage
│	│	├── question.hbs                   --> controller between models and management view
│   │	└── questionnaires.hbs             --> the same as "minimal viable grader"
│   ├── questionnaire           --> layouts - for management view
│   │   ├── delete.hbs                     --> controller between game and questionnaire
│	│	├── questionnaire_editor.hbs       --> shows homepage
│   │	└── questionnaires.hbs             --> the same as "minimal viable grader"
│   ├── user                    --> layouts - for user management
│   │   ├── change_password.hbs            --> layout for changing password (all)
│	│	├── change_role.hbs                --> layout for changin user role (only admin)
│	│	├── delete.hbs                     --> layout for deleting user (only admin)
│   │	├── edit_user.hbs                  --> layout for editing user details (all)
│   │   ├── login.hbs                      --> layout for login page
│	│	├── register.hbs                   --> layout for register page
│	│	├── user.hbs                       --> layout for user info 
│   │	└── users.hbs                      --> layout for lsiting all users (only admin)
├── test                        --> tests
│   ├── assignment              --> management view tests
│   │   ├── create_delete.test.js          --> tests adding/altering questionnaire page, test questionnaires listing page
│	│	├── read.test.js                   --> open questionnaire to play 
│   │	└── update.test.js                 --> tests questionnaire update and account permission
│   ├── integration             --> integration tests
│	│	├── auth.test.js                   --> test user permissions 
│   │	└── users.test.js                  --> test login/registering page
└── └── models                  --> unit tests for models
	    ├── db.test.js                     --> test database
	    ├── questionnaire.test.js          --> test questionnaire models 
   	    └── user.test.js                   --> test user models


## Game

- Description of the game
Games name: Who Wants To Be A Billionaire - game. Player has 4 answer options. There is 3 optional lifelines. Remove 2 options, Ask the audience, Call to a friend.
Theres only 1 right answer to each question. If player answers right he/she advances to next level earning increased amount of money. Each question is worth more money. Eventually price of the question will be Billion.
If player answers right to this question has he/she won the game with the grand price. If player answers wrong to a question ends the game leaving player that amount of points as there were right answers to questions prior to wrong answer.

- How to play the game
To play the game user must create an account to website. When account is created and user is logged in game can be selected from menu. Pressing "Who Wants to Be a Billionaire?" opens a list of possible question package that can be played.
Clicking the name of questionnaire opens "Who Wants to Be a Billionaire?" - game with selected questions.

## Management view

- Management view is handled by multiple different views. 

- /Questionnaires view
Questionnaire listview shows all available questionaires. User must select one to manipulate it. Questionanires can be found using optional search element. Questionnaire can be also deleted from this listview.
Theres button infront of questionnaire title from wich user can list all questions avaible from questionnaire.

- /questionnaires/edit and /questionanires/new views.
Selection redirects user to listview of all questions if there's any. 
Now user can remove whole question. Add and change questions. Question and possible options are shown under question. 
In front of each option is a radiobutton from which user can select the right answer for question. In this case we use radiobutton because there's only one correct answer for the question. 
When question is ready theres option to add another question. Questions and options can be remove by clicking the trash can buttons.



## Tests and documentation

- Documentation
    Documentation is done by commending all thats done and making sure commits are made often. As committing commends are good tool to document work thats been done.

- Testing
    Management view testing is done by implementin Zombie.js testing enviroment. Using zombie it's possible to run website filling titles and pressing buttons. This is good method testing the actual website and it's elements.
    With testing there's also error messages wich tell user what went wrong and helps users to understand what went wrong.


## Security concerns

- SQL injection - There might be sensitive data secured in same server as application. There shoud be consern and block to injection. If website implements textfield all data from this textfield should be filtered to match only desired data values also userID matching can be implemented.

- Cross Site Scripting (XSS) - Untrusted data send to application should be properly escaped, validated and sanitized.

- Cross-Site Request Forgery (CSRF) - CSRF makes user to execute unwanted actions. Especially state-changing requests are compromised. CSRF attack can be defended by using token cookies wich are submitted with every request.

---

## Installation

1. Install `nodejs` and `npm`, if not already installed.

2. Execute in the root, in the same place, where _package.json_-file is):

    ```
    npm install
    ```

3. **Copy** `.env.dist` in the root with the name `.env` (note the dot in the beginning of the file)

    ```
    cp -i .env.dist .env
    ```

    **Obs: If `.env`-file already exists, do not overwrite it!**

    **Note: Do not save `.env` file to the git repository - it contains sensitive data!**

    **Note: Do not modify `.env.dist` file. It is a model to be copied as .env, it neither must not contain any sensitive data!**

    Modify `.env` file and set the needed environment variables.

    In the real production environment, passwords need to be
    long and complex. Actually, after setting them, one does
    not need to memorize them or type them manually.

4. `Vagrantfile` is provided. It defines how the vagrant
   environment is set up, commands to be run:

    `vagrant up` //sets up the environment
    `vagrant ssh` //moves a user inside vagrant

    Inside vagrant, go to the directory `/bwa` and start the app:
    `npm start`

5. As an other alternative, `Dockerfile` is provided as well.
   Then, docker and docker-compile must be installed.
   In the root, give:

    ```
    docker-compose build && docker-compose up
    ```

    or

    ```
    docker-compose up --build
    ```

    The build phase should be needed only once. Later on you should omit the build phase and simply run:

    ```
    docker-compose up
    ```

    The container is started in the terminal and you can read what is written to console.log. The container is stopped with `Ctrl + C`.


    Sometimes, if you need to rebuild the whole docker container from the very beginning,
    it can be done with the following command:

    ```
    docker-compose build --no-cache --force-rm && docker-compose up
    ```

6. Docker container starts _bwa_ server and listens `http://localhost:3000/`

7) Docker container is stopped in the root dir with a command:

    ```
    docker-compose down
    ```

## Coding conventions

Project uses _express_ web app framework (https://expressjs.com/).
The application starts from `index.js` that in turn calls other modules.  
The actual _express_ application is created and configured in `app.js` and
routes in `router.js`.

The application complies with the _MVC_ model, where each route has
a corresponding _controller_ in the dir of `controllers`.
Controllers, in turn, use the models for getting and storing data.
The models centralize the operations of e.g. validation, sanitation
and storing of data (i.e., _business logic_) to one location.
Having such a structure also enables more standard testing.

As a _view_ component, the app uses _express-handlebars_;
actual views are put in the dir named `views`. It has two subdirectories:
`layouts` and `partials`.
`layouts` are whole pages, whereas `partials` are reusable smaller
snippets put in the `layouts` or other views. Views, layouts, and partials
use _handlebars_ syntax, and their extension is `.hbs`.
More information about _handlebars_ syntax can be found in: http://handlebarsjs.com/

Files such as images, _CSS_ styles, and clientside JavaScripts are under the `public` directory. When the app is run in a browser, the files are located under the`/`path, at the root of the server, so the views must refer to them using the absolute path. (For example, `<link rel =" stylesheet "href =" / css / style.css ">`) ** Note that `public` is not part of this path. **

The _mocha_ and _chai_ modules are used for testing and the tests can be found under the `test` directory.

##About coding policies

The project code aims to follow a consistent coding conventions
ensured by using the _eslint_ code validation tool. The primary purpose of the tool is to ensure that the project code follows more or less the generally accepted style of appropriate conventions, and that the code avoids known vulnerabilities and / or risky coding practices. In addition, the tool aims to standardize the appearance of code of all programmers involved in the project so that all code is easy to read and maintainable for non-original coders as well.

English is recommended for naming functions and variables and commenting on code. Git commit messages should also be written in English, but this is neither required nor monitored.

##Code style

The _eslint_ tool used is configured to require certain stylistic considerations that can reasonably be considered as opinion issues and may not necessarily be true or false. The intention is not to initiate any debate on the subject or upset anyone's mind, but to strive for uniformity in the appearance of the code, with no other motives.

This project follows the following coding styles:

-   indents with 4 spaces
-   the code block starting bracket `{` is in the same line as the block starting the function, clause or loop
-   the block terminating bracket `}` in the code block is always on its own line, except in cases where the whole block is on a single line
-   the _camelCase_ style is recommended for naming functions and variables
-   the variables should not be defined by using the `var` keyword, but the variables and constants are defined using the`let` and `const` keywords
-   each line of code ends with a semicolon `;`

You can check the style of your code by command:

`` ` npm run lint `` `

_eslint_ can also correct some code errors and style violations automatically, but you shouldn't rely on this blindly. You can do this explicitly with the command:

`` ` npm run lint:fix `` `

Naturally, it is easier to set up a code editor to monitor and correct the style during coding.

The project root directory contains the VSCode Editor configuration folder, where the appropriate settings are available for the editor. In addition, it contains plugin recommendations that VSCode will offer to install if the user so wishes. In addition, the project includes the _.editorconfig_ file, which allows you to easily import some of your settings to a number of other editors.
