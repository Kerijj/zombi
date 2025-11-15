// quest.js
// 🧟 УЛЬТИМАТИВНАЯ ЛОГИКА: 1.5 Часа Выживания, Таймеры и Обходы 🧟

// --- 1. Состояние Игры и Элементы DOM ---
let gameState = {
    lives: 3,
    bonuses: 0,
    timeLimit: 90 * 60, // 1.5 часа (90 минут) в секундах
    currentTime: 90 * 60,
    timerInterval: null,
    questionTimerInterval: null, // Новый таймер для вопросов
};

const DOMElements = {
    timer: document.getElementById('timer'),
    lives: document.getElementById('lives'),
    bonuses: document.getElementById('bonuses'),
    scenarioText: document.getElementById('scenario-text'),
    choicesContainer: document.getElementById('choices-container'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.querySelector('#overlay-content h2'),
    overlayText: document.querySelector('#overlay-content p'),
    restartButton: document.getElementById('restart-button')
};

// --- 2. Структура Квеста (Сценарии, Вопросы и Разветвления) ---

const QUEST_STEPS = {
    // --- НАЧАЛО (Коридор) ---
    start: {
        text: `Ты очнулся. Неоновые огни мерцают. У тебя 90 минут, чтобы добраться до передатчика. Ты в длинном коридоре. Слева - надпись «Опасно, но быстро», справа - «Безопасный, но длинный маршрут».`,
        choices: [
            { text: "➡️ Опасно, но быстро (Слева)", next: "path_danger_1" },
            { text: "➡️ Безопасный, но длинный (Справа)", next: "path_safe_1" }
        ]
    },

    // --- ВЕТКА "ОПАСНОСТЬ" (Акцент на скорость и реакцию) ---
    path_danger_1: {
        text: `Ты бежишь по слабоосвещенному складу. Внезапно срабатывает сирена, и на тебя бежит толпа! Ты должен быстро ответить на вопрос, чтобы найти люк для отступления. **У тебя 15 секунд!**`,
        type: 'speed_quiz',
        time: 15,
        question: 'Викторина (Скорость): Какое химическое вещество чаще всего используется для обозначения "неонового" зеленого света в кино?',
        answers: {
            a: { text: 'Радий', next: 'path_danger_1_fail' },
            b: { text: 'Люциферин', next: 'path_danger_1_fail' },
            c: { text: 'Уранин (флуоресцеин)', next: 'path_danger_2' }
        }
    },
    path_danger_1_fail: {
        text: `Время вышло, или ответ неверный! Ты потерял равновесие, спасаясь от орды. **-1 Жизнь** и **-5 минут времени**. Ты отступил в техническую нишу.`,
        effect: { lives: -1, time: -300 }, 
        choices: [
            { text: "➡️ Искать обход через вентиляцию", next: "path_alt_vent" }
        ]
    },
    path_danger_2: {
        text: `Люк открыт! Ты проваливаешься в темную комнату, но находишь **+1 Бонус** (Антидот) и чистую аптечку **(+1 Жизнь!)**.`,
        effect: { bonuses: 1, lives: 1 },
        choices: [
            { text: "➡️ Двигаться дальше", next: "path_danger_3" }
        ]
    },
    path_danger_3: {
        text: `Перед тобой Зомби-Инженер. Он заблокировал проход и готов дать тебе ключ, только если ты решишь его головоломку на логику.`,
        type: 'logic_puzzle',
        question: 'Логика: Если Зомби-Лжец всегда говорит, что он говорит правду, а Зомби-Правдивец всегда говорит, что он лжет. Что произойдет?',
        correctAnswer: 'Парадокс, оба замолчат.', // Ответ
        failNext: 'path_danger_3_fail',
        successNext: 'mid_junction'
    },
    path_danger_3_fail: {
        text: `Инженер недоволен твоей логикой. Он начинает строить баррикаду, блокируя путь. **-10 минут** на обход через завалы.`,
        effect: { time: -600 },
        choices: [
            { text: "➡️ Идти к центральному узлу", next: "mid_junction" }
        ]
    },
    
    // --- ВЕТКА "БЕЗОПАСНОСТЬ" (Акцент на теорию и мышление) ---
    path_safe_1: {
        text: `Ты идешь по тихому служебному коридору. На стене висит объявление: «Только для эрудированных». Чтобы открыть дверь, нужно ответить на вопрос из истории.`,
        type: 'theory_quiz',
        question: 'Теория (История): Когда был основан Рим?',
        answers: {
            a: { text: '476 год н.э.', next: 'path_safe_1_fail' },
            b: { text: '753 год до н.э.', next: 'path_safe_2' },
            c: { text: '1066 год н.э.', next: 'path_safe_1_fail' }
        }
    },
    path_safe_1_fail: {
        text: `Дверь издает противный скрежет, а затем из пола вылезает зомби-историк и кричит "Неверно!". **-1 Жизнь** и **-5 минут времени**.`,
        effect: { lives: -1, time: -300 }, 
        choices: [
            { text: "➡️ Проломить стену (Риск!)", next: "path_alt_hole" }
        ]
    },
    path_safe_2: {
        text: `Дверь открывается бесшумно. Ты находишь тайник с едой и водой – **+1 Бонус** и **+150 секунд времени** (небольшая передышка).`,
        effect: { bonuses: 1, time: 150 },
        choices: [
            { text: "➡️ Двигаться дальше", next: "path_safe_3" }
        ]
    },
    path_safe_3: {
        text: `Перед тобой дверь с табличкой "Проверь свои убеждения". Нужно решить "Верю/Не верю" на тему зомби-апокалипсиса.`,
        type: 'believe',
        question: 'Верю/Не верю: Факт: Если обезглавить зомби, его тело умрет, но голова останется живой и будет пытаться укусить до полного разложения. Правда или нет?',
        correctAnswer: true, // Пусть это будет "правдой" для игровой мифологии
        failNext: 'path_safe_3_fail',
        successNext: 'mid_junction'
    },
    path_safe_3_fail: {
        text: `Ошибка! Дверь бьет тебя током. **-1 Жизнь!** Ты теряешь равновесие и вынужден ползти по полу, теряя время.`,
        effect: { lives: -1 },
        choices: [
            { text: "➡️ Идти к центральному узлу", next: "mid_junction" }
        ]
    },

    // --- ОБХОДНЫЕ ПУТИ ---
    path_alt_vent: {
        text: `Ты ползешь по вентиляции. Она ведет в **Секретную комнату**! Там Зомби-Хакер оставил тебе записку: «Чтобы выбраться, реши, что будет, если два зомби-курьера столкнутся на скорости света?»`,
        type: 'logic_puzzle',
        question: 'Логика: Что произойдет, если два зомби столкнутся, каждый из которых бежит со скоростью 99% скорости света, если их мозг весит 1 кг?',
        correctAnswer: 'Они создадут мини-черную дыру.',
        failNext: 'final_stage_fail_long',
        successNext: 'final_stage_main_short'
    },
    path_alt_hole: {
        text: `Ты пробил стену и нашел **Потайной арсенал**. Ты берешь мощную гранату **(+2 Бонуса)**, но на стене нарисована головоломка.`,
        effect: { bonuses: 2 },
        type: 'logic_puzzle',
        question: 'Логика: У тебя есть 10 зомби. Как разделить их на две группы, чтобы в каждой было по 6 зомби?',
        correctAnswer: 'Разделить на 2 группы по 5, затем поместить одного зомби в обе группы.',
        failNext: 'final_stage_fail_long',
        successNext: 'final_stage_main_short'
    },

    // --- СЕРЕДИНА КВЕСТА (Объединение веток) ---
    mid_junction: {
        text: `Ты вышел в центральный зал. Он чист, но часы показывают, что прошло много времени. **Внимание!** Ты должен быстро решить, куда идти дальше. **10 секунд!**`,
        type: 'speed_quiz',
        time: 10,
        question: 'Викторина (Скорость): Какое число является и нечетным, и четным одновременно, если смотреть на него под неоновым светом?',
        answers: {
            a: { text: '2 (Четное)', next: 'final_stage_fail' },
            b: { text: '3 (Нечетное)', next: 'final_stage_fail' },
            c: { text: 'Свет', next: 'final_stage_main' } // "Свет" - правильный прикол
        }
    },

    // --- ФИНАЛЬНЫЕ СЦЕНЫ ---
    final_stage_main: {
        text: `Ты нашел прямой путь на крышу! Ты видишь передатчик. Введи последний код...`,
        type: 'final_check',
        choices: [
            { text: "🟢 Отправить сигнал", next: "game_win" }
        ]
    },
    final_stage_main_short: {
        text: `Тайный путь привел тебя прямо к передатчику! Потрачено минимум времени!`,
        type: 'final_check',
        choices: [
            { text: "🟢 Отправить сигнал", next: "game_win" }
        ]
    },
    final_stage_fail: {
        text: `Ты ошибся и попал в склад с громкой музыкой. Зомби сбегаются! Ты теряешь 15 минут, пока отбиваешься.`,
        effect: { time: -900 }, // -15 минут
        choices: [
            { text: "➡️ Идти на крышу (запыхавшись)", next: "final_stage_main" }
        ]
    },
    final_stage_fail_long: {
        text: `Обходной путь оказался ловушкой! Ты потратил полчаса в темноте, а зомби грызли дверь. **-1 Жизнь** и **-30 минут времени!**`,
        effect: { lives: -1, time: -1800 }, // -30 минут
        choices: [
            { text: "➡️ Идти на крышу (из последних сил)", next: "final_stage_main" }
        ]
    },

    // --- КОНЕЦ ИГРЫ ---
    game_win: {
        text: `СИГНАЛ ОТПРАВЛЕН! Ты выжил в Неоновом Апокалипсисе! Твое время: `,
        type: 'final_win'
    },
    game_over: {
        text: `Жизни исчерпаны, или время вышло. Твое тело пополнило армию зомби. КОНЕЦ ИГРЫ.`,
        type: 'final_lose'
    }
};

// --- 3. Функции Игры (С добавлением Таймера для вопросов) ---

// (Функции updateStats, startTimer, formatTime остаются прежними)

function updateStats() {
    DOMElements.lives.textContent = gameState.lives;
    DOMElements.bonuses.textContent = gameState.bonuses;
    if (gameState.lives <= 0) {
        endGame('game_over');
    }
}

function startTimer() {
    gameState.currentTime = gameState.timeLimit;
    gameState.timerInterval = setInterval(() => {
        gameState.currentTime--;
        const hours = String(Math.floor(gameState.currentTime / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((gameState.currentTime % 3600) / 60)).padStart(2, '0');
        const seconds = String(gameState.currentTime % 60).padStart(2, '0');
        DOMElements.timer.textContent = `${hours}:${minutes}:${seconds}`;

        if (gameState.currentTime <= 0) {
            clearInterval(gameState.timerInterval);
            endGame('game_over');
        }
    }, 1000);
}

function formatTime(totalSeconds) {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Главная функция перехода между шагами.
 */
function goToStep(stepKey) {
    // Останавливаем таймер предыдущего вопроса, если он был
    if (gameState.questionTimerInterval) {
        clearInterval(gameState.questionTimerInterval);
        gameState.questionTimerInterval = null;
    }
    
    const step = QUEST_STEPS[stepKey];
    // ... (Обработка эффектов и финала остается прежней)
    if (!step) {
        console.error("Шаг не найден:", stepKey);
        return;
    }
    if (step.effect) {
        if (step.effect.lives) { gameState.lives += step.effect.lives; }
        if (step.effect.bonuses) { gameState.bonuses += step.effect.bonuses; }
        if (step.effect.time) { gameState.currentTime += step.effect.time; }
        updateStats();
    }
    if (step.type === 'final_win' || step.type === 'final_lose') {
        endGame(stepKey);
        return;
    }

    DOMElements.scenarioText.innerHTML = '';
    DOMElements.choicesContainer.innerHTML = '';
    const textNode = document.createElement('p');
    textNode.innerHTML = step.text;
    DOMElements.scenarioText.appendChild(textNode);
    
    // Новая обработка типов шагов
    if (step.type === 'speed_quiz' || step.type === 'theory_quiz') {
        renderTimedQuestion(step);
    } else if (step.type === 'logic_puzzle') {
        renderLogicPuzzle(step);
    } else if (step.type === 'believe') {
        renderBelieveUnbelieve(step);
    } else if (step.type === 'final_check') {
        renderFinalCheck();
    } else if (step.choices) {
        // Обычный выбор
        step.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            button.addEventListener('click', () => goToStep(choice.next));
            DOMElements.choicesContainer.appendChild(button);
        });
    }
}

/**
 * Отображает и обрабатывает вопросы с ограничением по времени.
 * @param {object} step - Шаг с вопросом и таймером.
 */
function renderTimedQuestion(step) {
    const timeLimit = step.time; // Секунды
    let timeLeft = timeLimit;

    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>🚀 ${step.type === 'speed_quiz' ? 'СКОРОСТНАЯ ВИКТОРИНА' : 'ТЕМАТИЧЕСКАЯ ТЕОРИЯ'}</h3>
        <p class="timer-display" style="color: var(--neon-red); font-size: 1.5em;">Осталось: <span id="q-timer">${timeLeft}</span> сек.</p>
        <p>${step.question}</p>
        <p id="feedback-text"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    const feedback = document.getElementById('feedback-text');
    const timerDisplay = document.getElementById('q-timer');
    
    // Функция перехода при завершении (успех или провал)
    const complete = (nextStepKey) => {
        clearInterval(gameState.questionTimerInterval);
        // Задержка, чтобы игрок успел прочитать
        setTimeout(() => goToStep(nextStepKey), 1500);
    };

    // Запуск таймера
    gameState.questionTimerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            feedback.className = 'incorrect';
            feedback.textContent = '⏱️ Время вышло! Слишком медленно...';
            complete(Object.values(step.answers).find(a => a.next.includes('_fail')).next); // Ищем ключ провала
        }
    }, 1000);

    // Добавляем кнопки ответов
    for (const key in step.answers) {
        const answer = step.answers[key];
        const button = document.createElement('button');
        button.className = 'quest-button';
        button.textContent = answer.text;
        
        button.onclick = () => {
            document.querySelectorAll('.quest-button').forEach(btn => btn.disabled = true);
            
            if (answer.next.includes('_fail')) {
                feedback.className = 'incorrect';
                feedback.textContent = '❌ Неверный ответ! Вперед, зомби!';
                complete(answer.next);
            } else {
                feedback.className = 'correct';
                feedback.textContent = '✅ Правильно! Идеальная реакция!';
                gameState.bonuses++; // Бонус за скорость
                updateStats();
                complete(answer.next);
            }
        };
        gameContainer.appendChild(button);
    }
}

