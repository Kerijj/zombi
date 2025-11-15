const gameData = {
  start_node: "scene_corridor",
  chapters: {
    // ======================= Сцена 1: Коридор =======================
    scene_corridor: {
      type: "text",
      text: "🏫 Коридор школы. Вижу странную фигуру. 🧟 Что делать?",
      options: [
        { text: "👀 Подойти ближе", next: "corridor_approach" },
        { text: "🙈 Спрятаться в шкафчик", next: "corridor_hide" },
        { text: "🏃 Побежать к классу", next: "scene_classroom" }
      ]
    },
    corridor_hide: {
      type: "text",
      text: "Ты прячешься. Зомби проходит мимо. Вроде безопасно.",
      options: [{ text: "🚪 Выйти и подойти", next: "corridor_approach" }]
    },
    corridor_approach: {
      type: "minigame_memory",
      text: "🔍 Найди пары зомби-эмодзи! 20 карточек.",
      task: {
        cards: [
          {id:1,emoji:"🧟"}, {id:2,emoji:"🧟‍♂️"}, {id:3,emoji:"🧟‍♀️"}, {id:4,emoji:"🧟"},
          {id:5,emoji:"🧟‍♂️"}, {id:6,emoji:"🧟‍♀️"}, {id:7,emoji:"🧟"}, {id:8,emoji:"🧟‍♂️"},
          {id:9,emoji:"🧟‍♀️"}, {id:10,emoji:"🧟"}, {id:11,emoji:"🧟‍♂️"}, {id:12,emoji:"🧟‍♀️"},
          {id:13,emoji:"🧟"}, {id:14,emoji:"🧟‍♂️"}, {id:15,emoji:"🧟‍♀️"}, {id:16,emoji:"🧟"},
          {id:17,emoji:"🧟‍♂️"}, {id:18,emoji:"🧟‍♀️"}, {id:19,emoji:"🧟"}, {id:20,emoji:"🧟‍♂️"}
        ]
      },
      next: "scene_classroom"
    },

    // ======================= Сцена 2: Класс =======================
    scene_classroom: {
      type: "minigame_translate",
      text: "📖 Переведи сложные слова с иврита (5 слов).",
      task: {
        words:[
          {hebrew:"אחריות", translation:"ответственность"},
          {hebrew:"כעס", translation:"злость"},
          {hebrew:"אני בדרך", translation:"Я в пути!"},
          {hebrew:"חירות", translation:"свобода"},
          {hebrew:"יצירתיות", translation:"креативность"}
        ]
      },
      next: "class_question1"
    },

    class_question1: {
      type:"text",
      text:"❓ В классе горит свет. Кто первым поднимает руку?",
      options:[
        {text:"👩‍🏫 Учитель", next:"class_question2"},
        {text:"🧟 Зомби-ученик", next:"class_question2"}
      ]
    },
    class_question2: {
      type:"text",
      text:"❓ Логический вопрос: если все зомби в классе равны, а один зомби не равен, то?",
      options:[
        {text:"Ошибка в системе", next:"class_question3"},
        {text:"Зомби мутация", next:"class_question3"}
      ]
    },
    class_question3: {
      type:"text",
      text:"❓ Исторический: какой первый город был основан на территории Израиля?",
      options:[
        {text:"Иерусалим", next:"class_question4"},
        {text:"Тель-Авив", next:"class_question4"}
      ]
    },
    class_question4: {
      type:"text",
      text:"❓ Математика: Если z+5=10, z=?",
      options:[
        {text:"5", next:"class_question5"},
        {text:"15", next:"class_question5"}
      ]
    },
    class_question5: {
      type:"text",
      text:"❓ Выбор: спасти зомби или закрыть дверь?",
      options:[
        {text:"💖 Спасти зомби", next:"scene_gym"},
        {text:"🚪 Закрыть дверь", next:"scene_gym"}
      ]
    },

    // ======================= Сцена 3: Спортзал =======================
    scene_gym: {
      type:"minigame_match3",
      text:"🏀⚽🏐 Match-3: убери все одинаковые эмодзи, чтобы открыть путь.",
      task:{symbols:["⚽","🏀","🏐","⚽","🏀","🏐","⚽","🏀","🏐"]},
      next:"gym_question1"
    },

    gym_question1:{type:"text", text:"❓ Логика: Если мяч круглый и красный, он...", options:[{text:"красный круг", next:"gym_question2"},{text:"синий квадрат", next:"gym_question2"}]},
    gym_question2:{type:"text", text:"❓ Физика: сила тяжести влияет на?", options:[{text:"объекты", next:"gym_question3"},{text:"свет", next:"gym_question3"}]},
    gym_question3:{type:"text", text:"❓ География: самая высокая гора в Израиле?", options:[{text:"Хермон", next:"gym_question4"},{text:"Кармель", next:"gym_question4"}]},
    gym_question4:{type:"text", text:"❓ Математика: 7*8=?", options:[{text:"56", next:"gym_question5"},{text:"58", next:"gym_question5"}]},
    gym_question5:{type:"text", text:"❓ Выбор: пойти к кухне или актовому залу?", options:[{text:"🍳 Кухня", next:"scene_kitchen"},{text:"🎭 Актовый зал", next:"scene_hall"}]},

    // ======================= Сцена 4: Кухня =======================
    scene_kitchen: {
      type:"text",
      text:"🍳 Кухня. Вижу зомби-шефа. Что делать?",
      options:[
        {text:"🧑‍🍳 Помочь готовить", next:"kitchen_question1"},
        {text:"🚶‍♀️ Уйти тихо", next:"kitchen_question1"}
      ]
    },
    kitchen_question1:{type:"text", text:"❓ Логика: если ингредиенты равны, что получится?", options:[{text:"Суп", next:"kitchen_question2"},{text:"Торт", next:"kitchen_question2"}]},
    kitchen_question2:{type:"text", text:"❓ Химия: Вода + соль = ?", options:[{text:"Соленая вода", next:"kitchen_question3"},{text:"Сахарная вода", next:"kitchen_question3"}]},
    kitchen_question3:{type:"text", text:"❓ Знание кухни: главный ингредиент борща?", options:[{text:"Свекла", next:"kitchen_question4"},{text:"Картофель", next:"kitchen_question4"}]},
    kitchen_question4:{type:"text", text:"❓ Логика: если нож острый, резать будет?", options:[{text:"Легко", next:"kitchen_question5"},{text:"Сложно", next:"kitchen_question5"}]},
    kitchen_question5:{type:"text", text:"❓ Выбор: спасти зомби-шефа или уйти?", options:[{text:"💖 Спасти", next:"scene_hall"},{text:"🚶‍♀️ Уйти", next:"scene_hall"}]},

    // ======================= Сцена 5: Актовый зал =======================
    scene_hall: {
      type:"minigame_puzzle",
      text:"🎭 Собери предметы в актовом зале.",
      task:{items:["🔴 кнопка RESET","🗝️ ключ","🥚 пасхалка"]},
      options:[
        {text:"🔴 Нажать кнопку", next:"ending_good"},
        {text:"⛔ Не нажимать", next:"ending_funny"},
        {text:"🗝️ Использовать ключ", next:"ending_secret"}
      ]
    },

    // ======================= Концы =======================
    ending_good: {type:"end", text:"🎉 Все зомби становятся обычными людьми. Ты — герой дня!"},
    ending_funny: {type:"end", text:"😂 Ты оставила всё как есть. Зомби оказались милее обычных!"},
    ending_secret: {type:"end", text:"🕵️‍♀️ Ты открыла секретный уровень! Бонусные очки собраны!"}
  }
};

