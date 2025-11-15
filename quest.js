// quest.js
// 🧟 Логика Неонового Апокалипсиса 🧟

// --- 1. Состояние Игры и Элементы DOM ---
let gameState = {
    lives: 3,
    bonuses: 0,
    timeLimit: 120 * 60, // 2 часа в секундах
    currentTime: 120 * 60,
    timerInterval: null
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

// --- 2. Структура Квеста (Сценарии и Задания) ---

const QUEST_STEPS = {
    // Начальный шаг
    start: {
        text: `Ты очнулся в сердце Шеола. Неоновые огни мерцают, но вокруг только тень и рычание. Вирус "Зомби-X" захватил мир. У тебя есть 2 часа, чтобы добраться до единственного работающего передатчика на крыше и послать сигнал о помощи. Каждый неверный шаг может стоить жизни. Перед тобой две двери, над которыми мерцают неоновые знаки.`,
        choices: [
            { text: "➡️ Заброшенная Лаборатория (Влево)", next: "step_1_room_A" },
            { text: "➡️ Служебный Коридор (Прямо)", next: "step_1_room_B" }
        ]
    },

    // --- Шаг 1: Выбор Пути ---
    step_1_room_A: {
        text: `Лаборатория. Повсюду разбитое стекло и пробирки. Ты слышишь тихое шипение. На столе лежит забытая записка, написанная на иврите. Ты должен ее перевести, чтобы понять, безопасно ли здесь.`,
        type: 'minigame',
        game: 'translate_hebrew',
        failNext: 'step_1_fail',
        successNext: 'step_2_puzzle'
    },
    step_1_room_B: {
        text: `Коридор. Пахнет озоном и кровью. На полу ты видишь растяжку. Чтобы обезвредить ее, нужно решить логическую задачу.`,
        type: 'minigame',
        game: 'logic_puzzle',
        failNext: 'step_1_fail',
        successNext: 'step_2_fact'
    },
    step_1_fail: {
        text: `**КРАХ!** Растяжка сработала / Записка предназначалась для зомби. Ты потерял 1 жизнь и вынужден бежать назад.`,
        effect: { lives: -1 },
        choices: [
            { text: "◀️ Вернуться на старт", next: "start" }
        ]
    },

    // --- Шаг 2: Задания ---
    step_2_puzzle: {
        text: `Ты получил +1 Бонус и прошел в комнату с серверами. Здесь установлен старый "Сапер", который нужно решить, чтобы открыть люк на следующий этаж.`,
        type: 'minigame',
        game: 'minesweeper_stub', // Заглушка для "Сапера"
        failNext: 'game_over',
        successNext: 'step_3_final'
    },
    step_2_fact: {
        text: `Ты обезвредил ловушку и нашел аптечку (+1 Жизнь!). Ты продвигаешься к лестнице, но тут на дисплее появляется сообщение: «Необычный факт». Правда ли это?`,
        effect: { lives: 1 },
        type: 'minigame',
        game: 'believe_unbelieve',
        failNext: 'step_1_fail', // Неверный ответ отбрасывает назад
        successNext: 'step_3_final'
    },

    // --- Финал ---
    step_3_final: {
        text: `Ты на крыше! Передатчик перед тобой. Введи последний код... (Нажмите "ПОБЕДА", чтобы завершить квест)`,
        choices: [
            { text: "🟢 ПОБЕДА (Отправить сигнал)", next: "game_win" }
        ]
    },

    // --- Конец Игры ---
    game_win: {
        text: `СИГНАЛ ОТПРАВЛЕН! Ты выжил в Неоновом Апокалипсисе! Твое время: `, // Время будет добавлено
        type: 'final_win'
    },
    game_over: {
        text: `Жизни исчерпаны, или время вышло. Твое тело пополнило армию зомби. КОНЕЦ ИГРЫ.`,
        type: 'final_lose'
    }
};

// --- 3. Функции Игры ---

/**
 * Обновляет отображение статистики (жизни, бонусы, таймер).
 */
function updateStats() {
    DOMElements.lives.textContent = gameState.lives;
    DOMElements.bonuses.textContent = gameState.bonuses;
    if (gameState.lives <= 0) {
        endGame('game_over');
    }
}

/**
 * Запускает таймер обратного отсчета.
 */
function startTimer() {
    gameState.currentTime = gameState.timeLimit;
    gameState.timerInterval = setInterval(() => {
        gameState.currentTime--;

        // Форматирование времени (ЧЧ:ММ:СС)
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

/**
 * Переходит к новому шагу квеста.
 * @param {string} stepKey - Ключ шага в QUEST_STEPS.
 */
function goToStep(stepKey) {
    const step = QUEST_STEPS[stepKey];
    if (!step) {
        console.error("Шаг не найден:", stepKey);
        return;
    }

    // Применение эффектов (например, потеря/получение жизни)
    if (step.effect) {
        if (step.effect.lives) {
            gameState.lives += step.effect.lives;
        }
        updateStats();
    }

    // Если это финальный экран, то завершаем игру
    if (step.type === 'final_win' || step.type === 'final_lose') {
        endGame(stepKey);
        return;
    }

    // Очистка предыдущего контента
    DOMElements.scenarioText.innerHTML = '';
    DOMElements.choicesContainer.innerHTML = '';

    // Отображение текста
    const textNode = document.createElement('p');
    textNode.innerHTML = step.text;
    DOMElements.scenarioText.appendChild(textNode);

    // Обработка Мини-игр
    if (step.type === 'minigame') {
        renderMinigame(step.game, step.successNext, step.failNext);
    } 
    // Обработка Выбора
    else if (step.choices) {
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
 * Отображает и запускает логику для интерактивных мини-игр.
 * @param {string} gameKey - Ключ мини-игры.
 * @param {string} successNext - Шаг при успехе.
 * @param {string} failNext - Шаг при неудаче.
 */
function renderMinigame(gameKey, successNext, failNext) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    
    // Функция для перехода после игры
    const gameComplete = (isSuccess) => {
        // Добавляем небольшой таймаут, чтобы игрок успел увидеть результат
        setTimeout(() => {
            if (isSuccess) {
                goToStep(successNext);
            } else {
                goToStep(failNext);
            }
        }, 1500);
    };

    DOMElements.choicesContainer.appendChild(gameContainer);

    switch (gameKey) {
        // --- ЗАДАНИЕ 1: ПЕРЕВОД НА ИВРИТ (Переведи слово) ---
        case 'translate_hebrew':
            gameContainer.innerHTML = `
                <h3>🧠 Задание: Перевод с Иврита</h3>
                <p>Переведи слово, чтобы найти код доступа. **המפתח** (HAMAFTÉACH) - что это значит?</p>
                <input type="text" id="hebrew-answer" placeholder="Введите ответ на русском" class="quest-input">
                <button id="submit-hebrew" class="quest-button">Проверить</button>
                <p id="feedback-hebrew"></p>
            `;
            document.getElementById('submit-hebrew').onclick = () => {
                const answer = document.getElementById('hebrew-answer').value.trim().toLowerCase();
                const feedback = document.getElementById('feedback-hebrew');
                if (answer === 'ключ') {
                    feedback.className = 'correct';
                    feedback.textContent = '✅ Правильно! Код принят.';
                    gameComplete(true);
                } else {
                    feedback.className = 'incorrect';
                    feedback.textContent = '❌ Неверно! Попробуй еще раз, или провалишься.';
                    // Для примера, можно дать 3 попытки, но пока просто переводим на провал
                    // gameComplete(false); // В боевом варианте можно не переходить сразу
                }
            };
            break;

        // --- ЗАДАНИЕ 2: ЛОГИЧЕСКАЯ ЗАДАЧА (Простейшая) ---
        case 'logic_puzzle':
            gameContainer.innerHTML = `
                <h3>🔢 Задание: Логическая Загадка</h3>
                <p>Я всегда иду, но никогда не прихожу. Что я?</p>
                <button class="quest-button" data-answer="вода">Вода</button>
                <button class="quest-button" data-answer="время">Время</button>
                <button class="quest-button" data-answer="тень">Тень</button>
                <p id="feedback-logic"></p>
            `;
            document.querySelectorAll('.quest-button').forEach(btn => {
                btn.onclick = (e) => {
                    const answer = e.target.dataset.answer;
                    const feedback = document.getElementById('feedback-logic');
                    if (answer === 'время') {
                        feedback.className = 'correct';
                        feedback.textContent = '✅ Верно! Растяжка обезврежена. Это был ТЕСТ.';
                        gameComplete(true);
                    } else {
                        feedback.className = 'incorrect';
                        feedback.textContent = '❌ Ошибка! Ловушка сейчас сработает...';
                        gameComplete(false);
                    }
                };
            });
            break;
            
        // --- ЗАДАНИЕ 3: ВЕРЮ/НЕ ВЕРЮ (Интересный факт) ---
        case 'believe_unbelieve':
            const fact = {
                text: "Факт: В Древнем Риме, чтобы определить, будет ли человек говорить правду, его заставляли положить руку на голову мертвого зомби. Если рука замерзала, он лгал.",
                isTrue: false // Это выдумка для квеста
            };
            gameContainer.innerHTML = `
                <h3>❓ Задание: Верю / Не Верю</h3>
                <p>${fact.text}</p>
                <button class="quest-button" data-answer="true">ВЕРЮ</button>
                <button class="quest-button" data-answer="false">НЕ ВЕРЮ</button>
                <p id="feedback-fact"></p>
            `;
            document.querySelectorAll('.quest-button').forEach(btn => {
                btn.onclick = (e) => {
                    const isBeliefTrue = (e.target.dataset.answer === 'true');
                    const feedback = document.getElementById('feedback-fact');
                    
                    if (isBeliefTrue !== fact.isTrue) { // Игрок угадал, что это неправда
                        feedback.className = 'correct';
                        feedback.textContent = '✅ Ты не поддался панике. Факт - это ложь. Продвигайся!';
                        gameState.bonuses++; // Бонус за проницательность
                        updateStats();
                        gameComplete(true);
                    } else {
                        feedback.className = 'incorrect';
                        feedback.textContent = '❌ Доверчивость в Апокалипсисе губительна. Зомби был рядом!';
                        gameComplete(false);
                    }
                };
            });
            break;

        // --- ЗАГЛУШКА: САПЕР ---
        case 'minesweeper_stub':
            gameContainer.innerHTML = `
                <h3>💣 Задание: Сапер (Заглушка)</h3>
                <p>Настоящий "Сапер" требует сложной реализации. Для быстрого теста, нажми кнопку ниже. Учти, в реальной игре это будет стоить жизни!</p>
                <button class="quest-button" data-result="win">Пропустить и Открыть Люк (Успех)</button>
                <button class="quest-button" data-result="lose" style="border-color: var(--neon-red);">Нажать на Мину (Провал)</button>
            `;
            document.querySelectorAll('.quest-button').forEach(btn => {
                btn.onclick = (e) => {
                    if (e.target.dataset.result === 'win') {
                        gameComplete(true);
                    } else {
                        gameComplete(false);
                    }
                };
            });
            break;
            
        default:
            gameContainer.innerHTML = `<p class="incorrect">ОШИБКА: Игра "${gameKey}" не найдена.</p>`;
    }
}

/**
 * Завершает игру и отображает оверлей.
 * @param {string} outcome - 'game_win' или 'game_over'.
 */
function endGame(outcome) {
    clearInterval(gameState.timerInterval);
    DOMElements.overlay.classList.remove('hidden');

    if (outcome === 'game_win') {
        const timeSpent = gameState.timeLimit - gameState.currentTime;
        const finalTime = formatTime(timeSpent);
        DOMElements.overlayTitle.textContent = "🏆 ПОБЕДА! СИГНАЛ ОТПРАВЛЕН 🏆";
        DOMElements.overlayText.innerHTML = `Ты спас мир за <span class="correct">${finalTime}</span>.<br>Найдено бонусов: ${gameState.bonuses}.`;
        DOMElements.restartButton.textContent = "Начать Новую Игру";
    } else {
        DOMElements.overlayTitle.textContent = "☠️ КОНЕЦ ИГРЫ ☠️";
        DOMElements.overlayText.innerHTML = "Ты не успел или стал одним из них. Попробуй еще раз.";
        DOMElements.restartButton.textContent = "Повторить Попытку";
    }
}

/**
 * Вспомогательная функция для форматирования времени (секунды -> ЧЧ:ММ:СС).
 */
function formatTime(totalSeconds) {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


/**
 * Инициализация игры
 */
function initGame() {
    gameState.lives = 3;
    gameState.bonuses = 0;
    gameState.currentTime = gameState.timeLimit;
    
    // Сброс оверлея
    DOMElements.overlay.classList.add('hidden');
    
    updateStats();
    startTimer();
    goToStep('start');

    DOMElements.restartButton.onclick = initGame;
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);