/**
 * Отображает и обрабатывает логические задачи (с вводом текста).
 * @param {object} step - Шаг с логической задачей.
 */
function renderLogicPuzzle(step) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>🧠 ЛОГИЧЕСКАЯ ГОЛОВОЛОМКА</h3>
        <p>${step.question}</p>
        <input type="text" id="logic-answer" placeholder="Ключевой ответ" class="quest-input">
        <button id="submit-logic" class="quest-button">Проверить Логику</button>
        <p id="feedback-logic"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    document.getElementById('submit-logic').onclick = () => {
        const answer = document.getElementById('logic-answer').value.trim().toLowerCase();
        const feedback = document.getElementById('feedback-logic');
        const correctNorm = step.correctAnswer.toLowerCase();
        
        // Проверка на совпадение или частичное совпадение для логики
        const isCorrect = answer.includes(correctNorm.split(' ')[0]) || answer.includes(correctNorm);

        if (isCorrect) {
            feedback.className = 'correct';
            feedback.textContent = '✅ Твоя логика безупречна. Проход открыт.';
            setTimeout(() => goToStep(step.successNext), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = '❌ Ошибка в рассуждениях! Ты запутался...';
            // Можно дать вторую попытку или сразу на провал
            setTimeout(() => goToStep(step.failNext), 1500); 
        }
    };
}


