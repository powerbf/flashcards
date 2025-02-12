// load questionSets into scope
// index 0 will be chosen as default on page load
const questionSetsJSON = [genders, vocab];

// ask youser before leaving the page if they really want to
window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "";
});

// getting the DOM elements 
// Card Elements
let card = document.querySelector(".card")
let question = document.querySelector(".question");
let solution = document.querySelector(".solution");
let inputField = document.querySelector(".answer");
// Buttons
let checkAnswerBUTTON = document.querySelector(".check_answer");
let newWordBUTTON = document.querySelector(".new_word");
let correctBUTTON = document.querySelector(".correct");
let wrongBUTTON = document.querySelector(".wrong");
let reloadBUTTON = document.querySelector(".reload");
let returnBUTTON = document.querySelector(".return");
// card-deck-choice-fields
const cardDeckOptions = [
    "genders",
    "vocab",
];

// Text below the Cards
let remainingCards = document.querySelector(".remaining");
let knownCards = document.querySelector("#known");
let knownCardsCounter = 0;
let nextCards = document.querySelector("#next");

// define question-set
// global questionSet
let questionSet;
defineQuestionSet(questionSetsJSON[0]);

// set a questionSet to start with
function defineQuestionSet(set) {
    questionSet = [...set];
    nextRound = [];
    displayCounts();
}

function loadSelectedDeck() {
    let selectedDeck = deckOptions.value;
    let lastDeckIDX = cardDeckOptions.indexOf(selectedDeck);

    knownCardsCounter = 0;
    defineQuestionSet(questionSetsJSON[lastDeckIDX]);
    newCard();
}

// keep track of current deck-index (cardDeckOptions / questionSetsJSON)
let lastDeckIDX = 0;
// load the deck the user selects from the options-drop-down
let deckOptions = document.querySelector("#decks");
deckOptions.addEventListener("change", (e) => {
    loadSelectedDeck();
});

// flip Answer-Card back to Question
returnBUTTON.addEventListener("click", () => card.classList.remove("flipped"));


// gets a random pair (question/answer) from the a given array of objects
function getQuestionPair(dict) {
    let rand = Math.floor(Math.random() * dict.length);
    return Object.entries(dict)[rand][1];
}

// innitial randomPair on Page-Load
let randomPair = getQuestionPair(questionSet);

// display first question
displayQuestion(randomPair);

function displayCounts() {
    // display current stack of cards
    remainingCards.innerHTML = `Remaining: ${questionSet.length}`
    knownCards.innerHTML = `Correct: ${knownCardsCounter}`; 
    nextCards.innerHTML = `Next round: ${nextRound.length}`; 
}

function resetFrontStyle() {
    let front = document.querySelector(".front");
    front.classList = ["front"];
}

function resetBackStyle() {
    let back = document.querySelector(".back");
    back.classList = ["back"];
}

function addBackStyle(style) {
    let back = document.querySelector(".back");
    back.classList.add(style);
}

// write question on the front of card
function displayQuestion(rP) {
    // get curser into input-field
    if (inputField) inputField.focus(); 
    // remove input field from page if it is not needed (e.g. for rechtFragen)
    if (rP["input"]) {
        inputField.classList.remove("hidden");
        wrongBUTTON.classList.add("hidden");
        correctBUTTON.classList.add("hidden");
    } else {
        inputField.classList.add("hidden");
        wrongBUTTON.classList.remove("hidden");
        correctBUTTON.classList.remove("hidden");
    }
    // turn card to front-side
    card.classList.remove("flipped");
    // write question on front-side of the card
    question.innerHTML = rP["Frage"];
    // add hidden to the last answer, so the card-size rescales down (to question-size)
    solution.classList.add("hidden");
}

// used inside of "flipBackAndDisplayAnswer" to split multiple answers
function splitPhraseIfSeveralNumbers(phrase) {
    let re = /\d\.\s.+\;/;
    if (re.test(phrase)) {
        phrase = phrase.split(";");
    }
    return phrase;
}

// flip card to back-side and display/render answer(s)
function flipBackAndDisplayAnswer() {
    // display answer on the back of the card
    card.classList.add("flipped");
    // the solution-text is hidden (so the card-size isn't too big from the last answer)
    solution.classList.remove("hidden");

    resetBackStyle();
    if (randomPair["answer_class"]) {
        addBackStyle(randomPair["answer_class"]);
    }

    // if no input no "nächste Frage"
    if (randomPair["input"]) newWordBUTTON.classList.remove("hidden");
    else newWordBUTTON.classList.add("hidden");

    // create backside of the card
    let answer = document.querySelector(".answer");
    if (randomPair["input"]) {
        answer = answer.value;
        if (answer == randomPair["Antwort"]) solution.innerHTML = "Correct!";
        else solution.innerHTML = `No. The right answer is <em>"${randomPair["Antwort"]}"</em>.`;
    } else {
        // create List of possible multiple-answer
        let answerList = splitPhraseIfSeveralNumbers(randomPair["Antwort"]);
        // if it is just one answer display it
        if (typeof answerList == "string") solution.innerHTML = randomPair["Antwort"];
        // if muslitple answers display them as a list
        else {
            solution.innerHTML = "";
            let answerListDOM = document.createElement("ol");
            solution.appendChild(answerListDOM);
            answerList.forEach(a => {
                // check if a number is in front and delete it so the ordered list tag provides numbers;
                let numRegEx = /^\s*\d+\.\s/g;
                a = a.replace(numRegEx, "");
                let listElement = document.createElement("li");
                answerListDOM.appendChild(listElement);
                listElement.innerHTML = a;
            });
        }
    } 

    // clear the input field if there is one for next questions
    let answerInput = document.querySelector(".answer");
    if (answerInput) answerInput.value = "";
}

// get a new card
function newCard() {
    if (questionSet.length === 0 && nextRound.length > 0) {
        defineQuestionSet(nextRound);
    }
    // create new randomPair in global scope
    randomPair = getQuestionPair(questionSet);
    displayQuestion(randomPair);
}

// removes current randomPair of question Answer from global questionSet-Array of objects
function removeCardFromSet(correct) {
    let idx = questionSet.findIndex(qa => qa["Frage"] == randomPair["Frage"]);
    let card = questionSet[idx];
    if (correct) {
        questionSet.splice(idx, 1);
        knownCardsCounter += 1;
    } else {
        nextRound.push(card);
        questionSet.splice(idx, 1);
    }
    displayCounts();
    if (questionSet.length > 0 || nextRound.length > 0) {
        newCard();
    }
    else {
        resetBackStyle();
        addBackStyle("finished");
        wrongBUTTON.classList.add("hidden");
        correctBUTTON.classList.add("hidden");
        solution.innerHTML = "Card set finished!";
    }
}

// attache the show-result function to the button on frontside of card
checkAnswerBUTTON.addEventListener("click", flipBackAndDisplayAnswer);

// attache newWord-function to button on backside of card
newWordBUTTON.addEventListener("click", () => {
    let answer = document.querySelector(".answer");
    answer = answer.value;
    removeCardFromSet(answer == randomPair["Antwort"]);
});
// attache functionality "newCard" to wrong-button
wrongBUTTON.addEventListener("click", () => {
    removeCardFromSet(false);
});
correctBUTTON.addEventListener("click", () => {
    removeCardFromSet(true);
});

// reload the page / begin from the beginning
reloadBUTTON.addEventListener("click", () => loadSelectedDeck());

