// quest.js
// 💀 THE NEON APOCALYPSE: MORAL DILEMMAS & ULTIMATE CHAOS 💀

// --- 1. Состояние Игры и Элементы DOM ---
let gameState = {
    lives: 3,
    bonuses: 0,
    moralScore: 10, // Новый параметр: Моральный рейтинг (Начинаем с 10)
    timeLimit: 120 * 60, // Увеличиваем до 2 часов (120 minutes)
    currentTime: 120 * 60,
    timerInterval: null,
    questionTimerInterval: null, 
    // МНОГОЯЗЫЧНЫЕ ПЕРЕМЕННЫЕ
    labels: {
        timerTitle: 'TIMER',
        livesTitle: '❤️ LIVES',
        bonusesTitle: '🌟 BONUSES',
        moralTitle: '⚖️ MORAL', // Новый заголовок
        failTime: '⏱️ Time is up!',
        correct: '✅ CORRECT!',
        incorrect: '❌ WRONG!',
        restartButton: 'התחל מחדש (RESTART)' 
    }
};

const DOMElements = {
    timer: document.getElementById('timer'),
    lives: document.getElementById('lives'),
    bonuses: document.getElementById('bonuses'),
    moralScore: document.getElementById('moral-score'), // Новый элемент
    scenarioText: document.getElementById('scenario-text'),
    choicesContainer: document.getElementById('choices-container'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.querySelector('#overlay-content h2'),
    overlayText: document.querySelector('#overlay-content p'),
    restartButton: document.getElementById('restart-button')
};

// --- 2. Структура Квеста (Сценарии, Вопросы, Дилеммы) ---

const QUEST_STEPS = {
    // --- НАЧАЛО: ЗАПУТЫВАЮЩИЙ СТАРТ ---
    start: {
        text: `Ты просыпаешься в изоляции. '120 MINUTES TILL DAWN'. На стенах мерцают три символа: 🟦 (Логика), 🟥 (Хаос), 🟨 (Случайность). Какой путь зовет тебя?`,
        choices: [
            { text: "🟦 Путь Логики (The Blue Labyrinth)", next: "path_logic_1" },
            { text: "🟥 Путь Хаоса (The Red Rush)", next: "path_chaos_1" },
            { text: "🟨 Путь Случайности (The Yellow Whisper)", next: "path_random_1" }
        ]
    },
    
    // --- ВЕТКА 1: ЛОГИКА (Сложная загадка) ---
    path_logic_1: {
        text: `Синий путь ведет в комнату с голограммой Зомби-Клерка. Он держит две таблички: на одной 'ALL MY STATEMENTS ARE LIES', на другой - 'I HAVE 10 FINGERS'. Ты должен быстро определить, что он скрывает.`,
        type: 'logic_puzzle',
        question: 'Логика: Зомби-Лжец всегда говорит правду, а Зомби-Правдивец всегда лжет. Какая табличка принадлежит Зомби-Лжецу? (Ответ: 'I HAVE 10 FINGERS' или '10 FINGERS')',
        correctAnswer: 'I HAVE 10 FINGERS', 
        failNext: 'logic_fail_short',
        successNext: 'path_logic_2'
    },
    logic_fail_short: {
        text: `Клерк усмехается. Голограмма исчезает. -10 минут времени и -1 Мораль за неудачу. Ты идешь в обход.`,
        effect: { time: -600, moral: -1 },
        choices: [
            { text: "➡️ Поискать подсказку (теряя время)", next: "path_chaos_1" } 
        ]
    },
    path_logic_2: {
        text: `Логика пройдена! Ты нашел "+1 Бонус" (Кибер-очки). Перед тобой развилка: 'ЗАПИСИ АРХИВА' или 'НЕОНОВАЯ ШАХТА'.`,
        effect: { bonuses: 1 },
        choices: [
            { text: "📚 Архивирование (Длинный, но полезный путь)", next: "path_archive_challenge" },
            { text: "⬇️ Шахта (Быстрый спуск, риск)", next: "path_shaft_risk" }
        ]
    },

    // --- ВЕТКА 2: ХАОС (СКОРОСТЬ И ПЕРЕГРУЗКА) ---
    path_chaos_1: {
        text: `Красный коридор – это хаос. Ты должен нестись вперед, отвечая на вопросы на скорости, пока система не перегрузится. 20 секунд на все!`,
        type: 'speed_quiz',
        time: 20,
        question: 'Скорость: Какое животное было приручено первым?',
        answers: {
            a: { text: 'Кошка', next: 'chaos_fail_long' },
            b: { text: 'Собака', next: 'path_chaos_2' },
            c: { text: 'Лошадь', next: 'chaos_fail_long' }
        }
    },
    chaos_fail_long: {
        text: `Слишком медленно! Зомби-охранник настигает тебя, но ты вырываешься. -1 Жизнь и -15 минут. Это была ловушка.`,
        effect: { lives: -1, time: -900 },
        choices: [
            { text: "➡️ Искать безопасный выход", next: "moral_dilemma_1" }
        ]
    },
    path_chaos_2: {
        text: `Секция Хаоса пройдена! Ты избежал ловушки и нашел +1 Жизнь в аптечке. Тебя ждет первая **Моральная Дилемма**.`,
        effect: { lives: 1 },
        choices: [
            { text: "➡️ Столкнуться с Дилеммой", next: "moral_dilemma_1" }
        ]
    },

    // --- ВЕТКА 3: СЛУЧАЙНОСТЬ (ШЕПОТ СУДЬБЫ) ---
    path_random_1: {
        text: `Желтый свет ведет в комнату, полную мигающих экранов. Зомби-Шаман сидит посреди комнаты. Он предлагает сыграть в "Шепот Судьбы" — три вопроса о случайных фактах.`,
        type: 'believe',
        question: 'Шепот (1/3): Факт: Во Вселенной больше деревьев, чем звезд в нашей галактике. True or False?',
        correctAnswer: true, 
        failNext: 'random_fail_short',
        successNext: 'path_random_2'
    },
    random_fail_short: {
        text: `Шаман кричит "НЕВЕРНО!" и вызывает небольшой взрыв. -1 Жизнь, но ты успеваешь сбежать.`,
        effect: { lives: -1 },
        choices: [
            { text: "➡️ Вернуться к Логике", next: "path_logic_1" }
        ]
    },
    path_random_2: {
        text: 'Шепот (2/3): Зомби-Факт: Чтобы пережить зомби-апокалипсис, нужно всегда носить с собой резинового утенка. True or False?',
        type: 'believe',
        question: 'Шепот (2/3): Зомби-Факт: Чтобы пережить зомби-апокалипсис, нужно всегда носить с собой резинового утенка. True or False?',
        correctAnswer: false, 
        failNext: 'random_fail_long',
        successNext: 'path_random_3'
    },
    random_fail_long: {
        text: `Ты запутался в шепоте Шамана. -15 минут времени. 'YOU ARE LOST IN THOUGHTS'.`,
        effect: { time: -900 },
        choices: [
            { text: "➡️ Покинуть комнату", next: "mid_junction_hub" }
        ]
    },
    path_random_3: {
        text: 'Шепот (3/3): Факт: Сыр содержит вещество, которое вызывает привыкание, подобное легкому наркотическому. True or False?',
        type: 'believe',
        question: 'Шепот (3/3): Факт: Сыр содержит вещество, которое вызывает привыкание, подобное легкому наркотическому. True or False?',
        correctAnswer: true, 
        failNext: 'random_fail_long',
        successNext: 'path_random_success'
    },
    path_random_success: {
        text: `Шаман довольно кивает. 'YOUR FATE IS CLEAR'. Ты нашел "+2 Бонуса" в виде счастливых амулетов.`,
        effect: { bonuses: 2 },
        choices: [
            { text: "➡️ Идти к центральному узлу", next: "mid_junction_hub" }
        ]
    },

    // --- ДОПОЛНИТЕЛЬНЫЕ, ЗАПУТЫВАЮЩИЕ ВЕТКИ ---
    path_archive_challenge: {
        text: `Архив завален. Нужно найти старый "Зомби-Манифест", чтобы открыть дверь. На странице нарисована иероглифическая загадка.`,
        type: 'logic_puzzle',
        question: 'Логика (Шутка): Что падает, но никогда не ломается?',
        correctAnswer: 'дождь',
        failNext: 'logic_fail_short', 
        successNext: 'path_joke_question' 
    },
    path_shaft_risk: {
        text: `Ты спускаешься в шахту. В темноте слышишь рычание. У тебя 10 секунд, чтобы найти правильный путь.`,
        type: 'speed_quiz',
        time: 10,
        question: 'Скорость: Какое устройство изобрел Никола Тесла?',
        answers: {
            a: { text: 'Радио', next: 'path_joke_question' }, 
            b: { text: 'Лампочку', next: 'chaos_fail_long' },
            c: { text: 'Телефон', next: 'chaos_fail_long' }
        }
    },
    
    // --- ПРИКОЛЬНАЯ ШТУКА: ВОПРОС БЕЗ СМЫСЛА ---
    path_joke_question: {
        text: `Ты вышел на небольшой балкон. Перед тобой стоит Зомби-Философ, он глубокомысленно смотрит в пустоту. Он задает вопрос, на который не существует правильного ответа. 'ТВОЯ СУДЬБА ЗАВИСИТ ОТ ЮМОРА'.`,
        type: 'decision_scenario',
        question: 'Философия: Почему апельсины называются апельсинами, если они оранжевые, а бананы не называются банананами, если они желтые?',
        choices: [
            { text: "🍊 Потому что оранжевые назвали себя первыми", effect: { bonuses: 1, time: 300 }, next: 'mid_junction_hub' },
            { text: "🍌 Потому что бананы просто устали от всего", effect: { time: 600 }, next: 'mid_junction_hub' },
            { text: "🤖 Ответ: 42 (В духе Дугласа Адамса)", effect: { lives: 1 }, next: 'mid_junction_hub' }
        ]
    },


    // --- ПЕРВАЯ МОРАЛЬНАЯ ДИЛЕММА ---
    moral_dilemma_1: {
        text: `**⚖️ ДИЛЕММА 1: ЦЕНА ЗНАНИЙ**
        Перед тобой Зомби-Ученый. Он не агрессивен, но прикован к панели. Он умоляет тебя отдать ему один из твоих **Бонусов** (предметы), чтобы он мог закончить свой антидот. Если ты отдашь, он откроет тебе **короткий путь** (+15 минут). Если нет, он будет кричать, привлекая других.`,
        type: 'decision_scenario',
        choices: [
            { 
                text: "🤝 Отдать Бонус (Помочь: +15 минут, -1 Бонус, +3 Мораль)", 
                requiredBonus: 1, 
                effect: { bonuses: -1, time: 900, moral: 3 }, 
                next: 'mid_junction_hub' 
            },
            { 
                text: "🏃‍♀️ Отказать и бежать (Эгоизм: -5 минут, -2 Мораль)", 
                effect: { time: -300, moral: -2 }, 
                next: 'mid_junction_hub' 
            }
        ]
    },

    // --- ЦЕНТРАЛЬНЫЙ УЗЕЛ ---
    mid_junction_hub: {
        text: `Ты в Центральном Узле. Здесь четыре двери: A, B, C, D. На них висят таблички. Ты должен выбрать правильный путь, который ведет к главному передатчику.`,
        type: 'logic_puzzle',
        question: 'Логика: На двери А написано: "Дверь В - правда". На двери В: "Я – путь". На двери С: "Дверь А - ложь". На двери D: "Дверь С - ложь". Только одна дверь ведет к цели. Какая? (Ответ: Дверь А)',
        correctAnswer: 'Дверь А', 
        failNext: 'hub_fail_long',
        successNext: 'path_trap_room'
    },
    hub_fail_long: {
        text: `Ты выбрал неверный путь. Это был тупик, полный ловушек. -1 Жизнь и -20 минут. Твоя концентрация сильно упала.`,
        effect: { lives: -1, time: -1200 },
        choices: [
            { text: "➡️ Идти к финальному этапу", next: "path_trap_room" }
        ]
    },

    // --- ЛОВУШКА ИЛИ БОНУС ---
    path_trap_room: {
        text: `Ты попадаешь в комнату с двумя сундуками: золотым и серебряным. Зомби-Страж говорит: "В одном из них - +3 Бонуса, в другом - -1 Жизнь. На серебряном написано: 'Золотой сундук лжет'. На золотом: 'В серебряном сундуке бонус'. Оба сундука врут, или оба говорят правду. Выбери!`,
        type: 'decision_scenario',
        choices: [
            // Решение: Если оба врут/оба говорят правду: 
            // - Золотой: "Серебряный сундук лжет" (ложь) -> Если оба врут, то это неверно. Значит, оба говорят правду.
            // - Серебряный: "Золотой сундук лжет" (правда) -> Если оба говорят правду, то это верное утверждение.
            // Вывод: Оба сундука говорят правду. Золотой: В серебряном сундуке бонус (Правда, если выбираем Серебряный).
            { text: "🪙 Золотой сундук (-1 Жизнь)", effect: { lives: -1 }, next: 'moral_dilemma_2' }, 
            { text: "🥈 Серебряный сундук (+3 Бонуса)", effect: { bonuses: 3 }, next: 'moral_dilemma_2' }
        ]
    },

    // --- ВТОРАЯ МОРАЛЬНАЯ ДИЛЕММА ---
    moral_dilemma_2: {
        text: `**⚖️ ДИЛЕММА 2: ОСТАТЬСЯ ИЛИ УЙТИ**
        Ты видишь, как твой бывший коллега, который был добр к тебе, превращается в зомби. Он не нападает, но смотрит на тебя с мольбой, его мозг еще работает. Если ты потратишь **10 минут**, ты сможешь его "упокоить", избавив от мучений. Если уйдешь, ты сэкономишь время.`,
        type: 'decision_scenario',
        choices: [
            { 
                text: "😔 Остаться и помочь (Сострадание: -10 минут, +5 Мораль)", 
                effect: { time: -600, moral: 5 }, 
                next: 'final_stage' 
            },
            { 
                text: "💨 Бежать и игнорировать (Прагматизм: +10 минут, -5 Мораль)", 
                effect: { time: 600, moral: -5 }, 
                next: 'final_stage' 
            }
        ]
    },

    // --- ФИНАЛЬНЫЙ ЭТАП ---
    final_stage: {
        text: `Ты на крыше. Передатчик работает. Тебе нужно ввести последний код. Учитывая, что на кону судьба человечества, последняя проверка не должна зависеть от твоей удачи или бонусов, а от **Морального Рейтинга**.`,
        type: 'final_check_moral',
        choices: [
            { text: "🟢 Отправить сигнал", next: "game_win" }
        ]
    },
    

    // --- КОНЦЕВКИ ---
    game_win: {
        text: `СИГНАЛ ОТПРАВЛЕН! Ты выжил в Неоновом Апокалипсисе! Твое время: `,
        type: 'final_win'
    },
    game_over: {
        text: `Жизни исчерпаны, или время вышло. Твое тело пополнило армию зомби. КОНЕЦ ИГРЫ.`,
        type: 'final_lose'
    },
    game_ending_bad: {
        text: `СИГНАЛ ОТПРАВЛЕН... Но из-за низкого Морального Рейтинга (меньше 5), ты вызвал не спасателей, а АРМИЮ ЗОМБИ. Твоя плохая карма сработала против тебя. КОНЕЦ ИГРЫ.`,
        type: 'final_lose'
    }
};

// --- 3. Функции Игры (С обновленными метриками) ---

function updateStats() {
    if (document.getElementById('lives-label')) {
        document.getElementById('lives-label').textContent = gameState.labels.livesTitle;
        document.getElementById('bonuses-label').textContent = gameState.labels.bonusesTitle;
        document.getElementById('timer-label').textContent = gameState.labels.timerTitle;
        document.getElementById('moral-label').textContent = gameState.labels.moralTitle; 
    }

    DOMElements.lives.textContent = gameState.lives;
    DOMElements.bonuses.textContent = gameState.bonuses;
    DOMElements.moralScore.textContent = gameState.moralScore; 
    DOMElements.restartButton.textContent = gameState.labels.restartButton; 
    
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
    if (gameState.questionTimerInterval) {
        clearInterval(gameState.questionTimerInterval);
        gameState.questionTimerInterval = null;
    }
    
    const step = QUEST_STEPS[stepKey];
    if (!step) {
        console.error("Шаг не найден:", stepKey);
        return;
    }

    if (gameState.lives <= 0) {
        endGame('game_over');
        return;
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
    
    if (step.type === 'speed_quiz' || step.type === 'theory_quiz') {
        renderTimedQuestion(step);
    } else if (step.type === 'logic_puzzle') {
        renderLogicPuzzle(step);
    } else if (step.type === 'believe') {
        renderBelieveUnbelieve(step);
    } else if (step.type === 'final_check_moral') { 
        renderFinalCheckMoral();
    } else if (step.choices) {
        step.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            
            // Проверка для Моральной Дилеммы 1 (Бонус)
            if (choice.requiredBonus && gameState.bonuses < choice.requiredBonus) {
                if (choice.text.includes('Отдать Бонус')) {
                     button.disabled = true;
                     button.textContent = "❌ У тебя нет бонуса! (Автоматически бежишь)";
                     button.onclick = () => {
                        const refusalChoice = step.choices.find(c => c.text.includes('Отказать и бежать'));
                        if (refusalChoice.effect) {
                            if (refusalChoice.effect.moral) { gameState.moralScore += refusalChoice.effect.moral; }
                            if (refusalChoice.effect.time) { gameState.currentTime += refusalChoice.effect.time; }
                            updateStats();
                        }
                        goToStep(refusalChoice.next);
                     };
                }
            } else {
                 button.addEventListener('click', () => {
                    if (choice.effect) {
                        if (choice.effect.lives) { gameState.lives += choice.effect.lives; }
                        if (choice.effect.bonuses) { gameState.bonuses += choice.effect.bonuses; }
                        if (choice.effect.time) { gameState.currentTime += choice.effect.time; }
                        if (choice.effect.moral) { gameState.moralScore += choice.effect.moral; }
                        
                        updateStats();
                    }
                    goToStep(choice.next);
                });
            }
            DOMElements.choicesContainer.appendChild(button);
        });
    }
}

