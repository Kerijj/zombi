const gameData = {
  start_node: "chapter1_intro",
  chapters: {
    chapter1_intro: {
      type: "text",
      image: "images/corridor_comic_pixel.png",
      text: "Ты заходишь в школу… что-то явно не так. В коридоре пусто, а впереди мелькает странная фигура. BAM! Зомби-ученик!",
      options: [
        { text: "Подойти ближе", next: "chapter1_meet_zombie" },
        { text: "Спрятаться в шкафчик", next: "chapter1_hide" }
      ]
    },
    chapter1_hide: {
      type: "text",
      text: "Ты прячешься в шкафчике, зомби ничего не замечает.",
      options: [{ text: "Выйти и подойти", next: "chapter1_meet_zombie" }]
    },
    chapter1_meet_zombie: {
      type: "minigame_memory",
      image: "images/classroom_zombies_pixel.png",
      text: "Найди пары зомби-карт! Найди все совпадения, чтобы зомби доверился тебе.",
      task: {
        cards: [
          { id: 1, image: "images/zombie1.png" },
          { id: 2, image: "images/zombie2.png" },
          { id: 3, image: "images/zombie3.png" },
          { id: 4, image: "images/zombie1.png" },
          { id: 5, image: "images/zombie2.png" },
          { id: 6, image: "images/zombie3.png" }
        ]
      },
      next: "chapter2_classroom"
    },
    chapter2_classroom: {
      type: "minigame_translate",
      image: "images/translate_comic.png",
      text: "Переведи сложные слова с иврита, чтобы открыть дверь класса.",
      task: {
        words: [
          { hebrew: "תלמידה", translation: "ученица" },
          { hebrew: "מורה", translation: "учитель" },
          { hebrew: "מבחן", translation: "экзамен" }
        ]
      },
      next: "chapter3_gym"
    },
    chapter3_gym: {
      type: "minigame_match3",
      image: "images/gym_match3_pixel.png",
      text: "Нажимай на три одинаковых мячика, чтобы убрать их и открыть путь в спортзал.",
      task: { symbols: ["⚽","🏀","🏐"] },
      next: "chapter4_kitchen"
    },
    chapter4_kitchen: {
      type: "minigame_message",
      image: "images/kitchen_zombies_cartoon.png",
      text: "Составь сообщение о помощи директору, используя все слова.",
      task: { words: ["Помогите","Срочно","Школа","Зомби"] },
      next: "chapter5_final"
    },
    chapter5_final: {
      type: "minigame_puzzle",
      image: "images/final_hall_pixel_comic.png",
      text: "Собери предметы и выбери финальный путь!",
      task: { items: ["кнопка RESET","ключ","пасхалка"] },
      options: [
        { text: "Нажать кнопку", next: "ending_good" },
        { text: "Не нажимать", next: "ending_funny" },
        { text: "Использовать ключ", next: "ending_secret" }
      ]
    },
    ending_good: { type: "end", text: "Все зомби становятся обычными людьми. Ты — герой дня!" },
    ending_funny: { type: "end", text: "Ты оставила всё как есть. Зомби оказались милее обычных!" },
    ending_secret: { type: "end", text: "Ты открыла секретный уровень! Бонусные очки собраны!" }
  }
};

let currentNode = gameData.start_node;

const sceneTitle = document.getElementById("scene-title");
const sceneImg = document.getElementById("scene-img");
const minigameContainer = document.getElementById("minigame-container");
const taskDesc = document.getElementById("task-desc");
const optionsContainer = document.getElementById("options-container");
const nextBtn = document.getElementById("next-btn");

