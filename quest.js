// quest.js
// 💀 РЕЙС 245: ПОСЛЕДНЯЯ НАДЕЖДА 💀

// --- 1. Состояние Игры и Элементы DOM ---
let DOMElements = {};

let gameState = {
    lives: 3,
    bonuses: 0,
    moralScore: 10, 
    timeLimit: 120 * 60, // 2 часа
    currentTime: 120 * 60,
    timerInterval: null,
    questionTimerInterval: null, 
    labels: {
        timerTitle: 'TIMER',
        livesTitle: '❤️ LIVES',
        bonusesTitle: '🌟 ЧИПЫ',
        moralTitle: '⚖️ МОРАЛЬ', 
        failTime: '⏱️ Время вышло! Слишком медленно.',
        correct: '✅ Успех! Путь открыт.',
        incorrect: '❌ Ошибка! Ловушка сработала.',
        restartButton: 'ПЕРЕЗАПУСК' 
    }
};

// --- Инициализация элементов DOM ---
function initializeDOMElements() {
    DOMElements = {
        timer: document.getElementById('timer'),
        lives: document.getElementById('lives'),
        bonuses: document.getElementById('bonuses'),
        moralScore: document.getElementById('moral-score'), 
        scenarioText: document.getElementById('scenario-text'),
        choicesContainer: document.getElementById('choices-container'),
        overlay: document.getElementById('overlay'),
        overlayTitle: document.querySelector('#overlay-content h2'),
        overlayText: document.querySelector('#overlay-content p'),
        restartButton: document.getElementById('restart-button')
    };
    if (!DOMElements.timer || !DOMElements.lives) {
        console.error("ОШИБКА: Не удалось найти все необходимые элементы HTML. Проверьте index.html!");
    }
}

// --- 2. СТРУКТУРА КВЕСТА (6 ЛОКАЦИЙ) ---

