/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 *
 * This class handles displaying and interacting with a single question.
 *
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 30 seconds
 *
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 *
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 *
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 *
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */

export default class Question {
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;
    this.answered = false;
    this.questionData = this.quiz.getCurrentQuestion();
    this.index = this.quiz.currentQuestionIndex;
    this.correctAnswer = this.questionData.correct_answer;
    this.wrongAnswers = this.questionData.incorrect_answers;
    this.time = 15;
    this.timer = null;
    this.allAnswers = [...this.wrongAnswers, this.correctAnswer].sort(
      () => Math.random() - 0.5,
    );
    console.log(this.quiz.currentQuestionIndex);
    console.log(this.questionData);
  }
  displayQuestion() {
    console.log(this.container);
    this.container.innerHTML = `
        <div class="game-card question-card">
      
      <div class="xp-bar-container">
        <div class="xp-bar-header">
          <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
          <span class="xp-value">Question 1/10</span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width: 10%"></div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-badge category">
          <i class="fa-solid fa-bookmark"></i>
          <span>General Knowledge</span>
        </div>
        <div class="stat-badge difficulty easy">
          <i class="fa-solid fa-face-smile"></i>
          <span>easy</span>
        </div>
        <div class="stat-badge timer">
          <i class="fa-solid fa-stopwatch"></i>
          <span class="timer-value">15</span>s
        </div>
        <div class="stat-badge counter">
          <i class="fa-solid fa-gamepad"></i>
          <span>1/10</span>
        </div>
      </div>

      <h2 class="question-text">${this.questionData.question}</h2>

      <div class="answers-grid">
        <button class="answer-btn" data-answer="London">
          <span class="answer-key">1</span>
          <span class="answer-text">London</span>
        </button>
        <button class="answer-btn" data-answer="Paris">
          <span class="answer-key">2</span>
          <span class="answer-text">Paris</span>
        </button>
        <button class="answer-btn" data-answer="Berlin">
          <span class="answer-key">3</span>
          <span class="answer-text">Berlin</span>
        </button>
        <button class="answer-btn" data-answer="Madrid">
          <span class="answer-key">4</span>
          <span class="answer-text">Madrid</span>
        </button>
      </div>

      <p class="keyboard-hint">
        <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
      </p>

      <div class="score-panel">
        <div class="score-item">
          <div class="score-item-label">Score</div>
          <div class="score-item-value">0</div>
        </div>
      </div>
    </div>

    
    `;

    const questionCounter = this.container.querySelector(".xp-value");
    const scoreElement = this.container.querySelector(".score-item-value");
    scoreElement.textContent = this.quiz.score;
    questionCounter.textContent = `Question ${
      this.quiz.currentQuestionIndex + 1
    }/${this.quiz.questions.length}`;

    const answerButtons = this.container.querySelectorAll(".answer-btn");
    console.log(answerButtons);
    answerButtons.forEach((button, index) => {
      button.querySelector(".answer-text").textContent = this.allAnswers[index];
      button.dataset.answer = this.allAnswers[index];
    });

    this.addEventListeners();
    this.startTimer();
  }
  addEventListeners() {
    const answerButtons = this.container.querySelectorAll(".answer-btn");

    answerButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.checkAnswer(button);
      });
    });
  }
  checkAnswer(button) {
    if (this.answered) return;

    this.answered = true;
    clearInterval(this.timer);
    this.disableAnswers();

    const selectedAnswer = button ? button.dataset.answer : null;

    const isCorrect = selectedAnswer === this.correctAnswer;

    if (isCorrect) {
      this.quiz.incrementScore();

      if (button) {
        button.classList.add("correct");
      }
    } else {
      if (button) {
        button.classList.add("wrong");
      }

      this.highlightCorrectAnswer();
    }
    setTimeout(() => {
      this.getNextQuestion();
    }, 1500);
  }

  getNextQuestion() {
    const hasNext = this.quiz.nextQuestion();

    if (hasNext) {
      const nextQuestion = new Question(
        this.quiz,
        this.container,
        this.onQuizEnd,
      );

      nextQuestion.displayQuestion();
    } else {
      this.onQuizEnd();
    }
  }

  highlightCorrectAnswer() {
    const answerButtons = this.container.querySelectorAll(".answer-btn");

    answerButtons.forEach((button) => {
      if (button.dataset.answer === this.correctAnswer) {
        button.classList.add("correct");
      }
    });
  }

  disableAnswers() {
    const answerButtons = this.container.querySelectorAll(".answer-btn");

    answerButtons.forEach((button) => {
      button.disabled = true;
    });
  }

  startTimer() {
    const timerElement = this.container.querySelector(".timer-value");

    this.timer = setInterval(() => {
      this.time--;

      timerElement.textContent = this.time;
      if (this.time <= 0) {
        clearInterval(this.timer);
        this.checkAnswer(null);
      }
    }, 1000);
  }
  // TODO: Create constructor(quiz, container, onQuizEnd)
  // 1. Store the three parameters
  // 2. Get question data: this.questionData = quiz.getCurrentQuestion()
  // 3. Store index: this.index = quiz.currentQuestionIndex
  // 4. Decode and store: question, correctAnswer, category
  // 5. Decode wrong answers (use .map())
  // 6. Shuffle all answers
  // 7. Initialize: answered = false, timerInterval = null, timeRemaining
  // TODO: Create decodeHtml(html) method
  // Use DOMParser to decode HTML entities
  // TODO: Create shuffleAnswers() method
  // 1. Combine wrongAnswers and correctAnswer into one array
  // 2. Shuffle using Fisher-Yates algorithm
  // 3. Return shuffled array
  // TODO: Create getProgress() method
  // Calculate: ((index + 1) / quiz.numberOfQuestions) * 100
  // Round to whole number
  // TODO: Create displayQuestion() method
  // 1. Create HTML string for the question card
  //    (See index.html for the structure to use)
  // 2. Use template literals with ${} for dynamic data
  // 3. Set this.container.innerHTML = yourHTML
  // 4. Call this.addEventListeners()
  // 5. Call this.startTimer()
  // TODO: Create addEventListeners() method
  // 1. Get all answer buttons: document.querySelectorAll('.answer-btn')
  // 2. Add click event to each: call this.checkAnswer(button)
  // 3. Add keyboard support: listen for keys 1-4
  //    Valid keys are: ['1', '2', '3', '4']
  // TODO: Create removeEventListeners() method
  // Remove any keyboard listeners you added
  // TODO: Create startTimer() method
  // 1. Get timer display element
  // 2. Use setInterval to run every 1000ms (1 second)
  // 3. Decrement timeRemaining
  // 4. Update the display
  // 5. If timeRemaining <= 10 seconds, add 'warning' class
  // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()
  // TODO: Create stopTimer() method
  // Use clearInterval(this.timerInterval)
  // TODO: Create handleTimeUp() method
  // 1. Set answered = true
  // 2. Call removeEventListeners()
  // 3. Show correct answer (add 'correct' class)
  // 4. Show "TIME'S UP!" message
  // 5. Call animateQuestion() after a delay
  // TODO: Create checkAnswer(choiceElement) method
  // 1. If already answered, return early
  // 2. Set answered = true
  // 3. Stop the timer
  // 4. Get selected answer from data-answer attribute
  // 5. Compare with correctAnswer (case insensitive)
  // 6. If correct: add 'correct' class, call quiz.incrementScore()
  // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
  // 8. Disable other buttons (add 'disabled' class)
  // 9. Call animateQuestion()
  // TODO: Create highlightCorrectAnswer() method
  // Find the button with correct answer and add 'correct-reveal' class
  // TODO: Create getNextQuestion() method
  // 1. Call quiz.nextQuestion()
  // 2. If returns true: create new Question and display it
  // 3. If returns false: show results using quiz.endQuiz()
  //    Also add click listener to Play Again button
  // TODO: Create animateQuestion(duration) method
  // 1. Wait for 1500ms (transition delay)
  // 2. Add 'exit' class to question card
  // 3. Wait for duration
  // 4. Call getNextQuestion()
}