let currentNode = gameData.start_node;

const sceneTitle = document.getElementById("scene-title");
const minigameContainer = document.getElementById("minigame-container");
const taskDesc = document.getElementById("task-desc");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");

let memoryFlipped = [];
let memoryMatched = [];
let minigameCompleted = false;

// ----------------- Функция загрузки сцены -----------------
function loadNode(nodeId){
  minigameContainer.innerHTML = "";
  optionsContainer.innerHTML = "";
  taskDesc.innerText = "";
  nextBtn.style.display = "none";
  minigameCompleted = false;
  memoryFlipped = [];
  memoryMatched = [];

  const node = gameData.chapters[nodeId];
  currentNode = nodeId;

  if(node.text) taskDesc.innerText = node.text;

  if(node.type === "end"){ taskDesc.innerText = node.text; return; }

  if(node.options){
    node.options.forEach(opt=>{
      const btn=document.createElement("button");
      btn.innerText=opt.text;
      btn.classList.add("btn");
      btn.onclick=()=>loadNode(opt.next);
      optionsContainer.appendChild(btn);
    });
  }

  // ----------------- Мини-игры -----------------
  if(node.type.startsWith("minigame")){
    nextBtn.style.display="block";
    nextBtn.disabled=true;

    nextBtn.onclick=()=>{
      if(minigameCompleted){ loadNode(node.next); }
      else{ alert("Сначала завершите задание!"); }
    };

    // ================ Memory ================
    if(node.type==="minigame_memory"){
      node.task.cards.forEach(card=>{
        const c=document.createElement("div");
        c.classList.add("card"); c.style.fontSize="40px"; c.innerText="❓";
        c.dataset.emoji=card.emoji;
        c.dataset.id=card.id;
        c.onclick=()=>{
          if(memoryFlipped.length<2 && !memoryMatched.includes(card.id)){
            c.innerText=card.emoji; memoryFlipped.push({cardId:card.id, element:c});
            if(memoryFlipped.length===2){
              if(memoryFlipped[0].cardId===memoryFlipped[1].cardId){
                memoryMatched.push(card.id); memoryFlipped.forEach(f=>f.element.style.backgroundColor="#00ff99"); memoryFlipped=[];
                if(memoryMatched.length===node.task.cards.length/2){ minigameCompleted=true; nextBtn.disabled=false; }
              } else { setTimeout(()=>{memoryFlipped.forEach(f=>f.element.innerText="❓"); memoryFlipped=[];},500); }
            }
          }
        };
        minigameContainer.appendChild(c);
      });
    }

    // ================ Translate ================
    if(node.type==="minigame_translate"){
      const inputs=[];
      node.task.words.forEach((w,i)=>{
        const p=document.createElement("p");
        p.innerHTML=`${w.hebrew} → <input type="text" data-index="${i}" />`;
        minigameContainer.appendChild(p); inputs.push(p.querySelector("input"));
      });
      const checkBtn=document.createElement("button");
      checkBtn.innerText="Проверить"; checkBtn.classList.add("btn");
      checkBtn.onclick=()=>{
        let correct=true;
        inputs.forEach((input,i)=>{ if(input.value.trim()!==node.task.words[i].translation) correct=false; });
        if(correct){ alert("Правильно!"); minigameCompleted=true; nextBtn.disabled=false; }
        else alert("Неправильно, попробуй ещё раз!");
      };
      minigameContainer.appendChild(checkBtn);
    }

    // ================ Match3 ================
    if(node.type==="minigame_match3"){
      let selectedMatch=[];
      node.task.symbols.forEach(s=>{
        const t=document.createElement("div"); t.classList.add("match3-tile"); t.style.fontSize="40px"; t.innerText=s;
        t.onclick=()=>{
          selectedMatch.push(t);
          if(selectedMatch.length===3){
            const values=selectedMatch.map(e=>e.innerText);
            if(values.every(v=>v===values[0])){
              selectedMatch.forEach(e=>e.style.visibility="hidden");
              if([...minigameContainer.querySelectorAll(".match3-tile")].every(e=>e.style.visibility==="hidden")){
                minigameCompleted=true; nextBtn.disabled=false;
              }
            }
            selectedMatch=[];
          }
        };
        minigameContainer.appendChild(t);
      });
    }

    // ================ Puzzle ================
    if(node.type==="minigame_puzzle"){
      node.task.items.forEach(i=>{
        const t=document.createElement("div"); t.classList.add("card"); t.style.fontSize="30px"; t.innerText=i;
        t.onclick=()=>{
          t.style.visibility="hidden";
          if([...minigameContainer.querySelectorAll(".card")].every(e=>e.style.visibility==="hidden")){ minigameCompleted=true; nextBtn.disabled=false; }
        };
        minigameContainer.appendChild(t);
      });
    }
  }
}

loadNode(currentNode);