const QUEST_STEPS = {
    // === СТАРТ ===
    start: {
        text: `Ты приходишь в себя в полуразрушенном ангаре. Имплант активирован, но сигнал слабый. '120 MINUTES TILL DAWN'. Тебе нужно добраться до Бункера "Аврора". Две двери ведут к основной цели.`,
        choices: [
            { text: "➡️ Дверь 1: Заброшенная Лаборатория 'Генезис'", next: "lab_start" },
            { text: "➡️ Дверь 2: Через Центральное Хранилище (Опасный, но быстрый путь)", next: "storage_start" }
        ]
    },

    // =========================================================================
    // ⚙️ ЛОКАЦИЯ 1: ЗАБРОШЕННАЯ ЛАБОРАТОРИЯ "ГЕНЕЗИС" (6 заданий)
    // =========================================================================
    lab_start: {
        text: `Ты в Лаборатории, где началась чума. Повсюду разбитые колбы. Чтобы пройти, нужно активировать 6 защитных панелей.`,
        choices: [{ text: "Начать: Панель 1 (Логика Зомби-Клерка)", next: "lab_task_1" }]
    },
    lab_task_1: {
        text: `Панель 1: Голограмма Зомби-Клерка. Он держит две таблички: 'ВСЕ МОИ СЛОВА - ЛОЖЬ' и 'У МЕНЯ 10 ПАЛЬЦЕВ'. Определи, что говорит Зомби-Лжец.`,
        type: 'logic_puzzle',
        question: 'Введи текст таблички Зомби-Лжеца:',
        correctAnswer: 'У МЕНЯ 10 ПАЛЬЦЕВ', 
        failNext: 'lab_fail_vent_start', 
        successNext: 'lab_task_2' 
    },
    lab_task_2: {
        text: `Панель 2: **ДИЛЕММА**. Ты видишь ящик с чипами (Бонусы) и раненого инженера, который просит помощи. Если поможешь, потеряешь время.`,
        type: 'decision_scenario',
        choices: [
            { text: "🤝 Помочь, потеряв время (Сострадание)", effect: { time: -600, moral: 3 }, next: 'lab_task_3' },
            { text: "💰 Взять чипы и бежать (Прагматизм)", effect: { bonuses: 2, moral: -2 }, next: 'lab_task_3' }
        ]
    },
    lab_task_3: {
        text: `Панель 3: Система требует подтверждения факта о вирусе. 'Факт: Чтобы остановить вирус, нужен антидот, сделанный из зомби-мозга.'`,
        type: 'believe',
        question: 'Это правда или ложь?',
        correctAnswer: false, 
        failNext: 'fail_minor',
        successNext: 'lab_task_4'
    },
    lab_task_4: {
        text: `Панель 4: Внезапная тревога! У тебя 10 секунд, чтобы ввести правильный код на двери.`,
        type: 'speed_quiz',
        time: 10,
        question: 'Какой код соответствует устройству, изобретенному Николой Теслой? (Радио, Телефон, Лампочка)',
        answers: {
            a: { text: 'Код "Радио"', next: 'lab_task_5' }, 
            b: { text: 'Код "Телефон"', next: 'fail_minor' },
            c: { text: 'Код "Лампочка"', next: 'fail_minor' }
        }
    },
    lab_task_5: {
        text: `Панель 5: **РИСК**. На полу лежит рюкзак. Возможно, там аптечка (Жизнь), возможно, бомба (Потеря Жизни).`,
        type: 'decision_scenario',
        choices: [
            { text: "Открыть рюкзак (Высокий риск)", effect: { lives: -1, bonuses: 1 }, next: 'lab_task_6' },
            { text: "Обойти (Безопасность)", effect: { time: -180 }, next: 'lab_task_6' }
        ]
    },
    lab_task_6: {
        text: `Панель 6: Последний логический замок: 'Что всегда растет, но никогда не имеет корней?'`,
        type: 'logic_puzzle',
        question: 'Твой ответ:',
        correctAnswer: 'возраст', 
        failNext: 'fail_minor',
        successNext: 'lab_success_main_path' 
    },
    lab_success_main_path: {
        text: `Лаборатория пройдена! Все панели деактивированы. Ты можешь выбрать, куда идти дальше: в Административный Зал или в Хранилище.`,
        choices: [
            { text: "➡️ Административный Зал (Основной путь, БЛОК 2Б)", next: "hall_start" },
            { text: "➡️ Центральное Хранилище (Пропустить зал, БЛОК 3)", next: "storage_start" }
        ]
    },

    // =========================================================================
    // 🌪️ ЛОКАЦИЯ 2А: ВЕНТИЛЯЦИОННЫЕ ШАХТЫ (ВЕТВЛЕНИЕ)
    // =========================================================================
    lab_fail_vent_start: {
        text: `Из-за ошибки в коде сработала система защиты. Дверь закрылась, и ты вынужден ползти в Вентиляционные Шахты. -1 Жизнь и -1 Мораль за панику.`,
        effect: { lives: -1, moral: -1, time: -300 },
        choices: [{ text: "➡️ Начать движение по Шахтам", next: "vents_task_1" }]
    },
    vents_task_1: {
        text: `Шахты (1/6): Начинается вибрация. Ты должен быстро выбрать, куда прыгать.`,
        type: 'speed_quiz',
        time: 8,
        question: 'Куда прыгнуть?',
        answers: {
            a: { text: 'Влево (Безопасно)', next: 'vents_task_2' }, 
            b: { text: 'Вправо (Рискованно)', next: 'fail_minor' },
            c: { text: 'Вниз (Смертельно)', next: 'fail_major' }
        }
    },
    vents_task_2: {
        text: `Шахты (2/6): Ты видишь раненого Зомби, который держит чип. Он не агрессивен, пока ты не приблизишься.`,
        type: 'decision_scenario',
        choices: [
            { text: "🔪 Убить и забрать чип (Жестокость)", effect: { bonuses: 1, moral: -3 }, next: 'vents_task_3' },
            { text: "🤫 Пройти мимо (Экономия времени)", effect: { time: -60 }, next: 'vents_task_3' }
        ]
    },
    vents_task_3: {
        text: `Шахты (3/6): Ты наткнулся на выход в Хранилище. Выход близко.`,
        choices: [{ text: "➡️ Выйти в Центральное Хранилище (БЛОК 3)", next: "storage_start" }]
    },
    
    // =========================================================================
    // 🏛️ ЛОКАЦИЯ 2Б: АДМИНИСТРАТИВНЫЙ ЗАЛ (ОСНОВНОЙ ПУТЬ)
    // =========================================================================
    hall_start: {
        text: `Ты в Административном Зале. Все компьютеры выключены. Нужно взломать систему, решив 6 задач.`,
        choices: [{ text: "Начать: Консоль 1 (Сбор данных)", next: "hall_task_1" }]
    },
    hall_task_1: {
        text: `Консоль 1: Взлом архива. Тебе нужно найти имя ученого, который первым обнаружил иммунитет (Ответ: Рейс 245).`,
        type: 'logic_puzzle',
        question: 'Кто обнаружил иммунитет?',
        correctAnswer: 'Рейс 245', 
        failNext: 'fail_minor',
        successNext: 'hall_task_2' 
    },
    hall_task_2: {
        text: `Консоль 2: **ДИЛЕММА**. Система предлагает активировать оглушающую сирену, которая вырубит всех зомби, но и убьет всех неинфицированных животных в радиусе 1 км.`,
        type: 'decision_scenario',
        choices: [
            { text: "🔊 Активировать (Прагматизм)", effect: { time: 300, moral: -3 }, next: 'hall_task_3' },
            { text: "🔇 Отказаться (Мораль)", effect: { time: -300, moral: 3 }, next: 'hall_task_3' }
        ]
    },
    hall_task_3: {
        text: `Консоль 3: Логика: На столе три предмета: Аптечка, Оружие, Ключ. Страж говорит: 'Аптечка всегда ложь. Ключ всегда правда.' Какой предмет является ложью?`,
        type: 'logic_puzzle',
        question: 'Какой предмет - ложь?',
        correctAnswer: 'Аптечка', 
        failNext: 'fail_major',
        successNext: 'hall_task_4' 
    },
    hall_task_4: {
        text: `Консоль 4: Ты нашел секретный сейф. Нужно ввести пароль. Пароль — это число, которое не является простым и делится на 7.`,
        type: 'logic_puzzle',
        question: 'Введи пароль (трехзначное число):',
        correctAnswer: '105', // 105 / 7 = 15.
        failNext: 'fail_minor',
        successNext: 'hall_task_5' 
    },
    hall_task_5: {
        text: `Консоль 5: Факт: Вирус Красной Чумы был создан на основе ДНК летучей мыши.`,
        type: 'believe',
        question: 'Это правда или ложь?',
        correctAnswer: true, 
        failNext: 'fail_minor',
        successNext: 'hall_success_storage'
    },
    hall_success_storage: {
        text: `Административный Зал пройден. Ты получил данные и можешь идти в Хранилище.`,
        choices: [{ text: "➡️ В Центральное Хранилище Ресурсов (БЛОК 3)", next: "storage_start" }]
    },


    // =========================================================================
    // 📦 ЛОКАЦИЯ 3: ЦЕНТРАЛЬНОЕ ХРАНИЛИЩЕ РЕСУРСОВ
    // =========================================================================
    storage_start: {
        text: `Центральное Хранилище. Здесь полно контейнеров и ловушек. Тебе нужно пройти 6 зон, чтобы попасть в метро.`,
        choices: [{ text: "Начать: Зона 1 (Логика контейнеров)", next: "storage_task_1" }]
    },
    storage_task_1: {
        text: `Зона 1: Две коробки. На одной 'ЧИПЫ В ЭТОЙ КОРОБКЕ'. На другой: 'ЧИПЫ В КОРОБКЕ №1'. Известно, что только одна надпись верна. Где чипы?`,
        type: 'logic_puzzle',
        question: 'Введи номер коробки с чипами (1 или 2):',
        correctAnswer: '2', 
        failNext: 'fail_minor',
        successNext: 'storage_task_2' 
    },
    storage_task_2: {
        text: `Зона 2: Внезапное падение контейнера! 5 секунд, чтобы избежать его.`,
        type: 'speed_quiz',
        time: 5,
        question: 'Твой выбор?',
        answers: {
            a: { text: 'Присесть', next: 'fail_minor' },
            b: { text: 'Отскочить влево', next: 'storage_task_3' }, 
            c: { text: 'Бежать вперед', next: 'fail_major' }
        }
    },
    storage_task_3: {
        text: `Зона 3: **ДИЛЕММА**. Ты видишь запертого зомби в стеклянной камере. Если ты нажмешь кнопку, он умрет, но ты получишь много чипов (Бонусов).`,
        type: 'decision_scenario',
        choices: [
            { text: "💀 Нажать кнопку (Алчность)", effect: { bonuses: 5, moral: -4 }, next: 'storage_task_4' },
            { text: "🚶‍♂️ Пройти мимо (Мораль)", effect: { moral: 2 }, next: 'storage_task_4' }
        ]
    },
    storage_task_4: {
        text: `Зона 4: Загадка: 'Я могу быть легким, но долго меня никто не сможет держать. Что я?'`,
        type: 'logic_puzzle',
        question: 'Твой ответ:',
        correctAnswer: 'дыхание', 
        failNext: 'fail_minor',
        successNext: 'storage_task_5' 
    },
    storage_task_5: {
        text: `Зона 5: Факт: Зомби могут плавать, и они предпочитают воду для передвижения.`,
        type: 'believe',
        question: 'Это правда или ложь?',
        correctAnswer: false, 
        failNext: 'fail_minor',
        successNext: 'storage_success_metro'
    },
    storage_success_metro: {
        text: `Хранилище пройдено. Впереди затопленный тоннель метро.`,
        choices: [{ text: "➡️ В Затопленный Тоннель Метро (БЛОК 4)", next: "metro_start" }]
    },

    // =========================================================================
    // 🚇 ЛОКАЦИЯ 4: ЗАТОПЛЕННЫЙ ТОННЕЛЬ МЕТРО
    // =========================================================================
    metro_start: {
        text: `Тоннель Метро. Вода по пояс, повсюду слышен булькающий шум "Пловцов". Тебе нужно пройти 6 участков.`,
        choices: [{ text: "Начать: Участок 1 (Ориентирование)", next: "metro_task_1" }]
    },
    metro_task_1: {
        text: `Участок 1: Ты видишь едва заметный свет в двух направлениях. Какое направление безопаснее?`,
        type: 'speed_quiz',
        time: 12,
        question: 'Какое направление?',
        answers: {
            a: { text: 'В сторону громкого звука (Риск)', next: 'fail_minor' },
            b: { text: 'В сторону мерцающего света (Безопасно)', next: 'metro_task_2' }, 
            c: { text: 'Назад', next: 'fail_major' }
        }
    },
    metro_task_2: {
        text: `Участок 2: Факт: "Пловцы" не видят в темноте, но отлично слышат вибрацию по воде.`,
        type: 'believe',
        question: 'Это правда или ложь?',
        correctAnswer: true, 
        failNext: 'fail_minor',
        successNext: 'metro_task_3'
    },
    metro_task_3: {
        text: `Участок 3: **РИСК**. Впереди сильный ток. Ты можешь бросить один из своих чипов, чтобы замкнуть цепь и отключить его.`,
        type: 'decision_scenario',
        choices: [
            { text: "⚡ Бросить чип (Быстро, но дорого)", requiredBonus: 1, effect: { bonuses: -1, time: 120 }, next: 'metro_task_4' },
            { text: "🐌 Ждать, пока ток спадет (Медленно)", effect: { time: -480 }, next: 'metro_task_4' }
        ]
    },
    metro_task_4: {
        text: `Участок 4: Звуковая загадка. 'Что имеет рот, но никогда не говорит?'`,
        type: 'logic_puzzle',
        question: 'Твой ответ:',
        correctAnswer: 'река', 
        failNext: 'fail_minor',
        successNext: 'metro_task_5' 
    },
    metro_task_5: {
        text: `Участок 5: Ты видишь выжившего. Он просит аптечку (Жизнь), обещая взамен чипы.`,
        type: 'decision_scenario',
        choices: [
            { text: "💔 Отдать аптечку (Сострадание)", requiredLife: 1, effect: { lives: -1, bonuses: 3, moral: 5 }, next: 'metro_success_defense' },
            { text: "🥶 Отказать и уйти (Жестокость)", effect: { moral: -5 }, next: 'metro_success_defense' }
        ]
    },
    metro_success_defense: {
        text: `Тоннель Метро пройден. Впереди Сектор Обороны.`,
        choices: [{ text: "➡️ В Сектор Обороны 'Баррикада' (БЛОК 5)", next: "defense_start" }]
    },

    // =========================================================================
    // 🛡️ ЛОКАЦИЯ 5: СЕКТОР ОБОРОНЫ "БАРРИКАДА"
    // =========================================================================
    defense_start: {
        text: `Сектор Обороны. Это последняя линия перед Бункером. Все замки - высокоуровневая логика.`,
        choices: [{ text: "Начать: Замок 1 (Загадка о числе)", next: "defense_task_1" }]
    },
    defense_task_1: {
        text: `Замок 1: 'Я число, которое в сумме с 5 дает 12, а в сумме с 7 дает 14'. Что это за число?`,
        type: 'logic_puzzle',
        question: 'Твой ответ (число):',
        correctAnswer: '7', 
        failNext: 'fail_major',
        successNext: 'defense_task_2' 
    },
    defense_task_2: {
        text: `Замок 2: Факт: Чем больше зомби-мозг, тем сложнее его убить.`,
        type: 'believe',
        question: 'Это правда или ложь?',
        correctAnswer: false, 
        failNext: 'fail_minor',
        successNext: 'defense_task_3'
    },
    defense_task_3: {
        text: `Замок 3: **ФИНАЛЬНАЯ ДИЛЕММА**. Ты видишь двух зомби: один - ребенок, второй - солдат. У тебя один патрон. Ты должен выбрать, кого "упокоить".`,
        type: 'decision_scenario',
        choices: [
            { text: "👶 Ребенок-зомби (Сострадание)", effect: { moral: -5, lives: -1 }, next: 'defense_task_4' }, 
            { text: "💂 Солдат-зомби (Прагматизм)", effect: { moral: 5, time: -600 }, next: 'defense_task_4' }
        ]
    },
    defense_task_4: {
        text: `Замок 4: Головоломка о дверях: На двери А: "Дверь В - ложь". На двери В: "Дверь С - правда". На двери С: "Дверь А - ложь". Только одна дверь верна. Какая?`,
        type: 'logic_puzzle',
        question: 'Введи букву двери (A, B или C):',
        correctAnswer: 'A', 
        failNext: 'fail_major',
        successNext: 'defense_success_bunker' 
    },
    defense_success_bunker: {
        text: `Сектор Обороны пройден! Последний шаг – Гермодверь Бункера.`,
        choices: [{ text: "➡️ К Гермодвери Бункера 'Аврора' (БЛОК 6)", next: "final_stage" }]
    },

    // =========================================================================
    // 📡 ЛОКАЦИЯ 6: ФИНАЛЬНЫЙ БУНКЕР "АВРОРА"
    // =========================================================================
    final_stage: {
        text: `Ты в Финальном Бункере! Перед тобой передатчик. Активация сигнала зависит от твоей человечности.`,
        type: 'final_check_moral',
        choices: [
            { text: "🟢 ОТПРАВИТЬ СИГНАЛ", next: "game_win" }
        ]
    },
    

    // --- ОБЩИЕ НЕУДАЧИ (Скрытые штрафы) ---
    fail_minor: {
        text: `Неудача. Сработала небольшая сигнализация. Ты потратил время на обходной путь.`,
        effect: { time: -600, moral: -1 }, // -10 минут, -1 Мораль
        choices: [{ text: "➡️ Идти дальше", next: "hall_start" }] // Возврат к Административному Залу как к нейтральному хабу
    },
    fail_major: {
        text: `Крупный провал. Ловушка сработала, причинив тебе вред. Ты теряешь жизненные силы и время.`,
        effect: { lives: -1, time: -1200, moral: -3 }, // -1 Жизнь, -20 минут, -3 Мораль
        choices: [{ text: "➡️ Идти дальше", next: "hall_start" }]
    },


    // --- КОНЦЕВКИ (Остались прежними) ---
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

// --- 3. ФУНКЦИИ ИГРЫ (Остались прежними, но адаптированы под новую структуру) ---

function updateStats() {
    if (!DOMElements.lives) { initializeDOMElements(); }

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

function goToStep(stepKey) {
    if (!DOMElements.lives) { initializeDOMElements(); }

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
            
            // Логика проверки условий для Моральных Дилемм
            let isDisabled = false;
            
            // Требуется Бонус
            if (choice.requiredBonus && gameState.bonuses < choice.requiredBonus) {
                 isDisabled = true;
            }
            // Требуется Жизнь (Аптечка)
            if (choice.requiredLife && gameState.lives < choice.requiredLife) {
                 isDisabled = true;
            }

            if (isDisabled) {
                button.disabled = true;
                button.textContent += " (НЕТ РЕСУРСОВ)";
                // Если не хватает, кнопка становится недоступной, игрок должен выбрать другой путь
                const alternativeChoice = step.choices.find(c => c.text !== choice.text && !c.requiredBonus && !c.requiredLife);
                 if (alternativeChoice) {
                     button.textContent = "❌ " + choice.text + " (НЕТ РЕСУРСОВ)";
                     button.onclick = () => {
                         applyEffects(alternativeChoice.effect);
                         goToStep(alternativeChoice.next);
                     };
                 }
            } else {
                 button.addEventListener('click', () => {
                    if (choice.effect) {
                        applyEffects(choice.effect);
                    }
                    goToStep(choice.next);
                });
            }
            DOMElements.choicesContainer.appendChild(button);
        });
    }
}