/**
 * Отображает и обрабатывает вопросы Верю/Не Верю. (Остается прежним)
 */
function renderBelieveUnbelieve(step) {
    // ... (код renderBelieveUnbelieve из предыдущей версии)
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `<h3>❓ Задание: Верю / Не Верю</h3>`;
    
    const questionText = document.createElement('p');
    questionText.innerHTML = step.question;
    gameContainer.appendChild(questionText);

    const feedback = document.createElement('p');
    feedback.id = 'feedback-text';
    gameContainer.appendChild(feedback);
    DOMElements.choicesContainer.appendChild(gameContainer);

    const checkAnswer = (isBeliefTrue) => {
        document.querySelectorAll('.quest-button').forEach(btn => btn.disabled = true);
        
        const isCorrect = (isBeliefTrue === step.correctAnswer);

        if (isCorrect) {
            feedback.className = 'correct';
            feedback.textContent = '✅ Верно! Твоя проницательность спасла тебя.';
            setTimeout(() => goToStep(step.successNext), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = '❌ Ложное знание! Задержка...';
            setTimeout(() => goToStep(step.failNext), 1500);
        }
    };
    
    const buttonTrue = document.createElement('button');
    buttonTrue.className = 'quest-button';
    buttonTrue.textContent = 'ВЕРЮ';
    buttonTrue.onclick = () => checkAnswer(true);
    
    const buttonFalse = document.createElement('button');
    buttonFalse.className = 'quest-button';
    buttonFalse.textContent = 'НЕ ВЕРЮ';
    buttonFalse.onclick = () => checkAnswer(false);
    
    gameContainer.appendChild(buttonTrue);
    gameContainer.appendChild(buttonFalse);
}

/**
 * Обработка финальной проверки кода. (Остается прежней)
 */
function renderFinalCheck() {
    // ... (код renderFinalCheck из предыдущей версии)
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    
    const requiredCode = (gameState.bonuses + gameState.lives) * 10;
    
    gameContainer.innerHTML = `
        <h3>🔑 Финальный Код</h3>
        <p>Код = (Бонусы + Жизни) * 10. У тебя ${gameState.bonuses} бонусов и ${gameState.lives} жизней.</p>
        <input type="number" id="final-code" placeholder="Введите код (например, ${requiredCode})" class="quest-input">
        <button id="submit-final" class="quest-button">Активировать</button>
        <p id="feedback-final"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    document.getElementById('submit-final').onclick = () => {
        const answer = parseInt(document.getElementById('final-code').value);
        const feedback = document.getElementById('feedback-final');
        
        if (answer === requiredCode) {
            feedback.className = 'correct';
            feedback.textContent = '✅ Код принят! Вперед к победе!';
            setTimeout(() => goToStep('game_win'), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = `❌ Код неверный! Ты потерял время, вводя его. Попробуй еще!`;
            gameState.currentTime -= 60; // -1 минута
            updateStats();
        }
    };
}


// Запуск игры при загрузке страницы
function initGame() {
    gameState.lives = 3;
    gameState.bonuses = 0;
    gameState.currentTime = gameState.timeLimit;
    
    DOMElements.overlay.classList.add('hidden');
    
    updateStats();
    if(gameState.timerInterval) clearInterval(gameState.timerInterval); 
    startTimer();
    goToStep('start');

    DOMElements.restartButton.onclick = initGame;
}

document.addEventListener('DOMContentLoaded', initGame);
