// quest.js
// 🧟 Обновленная Логика: Бродилка, Логика и Викторина 🧟

// --- 1. Состояние Игры и Элементы DOM (Остаются прежними) ---
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

// --- 2. Структура Квеста (Сценарии, Вопросы и Разветвления) ---

const QUEST_STEPS = {
    // --- НАЧАЛО ---
    start: {
        text: `Ты очнулся в сердце Шеола. Неоновые огни мерцают, но вокруг только тень и рычание. У тебя 2 часа, чтобы добраться до передатчика. Перед тобой две двери. Над одной висит табличка: **"Для тех, кто предпочитает скорость"**, над другой: **"Для тех, кто ценит безопасность"**.`,
        choices: [
            { text: "➡️ Дверь «Скорость»", next: "path_speed_1" },
            { text: "➡️ Дверь «Безопасность»", next: "path_safe_1" }
        ]
    },

    // --- ВЕТКА "СКОРОСТЬ" ---
    path_speed_1: {
        text: `Ты попадаешь в длинный, слабо освещенный коридор. Внезапно перед тобой выскакивает **Зомби-Курьер** в неоновой форме с рюкзаком Glovo. Он не нападает, а просто тычет в тебя планшетом. Чтобы пройти, ты должен правильно ответить на его "вопрос доставки".`,
        type: 'quiz',
        question: 'Викторина: Как зовут первого живого человека, который был на орбите Земли?',
        answers: {
            a: { text: 'Нил Армстронг', next: 'path_speed_1_fail' },
            b: { text: 'Юрий Гагарин', next: 'path_speed_2' },
            c: { text: 'Лайка', next: 'path_speed_1_fail' }
        }
    },
    path_speed_1_fail: {
        text: `Зомби-Курьер издает недовольное рычание, а затем втыкает тебе в руку рекламный флаер, который оказался очень острым. **-1 Жизнь!** Ты теряешь драгоценное время, пока отбиваешься от медленного, но назойливого зомби.`,
        effect: { lives: -1 },
        choices: [
            { text: "➡️ Продолжить путь, осторожнее!", next: "path_speed_2_long" }
        ]
    },
    path_speed_2: {
        text: `Курьер удовлетворенно хмыкает и уходит, оставив на полу **Пачку энергетиков (+1 Бонус!)**. Ты быстро поднимаешься на следующий этаж.`,
        effect: { bonuses: 1 },
        choices: [
            { text: "➡️ Двигаться к цели", next: "path_speed_3" }
        ]
    },
    path_speed_2_long: {
        text: `Ты прошел через длинные офисные кубиклы, кишащие "офисными" зомби, которые пытались продать тебе страховку. Ты измотан. Перед тобой запертая дверь с кодовым замком. Нужно решить логическую загадку.`,
        type: 'logic',
        question: 'Логика: Перед тобой три кнопки. Одна ведет к выходу, две – к зомби-боссу. Охранник говорит: "Я всегда лгу". Какую кнопку ты выберешь?',
        answers: {
            a: { text: 'Поверю ему и выберу первую кнопку', next: 'path_speed_2_long_fail' },
            b: { text: 'Не поверю и выберу третью кнопку', next: 'path_speed_3' },
            c: { text: 'Спрошу, какая кнопка ведет к его другу', next: 'path_speed_2_long_fail' }
        }
    },
    path_speed_2_long_fail: {
        text: `Ты слышишь зловещий смех. Дверь открывается, и оттуда вываливается целая толпа зомби-программистов с горящими глазами (от дедлайнов). **-1 Жизнь!** Ты еле уносишь ноги через окно.`,
        effect: { lives: -1 },
        choices: [
            { text: "➡️ Искать другой путь (Обход)", next: "final_stage_alt" }
        ]
    },
    path_speed_3: {
        text: `Ты нашел неповрежденный лифт. На нем надпись: «На крышу идет только тот, кто знает истину».`,
        type: 'believe',
        question: 'Верю/Не верю: Средневековые врачи считали, что зомби можно излечить, если дать им понюхать букет свежего базилика. Правда или нет?',
        correctAnswer: false, // Неправда
        failNext: 'final_stage_fail',
        successNext: 'final_stage_main'
    },

    // --- ВЕТКА "БЕЗОПАСНОСТЬ" ---
    path_safe_1: {
        text: `Ты попадаешь в технический туннель. Он чист, но очень запутан. На стене висит карта, но ее нужно расшифровать, ответив на вопрос.`,
        type: 'quiz',
        question: 'Викторина: Иврит. Какое из этих слов означает "Жизнь"?',
        answers: {
            a: { text: 'שמש (Шемеш)', next: 'path_safe_1_fail' },
            b: { text: 'מים (Маим)', next: 'path_safe_1_fail' },
            c: { text: 'חיים (Хаим)', next: 'path_safe_2' }
        }
    },
    path_safe_1_fail: {
        text: `Карта рвется на куски, и ты слышишь за спиной шаги. Это Зомби-Надзиратель! Ты отвлекся, и он нанес удар. **-1 Жизнь!** Ты вынужден бежать, ориентируясь по памяти.`,
        effect: { lives: -1 },
        choices: [
            { text: "➡️ Продолжить наугад, проклиная иврит", next: "path_safe_2_long" }
        ]
    },
    path_safe_2: {
        text: `Карта светится неоновым светом, указывая короткий путь! Ты также находишь забытую аптечку **(+1 Жизнь!)**.`,
        effect: { lives: 1 },
        choices: [
            { text: "➡️ Через вентиляцию", next: "path_safe_3" }
        ]
    },
    path_safe_2_long: {
        text: `Ты ползешь по грязному туннелю. В конце туннеля – загадка, написанная красной краской: «Три зомби-босса – Майк, Айк и Тайк. Один из них всегда лжет, двое говорят правду. Как за один вопрос узнать того, кто лжет?»`,
        type: 'logic',
        question: 'Логика: Ты должен спросить у одного из них: "Если бы я спросил другого, кто из вас лжец, что бы он ответил?"',
        answers: {
            a: { text: 'Тот, на кого он укажет, и есть Лжец.', next: 'path_safe_2_long_fail' },
            b: { text: 'Тот, кто ответит, и есть Лжец.', next: 'path_safe_3' },
            c: { text: 'Тот, кто остался, и есть Лжец.', next: 'path_safe_2_long_fail' }
        }
    },
    path_safe_2_long_fail: {
        text: `Ошибка! Зомби-боссы начинают медленно аплодировать, и внезапно дверь за тобой закрывается. Ты теряешь много времени, пока ищешь запасной выход. **-20 минут** (для эффекта, но жизни сохраним).`,
        effect: { time: -1200 }, // -20 минут
        choices: [
            { text: "➡️ Выбраться через канализацию", next: "final_stage_alt" }
        ]
    },
    path_safe_3: {
        text: `Ты вышел на верхнем этаже, но путь преграждает Зомби-Охранник. Он говорит, что пропустит тебя, если ты ответишь, "Правда ли, что..."`,
        type: 'believe',
        question: 'Верю/Не верю: Самый быстрый вид зомби в истории кино - это Зомби из фильма "Бегущий зомби", который двигался со скоростью света. Правда или нет?',
        correctAnswer: true, // Пусть это будет "правдой" для прикола
        failNext: 'final_stage_fail',
        successNext: 'final_stage_main'
    },

    // --- ФИНАЛЬНЫЕ СЦЕНЫ ---
    final_stage_main: {
        text: `Ты победил охранника (или лифт). Прямой путь на крышу! Ты видишь передатчик. Чтобы его активировать, нужен код из трех цифр, равный твоему количеству **Бонусов** и **Жизней** на данный момент, умноженный на 10.`,
        type: 'final_check', // Специальный тип для проверки
        choices: [
            { text: "🟢 Отправить сигнал", next: "game_win" }
        ]
    },
    final_stage_alt: {
        text: `Обходной путь привел тебя через опасную зону. Ты видишь передатчик, но он завален обломками. Придется потратить время на расчистку.`,
        effect: { time: -900 }, // -15 минут
        choices: [
            { text: "🟢 Отправить сигнал", next: "game_win" }
        ]
    },
    final_stage_fail: {
        text: `Охранник (или лифт) оказался слишком сложным. Ты потратил много времени, и тут взорвалась труба! **-1 Жизнь!**`,
        effect: { lives: -1 },
        choices: [
            { text: "➡️ Быстро бежать к обходному пути", next: "final_stage_alt" }
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

// --- 3. Функции Игры (Модифицированы для новой логики) ---

/**
 * Обновляет отображение статистики и проверяет конец игры.
 */
function updateStats() {
    DOMElements.lives.textContent = gameState.lives;
    DOMElements.bonuses.textContent = gameState.bonuses;
    
    // Проверка на потерю всех жизней
    if (gameState.lives <= 0) {
        endGame('game_over');
    }
}

// Запуск таймера остается без изменений
function startTimer() {
    // ... (код startTimer из предыдущей версии)
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

    // 1. Применение эффектов (жизни, время, бонусы)
    if (step.effect) {
        if (step.effect.lives) {
            gameState.lives += step.effect.lives;
        }
        if (step.effect.bonuses) {
            gameState.bonuses += step.effect.bonuses;
        }
        if (step.effect.time) {
            gameState.currentTime += step.effect.time;
        }
        updateStats();
    }

    // 2. Проверка на финал
    if (step.type === 'final_win' || step.type === 'final_lose') {
        endGame(stepKey);
        return;
    }

    // 3. Очистка и отображение текста сценария
    DOMElements.scenarioText.innerHTML = '';
    DOMElements.choicesContainer.innerHTML = '';

    const textNode = document.createElement('p');
    textNode.innerHTML = step.text;
    DOMElements.scenarioText.appendChild(textNode);
    
    // 4. Обработка типов шагов
    if (step.type === 'quiz' || step.type === 'logic') {
        renderQuestion(step);
    } else if (step.type === 'believe') {
        renderBelieveUnbelieve(step);
    } else if (step.type === 'final_check') {
        // Логика проверки финала
        renderFinalCheck();
    } else if (step.choices) {
        // Бродилка (обычный выбор)
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
 * Отображает и обрабатывает вопросы на Логику и Викторину.
 * @param {object} step - Текущий шаг с вопросом и ответами.
 */
function renderQuestion(step) {
    const questionContainer = document.createElement('div');
    questionContainer.className = 'mini-game-container';
    questionContainer.innerHTML = `<h3>${step.type === 'quiz' ? '💡 Викторина' : '🤔 Логическая Загадка'}</h3>`;
    
    const questionText = document.createElement('p');
    questionText.innerHTML = step.question;
    questionContainer.appendChild(questionText);
    
    const feedback = document.createElement('p');
    feedback.id = 'feedback-text';
    questionContainer.appendChild(feedback);

    DOMElements.choicesContainer.appendChild(questionContainer);

    // Добавляем кнопки ответов
    for (const key in step.answers) {
        const answer = step.answers[key];
        const button = document.createElement('button');
        button.className = 'quest-button';
        button.textContent = answer.text;
        
        button.onclick = () => {
            // Деактивируем все кнопки после ответа
            document.querySelectorAll('.quest-button').forEach(btn => btn.disabled = true);
            
            if (answer.next.includes('_fail')) {
                // Неправильный ответ
                feedback.className = 'incorrect';
                feedback.textContent = '❌ Неверно! Потеря времени...';
            } else {
                // Правильный ответ
                feedback.className = 'correct';
                feedback.textContent = '✅ Правильно! Путь открыт!';
                
            }
            // Переход к следующему шагу
            setTimeout(() => goToStep(answer.next), 1500);
        };
        questionContainer.appendChild(button);
    }
}

/**
 * Отображает и обрабатывает вопросы Верю/Не Верю.
 * @param {object} step - Текущий шаг с фактом.
 */
function renderBelieveUnbelieve(step) {
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
        // Деактивируем кнопки
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
 * Обработка финальной проверки кода.
 */
function renderFinalCheck() {
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
            feedback.textContent = `❌ Код неверный! Ты потерял время, вводя его. ${requiredCode > 0 ? 'Попробуй еще!' : 'Проверь формулу!'}`;
            // Небольшое наказание за неверный код
            gameState.currentTime -= 60; // -1 минута
            updateStats();
        }
    };
}


/**
 * Завершает игру и отображает оверлей. (Остается без изменений)
 */
function endGame(outcome) {
    clearInterval(gameState.timerInterval);
    DOMElements.overlay.classList.remove('hidden');

    // ... (код endGame из предыдущей версии)
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
 * Вспомогательная функция для форматирования времени (Остается без изменений).
 */
function formatTime(totalSeconds) {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


/**
 * Инициализация игры (Остается без изменений).
 */
function initGame() {
    gameState.lives = 3;
    gameState.bonuses = 0;
    gameState.currentTime = gameState.timeLimit;
    
    DOMElements.overlay.classList.add('hidden');
    
    updateStats();
    // Сначала останавливаем, если запущен
    if(gameState.timerInterval) clearInterval(gameState.timerInterval); 
    startTimer();
    goToStep('start');

    DOMElements.restartButton.onclick = initGame;
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', initGame);
