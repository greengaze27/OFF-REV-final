const flashcards =
    JSON.parse(localStorage.getItem("flashcards")) || [];

let currentQuestion = 0;
let score = 0;

if (flashcards.length === 0) {

    document.getElementById("quizQuestion").textContent =
        "No questions found.";

} else {

    loadQuestion();

}


function loadQuestion() {

    const current =
        flashcards[currentQuestion];


    document.getElementById("quizQuestion").textContent =
        current.question;


    document.getElementById("quizCounter").textContent =
        "Question " +
        (currentQuestion + 1) +
        " of " +
        flashcards.length;


    document.getElementById("feedback").textContent =
        "";


    document.getElementById("nextButton").style.display =
        "none";


    createChoices();

}


function createChoices() {

    const choicesContainer =
        document.getElementById("choices");

    choicesContainer.innerHTML = "";


    const correctAnswer =
        flashcards[currentQuestion].answer;

    let wrongAnswers =
        flashcards
            .map(card => card.answer)
            .filter(answer =>
                answer &&
                answer !== correctAnswer
            );

    wrongAnswers =
        [...new Set(wrongAnswers)];

    wrongAnswers.sort(
        () => Math.random() - 0.5
    );

    wrongAnswers =
        wrongAnswers.slice(0, 3);

    let choices = [
        correctAnswer,
        ...wrongAnswers
    ];

    choices.sort(
        () => Math.random() - 0.5
    );


    choices.forEach(function(choice, index) {

        const button =
            document.createElement("button");


        button.className =
            "quiz-choice";


        button.textContent =
            String.fromCharCode(65 + index) +
            ". " +
            choice;


        button.onclick = function() {

            checkAnswer(
                choice,
                correctAnswer,
                button
            );

        };


        choicesContainer.appendChild(button);

    });

}


function checkAnswer(
    selected,
    correct,
    selectedButton
) {

    const feedback =
        document.getElementById("feedback");


    const buttons =
        document.querySelectorAll(".quiz-choice");

    if (selected === correct) {

        score++;


        feedback.textContent =
            "✅ Correct!";


        feedback.style.color =
            "green";


        selectedButton.style.fontWeight =
            "bold";

    }

    else {

        feedback.textContent =
            "❌ Incorrect!";


        feedback.style.color =
            "red";

    }

    buttons.forEach(function(button) {

        button.disabled = true;

    });

    document.getElementById("nextButton")
        .style.display = "inline-block";

}


function nextQuestion() {

    currentQuestion++;

    if (
        currentQuestion >=
        flashcards.length
    ) {

        localStorage.setItem(
            "quizScore",
            score
        );


        localStorage.setItem(
            "quizTotal",
            flashcards.length
        );


        window.location.href =
            "result.html";


        return;

    }

    loadQuestion();

}