/**
 * Рендеринг финальной проверки на Моральный Рейтинг.
 */
function renderFinalCheckMoral() {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    
    const requiredMoral = 5; 
    
    gameContainer.innerHTML = `
        <h3>⚖️ FINAL VERDICT | פסק דין סופי</h3>
        <p>Для активации спасательного сигнала требуется, чтобы твои намерения были чисты. Твой текущий Моральный Рейтинг: **${gameState.moralScore}**. </p>
        <p>Минимальный требуемый рейтинг для *успешной* активации: **${requiredMoral}**.</p>
        <button id="submit-final" class="quest-button">Activate Signal / הפעל אות</button>
        <p id="feedback-final"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    document.getElementById('submit-final').onclick = () => {
        const feedback = document.getElementById('feedback-final');
        document.getElementById('submit-final').disabled = true;

        if (gameState.moralScore >= requiredMoral) {
            feedback.className = 'correct';
            feedback.textContent = `CODE ACCEPTED! МОРАЛЬНЫЙ РЕЙТИНГ (${gameState.moralScore}) ВЫСОК. СПАСАТЕЛЬНАЯ МИССИЯ АКТИВИРОВАНА.`;
            setTimeout(() => goToStep('game_win'), 2000);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = `WARNING! МОРАЛЬНЫЙ РЕЙТИНГ (${gameState.moralScore}) НИЗОК. СИГНАЛ ПЕРЕХВАЧЕН...`;
            setTimeout(() => goToStep('game_ending_bad'), 2000);
        }
    };
}


/**
 * Отображает и обрабатывает вопросы с ограничением по времени (Скорость/Теория).
 */
function renderTimedQuestion(step) {
    const timeLimit = step.time || 20; 
    let timeLeft = timeLimit;

    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>${step.type === 'speed_quiz' ? '🚀 SPEED TEST' : '🎓 THEORY QUIZ'}</h3>
        <p class="timer-display" style="color: var(--neon-red); font-size: 1.5em;">Time Left: <span id="q-timer">${timeLeft}</span> sec.</p>
        <p>${step.question}</p>
        <p id="feedback-text"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    const feedback = document.getElementById('feedback-text');
    const timerDisplay = document.getElementById('q-timer');
    
    const complete = (nextStepKey) => {
        clearInterval(gameState.questionTimerInterval);
        setTimeout(() => goToStep(nextStepKey), 1500);
    };

    gameState.questionTimerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.failTime + ' YOUR CHANCE IS GONE.';
            const failKey = Object.values(step.answers).find(a => a.next.includes('_fail') || a.next.includes('fail')).next;
            complete(failKey); 
        }
    }, 1000);

    for (const key in step.answers) {
        const answer = step.answers[key];
        const button = document.createElement('button');
        button.className = 'quest-button';
        button.textContent = answer.text;
        
        button.onclick = () => {
            document.querySelectorAll('.quest-button').forEach(btn => btn.disabled = true);
            
            if (answer.next.includes('_fail') || answer.next.includes('fail')) {
                feedback.className = 'incorrect';
                feedback.textContent = gameState.labels.incorrect + ' ZOMBIE HORDE IS CLOSING IN!';
                complete(answer.next);
            } else {
                feedback.className = 'correct';
                feedback.textContent = gameState.labels.correct + ' IMPRESSIVE!';
                gameState.bonuses++; 
                updateStats();
                complete(answer.next);
            }
        };
        gameContainer.appendChild(button);
    }
}

/**
 * Отображает и обрабатывает логические задачи (с вводом текста).
 */
function renderLogicPuzzle(step) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>🧠 LOGIC PUZZLE | חידה הגיונית</h3>
        <p>${step.question}</p>
        <input type="text" id="logic-answer" placeholder="Your Answer / תשובתך" class="quest-input">
        <button id="submit-logic" class="quest-button">Check Logic / בדוק</button>
        <p id="feedback-logic"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    document.getElementById('submit-logic').onclick = () => {
        const answer = document.getElementById('logic-answer').value.trim().toLowerCase();
        const feedback = document.getElementById('feedback-logic');
        const correctNorm = step.correctAnswer.toLowerCase();
        
        const isCorrect = correctNorm.split(' ').some(word => answer.includes(word.substring(0, 3))) || answer.includes(correctNorm); 
        
        if (isCorrect) {
            feedback.className = 'correct';
            feedback.textContent = gameState.labels.correct + ' LOGIC PASSED. THE PATH IS CLEAR.';
            gameState.bonuses++; 
            updateStats();
            setTimeout(() => goToStep(step.successNext), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect + ' FAILED! YOU ARE STUCK.';
            setTimeout(() => goToStep(step.failNext), 1500); 
        }
    };
}


/**
 * Отображает и обрабатывает вопросы Верю/Не Верю.
 */
function renderBelieveUnbelieve(step) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `<h3>❓ TRUE OR FALSE | אמת או שקר</h3>`;
    
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
            feedback.textContent = gameState.labels.correct + ' INTUITION SAVED YOU.';
            gameState.bonuses++; 
            updateStats();
            setTimeout(() => goToStep(step.successNext), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect + ' FALSE KNOWLEDGE!';
            setTimeout(() => goToStep(step.failNext), 1500);
        }
    };
    
    const buttonTrue = document.createElement('button');
    buttonTrue.className = 'quest-button';
    buttonTrue.textContent = 'ВЕРЮ (TRUE)';
    buttonTrue.onclick = () => checkAnswer(true);
    
    const buttonFalse = document.createElement('button');
    buttonFalse.className = 'quest-button';
    buttonFalse.textContent = 'НЕ ВЕРЮ (FALSE)';
    buttonFalse.onclick = () => checkAnswer(false);
    
    gameContainer.appendChild(buttonTrue);
    gameContainer.appendChild(buttonFalse);
}


function endGame(outcome) {
    clearInterval(gameState.timerInterval);
    DOMElements.overlay.classList.remove('hidden');

    if (outcome === 'game_win') {
        const timeSpent = gameState.timeLimit - gameState.currentTime;
        const finalTime = formatTime(timeSpent);
        DOMElements.overlayTitle.textContent = "🏆 VICTORY! SIGNAL SENT | ניצחון 🏆";
        DOMElements.overlayText.innerHTML = `You survived in <span class="correct">${finalTime}</span>.<br>Bonuses collected: ${gameState.bonuses}. Final Moral Score: ${gameState.moralScore}.`;
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    } else if (outcome === 'game_ending_bad') {
        DOMElements.overlayTitle.textContent = "❌ MORAL FAILURE | כשלון מוסרי ❌";
        DOMElements.overlayText.innerHTML = QUEST_STEPS.game_ending_bad.text + `<br>Final Moral Score: ${gameState.moralScore}.`;
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    } 
    else {
        DOMElements.overlayTitle.textContent = "☠️ GAME OVER | הסוף ☠️";
        DOMElements.overlayText.innerHTML = "You ran out of time or became one of them. Try again.";
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    }
}

function initGame() {
    gameState.lives = 3;
    gameState.bonuses = 0;
    gameState.moralScore = 10;
    gameState.currentTime = gameState.timeLimit;
    
    DOMElements.overlay.classList.add('hidden');
    
    updateStats();
    if(gameState.timerInterval) clearInterval(gameState.timerInterval); 
    startTimer();
    goToStep('start');

    DOMElements.restartButton.onclick = initGame;
}

document.addEventListener('DOMContentLoaded', initGame);
