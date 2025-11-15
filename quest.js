{
  "start_node": "main_screen",
  "chapters": {
    "main_screen": {
      "type": "text",
      "text": "🏫 Добро пожаловать в школу! Здесь что-то явно не так…\n\nВ коридорах мелькают странные фигуры — зомби-ученики! Тебе предстоит пройти через школу, решить головоломки и выбрать свой путь. Сможешь ли ты спасти школу? 🧟‍♀️",
      "options": [{"text": "▶ Начать квест", "next": "scene_corridor_step1"}]
    },
    "scene_corridor_step1": {
      "type": "text",
      "text": "🚶‍♀️ Ты заходишь в коридор. Вижу зомби-ученика! Что делать?",
      "options": [
        {"text":"🏃‍♀️ Бежать в обход","next":"corridor_step2_run"},
        {"text":"🚪 Прятаться в шкафчик","next":"corridor_step2_hide"},
        {"text":"💥 Подойти и поговорить","next":"corridor_step2_talk"}
      ]
    },
    "corridor_step2_run": {"type":"minigame_logic","text":"🧩 Логическая задача: последовательность 🔴⚪🔴⚪ ?","task":{"options":[{"text":"🔴","correct":true},{"text":"⚪","correct":false},{"text":"🔵","correct":false},{"text":"🟢","correct":false}]},"next":"corridor_step3"},
    "corridor_step2_hide": {"type":"minigame_logic","text":"🧠 Логическая задача: если A>B и B>C, что верно?","task":{"options":[{"text":"A>C","correct":true},{"text":"C>A","correct":false},{"text":"B>A","correct":false}]},"next":"corridor_step3"},
    "corridor_step2_talk": {"type":"text","text":"❓ Зомби говорит странные слова. Варианты?","options":[{"text":"Помочь","next":"corridor_step3"},{"text":"Игнорировать","next":"corridor_step3"}]},
    "corridor_step3": {"type":"text","text":"❓ В коридоре ещё один зомби. Бежать или прятаться?","options":[{"text":"🏃‍♀️ Бежать дальше","next":"scene_classroom_step1"},{"text":"🚪 Прятаться","next":"scene_classroom_step1"}]},

    "scene_classroom_step1": {"type":"text","text":"📚 Ты входишь в класс. На столе лежат книги. Действия?","options":[{"text":"📖 Проверить книги","next":"class_step2_logic"},{"text":"💬 Поговорить с учеником-зомби","next":"class_step2_translate"},{"text":"🚶‍♀️ Игнорировать","next":"class_step2_puzzle"}]},
    "class_step2_logic":{"type":"minigame_logic","text":"🧩 Логическая задача: лишнее число 2,4,8,16,31?","task":{"options":[{"text":"31","correct":true},{"text":"16","correct":false}]},"next":"class_step3"},
    "class_step2_translate":{"type":"minigame_translate","text":"📖 Переведи слова с иврита: אחריות, כעס, אני בדרך","task":{"words":[{"hebrew":"אחריות","translation":"ответственность"},{"hebrew":"כעס","translation":"злость"},{"hebrew":"אני בדרך","translation":"Я в пути!"}]},"next":"class_step3"},
    "class_step2_puzzle":{"type":"minigame_puzzle","text":"🔧 Собери предметы на столе","task":{"items":["📓 тетрадь","🖊️ ручка","📚 книга"]},"next":"class_step3"},
    "class_step3":{"type":"minigame_match3","text":"🏀 Match-3: убери все одинаковые эмодзи","task":{"symbols":["⚽","🏀","🏐","⚽","🏀","🏐","⚽","🏀","🏐"]},"next":"class_step4"},
    "class_step4":{"type":"minigame_path","text":"🚦 Выбор: пойти в спортзал или кухню","task":{"paths":[{"text":"🏋️‍♂️ Спортзал","next":"scene_gym_step1"},{"text":"🍳 Кухня","next":"scene_kitchen_step1"}]}}
  }
}
