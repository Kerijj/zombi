// quest.js
// 💀 РЕЙС 245: ЖЕЛЕЗНОЕ СЕРДЦЕ (Полный код 60 Заданий) 💀

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
        failTime: '⏱️ Время вышло! Слишком медленно. (-1 Жизнь)',
        correct: '✅ Успех! (+1 Чип).',
        incorrect: '❌ Ошибка! (-1 Жизнь, но продолжаешь).',
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
        // Предполагаем, что HTML-структура верна.
    }
}

// --- 2. СТРУКТУРА КВЕСТА (6 ЛОКАЦИЙ x 10 ЗАДАНИЙ) ---

const QUEST_STEPS = {
    // === СТАРТ ===
    start: {
        text: `Ты приходишь в себя в полуразрушенном ангаре. Имплант активирован, но сигнал слабый. '120 MINUTES TILL DAWN'. Тебе нужно добраться до Бункера "Аврора".`,
        choices: [
            { text: "➡️ Дверь 1: Заброшенная Лаборатория 'Генезис'", next: "lab_start" }
        ]
    },

    // =========================================================================
    // ⚙️ ЛОКАЦИЯ 1: ЗАБРОШЕННАЯ ЛАБОРАТОРИЯ "ГЕНЕЗИС" (10 заданий)
    // =========================================================================
    lab_start: {
        text: `Ты в Лаборатории, где началась чума. Повсюду разбитые колбы. Чтобы пройти, нужно активировать 10 защитных панелей.`,
        choices: [{ text: "Начать: Панель 1 (Взлом терминала)", next: "lab_task_1" }]
    },
    lab_task_1: {
        text: `Панель 1: Голограмма: 'Что всегда бежит, но никогда не устает?' (Ответ: Река)`,
        type: 'logic_puzzle',
        correctAnswer: 'река', 
        successNext: 'lab_task_2' 
    },
    lab_task_2: {
        text: `Панель 2: **Моральная Дилемма**. Слышен крик. Ты пойдёшь спасать выжившего, теряя 10 минут, или продолжить искать чипы (+2 Чипа)?`,
        type: 'decision_scenario',
        choices: [
            { text: "🤝 Спасать (+2 Мораль, -600 сек)", effect: { moral: 2, time: -600 }, next: 'lab_task_3' },
            { text: "💰 Искать чипы (+2 Чипа, -2 Мораль)", effect: { bonuses: 2, moral: -2 }, next: 'lab_task_3' }
        ]
    },
    lab_task_3: {
        text: `Панель 3: Система требует подтверждения факта. 'Факт: "Красная чума" передаётся только через кровь.'`,
        type: 'believe',
        correctAnswer: false, // Ложь
        successNext: 'lab_task_4'
    },
    lab_task_4: {
        text: `Панель 4: **Скорость**. Сигнализация! 10 секунд на выбор двери (А или В, В - ловушка).`,
        type: 'speed_quiz',
        time: 10,
        question: 'Куда идти? (Дверь А или Дверь В)',
        correctAnswerText: 'Дверь А',
        successNext: 'lab_task_5'
    },
    lab_task_5: {
        text: `Панель 5: **Загадка**. 'Я число, которое в квадрате даёт 81.'`,
        type: 'logic_puzzle',
        correctAnswer: '9', 
        successNext: 'lab_task_6'
    },
    lab_task_6: {
        text: `Панель 6: **Риск**. Перед тобой аптечка в зоне с высоким уровнем радиации. Взять?`,
        type: 'decision_scenario',
        choices: [
            { text: "💉 Взять (+1 Жизнь, -1 Мораль)", effect: { lives: 1, moral: -1 }, next: 'lab_task_7' },
            { text: "🚶‍♂️ Обойти (Безопасно)", effect: { time: -120 }, next: 'lab_task_7' }
        ]
    },
    lab_task_7: {
        text: `Панель 7: **Скрытая ловушка**. Ввод кода, где '1=C, 2=B, 3=A'. Введите 2. (Ответ: B)`,
        type: 'logic_puzzle',
        correctAnswer: 'b',
        successNext: 'lab_task_8'
    },
    lab_task_8: {
        text: `Панель 8: **Дилемма Чипов**. Ты нашел 3 чипа, но для прохода нужно пожертвовать 1 чипом.`,
        type: 'decision_scenario',
        choices: [
            { text: "➡️ Пожертвовать чипом (-1 Чип, +3 Мораль)", requiredBonus: 1, effect: { bonuses: -1, moral: 3 }, next: 'lab_task_9' },
            { text: "⬅️ Взломать дверь (-2 минуты, -1 Мораль)", effect: { time: -120, moral: -1 }, next: 'lab_task_9' }
        ]
    },
    lab_task_9: {
        text: `Панель 9: **Загадка**. 'Что можно увидеть закрытыми глазами?'`,
        type: 'logic_puzzle',
        correctAnswer: 'сон',
        successNext: 'lab_task_10'
    },
    lab_task_10: {
        text: `Панель 10: **Финальный Замок**. 'Какой месяц содержит 28 дней?' (Ответ: Все)`,
        type: 'logic_puzzle',
        correctAnswer: 'все',
        successNext: 'hall_start' 
    },

    // =========================================================================
    // 🏛️ ЛОКАЦИЯ 2: ЗАБРОШЕННЫЙ АДМИНИСТРАТИВНЫЙ ЗАЛ (10 заданий)
    // =========================================================================
    hall_start: {
        text: `**СЦЕНАРИЙ:** Вы вошли в Административный Зал. Громадные колонны и тишина. Вам нужно взломать центральный сервер, чтобы найти кратчайший путь к Хранилищу.`,
        choices: [{ text: "Начать: Консоль 1 (Взлом пароля)", next: "hall_task_1" }]
    },
    hall_task_1: {
        text: `Консоль 1: **Взлом пароля**. Пароль — это животное, которое спит стоя.`,
        type: 'logic_puzzle',
        correctAnswer: 'лошадь', 
        successNext: 'hall_task_2' 
    },
    hall_task_2: {
        text: `Консоль 2: **Моральная Дилемма**. Вы видите человека, пытающегося продать свою последнюю аптечку за 5 чипов.`,
        type: 'decision_scenario',
        choices: [
            { text: "🤝 Купить аптечку (-5 Чипов, +1 Жизнь)", requiredBonus: 5, effect: { bonuses: -5, lives: 1 }, next: 'hall_task_3' },
            { text: "💰 Отказаться (+3 Мораль, но без лечения)", effect: { moral: 3 }, next: 'hall_task_3' }
        ]
    },
    hall_task_3: {
        text: `Консоль 3: **Загадка**. 'У меня нет веса, но я могу упасть. Я не материальна, но могу быть сломана.' (Ответ: Обещание)`,
        type: 'logic_puzzle',
        correctAnswer: 'обещание',
        successNext: 'hall_task_4' 
    },
    hall_task_4: {
        text: `Консоль 4: **Спешка**. 8 секунд: Выбери рычаг, который остановит сканирование (Красный или Синий - Синий верен).`,
        type: 'speed_quiz',
        time: 8,
        question: 'Какой рычаг?',
        correctAnswerText: 'Синий',
        successNext: 'hall_task_5'
    },
    hall_task_5: {
        text: `Консоль 5: **Факт**. Верно ли, что зомби реагируют на звук, а не на свет?`,
        type: 'believe',
        correctAnswer: true,
        successNext: 'hall_task_6'
    },
    hall_task_6: {
        text: `Консоль 6: **Расшифровка**. Код 'R245' означает, что ты... (Ответ: Рейс 245)`,
        type: 'logic_puzzle',
        correctAnswer: 'рейс 245', 
        successNext: 'hall_task_7' 
    },
    hall_task_7: {
        text: `Консоль 7: **Риск**. Вы нашли ящик с надписью "ТАКСИЧНО". Вскрыть, рискуя здоровьем?`,
        type: 'decision_scenario',
        choices: [
            { text: "📦 Вскрыть (+2 Чипа, -1 Жизнь)", effect: { bonuses: 2, lives: -1 }, next: 'hall_task_8' },
            { text: "🚶‍♂️ Обойти (Безопасно)", effect: { time: -180 }, next: 'hall_task_8' }
        ]
    },
    hall_task_8: {
        text: `Консоль 8: **Дилемма**. Использовать мощный, но шумный фонарь (+1 минута), или идти в темноте (-1 Мораль)?`,
        type: 'decision_scenario',
        choices: [
            { text: "🔦 Фонарь (+60 сек)", effect: { time: 60 }, next: 'hall_task_9' },
            { text: "🤫 Темнота (-1 Мораль)", effect: { moral: -1 }, next: 'hall_task_9' }
        ]
    },
    hall_task_9: {
        text: `Консоль 9: **Загадка**. 'Чем больше ты берёшь, тем больше он становится.'`,
        type: 'logic_puzzle',
        correctAnswer: 'яма', 
        successNext: 'hall_task_10' 
    },
    hall_task_10: {
        text: `Консоль 10: **Финальный Замок**. 'Четыре человека в лодке, а укрылись только трое. Как?' (Ответ: Беременная)`,
        type: 'logic_puzzle',
        correctAnswer: 'беременная', 
        successNext: 'storage_start'
    },

    // =========================================================================
    // 📦 ЛОКАЦИЯ 3: ЦЕНТРАЛЬНОЕ ХРАНИЛИЩЕ РЕСУРСОВ (10 заданий)
    // =========================================================================
    storage_start: {
        text: `**СЦЕНАРИЙ:** Вы вошли в Центральное Хранилище. Повсюду автоматические погрузчики и лазерные сети. Вам нужно найти запасной вход в метро.`,
        choices: [{ text: "Начать: Зона 1 (Навигация)", next: "storage_task_1" }]
    },
    storage_task_1: {
        text: `Зона 1: **Навигация**. 7 секунд: Выбрать правильный проход в лазерной сетке (Проход 1 или Проход 2 - Проход 1 верен).`,
        type: 'speed_quiz',
        time: 7,
        question: 'Какой проход?',
        correctAnswerText: 'Проход 1',
        successNext: 'storage_task_2' 
    },
    storage_task_2: {
        text: `Зона 2: **Моральная Дилемма**. Чтобы открыть дверь, нужно перекрыть вентиляцию в зоне, где, возможно, есть выжившие.`,
        type: 'decision_scenario',
        choices: [
            { text: "➡️ Открыть дверь (-3 Мораль)", effect: { moral: -3 }, next: 'storage_task_3' },
            { text: "⬅️ Искать код (-5 минут, +3 Мораль)", effect: { time: -300, moral: 3 }, next: 'storage_task_3' }
        ]
    },
    storage_task_3: {
        text: `Зона 3: **Загадка**. 'Вчера было воскресенье, завтра будет среда. Какой сегодня день?' (Ответ: Пятница)`,
        type: 'logic_puzzle',
        correctAnswer: 'пятница', 
        successNext: 'storage_task_4' 
    },
    storage_task_4: {
        text: `Зона 4: **Факт**. Верно ли, что зомби могут почувствовать иммунитет?`,
        type: 'believe',
        correctAnswer: false, 
        successNext: 'storage_task_5'
    },
    storage_task_5: {
        text: `Зона 5: **Расшифровка**. Что было первым: курица или яйцо?`,
        type: 'logic_puzzle',
        correctAnswer: 'яйцо', 
        successNext: 'storage_task_6' 
    },
    storage_task_6: {
        text: `Зона 6: **Экономия**. Потратить 3 чипа, чтобы моментально открыть замок, или взламывать 5 минут?`,
        type: 'decision_scenario',
        choices: [
            { text: "➡️ Потратить (-3 Чипа)", requiredBonus: 3, effect: { bonuses: -3 }, next: 'storage_task_7' },
            { text: "🐌 Взламывать (-5 минут)", effect: { time: -300 }, next: 'storage_task_7' }
        ]
    },
    storage_task_7: {
        text: `Зона 7: **Загадка**. 'Что можно держать, но нельзя бросить?'`,
        type: 'logic_puzzle',
        correctAnswer: 'слово', 
        successNext: 'storage_task_8' 
    },
    storage_task_8: {
        text: `Зона 8: **Риск**. Вы можете кинуть едкий порошок (-1 Мораль) в зомби или попытаться убежать (-2 минуты).`,
        type: 'decision_scenario',
        choices: [
            { text: "➡️ Кинуть порошок (-1 Мораль)", effect: { moral: -1 }, next: 'storage_task_9' },
            { text: "⬅️ Убежать (-2 минуты)", effect: { time: -120 }, next: 'storage_task_9' }
        ]
    },
    storage_task_9: {
        text: `Зона 9: **Загадка о весе**. Что легче: тонна камней или тонна перьев?`,
        type: 'logic_puzzle',
        correctAnswer: 'одинаково', 
        successNext: 'storage_task_10' 
    },
    storage_task_10: {
        text: `Зона 10: **Финальный Замок**. В каком году был запущен первый спутник? (Ответ: 1957)`,
        type: 'logic_puzzle',
        correctAnswer: '1957', 
        successNext: 'metro_start'
    },

    // =========================================================================
    // 🚇 ЛОКАЦИЯ 4: ЗАТОПЛЕННЫЙ ТОННЕЛЬ МЕТРО (10 заданий)
    // =========================================================================
    metro_start: {
        text: `**СЦЕНАРИЙ:** Вы вошли в Затопленный Тоннель Метро. Вода по пояс, слышны "Пловцы". Вы должны найти и починить железнодорожную тележку.`,
        choices: [{ text: "Начать: Участок 1 (Ориентирование)", next: "metro_task_1" }]
    },
    metro_task_1: {
        text: `Участок 1: **Ориентирование**. 12 секунд: Ты видишь свет в трёх тоннелях. Какой самый короткий (Тоннель 3)?`,
        type: 'speed_quiz',
        time: 12,
        question: 'Тоннель 1, 2 или 3?',
        correctAnswerText: 'Тоннель 3',
        successNext: 'metro_task_2'
    },
    metro_task_2: {
        text: `Участок 2: **Факт**. Верно ли, что "Пловцы" не могут подняться на сушу?`,
        type: 'believe',
        correctAnswer: false, // Ложь
        successNext: 'metro_task_3'
    },
    metro_task_3: {
        text: `Участок 3: **Загадка**. У отца Мэри пять дочерей: Нана, Нена, Нина, Нона. Как зовут пятую? (Ответ: Мэри)`,
        type: 'logic_puzzle',
        correctAnswer: 'мэри', 
        successNext: 'metro_task_4' 
    },
    metro_task_4: {
        text: `Участок 4: **Моральная Дилемма**. Вы видите, как "Пловец" напал на крысу. Вы можете потратить патрон, чтобы спасти животное.`,
        type: 'decision_scenario',
        choices: [
            { text: "🤝 Спасти (+2 Мораль, -120 сек)", effect: { moral: 2, time: -120 }, next: 'metro_task_5' },
            { text: "💰 Пройти мимо (-1 Мораль)", effect: { moral: -1 }, next: 'metro_task_5' }
        ]
    },
    metro_task_5: {
        text: `Участок 5: **Риск**. На рельсах лежит ржавый, но целый пистолет. Поднять, рискуя заражением?`,
        type: 'decision_scenario',
        choices: [
            { text: "🔫 Поднять (+1 Жизнь, -1 Мораль)", effect: { lives: 1, moral: -1 }, next: 'metro_task_6' },
            { text: "🚶‍♂️ Обойти (Безопасно)", effect: { time: -60 }, next: 'metro_task_6' }
        ]
    },
    metro_task_6: {
        text: `Участок 6: **Логика**. Что имеет зубы, но не ест? (Ответ: Расческа)`,
        type: 'logic_puzzle',
        correctAnswer: 'расческа', 
        successNext: 'metro_task_7' 
    },
    metro_task_7: {
        text: `Участок 7: **Дилемма с чипами**. Использовать 2 чипа, чтобы пробить дверь на 50%, и бить ломом (-1 Жизнь)?`,
        type: 'decision_scenario',
        choices: [
            { text: "➡️ Использовать Чипы (-2 Чипа, -1 Жизнь)", requiredBonus: 2, effect: { bonuses: -2, lives: -1 }, next: 'metro_task_8' },
            { text: "⬅️ Искать обход (-3 минуты)", effect: { time: -180 }, next: 'metro_task_8' }
        ]
    },
    metro_task_8: {
        text: `Участок 8: **Скрытая ловушка**. Ввод кода, где '1=A, 2=B, 3=C'. Введите 3. (Ответ: C)`,
        type: 'logic_puzzle',
        correctAnswer: 'c',
        successNext: 'metro_task_9'
    },
    metro_task_9: {
        text: `Участок 9: **Загадка**. Что принадлежит тебе, но другие используют его чаще? (Ответ: Имя)`,
        type: 'logic_puzzle',
        correctAnswer: 'имя', 
        successNext: 'metro_task_10' 
    },
    metro_task_10: {
        text: `Участок 10: **Финальный Замок**. Я могу быть словом, но меня нельзя произнести. Что я? (Ответ: Тишина)`,
        type: 'logic_puzzle',
        correctAnswer: 'тишина', 
        successNext: 'defense_start'
    },

    // =========================================================================
    // 🛡️ ЛОКАЦИЯ 5: СЕКТОР ОБОРОНЫ "БАРРИКАДА" (10 заданий)
    // =========================================================================
    defense_start: {
        text: `**СЦЕНАРИЙ:** Вы в Секторе Обороны. Это последняя линия перед Бункером. Здесь активная система защиты.`,
        choices: [{ text: "Начать: Замок 1 (Расшифровка)", next: "defense_task_1" }]
    },
    defense_task_1: {
        text: `Замок 1: **Расшифровка**. PIN-код: [4, 8, 15, 16, 23, ?] (Ответ: 42)`,
        type: 'logic_puzzle',
        correctAnswer: '42', 
        successNext: 'defense_task_2' 
    },
    defense_task_2: {
        text: `Замок 2: **Моральная Дилемма**. Вы видите группу мирных выживших, которые крадут ваши припасы. Среди них дети.`,
        type: 'decision_scenario',
        choices: [
            { text: "🤝 Простить (+3 Мораль)", effect: { moral: 3 }, next: 'defense_task_3' },
            { text: "💰 Наказать (-1 Чип, -3 Мораль)", requiredBonus: 1, effect: { bonuses: -1, moral: -3 }, next: 'defense_task_3' }
        ]
    },
    defense_task_3: {
        text: `Замок 3: **Загадка**. 'Человек похоронил свою жену, но он не был женат.' Как? (Ответ: Его отец)`,
        type: 'logic_puzzle',
        correctAnswer: 'отец', 
        successNext: 'defense_task_4' 
    },
    defense_task_4: {
        text: `Замок 4: **Скорость**. Турель нацелилась. 5 секунд на ввод кода "00101".`,
        type: 'speed_quiz',
        time: 5,
        question: 'Введи код 00101',
        correctAnswerText: '00101',
        successNext: 'defense_task_5'
    },
    defense_task_5: {
        text: `Замок 5: **Факт**. Верно ли, что система "Баррикада" питается от геотермальной энергии?`,
        type: 'believe',
        correctAnswer: true,
        successNext: 'defense_task_6'
    },
    defense_task_6: {
        text: `Замок 6: **Риск**. Обойти минное поле (-10 минут) или рискнуть (50/50, -1 Жизнь)?`,
        type: 'decision_scenario',
        choices: [
            { text: "🐌 Обойти (-10 минут)", effect: { time: -600 }, next: 'defense_task_7' },
            { text: "💥 Рискнуть (-1 Жизнь)", effect: { lives: -1 }, next: 'defense_task_7' }
        ]
    },
    defense_task_7: {
        text: `Замок 7: **Загадка**. Что можно поймать, но нельзя кинуть? (Ответ: Простуда)`,
        type: 'logic_puzzle',
        correctAnswer: 'простуда', 
        successNext: 'defense_task_8' 
    },
    defense_task_8: {
        text: `Замок 8: **Дилемма с чипами**. Использовать 5 чипов, чтобы запустить дрон-разведчик, или идти вслепую (-1 Жизнь)?`,
        type: 'decision_scenario',
        choices: [
            { text: "➡️ Дрон (-5 Чипов)", requiredBonus: 5, effect: { bonuses: -5 }, next: 'defense_task_9' },
            { text: "⬅️ Вслепую (-1 Жизнь)", effect: { lives: -1 }, next: 'defense_task_9' }
        ]
    },
    defense_task_9: {
        text: `Замок 9: **Логика**. Если ты держишь меня, ты хочешь поделиться мной. Если ты поделишься мной, ты больше не держишь меня. (Ответ: Секрет)`,
        type: 'logic_puzzle',
        correctAnswer: 'секрет', 
        successNext: 'defense_task_10' 
    },
    defense_task_10: {
        text: `Замок 10: **Финальный Замок**. Кто говорит на всех языках? (Ответ: Эхо)`,
        type: 'logic_puzzle',
        correctAnswer: 'эхо', 
        successNext: 'final_stage'
    },
    
    // =========================================================================
    // 📡 ЛОКАЦИЯ 6: ФИНАЛЬНЫЙ БУНКЕР "АВРОРА" (10 заданий)
    // =========================================================================
    final_stage: {
        text: `**СЦЕНАРИЙ:** Ты прорвался. Остался только Бункер. Вам нужно активировать спутниковый передатчик.`,
        choices: [{ text: "Начать активацию: Панель 1", next: "final_task_1" }]
    },
    final_task_1: {
        text: `Панель 1: **Активация**. Что поднимается, но не опускается? (Ответ: Возраст)`,
        type: 'logic_puzzle',
        correctAnswer: 'возраст', 
        successNext: 'final_task_2' 
    },
    final_task_2: {
        text: `Панель 2: **Взлом**. Какое число самое маленькое, если его написать? (Ответ: Сто)`,
        type: 'logic_puzzle',
        correctAnswer: 'сто',
        successNext: 'final_task_3' 
    },
    final_task_3: {
        text: `Панель 3: **Дилемма**. Система предлагает уничтожить все данные о "Красной Чуме" (безопасность) или сохранить их (знание).`,
        type: 'decision_scenario',
        choices: [
            { text: "➡️ Уничтожить (-2 Мораль)", effect: { moral: -2 }, next: 'final_task_4' },
            { text: "⬅️ Сохранить (+2 Мораль)", effect: { moral: 2 }, next: 'final_task_4' }
        ]
    },
    final_task_4: {
        text: `Панель 4: **Факт**. Верно ли, что "Аврора" может отправить сигнал только раз в сутки?`,
        type: 'believe',
        correctAnswer: true,
        successNext: 'final_task_5'
    },
    final_task_5: {
        text: `Панель 5: **Загадка**. Что мокрое, когда оно сушит? (Ответ: Полотенце)`,
        type: 'logic_puzzle',
        correctAnswer: 'полотенце', 
        successNext: 'final_task_6' 
    },
    final_task_6: {
        text: `Панель 6: **Финальный Выбор**. Вы слышите стон. Выживший нуждается в чипе. Вы отдадите свой последний чип?`,
        type: 'decision_scenario',
        choices: [
            { text: "🤝 Отдать (-1 Чип, +5 Мораль)", requiredBonus: 1, effect: { bonuses: -1, moral: 5 }, next: 'final_task_7' },
            { text: "💰 Оставить (-5 Мораль)", effect: { moral: -5 }, next: 'final_task_7' }
        ]
    },
    final_task_7: {
        text: `Панель 7: **Загадка**. Что может путешествовать по всему миру, оставаясь в одном углу? (Ответ: Марка)`,
        type: 'logic_puzzle',
        correctAnswer: 'марка', 
        successNext: 'final_task_8' 
    },
    final_task_8: {
        text: `Панель 8: **Код**. Какой алфавит имеет 26 букв? (Ответ: Английский)`,
        type: 'logic_puzzle',
        correctAnswer: 'английский', 
        successNext: 'final_task_9' 
    },
    final_task_9: {
        text: `Панель 9: **Завершение**. Что происходит раз в минуту, два раза в момент и никогда в тысячу лет? (Ответ: Буква М)`,
        type: 'logic_puzzle',
        correctAnswer: 'буква м', 
        successNext: 'final_check_moral' 
    },
    final_check_moral: {
        text: `Панель 10: ФИНАЛЬНАЯ ПРОВЕРКА. Твой рейтинг решит судьбу человечества.`,
        type: 'final_check_moral',
        choices: [
            { text: "🟢 ОТПРАВИТЬ СИГНАЛ", next: "game_win" }
        ]
    },
    

    // --- ОБЩИЕ НЕУДАЧИ и КОНЦОВКИ ---
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

// --- 3. ФУНКЦИИ ИГРЫ (ОБНОВЛЕННАЯ ЛОГИКА) ---

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
    
    if (step.type === 'speed_quiz') {
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
            
            let isDisabled = false;
            
            // Проверка на Чипы
            if (choice.requiredBonus && gameState.bonuses < choice.requiredBonus) {
                 isDisabled = true;
            }
            // Проверка на Жизни (для дилемм, где нужно пожертвовать жизнью)
            if (choice.requiredLife && gameState.lives < choice.requiredLife) {
                 isDisabled = true;
            }

            if (isDisabled) {
                // Если не хватает ресурсов (чипов), мы ищем альтернативный путь в той же дилемме
                const alternativeChoice = step.choices.find(c => c.text !== choice.text && !c.requiredBonus && !c.requiredLife);
                 if (alternativeChoice) {
                     button.textContent = "❌ " + choice.text + " (НЕТ РЕСУРСОВ. Выбран другой путь: " + alternativeChoice.text + ")";
                     button.onclick = () => {
                         applyEffects(alternativeChoice.effect);
                         goToStep(alternativeChoice.next);
                     };
                 } else {
                     // Если нет альтернативы, просто блокируем кнопку
                     button.disabled = true;
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


/**
 * ОБНОВЛЕННАЯ ЛОГИКА: Неверный ответ или истечение времени -> -1 Жизнь, но ИДТИ ДАЛЬШЕ.
 * Начисление +1 Чипа за правильный ответ.
 */
function renderTimedQuestion(step) {
    const timeLimit = step.time || 20; 
    let timeLeft = timeLimit;

    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>🚀 ТЕСТ НА СКОРОСТЬ</h3>
        <p class="timer-display" style="color: var(--neon-red); font-size: 1.5em;">Осталось времени: <span id="q-timer">${timeLeft}</span> сек.</p>
        <p>${step.question}</p>
        <input type="text" id="speed-answer" placeholder="${step.correctAnswerText || 'Твой ответ...'}" class="quest-input">
        <button id="submit-speed" class="quest-button">Проверить</button>
        <p id="feedback-text"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    const feedback = document.getElementById('feedback-text');
    const timerDisplay = document.getElementById('q-timer');
    const inputElement = document.getElementById('speed-answer');
    const submitButton = document.getElementById('submit-speed');

    const checkAndComplete = (isCorrect) => {
        clearInterval(gameState.questionTimerInterval);
        submitButton.disabled = true;
        inputElement.disabled = true;

        if (isCorrect) {
            feedback.className = 'correct';
            feedback.textContent = gameState.labels.correct;
            applyEffects({ bonuses: 1 });
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect;
            applyEffects({ lives: -1 }); // ❗ ШТРАФ ЗА НЕВЕРНЫЙ ОТВЕТ
        }

        if (gameState.lives <= 0) {
             setTimeout(() => endGame('game_over'), 100);
             return;
        }

        setTimeout(() => goToStep(step.successNext), 1500);
    };

    submitButton.onclick = () => {
        const answer = inputElement.value.trim().toLowerCase();
        const correctNorm = (step.correctAnswerText || '').toLowerCase();
        // Проверяем, включает ли ответ хотя бы часть верного текста (для вариаций, типа 'проход 1' или 'синий рычаг')
        const isCorrect = answer === correctNorm || (step.correctAnswerText && correctNorm.split(' ').some(word => answer.includes(word.substring(0, 3))));
        checkAndComplete(isCorrect);
    };

    gameState.questionTimerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.failTime;
            applyEffects({ lives: -1 }); // ❗ ШТРАФ ЗА ВРЕМЯ
            checkAndComplete(false); // Завершить как неудачу
        }
    }, 1000);
}


/**
 * ОБНОВЛЕННАЯ ЛОГИКА: Неверный ответ -> -1 Жизнь, но ИДТИ ДАЛЬШЕ.
 * Начисление +1 Чипа за правильный ответ.
 */
function renderLogicPuzzle(step) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `
        <h3>🧠 ЛОГИЧЕСКАЯ ЗАГАДКА</h3>
        <p>${step.text.replace(/'/g, '"')}</p>
        <input type="text" id="logic-answer" placeholder="Твой ответ..." class="quest-input">
        <button id="submit-logic" class="quest-button">Проверить</button>
        <p id="feedback-logic"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    document.getElementById('submit-logic').onclick = () => {
        const answer = document.getElementById('logic-answer').value.trim().toLowerCase();
        const feedback = document.getElementById('feedback-logic');
        const submitButton = document.getElementById('submit-logic');
        submitButton.disabled = true;

        const correctNorm = step.correctAnswer.toLowerCase();
        // Используем более гибкую проверку для логических загадок
        const isCorrect = correctNorm.split(' ').some(word => answer.includes(word.substring(0, 3))) || answer.includes(correctNorm); 
        
        if (isCorrect) {
            feedback.className = 'correct';
            feedback.textContent = gameState.labels.correct;
            applyEffects({ bonuses: 1 }); 
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect;
            applyEffects({ lives: -1 }); // ❗ ШТРАФ ЗА НЕВЕРНЫЙ ОТВЕТ
        }
        
        if (gameState.lives <= 0) {
             setTimeout(() => endGame('game_over'), 100);
             return;
        }

        // ❗ ПРИ ЛЮБОМ ИСХОДЕ ПЕРЕХОДИМ К СЛЕДУЮЩЕМУ ШАГУ В ЦЕПОЧКЕ
        setTimeout(() => goToStep(step.successNext), 1500); 
    };
}

/**
 * ОБНОВЛЕННАЯ ЛОГИКА: Неверный ответ -> -1 Жизнь, но ИДТИ ДАЛЬШЕ.
 * Начисление +1 Чипа за правильный ответ.
 */
function renderBelieveUnbelieve(step) {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    gameContainer.innerHTML = `<h3>❓ ФАКТ ИЛИ МИФ</h3>`;
    
    const questionText = document.createElement('p');
    questionText.innerHTML = step.text.replace(/'/g, '"');
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
            feedback.textContent = gameState.labels.correct;
            applyEffects({ bonuses: 1 });
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect;
            applyEffects({ lives: -1 }); // ❗ ШТРАФ ЗА НЕВЕРНЫЙ ОТВЕТ
        }
        
        if (gameState.lives <= 0) {
             setTimeout(() => endGame('game_over'), 100);
             return;
        }

        // ❗ ПРИ ЛЮБОМ ИСХОДЕ ПЕРЕХОДИМ К СЛЕДУЮЩЕМУ ШАГУ В ЦЕПОЧКЕ
        setTimeout(() => goToStep(step.successNext), 1500);
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
