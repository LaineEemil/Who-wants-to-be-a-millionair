'use strict';

$(function () {
    $("#search-type-select").on("change", function () {
        $("#questionnaire-search").trigger("input");
    });

    $("#questionnaire-search").on("input", function () {
        var searchType = $("#search-type-select").val();
        var search = $(this).val().toLowerCase();
        if (!search) {
            $("tr").removeClass("hidden");
            return;
        }
        search = search.toLowerCase();

        $(".questionnaire-tr").each(function () {
            let questionnaireTitle = $(this).find(".question-title-link").text().toLowerCase();
            let questionnaireTitleMatches = questionnaireTitle.indexOf(search) != -1;

            let anyQuestionMatches = false;
            $(this).find("li").each(function () {
                let text = $(this).text().toLowerCase();
                if (text.indexOf(search) != -1) {
                    anyQuestionMatches = true;
                }
            });

            if (searchType == 1) {
                if (questionnaireTitleMatches) {
                    $(this).removeClass("hidden");
                } else {
                    $(this).addClass("hidden");
                }
            } else if (searchType == 2) {
                if (anyQuestionMatches) {
                    $(this).removeClass("hidden");
                } else {
                    $(this).addClass("hidden");
                }
            } else if (searchType == 3) {
                if (questionnaireTitleMatches || anyQuestionMatches) {
                    $(this).removeClass("hidden");
                } else {
                    $(this).addClass("hidden");
                }
            }
        });
    });

    $(".show-question-list-btn").click(function () {
        var btn = $(this);
        // Not visible if collapsed
        let state = $(this).data("state");
        btn.html(state == "collapsed" ? "&#10134;" : "&#10133;")
        btn.data("state", state == "collapsed" ? "expanded" : "collapsed");
    });
});

function generateId() {
    // add random letter so it can used as HTML ID right away
    var letter = String.fromCharCode(65 + Math.floor(26 * Math.random));
    return letter + new Date().getTime();
}

function addQuestion(rootContainerSelector) {
    let id = generateId();

    let container = $('<div id="question-' + id + '" data-qid="' + id + '" class="container question-container">');
    let marginContainer = $('<div class="row mt-2">');
    let removeContainer = $('<div class="text-right">'
        + '<button type="button" onclick="removeQuestion(\'#question-' + id + '\')" id="removeQuestionbtn" class="btn btn-outline-danger">&#128465;</button></div>');
    let card = $('<div class="card card-body">');

    card.append(removeContainer);
    card.append('<input type="hidden" name="id" value="" />');
    card.append('<label for="q-title-id-' + id + '">Question title</label><input id="q-title-' + id
        + '" class="q-title form-control" type="text" name="title" value="" />');
    card.append('<label for="q-title-id-' + id + '">Max points</label><input id="q-max-points-' + id
        + '" class="q-max-points form-control" type="number" min="1" name="maxPoints" value="" />');

    let optionsContainer = $('<div class="table-responsive mt-4 text-center">');
    let optionsTable = $('<table id="q-options-' + id + '" class="table options-table">');
    optionsTable.append("<tr><th>Correct</th><th>Option</th><th>Remove</th></tr>");
    optionsContainer.append(optionsTable);
    optionsContainer.append('<button class="btn btn-secondary" id="addOptionbtn" onclick="addOption(\'' + id + '\');" type="button" >Add option</button>');

    card.append(optionsContainer);
    marginContainer.append(card);
    container.append(marginContainer);
    $(rootContainerSelector).append(container);
}

function addOption(questionId) {
    let id = generateId();
    let delBtn = '<button type="button" onclick="removeOption(\'#option-' + id + '\')" id="removeOptionbtn" class="btn btn-outline-danger">&#128465;</button>';
    let row = '<tr id="option-' + id + '" class="option-tr"><td><input name="q-correctness-' + questionId + '" type="radio" value="' + id + '" id="' + id + '" class="correctness" required/></td>'
        + '<td><input name="option" placeholder="Option" id="add-option-' + id + '" class="form-control" type="text" /><br>'
        + '<input name="hint" placeholder="Hint" id="add-hint-' + id + '" class="form-control" type="text" /></td><td>' + delBtn + '</td></tr>';
    $("#q-options-" + questionId).append(row);
}

function removeQuestion(containerSelector) {
    if (confirm("Delete question?")) {
        $(containerSelector).remove();
    }
}

function removeOption(containerSelector) {
    if (confirm("Remove option?")) {
        $(containerSelector).remove();
    }
}

function save() {
    let questionnaire = {
        title: $("#title").val(),
        submissions: parseInt($("#submissions").val()),
        questions: []
    };
    let id = $("#id").val();
    if (id) {
        questionnaire.id = id;
    }
    $('.question-container').each(function () {
        let q = {};
        q.title = $(this).find("input[name=title]").val();
        q.maxPoints = parseInt($(this).find("input[name=maxPoints]").val());
        q.options = [];

        let qID = $(this).data("qid");
        let correctOption = $('input[name=q-correctness-' + qID + ']:checked').val();

        $(this).find(".option-tr").each(function () {
            let o = {};
            o.correctness = $(this).find(".correctness").val() == correctOption;
            o.option = $(this).find("input[name=option]").val();
            o.hint = $(this).find("input[name=hint]").val();
            q.options.push(o);
        });
        questionnaire.questions.push(q);
    });

    let data = JSON.stringify(questionnaire);
    $.ajax({
        type: "POST",
        url: location.pathname,
        data: data,
        contentType: "application/json",
        error: function (xhr, textStatus, errorThrown) {
            $("#errors").removeClass("hidden");
            $("#errors").text(xhr.responseText);
        },
        success: function (response, textStatus, jqXHR) {
            window.location = "/questionnaires";
        }
    });
}