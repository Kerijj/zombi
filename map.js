const mapNodes = [
  {id:"scene1", name:"Коридор", x:100, y:50, next:["scene1_memory","scene1_hide"]},
  {id:"scene1_hide", name:"Прятки", x:300, y:50, next:["scene1_memory"]},
  {id:"scene1_memory", name:"Memory", x:200, y:150, next:["scene2"]},
  {id:"scene2", name:"Класс", x:200, y:250, next:["scene3"]},
  {id:"scene3", name:"Спортзал", x:100, y:350, next:["scene4"]},
  {id:"scene4", name:"Кухня", x:300, y:350, next:["scene5"]},
  {id:"scene5", name:"Актовый зал", x:200, y:450, next:["ending_good","ending_funny","ending_secret"]}
];

const svg = document.getElementById("map-svg");

function renderMap(){
  svg.innerHTML="";

  mapNodes.forEach(node=>{
    if(node.next){
      node.next.forEach(nextId=>{
        const target = mapNodes.find(n=>n.id===nextId);
        if(target){
          const line = document.createElementNS("http://www.w3.org/2000/svg","line");
          line.setAttribute("x1",node.x);
          line.setAttribute("y1",node.y);
          line.setAttribute("x2",target.x);
          line.setAttribute("y2",target.y);
          line.classList.add("line-progress");
          svg.appendChild(line);
        }
      });
    }
  });

  mapNodes.forEach(node=>{
    const circle = document.createElementNS("http://www.w3.org/2000/svg","circle");
    circle.setAttribute("cx",node.x); circle.setAttribute("cy",node.y); circle.setAttribute("r",25);
    circle.classList.add("map-node-circle");
    if(node.id===currentNode) circle.classList.add("current");
    if(node.id===currentNode || memoryMatched.includes(node.id)) circle.classList.add("completed");
    circle.addEventListener("click", ()=>loadNode(node.id));
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg","text");
    text.setAttribute("x",node.x); text.setAttribute("y",node.y+5);
    text.classList.add("map-node-text"); text.textContent=node.name;
    svg.appendChild(text);
  });
}

const originalLoadNodeMap = loadNode;
loadNode = function(nodeId){ originalLoadNodeMap(nodeId); renderMap(); }
renderMap();