let memoryFlipped = [];
let memoryMatched = [];
let minigameCompleted = false;

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

  if(node.image) sceneImg.src = node.image;
  if(node.text) taskDesc.innerText = node.text;

  // Конец игры
  if(node.type === "end"){
    taskDesc.innerText = node.text;
    return;
  }

  // Опции выбора
  if(node.options){
    node.options.forEach(opt=>{
      const btn = document.createElement("button");
      btn.innerText = opt.text;
      btn.classList.add("btn");
      btn.onclick = ()=>{
        loadNode(opt.next); // переход по выбранной ветке
      };
      optionsContainer.appendChild(btn);
    });
  }

  // Мини-игры
  if(node.type.startsWith("minigame")){
    nextBtn.style.display = "block";
    nextBtn.disabled = true; // блокируем кнопку "Далее"

    nextBtn.onclick = ()=>{
      if(minigameCompleted){
        loadNode(node.next);
      } else {
        alert("Сначала завершите задание!");
      }
    };

    switch(node.type){
      case "minigame_memory":
        node.task.cards.forEach(card=>{
          const c = document.createElement("div"); c.classList.add("card");
          const img = document.createElement("img"); img.src = card.image; img.dataset.id = card.id; img.style.visibility="hidden";
          c.appendChild(img);
          c.onclick = ()=>{
            if(memoryFlipped.length<2 && !memoryMatched.includes(card.id)){
              img.style.visibility="visible";
              memoryFlipped.push({cardId:card.id, element:img});
              if(memoryFlipped.length===2){
                if(memoryFlipped[0].cardId===memoryFlipped[1].cardId){
                  memoryMatched.push(card.id);
                  memoryFlipped = [];
                  if(memoryMatched.length === node.task.cards.length / 2){
                    minigameCompleted = true;
                    nextBtn.disabled = false;
                  }
                } else {
                  setTimeout(()=>{memoryFlipped.forEach(f=>f.element.style.visibility="hidden"); memoryFlipped=[];},500);
                }
              }
            }
          };
          minigameContainer.appendChild(c);
        });
        break;

      case "minigame_translate":
        const inputs = [];
        node.task.words.forEach((w,i)=>{
          const p = document.createElement("p");
          p.innerHTML = `${w.hebrew} → <input type="text" data-index="${i}" />`;
          minigameContainer.appendChild(p);
          inputs.push(p.querySelector("input"));
        });
        const checkBtn = document.createElement("button");
        checkBtn.innerText = "Проверить";
        checkBtn.classList.add("btn");
        checkBtn.onclick = ()=>{
          let correct = true;
          inputs.forEach((input,i)=>{
            if(input.value.trim() !== node.task.words[i].translation){
              correct = false;
            }
          });
          if(correct){
            alert("Правильно!");
            minigameCompleted = true;
            nextBtn.disabled = false;
          } else alert("Неправильно. Попробуй снова!");
        };
        minigameContainer.appendChild(checkBtn);
        break;

      case "minigame_match3":
        let selectedMatch=[];
        node.task.symbols.forEach(s=>{
          const t=document.createElement("div"); t.classList.add("match3-tile"); t.innerText=s;
          t.onclick = ()=>{
            selectedMatch.push(t);
            if(selectedMatch.length===3){
              const values = selectedMatch.map(e=>e.innerText);
              if(values.every(v=>v===values[0])){
                selectedMatch.forEach(e=>e.style.visibility="hidden");
                if([...minigameContainer.querySelectorAll(".match3-tile")].every(e=>e.style.visibility==="hidden")){
                  minigameCompleted = true;
                  nextBtn.disabled = false;
                }
              }
              selectedMatch=[];
            }
          };
          minigameContainer.appendChild(t);
        });
        break;

      case "minigame_message":
        const tiles = [];
        node.task.words.forEach(w=>{
          const t=document.createElement("div"); t.classList.add("word-tile"); t.innerText=w; t.draggable=true;
          t.ondragstart = e=>{ t.classList.add("dragging"); e.dataTransfer.setData("text",w); };
          t.ondragend = e=>t.classList.remove("dragging");
          minigameContainer.appendChild(t);
          tiles.push(t);
        });

        const dropZone = document.createElement("div");
        dropZone.style.border="2px dashed #ffcc00";
        dropZone.style.height="50px";
        dropZone.style.marginTop="10px";
        dropZone.ondragover = e=>e.preventDefault();
        dropZone.ondrop = e=>{
          const text = e.dataTransfer.getData("text");
          const t = tiles.find(tile=>tile.innerText===text);
          t.style.display="none";
          const span = document.createElement("span");
          span.innerText = text+" ";
          dropZone.appendChild(span);

          if(dropZone.textContent.replace(/\s/g,"").length === node.task.words.join("").length){
            minigameCompleted = true;
            nextBtn.disabled = false;
            alert("Сообщение составлено!");
          }
        };
        minigameContainer.appendChild(dropZone);
        break;

      case "minigame_puzzle":
        node.task.items.forEach(i=>{
          const t=document.createElement("div"); t.classList.add("card"); t.innerText=i;
          t.onclick = ()=>{t.style.visibility="hidden"; if([...minigameContainer.querySelectorAll(".card")].every(e=>e.style.visibility==="hidden")){ minigameCompleted=true; nextBtn.disabled=false; } };
          minigameContainer.appendChild(t);
        });
        break;
    }
  }
}

loadNode(currentNode);
