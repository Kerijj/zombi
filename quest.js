// quest.js
// 🧟 ULTIMATE LOGIC QUEST: 1.5 Hours, Timers, Branching Reality, and Multilingual Interface 🧟

// --- 1. Состояние Игры и Элементы DOM ---
let gameState = {
    lives: 3,
    bonuses: 0,
    timeLimit: 90 * 60, // 1.5 часа (90 minutes) in seconds
    currentTime: 90 * 60,
    timerInterval: null,
    questionTimerInterval: null, 
    // МНОГОЯЗЫЧНЫЕ ПЕРЕМЕННЫЕ
    labels: {
        timerTitle: 'TIMER',
        livesTitle: '❤️ LIVES',
        bonusesTitle: '🌟 BONUSES',
        failTime: '⏱️ Time is up!',
        correct: '✅ CORRECT!',
        incorrect: '❌ WRONG!',
        restartButton: 'התחל מחדש (RESTART)' // Hebrew + English
    }
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
    // --- НАЧАЛО (С МНОГОЯЗЫЧНЫМИ НАДПИСЯМИ И НАПРЯЖЕНИЕМ) ---
    start: {
        text: `Ты очнулся в кромешной тьме. Единственный звук – твое учащенное дыхание. Мерцающий неоновый свет пробивается сквозь трещины. На стене кровью выведено: '90 MINUTES TILL DAWN'. Каждое мгновение – это шаг к небытию. Перед тобой два пути. Слева – узкий проход, пахнущий озоном и гнилью, над ним надпись: «Опасно, но быстро». Справа – широкий, пугающе тихий коридор, где на стене нацарапано: «Безопасный, но длинный маршрут».`,
        choices: [
            { text: "➡️ Опасно, но быстро (LEFT)", next: "path_danger_1" },
            { text: "➡️ Безопасный, но длинный (RIGHT)", next: "path_safe_1" }
        ]
    },

    // --- ВЕТКА "ОПАСНОСТЬ" (Акцент на скорость и реакцию) ---
    path_danger_1: {
        text: `Ты бежишь по слабоосвещенному складу, каждый твой шаг отдается эхом. Внезапно сирена пронзает тишину, и из темноты на тебя несется орда. 'RUN!'. Ты должен быстро найти укрытие. У тебя 15 секунд!`,
        type: 'speed_quiz',
        time: 15,
        question: 'Викторина (Скорость): Как называется явление, при котором свет распадается на спектр, как в неоновых вывесках?',
        answers: {
            a: { text: 'Рефракция', next: 'path_danger_1_fail' },
            b: { text: 'Дисперсия', next: 'path_danger_2' },
            c: { text: 'Интерференция', next: 'path_danger_1_fail' }
        }
    },
    path_danger_1_fail: {
        text: `Ты потерял равновесие, падая прямо под ноги преследующей орде. 'TOO SLOW!'. Чудом избежав укуса, ты откатываешься в темную нишу. -1 Жизнь и -5 минут времени.`,
        effect: { lives: -1, time: -300 }, 
        choices: [
            { text: "➡️ Искать обход через вентиляцию", next: "path_alt_vent" }
        ]
    },
    path_danger_2: {
        text: `Люк открыт! Ты проваливаешься в пыльную комнату, но здесь нет зомби. Среди мусора находишь +1 Бонус (Антидот) и чистую аптечку (+1 Жизнь!). Небольшая передышка, пока их крики стихают за стеной.`,
        effect: { bonuses: 1, lives: 1 },
        choices: [
            { text: "➡️ Двигаться дальше", next: "path_danger_3" }
        ]
    },
    path_danger_3: {
        text: `Впереди проход заблокирован грудой обломков. Из-за них торчит голова Зомби-Инженера. Он указывает на старую панель управления: 'Solve my riddle, and I’ll move these pathetic obstacles. If not, you’ll join my collection.'`,
        type: 'logic_puzzle',
        question: 'Логика: Если Зомби-Лжец всегда говорит, что он говорит правду, а Зомби-Правдивец всегда говорит, что он лжет. Что произойдет?',
        correctAnswer: 'Парадокс, оба замолчат.',
        failNext: 'path_danger_3_fail',
        successNext: 'mid_junction'
    },
    path_danger_3_fail: {
        text: `Инженер рычит от досады, ты не понял его. Он начинает с остервенением укреплять баррикаду. -10 минут на обход через завалы. Каждый миг – это чья-то новая жертва.`,
        effect: { time: -600 },
        choices: [
            { text: "➡️ Идти к центральному узлу", next: "mid_junction" }
        ]
    },

    // --- ВЕТКА "БЕЗОПАСНОСТЬ" (Множество вопросов: История/Эрудиция) ---
    path_safe_1: {
        text: `Ты идешь по тихому служебному коридору. Единственное, что нарушает тишину – капающая вода. На стене ржавой краской выведена надпись на иврите: 'זהירות - רק לחכמים' (Осторожно - только для умных). Дверь впереди заперта, и чтобы открыть ее, нужна эрудиция.`,
        type: 'theory_quiz',
        question: 'Теория (История): Когда был основан Рим?',
        answers: {
            a: { text: '476 год н.э.', next: 'path_safe_1_fail' },
            b: { text: '753 год до н.э.', next: 'path_erudition_1' }, 
            c: { text: '1066 год н.э.', next: 'path_safe_1_fail' }
        }
    },
    path_safe_1_fail: {
        text: `Дверь издает противный скрежет, а затем из пола вылезает зомби-историк и кричит "INVALID!". -1 Жизнь и -5 минут времени. Его укус почти настиг тебя.`,
        effect: { lives: -1, time: -300 }, 
        choices: [
            { text: "➡️ Проломить стену (Риск!)", next: "path_alt_hole" }
        ]
    },
    
    // --- ПОСЛЕДОВАТЕЛЬНОСТЬ: ЭРУДИЦИЯ (5 вопросов) ---
    path_erudition_1: {
        text: `Дверь открылась, но ты оказался в зале библиотеки, заваленном книгами и пылью. Среди стеллажей бродят зомби-ученые, их бормотание звучит жутко. Чтобы проскользнуть, нужно ответить на серию вопросов. (Вопрос 2/5).`,
        type: 'theory_quiz',
        question: 'Теория (История): Какое событие традиционно считается началом Второй мировой войны?',
        answers: {
            a: { text: 'Нападение на Перл-Харбор', next: 'path_erudition_fail' },
            b: { text: 'Вторжение Германии в Польшу', next: 'path_erudition_2' }, 
            c: { text: 'Битва под Москвой', next: 'path_erudition_fail' }
        }
    },
    path_erudition_2: {
        text: `(Вопрос 3/5). Эрудиция: Кто считается автором периодической таблицы химических элементов?`,
        type: 'theory_quiz',
        question: 'Теория (Химия): Кто считается автором периодической таблицы химических элементов?',
        answers: {
            a: { text: 'Нильс Бор', next: 'path_erudition_fail' },
            b: { text: 'Дмитрий Менделеев', next: 'path_erudition_3' }, 
            c: { text: 'Альберт Эйнштейн', next: 'path_erudition_fail' }
        }
    },
    path_erudition_3: {
        text: `(Вопрос 4/5). Эрудиция: Как назывался первый искусственный спутник Земли?`,
        type: 'theory_quiz',
        question: 'Теория (Наука): Как назывался первый искусственный спутник Земли?',
        answers: {
            a: { text: 'Аполлон-11', next: 'path_erudition_fail' },
            b: { text: 'Спутник-1', next: 'path_erudition_4' }, 
            c: { text: 'Восток-1', next: 'path_erudition_fail' }
        }
    },
    path_erudition_4: {
        text: `(Вопрос 5/5). Эрудиция: Кто был "Железной леди" британской политики?`,
        type: 'theory_quiz',
        question: 'Теория (История): Кто был "Железной леди" британской политики?',
        answers: {
            a: { text: 'Елизавета II', next: 'path_erudition_fail' },
            b: { text: 'Маргарет Тэтчер', next: 'path_intuition_start' }, 
            c: { text: 'Виктория', next: 'path_erudition_fail' }
        }
    },
    path_erudition_fail: {
        text: `Один из зомби-ученых издает пронзительный крик "FAILURE!" и обрушивает на тебя книжные полки. -10 минут времени! Ты едва успеваешь выбраться, теряя драгоценные секунды.`,
        effect: { time: -600 }, 
        choices: [
            { text: "➡️ Продолжить путь, минуя библиотеку", next: "mid_junction" }
        ]
    },

    // --- ПОСЛЕДОВАТЕЛЬНОСТЬ: ИНТУИЦИЯ (5 вопросов Верю/Не верю) ---
    path_intuition_start: {
        text: `Ты нашел тайник с припасами (+1 Жизнь!). Теперь ты в "Зале Зеркал" – здесь каждый отражение искажено, и только интуиция поможет тебе. Тебя ждет серия "Верю/Не верю".`,
        effect: { lives: 1 },
        type: 'believe',
        question: 'Верю/Не верю (1/5): Факт: Осьминоги имеют три сердца. True or False?',
        correctAnswer: true, 
        failNext: 'path_intuition_fail',
        successNext: 'path_intuition_1' 
    },
    path_intuition_1: {
        text: `Интуиция (2/5): Факт: Космический аппарат "Вояджер-1" покинул Солнечную систему и до сих пор передает данные. Правда или нет?`,
        type: 'believe',
        question: 'Верю/Не верю (2/5): Факт: Космический аппарат "Вояджер-1" покинул Солнечную систему и до сих пор передает данные. True or False?',
        correctAnswer: true, 
        failNext: 'path_intuition_fail',
        successNext: 'path_intuition_2' 
    },
    path_intuition_2: {
        text: `Интуиция (3/5): Зомби-Факт: Чтобы замаскировать запах живого человека от зомби, нужно обмазаться кетчупом. Правда или нет?`,
        type: 'believe',
        question: 'Верю/Не верю (3/5): Зомби-Факт: Чтобы замаскировать запах живого человека от зомби, нужно обмазаться кетчупом. True or False?',
        correctAnswer: false, 
        failNext: 'path_intuition_fail',
        successNext: 'path_intuition_3' 
    },
    path_intuition_3: {
        text: `Интуиция (4/5): Факт: Египетские пирамиды были построены не рабами, а свободными рабочими. True or False?`,
        type: 'believe',
        question: 'Верю/Не верю (4/5): Факт: Египетские пирамиды были построены не рабами, а свободными рабочими. Правда или нет?',
        correctAnswer: true, 
        failNext: 'path_intuition_fail',
        successNext: 'path_intuition_4' 
    },
    path_intuition_4: {
        text: `Интуиция (5/5): Зомби-Факт: Если зомби-подростку предложить чипсы с сыром, он временно потеряет интерес к тебе. Правда или нет?`,
        type: 'believe',
        question: 'Верю/Не верю (5/5): Зомби-Факт: Если зомби-подростку предложить чипсы с сыром, он временно потеряет интерес к тебе. True or False?',
        correctAnswer: false, 
        failNext: 'path_intuition_fail',
        successNext: 'path_encounter_1' 
    },
    path_intuition_fail: {
        text: `Ошибка интуиции! Осколки зеркал вокруг тебя оживают, превращаясь в призрачные силуэты зомби. -1 Жизнь! Ты споткнулся и упал.`,
        effect: { lives: -1 },
        choices: [
            { text: "➡️ Искать выход наугад", next: "mid_junction" }
        ]
    },


    // --- СЕРЕДИНА КВЕСТА (Объединение веток) ---
    mid_junction: {
        text: `Ты вышел в центральный зал. Неоновые огни пульсируют, отбрасывая зловещие тени. На каждом шагу ты чувствуешь, как утекает время. Надпись на стене: 'הזמן אוזל' (Время уходит). Ты должен принять быстрое решение. 10 секунд!`,
        type: 'speed_quiz',
        time: 10,
        question: 'Викторина (Скорость): Какое число является и нечетным, и четным одновременно, если смотреть на него под неоновым светом?',
        answers: {
            a: { text: '2 (Четное)', next: 'final_stage_fail' },
            b: { text: '3 (Нечетное)', next: 'final_stage_fail' },
            c: { text: 'Свет', next: 'mid_junction_success' } 
        }
    },
    
    // --- ПОСЛЕДОВАТЕЛЬНОСТЬ: УСЛОЖНЕННАЯ ЛОГИКА (3 вопроса) ---
    mid_junction_success: {
        text: `Ты нашел правильный маршрут! Но дверь заперта на три кодовых замка. На панели управления мигает надпись: 'PURE LOGIC REQUIRED'. Каждая ошибка может стоить тебе жизни. (Логика 1/3)`,
        type: 'logic_puzzle',
        question: 'Логика 1: У тебя есть три выключателя в коридоре. Только один из них зажигает лампочку в комнате. Как определить правильный выключатель, войдя в комнату только один раз?',
        correctAnswer: 'Включить первый, подождать, выключить. Включить второй, быстро войти. Горит — второй. Горячая — первый. Холодная — третий.',
        failNext: 'logic_fail_long',
        successNext: 'path_logic_sequence_2' 
    },
    path_logic_sequence_2: {
        text: `Первый код введен. Из темноты появляется Зомби-Клерк, его глаза мерцают безумием. Он преграждает путь и протягивает тебе грязную бумажку с новым вопросом. 'SOLVE THIS, OR PERISH!' (Логика 2/3)`,
        type: 'logic_puzzle',
        question: 'Логика 2: Смотрит человек на портрет. И говорит: "У меня нет ни сестер, ни братьев, но отец этого человека – сын моего отца". Чей портрет смотрит человек?',
        correctAnswer: 'Сын этого человека',
        failNext: 'logic_fail_long',
        successNext: 'path_logic_sequence_3' 
    },
    path_logic_sequence_3: {
        text: `Последний код! Воздух наполнен предчувствием. Ты чувствуешь, что это последний барьер перед неизвестностью. (Логика 3/3)`,
        type: 'logic_puzzle',
        question: 'Логика 3 (Z-Тематика): Кирпич весит 1 кг плюс пол-кирпича. Сколько весит зомби-мозг, если он в 10 раз тяжелее кирпича?',
        correctAnswer: '20 кг',
        failNext: 'logic_fail_long',
        successNext: 'path_encounter_1' 
    },
    logic_fail_long: {
        text: `Провал логики! Зомби-Клерк издает пронзительный вой, активируя сигнализацию. -1 Жизнь и -15 минут времени. 'YOU ARE DOOMED!'. Ты бежишь через темную шахту, пытаясь оторваться.`,
        effect: { lives: -1, time: -900 },
        choices: [
            { text: "➡️ Идти к обходному маршруту", next: "final_stage_fail" }
        ]
    },


    // --- НОВАЯ СЕКЦИЯ: ВЕТВЛЕНИЕ РЕАЛЬНОСТИ (Находка людей) ---
    path_encounter_1: {
        text: `Ты открываешь дверь и замираешь. Перед тобой не зомби, а живой человек! Девушка, раненная, ее глаза полны отчаяния. Она шепчет: 'Help me... please...'. За ее спиной слышны тяжелые шаги Зомби-Гладиатора. 'WHAT DO YOU DO?'`,
        type: 'decision_scenario',
        choices: [
            { 
                text: "🤝 Помочь Лее (Лея дает тебе +1 Жизнь)", 
                effect: { lives: 1, time: -180 }, 
                next: 'path_group_decision' 
            },
            { 
                text: "🏃‍♀️ Использовать Лею как отвлечение и бежать (High Risk/High Reward)", 
                effect: { bonuses: 1, time: 300 }, 
                next: 'path_group_decision_solo' 
            }
        ]
    },
    path_group_decision: {
        text: `Лея выжила! Она благодарит тебя, ее голос дрожит от облегчения, и ведет в небольшое убежище. Там прячется Группа Выживших. Их лидер, хмурый мужчина, смотрит на тебя: 'JOIN US or GO ALONE. Make your choice. Now.'`,
        type: 'decision_scenario',
        choices: [
            { 
                text: "🛡️ Присоединиться к группе (Безопасный маршрут)", 
                effect: { time: -1200 }, 
                next: 'path_group_safe_end' 
            },
            { 
                text: "💨 Использовать их как прикрытие и быстро бежать (RISKY)", 
                effect: { bonuses: -1, time: 300 }, 
                next: 'final_stage_main_short' 
            }
        ]
    },
    path_group_decision_solo: {
        text: `Ты предал Лею, оставив ее на растерзание. Ее крики доносятся из-за спины. Теперь ты совсем один. На следующей развилке ты видишь записку, написанную дрожащей рукой: 'THE HERD IS COMING. They are everywhere.'`,
        type: 'decision_scenario',
        choices: [
            { 
                text: "🐂 Рискнуть и пойти сквозь стадо (Быстро, но опасно)", 
                effect: { lives: -1, bonuses: 1 }, 
                next: 'final_stage_main_short' 
            },
            { 
                text: "🚪 Спрятаться и переждать (Безопасно, но долго)", 
                effect: { time: -900 }, 
                next: 'final_stage_main' 
            }
        ]
    },
    path_group_safe_end: {
        text: `Группа Выживших провела тебя по секретному, но очень длинному маршруту. Ты в относительной безопасности, но потерял много драгоценного времени. Каждый шорох в этих коридорах заставляет сердце сжиматься.`,
        choices: [
            { text: "➡️ Идти к передатчику", next: "final_stage_main" }
        ]
    },

    // --- СЕКЦИЯ "СИТУАЦИОННЫЙ ВЫБОР" (Логика остается прежней) ---
    path_situation_fork: {
        text: `Ты вышел на верхний этаж, но видишь, что единственный путь к передатчику ведет через кухню, где Зомби-Повар готовит (рычит) ужин. На полу лежит Ключ-Карта, который может открыть короткий путь, но Зомби-Повар его охраняет.`,
        type: 'decision_scenario',
        choices: [
            { 
                text: "🏃‍♀️ Отвлечь Повара, бросив гранату (если есть бонусы)", 
                effect: { bonuses: -1, time: 600 }, 
                next: 'path_situation_success'
            },
            { 
                text: "🔪 Прокрасться мимо, используя тени (очень рискованно)", 
                effect: { lives: -1, time: -300 }, 
                next: 'path_situation_fail_long'
            },
            {
                text: "🗣️ Спросить Зомби-Повара, как он готовит свой фирменный 'мозг' (глупый прикол)",
                effect: { time: -1200 }, 
                next: 'mid_junction'
            }
        ]
    },
    path_situation_success: {
        text: `Если у тебя был Бонус, он сработал! Взрыв отвлек Повара, и ты нашел Ключ-Карту. Ты сэкономил много времени!`,
        choices: [
            { text: "➡️ Использовать Ключ-Карту", next: "final_stage_main_short" }
        ]
    },
    path_situation_fail_long: {
        text: `Повар заметил твою тень. Он не успевает укусить, но ты теряешь равновесие. -1 Жизнь и -10 минут на обход.`,
        effect: { lives: -1, time: -600 },
        choices: [
            { text: "➡️ Идти на крышу (запыхавшись)", next: "final_stage_main" }
        ]
    },
    
    // --- ОБХОДНЫЕ ПУТИ (Логика остается прежней) ---
    path_alt_vent: {
        text: `Ты ползешь по вентиляции. Она ведет в Секретную комнату! Там Зомби-Хакер оставил тебе записку: «Чтобы выбраться, реши, что будет, если два зомби-курьера столкнутся на скорости света?»`,
        type: 'logic_puzzle',
        question: 'Логика: Что произойдет, если два зомби столкнутся, каждый из которых бежит со скоростью 99% скорости света, если их мозг весит 1 кг?',
        correctAnswer: 'Они создадут мини-черную дыру.',
        failNext: 'final_stage_fail_long',
        successNext: 'final_stage_main_short'
    },
    path_alt_hole: {
        text: `Ты пробил стену и нашел Потайной арсенал. Ты берешь мощную гранату (+2 Бонуса), но на стене нарисована головоломка.`,
        effect: { bonuses: 2 },
        type: 'logic_puzzle',
        question: 'Логика: У тебя есть 10 зомби. Как разделить их на две группы, чтобы в каждой было по 6 зомби?',
        correctAnswer: 'Разделить на 2 группы по 5, затем поместить одного зомби в обе группы.',
        failNext: 'final_stage_fail_long',
        successNext: 'final_stage_main_short'
    },


    // --- ФИНАЛЬНЫЕ СЦЕНЫ (Остаются прежними) ---
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
        effect: { time: -900 }, 
        choices: [
            { text: "➡️ Идти на крышу (запыхавшись)", next: "final_stage_main" }
        ]
    },
    final_stage_fail_long: {
        text: `Обходной путь оказался ловушкой! Ты потратил полчаса в темноте, а зомби грызли дверь. -1 Жизнь и -30 минут времени!`,
        effect: { lives: -1, time: -1800 }, 
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

// --- 3. Функции Игры (Адаптированные для многоязычности и напряженности) ---

function updateStats() {
    // ВАЖНО: Предполагается, что в HTML есть элементы с id: 'lives-label', 'bonuses-label', 'timer-label'
    if (document.getElementById('lives-label')) {
        document.getElementById('lives-label').textContent = gameState.labels.livesTitle;
        document.getElementById('bonuses-label').textContent = gameState.labels.bonusesTitle;
        document.getElementById('timer-label').textContent = gameState.labels.timerTitle;
    }

    DOMElements.lives.textContent = gameState.lives;
    DOMElements.bonuses.textContent = gameState.bonuses;
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
    } else if (step.type === 'final_check') {
        renderFinalCheck();
    } else if (step.choices) {
        step.choices.forEach(choice => {
            const button = document.createElement('button');
            button.className = 'choice-button';
            button.textContent = choice.text;
            
            button.addEventListener('click', () => {
                // ПРОВЕРКА ДЛЯ СИТУАЦИОННОГО ВЫБОРА (Проверка бонусов на гранату)
                if (stepKey === 'path_situation_fork' && choice.text.includes('Отвлечь Повара')) {
                    if (gameState.bonuses < 1) {
                        alert('NO GRENADE! Insufficient bonuses to throw grenade! You waste time searching for another path.');
                        gameState.currentTime -= 180; 
                        updateStats();
                        goToStep('mid_junction'); 
                        return;
                    }
                }
                
                // Применяем эффекты при клике
                if (choice.effect) {
                    if (choice.effect.lives) { gameState.lives += choice.effect.lives; }
                    if (choice.effect.bonuses) { gameState.bonuses += choice.effect.bonuses; }
                    if (choice.effect.time) { gameState.currentTime += choice.effect.time; }
                    updateStats();
                }
                goToStep(choice.next);
            });
            DOMElements.choicesContainer.appendChild(button);
        });
    }
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
            const failKey = Object.values(step.answers).find(a => a.next.includes('_fail')).next;
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
            
            if (answer.next.includes('_fail')) {
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
        
        const isCorrect = answer.includes(correctNorm.split(' ')[0]) || answer.includes(correctNorm);

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

/**
 * Обработка финальной проверки кода.
 */
function renderFinalCheck() {
    const gameContainer = document.createElement('div');
    gameContainer.className = 'mini-game-container';
    
    const requiredCode = (gameState.bonuses + gameState.lives) * 10;
    
    gameContainer.innerHTML = `
        <h3>🔑 FINAL CODE | קוד סופי</h3>
        <p>Code = (Bonuses + Lives) * 10. У тебя ${gameState.bonuses} бонусов и ${gameState.lives} жизней.</p>
        <input type="number" id="final-code" placeholder="Enter Code (e.g., ${requiredCode})" class="quest-input">
        <button id="submit-final" class="quest-button">Activate / הפעל</button>
        <p id="feedback-final"></p>
    `;
    DOMElements.choicesContainer.appendChild(gameContainer);

    document.getElementById('submit-final').onclick = () => {
        const answer = parseInt(document.getElementById('final-code').value);
        const feedback = document.getElementById('feedback-final');
        
        if (answer === requiredCode) {
            feedback.className = 'correct';
            feedback.textContent = gameState.labels.correct + ' CODE ACCEPTED! THE SIGNAL IS READY!';
            setTimeout(() => goToStep('game_win'), 1500);
        } else {
            feedback.className = 'incorrect';
            feedback.textContent = gameState.labels.incorrect + ` CODE ERROR! TIME LOST.`;
            gameState.currentTime -= 60; 
            updateStats();
        }
    };
}


function endGame(outcome) {
    clearInterval(gameState.timerInterval);
    DOMElements.overlay.classList.remove('hidden');

    if (outcome === 'game_win') {
        const timeSpent = gameState.timeLimit - gameState.currentTime;
        const finalTime = formatTime(timeSpent);
        DOMElements.overlayTitle.textContent = "🏆 VICTORY! SIGNAL SENT | ניצחון 🏆";
        DOMElements.overlayText.innerHTML = `You survived in <span class="correct">${finalTime}</span>.<br>Bonuses collected: ${gameState.bonuses}.`;
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    } else {
        DOMElements.overlayTitle.textContent = "☠️ GAME OVER | הסוף ☠️";
        DOMElements.overlayText.innerHTML = "You ran out of time or became one of them. Try again.";
        DOMElements.restartButton.textContent = gameState.labels.restartButton;
    }
}

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