function applyEffects(effect) {
    if (effect.lives) { gameState.lives += effect.lives; }
    if (effect.bonuses) { gameState.bonuses += effect.bonuses; }
    if (effect.time) { gameState.currentTime += effect.time; }
    if (effect.moral) { gameState.moralScore += effect.moral; }
    updateStats();
}

// -------------------------------------------------------------
// *ДАЛЕЕ ИДУТ ФУНКЦИИ РЕНДЕРИНГА (Logic, Speed, Moral, End)*
// -------------------------------------------------------------

function renderFinalCheckMoral() {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    
    const requiredMoral = 5; 
    
    gameContainer.innerHTML = `
        <h3>⚖️ ФИНАЛЬНОЕ СУЖДЕНИЕ</h3>
        <p>Твоя Карма определит, кто ответит на твой сигнал. Твой текущий Моральный Рейтинг: **${gameState.moralScore}**. </p>
        <p>Минимальный требуемый рейтинг: **${requiredMoral}**.</p>
        <button id="submit-final" class="quest-button">АКТИВИРОВАТЬ СИГНАЛ</button>
        <p id="feedback-final"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    document.getElementById('submit-final').onclick = () => {
        const feedback = document.getElementById('feedback-final');
        document.getElementById('submit-final').disabled = true;

        if (gameState.moralScore >= requiredMoral) {
            feedback.className = 'correct';
            feedback.textContent = `КОД ПРИНЯТ! СИГНАЛ УСПЕШНО ОТПРАВЛЕН.`;
            setTimeout(() => goToStep('game_win'), 2000);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = `ПРЕДУПРЕЖДЕНИЕ! СИГНАЛ ПЕРЕХВАЧЕН ИЗ-ЗА НИЗКОЙ МОРАЛИ.`;
            setTimeout(() => goToStep('game_ending_bad'), 2000);
        }
    };
}

function renderTimedQuestion(step) {
    const timeLimit = step.time || 20; 
    let timeLeft = timeLimit;

    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>🚀 ТЕСТ НА СКОРОСТЬ</h3>
        <p class="timer-display" style="color: var(--neon-red); font-size: 1.5em;">Осталось времени: <span id="q-timer">${timeLeft}</span> сек.</p>
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
            feedback.textContent = gameState.labels.failTime;
            complete('fail_major'); 
        }
    }, 1000);

    for (const key in step.answers) {
        const answer = step.answers[key];
        const button = document.createElement('button');
        button.className = 'quest-button';
        button.textContent = answer.text;
        
        button.onclick = () => {
            document.querySelectorAll('.quest-button').forEach(btn => btn.disabled = true);
            
            if (answer.next.includes('fail')) {
                feedback.className = 'incorrect';
                feedback.textContent = gameState.labels.incorrect + ' Ты потерял равновесие.';
                complete(answer.next);
            } else {
                feedback.className = 'correct';
                feedback.textContent = gameState.labels.correct + ' (+1 Чип найден)';
                applyEffects({ bonuses: 1 });
                complete(answer.next);
            }
        };
        gameContainer.appendChild(button);
    }
}

function renderLogicPuzzle(step) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>🧠 ЛОГИЧЕСКАЯ ЗАГАДКА</h3>
        <p>${step.question}</p>
        <input type="text" id="logic-answer" placeholder="Твой ответ..." class="quest-input">
        <button id="submit-logic" class="quest-button">Проверить</button>
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
            feedback.textContent = gameState.labels.correct + ' (+1 Чип за взлом).';
            applyEffects({ bonuses: 1 }); 
            setTimeout(() => goToStep(step.successNext), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect + ' Панель заблокирована.';
            setTimeout(() => goToStep(step.failNext), 1500); 
        }
    };
}

function renderBelieveUnbelieve(step) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `<h3>❓ ФАКТ ИЛИ МИФ</h3>`;
    
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
            feedback.textContent = gameState.labels.correct + ' (+1 Чип).';
            applyEffects({ bonuses: 1 });
            setTimeout(() => goToStep(step.successNext), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect + ' Ложное знание.';
            setTimeout(() => goToStep(step.failNext), 1500);
        }
    };
    
    const buttonTrue = document.createElement('button');
    buttonTrue.className = 'quest-button';
    buttonTrue.textContent = 'ФАКТ (TRUE)';
    buttonTrue.onclick = () => checkAnswer(true);
    
    const buttonFalse = document.createElement('button');
    buttonFalse.className = 'quest-button';
    buttonFalse.textContent = 'МИФ (FALSE)';
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
        DOMElements.overlayTitle.textContent = "🏆 ПОБЕДА! СИГНАЛ ОТПРАВЛЕН 🏆";
        DOMElements.overlayText.innerHTML = `Ты выжил за <span class="correct">${finalTime}</span>.<br>Найдено Чипов: ${gameState.bonuses}. Финальный Моральный Рейтинг: ${gameState.moralScore}.`;
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    } else if (outcome === 'game_ending_bad') {
        DOMElements.overlayTitle.textContent = "❌ ПРОВАЛ ИЗ-ЗА МОРАЛИ ❌";
        DOMElements.overlayText.innerHTML = QUEST_STEPS.game_ending_bad.text + `<br>Финальный Моральный Рейтинг: ${gameState.moralScore}.`;
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    } 
    else {
        DOMElements.overlayTitle.textContent = "☠️ КОНЕЦ ИГРЫ ☠️";
        DOMElements.overlayText.innerHTML = "Время истекло, или ты пал в бою. Миссия провалена.";
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    }
}

function initGame() {
    initializeDOMElements(); 

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
