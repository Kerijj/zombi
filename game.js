const gameData = {
  start_node: "scene_corridor",
  chapters: {

    // ======================= Сцена 1: Коридор =======================
    scene_corridor: {
      type: "minigame_logic",
      text: "🧩 Логическая задача: выбери правильный символ, который завершает последовательность: 🔴⚪🔴⚪ ?",
      task: {
        options: [
          {text:"🔴", correct:true},
          {text:"⚪", correct:false},
          {text:"🔵", correct:false},
          {text:"🟢", correct:false}
        ]
      },
      next: "corridor_question1"
    },
    corridor_question1: {type:"text", text:"❓ В коридоре ты видишь зомби-ученика. Пойти к нему или спрятаться?", options:[{text:"👣 Подойти", next:"corridor_question2"},{text:"🚪 Спрятаться", next:"corridor_question2"}]},
    corridor_question2: {type:"text", text:"❓ Логическая задача: если три двери закрыты, а одна открыта, что делать?", options:[{text:"Открыть", next:"corridor_question3"},{text:"Обойти", next:"corridor_question3"}]},
    corridor_question3: {type:"text", text:"❓ Вопрос по культуре: кто автор 'Гамлета'?", options:[{text:"Шекспир", next:"corridor_question4"},{text:"Достоевский", next:"corridor_question4"}]},
    corridor_question4: {type:"text", text:"❓ Математика: 12*8=?", options:[{text:"96", next:"corridor_question5"},{text:"88", next:"corridor_question5"}]},
    corridor_question5: {type:"text", text:"❓ Выбор: спасти зомби или продолжить путь?", options:[{text:"💖 Спасти", next:"scene_classroom"},{text:"➡️ Продолжить путь", next:"scene_classroom"}]},

    // ======================= Сцена 2: Класс =======================
    scene_classroom: {type:"minigame_translate", text:"📖 Переведи сложные слова с иврита (5 слов).", task:{words:[
      {hebrew:"אחריות", translation:"ответственность"},
      {hebrew:"כעס", translation:"злость"},
      {hebrew:"אני בדרך", translation:"Я в пути!"},
      {hebrew:"חירות", translation:"свобода"},
      {hebrew:"יצירתיות", translation:"креативность"}
    ]}, next:"class_question1"},
    class_question1: {type:"text", text:"❓ Логика: если все зомби равны, а один нет?", options:[{text:"Ошибка в системе", next:"class_question2"},{text:"Зомби мутация", next:"class_question2"}]},
    class_question2: {type:"text", text:"❓ История: первый город Израиля?", options:[{text:"Иерусалим", next:"class_question3"},{text:"Тель-Авив", next:"class_question3"}]},
    class_question3: {type:"text", text:"❓ Наука: вода замерзает при?", options:[{text:"0°C", next:"class_question4"},{text:"100°C", next:"class_question4"}]},
    class_question4: {type:"text", text:"❓ Математика: x+15=45, x=?", options:[{text:"30", next:"class_question5"},{text:"25", next:"class_question5"}]},
    class_question5: {type:"text", text:"❓ Выбор пути: пойти в спортзал или кухню?", options:[{text:"🏋️‍♂️ Спортзал", next:"scene_gym"},{text:"🍳 Кухня", next:"scene_kitchen"}]},

    // ======================= Сцена 3: Спортзал =======================
    scene_gym: {type:"minigame_match3", text:"🏀 Match-3: убери все одинаковые эмодзи.", task:{symbols:["⚽","🏀","🏐","⚽","🏀","🏐","⚽","🏀","🏐"]}, next:"gym_question1"},
    gym_question1: {type:"text", text:"❓ Логика: если мяч круглый и красный, он?", options:[{text:"красный круг", next:"gym_question2"},{text:"синий квадрат", next:"gym_question2"}]},
    gym_question2: {type:"text", text:"❓ Физика: сила тяжести влияет на?", options:[{text:"объекты", next:"gym_question3"},{text:"свет", next:"gym_question3"}]},
    gym_question3: {type:"text", text:"❓ География: самая высокая гора в Израиле?", options:[{text:"Хермон", next:"gym_question4"},{text:"Кармель", next:"gym_question4"}]},
    gym_question4: {type:"text", text:"❓ Математика: 7*9=?", options:[{text:"63", next:"gym_question5"},{text:"72", next:"gym_question5"}]},
    gym_question5: {type:"text", text:"❓ Выбор: пойти к кухне или актовому залу?", options:[{text:"🍳 Кухня", next:"scene_kitchen"},{text:"🎭 Актовый зал", next:"scene_hall"}]},

    // ======================= Сцена 4: Кухня =======================
    scene_kitchen: {type:"text", text:"🍳 Кухня. Видишь зомби-шефа. Что делать?", options:[{text:"🧑‍🍳 Помочь готовить", next:"kitchen_question1"},{text:"🚶‍♀️ Уйти тихо", next:"kitchen_question1"}]},
    kitchen_question1:{type:"text", text:"❓ Логика: если ингредиенты равны, что получится?", options:[{text:"Суп", next:"kitchen_question2"},{text:"Торт", next:"kitchen_question2"}]},
    kitchen_question2:{type:"text", text:"❓ Химия: вода + соль = ?", options:[{text:"Соленая вода", next:"kitchen_question3"},{text:"Сахарная вода", next:"kitchen_question3"}]},
    kitchen_question3:{type:"text", text:"❓ Кулинария: главный ингредиент борща?", options:[{text:"Свекла", next:"kitchen_question4"},{text:"Картофель", next:"kitchen_question4"}]},
    kitchen_question4:{type:"text", text:"❓ Логика: если нож острый, резать будет?", options:[{text:"Легко", next:"kitchen_question5"},{text:"Сложно", next:"kitchen_question5"}]},
    kitchen_question5:{type:"text", text:"❓ Выбор: спасти зомби-шефа или уйти?", options:[{text:"💖 Спасти", next:"scene_hall"},{text:"🚶‍♀️ Уйти", next:"scene_hall"}]},

    // ======================= Сцена 5: Актовый зал =======================
    scene_hall: {type:"minigame_puzzle", text:"🎭 Собери предметы в актовом зале.", task:{items:["🔴 кнопка RESET","🗝️ ключ","🥚 пасхалка"]}, options:[
      {text:"🔴 Нажать кнопку", next:"ending_good"},
      {text:"⛔ Не нажимать", next:"ending_funny"},
      {text:"🗝️ Использовать ключ", next:"ending_secret"}
    ]},

    // ======================= Концы =======================
    ending_good: {type:"end", text:"🎉 Все зомби становятся обычными людьми. Ты — герой дня!"},
    ending_funny: {type:"end", text:"😂 Ты оставила всё как есть. Зомби оказались милее обычных!"},
    ending_secret: {type:"end", text:"🕵️‍♀️ Ты открыла секретный уровень! Бонусные очки собраны!"}
  }
};
