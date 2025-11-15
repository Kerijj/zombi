const gameData = {
  start_node: "scene1",
  scenes: {
    scene1: { type: "text", image: "images/corridor_comic_pixel.png", text: "Ты заходишь в школу и встречаешь зомби-ученика! Что делать?", options: [{text:"Подойти ближе", next:"scene1_memory"}, {text:"Спрятаться в шкафчик", next:"scene1_hide"}]},
    scene1_hide:{ type:"text", text:"Ты прячешься, но зомби милый и немного тупой.", options:[{text:"Выйти и помочь", next:"scene1_memory"}]},
    scene1_memory:{ type:"minigame_memory", image:"images/classroom_zombies_pixel.png", text:"Найди пары зомби-карт!", task:{cards:[{id:1,image:"images/zombie1.png"},{id:2,image:"images/zombie2.png"},{id:3,image:"images/zombie1.png"},{id:4,image:"images/zombie2.png"}]}, next:"scene2"},
    scene2:{ type:"minigame_translate", image:"images/translate_comic.png", text:"Переведи слова с иврита, чтобы открыть дверь класса.", task:{words:[{hebrew:"ספר",translation:"книга"},{hebrew:"שולחן",translation:"стол"},{hebrew:"מחברת",translation:"тетрадь"}]}, next:"scene3"},
    scene3:{ type:"minigame_match3", image:"images/gym_match3_pixel.png", text:"Нажимай на три одинаковых мячика, чтобы убрать их.", task:{symbols:["⚽","🏀","🏐"]}, next:"scene4"},
    scene4:{ type:"minigame_message", image:"images/kitchen_zombies_cartoon.png", text:"Составь сообщение о помощи для директора.", task:{words:["Помогите","Срочно","Школа","Зомби"]}, next:"scene5"},
    scene5:{ type:"minigame_puzzle", image:"images/final_hall_pixel_comic.png", text:"Собери предметы и выбери финальный путь!", task:{items:["кнопка RESET","ключ","пасхалка"]}, options:[{text:"Нажать кнопку", next:"ending_good"},{text:"Не нажимать", next:"ending_funny"},{text:"Использовать ключ", next:"ending_secret"}]},
    ending_good:{type:"end", text:"Все зомби становятся обычными людьми. Ты — герой дня!"},
    ending_funny:{type:"end", text:"Ты оставила всё как есть. Зомби оказались милее обычных!"},
    ending_secret:{type:"end", text:"Ты открыла секретный уровень! Бонусные очки собраны!"}
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

function loadNode(nodeId){
  minigameContainer.innerHTML = "";
  optionsContainer.innerHTML = "";
  taskDesc.innerText = "";
  nextBtn.style.display = "none";

  memoryFlipped = [];
  memoryMatched = [];

  const node = gameData.scenes[nodeId];
  currentNode = nodeId;

  if(node.image) sceneImg.src = node.image;
  if(node.text) taskDesc.innerText = node.text;

  if(node.type === "end"){ taskDesc.innerText = node.text; return; }

  if(node.options){
    node.options.forEach(opt=>{
      const btn = document.createElement("button");
      btn.innerText = opt.text;
      btn.classList.add("btn");
      btn.onclick = ()=>loadNode(opt.next);
      optionsContainer.appendChild(btn);
    });
  }

  if(node.type.startsWith("minigame")){
    nextBtn.style.display = "block";
    nextBtn.onclick = ()=>loadNode(node.next);

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
                if(memoryFlipped[0].cardId===memoryFlipped[1].cardId){ memoryMatched.push(card.id); memoryFlipped=[]; }
                else{ setTimeout(()=>{memoryFlipped.forEach(f=>f.element.style.visibility="hidden"); memoryFlipped=[];},500); }
              }
            }
          };
          minigameContainer.appendChild(c);
        });
        break;
      case "minigame_translate":
        node.task.words.forEach(w=>{ const p=document.createElement("p"); p.innerText=`${w.hebrew} → ${w.translation}`; minigameContainer.appendChild(p); });
        break;
      case "minigame_match3":
        let selectedMatch=[];
        node.task.symbols.forEach(s=>{
          const t=document.createElement("div"); t.classList.add("match3-tile"); t.innerText=s;
          t.onclick = ()=>{
            selectedMatch.push(t);
            if(selectedMatch.length===3){
              const values = selectedMatch.map(e=>e.innerText);
              if(values.every(v=>v===values[0])) selectedMatch.forEach(e=>e.style.visibility="hidden");
              selectedMatch=[];
            }
          };
          minigameContainer.appendChild(t);
        });
        break;
      case "minigame_message":
        node.task.words.forEach(w=>{
          const t=document.createElement("div"); t.classList.add("word-tile"); t.innerText=w; t.draggable=true;
          t.ondragstart = e=>{ t.classList.add("dragging"); e.dataTransfer.setData("text",w); };
          t.ondragend = e=>t.classList.remove("dragging");
          minigameContainer.appendChild(t);
        });
        break;
      case "minigame_puzzle":
      case "minigame_hidden_object":
        node.task.items.forEach(i=>{
          const t=document.createElement("div"); t.classList.add("card"); t.innerText=i; t.onclick = ()=>{t.style.visibility="hidden";};
          minigameContainer.appendChild(t);
        });
        break;
    }
  }
}

loadNode(currentNode);
