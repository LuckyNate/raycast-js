/* index.js for JS-RAYCAST         
Tim Perfect Software Industries  
==============================================
adapted and improved from tutorial at:
https://www.youtube.com/watch?v=5nSFArCgCXA
==============================================
*/
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const canvas = document.createElement("canvas");
canvas.setAttribute("margin", 0);
canvas.setAttribute("border", 0);
canvas.setAttribute("width", SCREEN_WIDTH);
canvas.setAttribute("height", SCREEN_HEIGHT);
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
//========================================================
/* MAP CREATION AND HANDLING */
//========================================================
const FOV = toRadians(80);

const CELL_SIZE = 1000;
const m = CELL_SIZE;
const COLORS = {
    rays: "#ffffff06",
    wall: "#eccca0ff",
    wallDark: "#b57865ff",
    floors: "#713c32ff",
    minifloors: "#713c3244",
    cieling: "#bdad93ff"
};

const testmap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function newmap(sizex, sizey){
    tempmap = [];
    for(let y = 0; y < sizey; y++){
        newrow = [];
        for(let x=0; x < sizex; x++){
            (Math.random()*100) < 8
            ? newrow.push(1)
            : newrow.push(0);
        }
        tempmap.push(newrow);
    }
    return tempmap;
}

let map = newmap(20,20);
//=====================================================

const player = {
    x: CELL_SIZE * map[0].length/2,
    y: CELL_SIZE * map.length/2,
    angle: 0,
    speed: 0,
    size: 0.5*m,
    //raysize: 64
}

//=====================================================

function clearScreen(){
    ctx.fillStyle = "#282828ff";
    ctx.fillRect(0,0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

function fadeScreen(){
    ctx.fillStyle = "#28282802";
    ctx.fillRect(0,0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

//=====================================================
function tileClip(){
    let nexty = player.y + Math.sin(player.angle) * player.speed;
    let nextx = player.x + Math.cos(player.angle) * player.speed;

    let ytile = Math.floor(nexty/m);
    let xtile = Math.floor(nextx/m); 

    let mmy = nexty/m;
    let mmx = nextx/m;
    
    if(map[ytile][xtile] === 0){
        player.y = nexty;
        player.x = nextx;
    }
}

function movePlayer(){
    tileClip();
    if(outOfMapBounds(player.x, player.y)){
        player.x >= CELL_SIZE*map[0].length-(player.size)
            ? player.x=CELL_SIZE*map[0].length-(player.size)
            :player.x;
        player.x <= (player.size)
            ? player.x = (player.size)
            :player.x;

        player.y >= CELL_SIZE*map.length-(player.size)
            ? player.y=CELL_SIZE*map.length-(player.size)
            :player.y;
        player.y <= player.size
            ? player.y = (player.size)
            :player.y;
    }
}

//=====================================================

function outOfMapBounds(x,y){
    return x<0 || x>= map[0].length || y<0 || y>= map.length;
}

function distance(x1, y1, x2, y2){
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

//=====================================================
/* MEASURE VERTICAL COLLISION DISTANCE */
//=====================================================
function getVCollision(angle){
    const right = Math.abs(Math.floor((angle-Math.PI/2)/Math.PI)%2);
    const firstX = right 
        ? Math.floor(player.x/CELL_SIZE)*CELL_SIZE+CELL_SIZE 
        : Math.floor(player.x/CELL_SIZE)*CELL_SIZE;
    const firstY = player.y + (firstX - player.x) * Math.tan(angle);
    const xA = right 
        ? CELL_SIZE 
        : -CELL_SIZE;
    const yA = xA * Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;

    while(!wall){
        const cellX = right  
            ? Math.floor(nextX/CELL_SIZE)
            : Math.floor(nextX/CELL_SIZE) - 1;
        const cellY = Math.floor(nextY/CELL_SIZE);
    
        if(outOfMapBounds(cellX, cellY)){
            break;
        }

        wall = map[cellY][cellX];
        if(!wall){
            nextX += xA;
            nextY += yA;
        }
    }
    return { angle, distance: distance(player.x, player.y, nextX, nextY), vertical: true }
}

//=====================================================
/* MEASURE HORIZONTAL COLLISION DISTANCE */
//=====================================================
function getHCollision(angle){
    const up = Math.abs(Math.floor(angle/Math.PI)%2);
    const firstY = up 
        ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
        : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE; 
    const firstX = player.x + (firstY-player.y) / Math.tan(angle);
    const yA = up
        ? -CELL_SIZE
        : CELL_SIZE;
    const xA = yA/Math.tan(angle);
    
    let wall;
    let nextX = firstX;
    let nextY = firstY;

    while(!wall){
        const cellX = Math.floor(nextX/CELL_SIZE);
        const cellY = up
            ? Math.floor(nextY/CELL_SIZE) -1
            : Math.floor(nextY/CELL_SIZE);
    
        if(outOfMapBounds(cellX, cellY)){
            break;
        }

        wall = map[cellY][cellX];
        if(!wall){
            nextX += xA;
            nextY += yA;
        }
    }
    return { angle, distance: distance(player.x, player.y, nextX, nextY), vertical: false }
}

//=====================================================
/* MAKE RAYS */
//=====================================================
function castRay(angle){
    const vCollision = getVCollision(angle);
    const hCollision = getHCollision(angle);
    return hCollision.distance >= vCollision.distance 
        ? vCollision 
        : hCollision;
}

function getRays(){
    const initialAngle = player.angle - FOV/2;
    const numRays = SCREEN_WIDTH;
    const angleStep =  FOV/numRays;

    return Array.from({length: numRays}, (_, i) => {
        const angle = initialAngle + i * angleStep;
        const ray = castRay(angle);
        return ray;
    })
}

//=====================================================
/* MAIN SCENE RENDER */
//=====================================================
function fixFishEye(distance, angle, playerAngle){
    const diff = angle - playerAngle;
    return distance*Math.cos(diff);
}

function renderScene(rays){
    rays.forEach((ray, i)=> {
        const distance = fixFishEye(ray.distance, ray.angle, player.angle);
        const wallHeight = ((CELL_SIZE*3)/distance* 1000);
        ctx.fillStyle = ray.vertical 
            ? COLORS.wallDark
            : COLORS.wall;
        ctx.fillRect(i, SCREEN_HEIGHT/2-wallHeight/2, 1, wallHeight);
        ctx.fillStyle = COLORS.floors;
        ctx.fillRect(i, SCREEN_HEIGHT/2 + wallHeight/2, 1, SCREEN_HEIGHT/2 + wallHeight)/2;
        ctx.fillStyle = COLORS.cieling;
        ctx.fillRect(i, 0, 1, SCREEN_HEIGHT/2 - wallHeight/2);
    });
}

//=====================================================
/* MINIMAP */
//=====================================================
function renderMinimap(posX, posY, scale, rays){
    const cellSize = scale * CELL_SIZE;
    map.forEach((row,y) => {
        row.forEach((cell, x) => {
            if(cell){
                ctx.fillStyle = "#28282866";
                ctx.fillRect(
                    posX + x * cellSize, 
                    posY + y * cellSize, 
                    cellSize, cellSize
                );
            }
            else {
                ctx.fillStyle = COLORS.minifloors;
                ctx.fillRect(
                    posX + x * cellSize, 
                    posY + y * cellSize, 
                    cellSize, cellSize
                );
                ctx.fillStyle = COLORS.minifloors;
                ctx.fillRect(
                    posX + x * cellSize+1, 
                    posY + y * cellSize+1, 
                    cellSize-2, cellSize-2
                );
            }
        });
    });
/*draw the mini rays*/
    ctx.strokeStyle = COLORS.rays;
    rays.forEach(ray => {
        ctx.beginPath()
        ctx.moveTo(player.x*scale + posX, player.y*scale + posY)
        ctx.lineTo(
            (player.x + Math.cos(ray.angle)*ray.distance) * scale,
            (player.y + Math.sin(ray.angle)*ray.distance) * scale,
        )
        ctx.closePath()
        ctx.stroke()
    })
    
    ctx.fillStyle = "#00ff00ff";
    ctx.fillRect(
        posX + player.x*scale - player.size*scale/2,
        posY + player.y*scale - player.size*scale/2,
        player.size*scale, player.size*scale
        );
}

function toRadians(deg){
    return (deg*Math.PI)/180;
}

//=====================================================

function gameLoop(){
    requestAnimationFrame(gameLoop);
    clearScreen();
    movePlayer();
    const rays = getRays();
    renderScene(rays);
    renderMinimap(0,0,0.01,rays);
    fadeScreen();
}

requestAnimationFrame(gameLoop);

//=====================================================



document.addEventListener("keydown", (e) =>{
    const fps = 60;
    walkSpeed = 2.4*m;
    runSpeed = 5.0*m;

    if(e.key === "w"){
        if(player.speed > walkSpeed/fps){
            player.speed = walkSpeed/fps;
        }
        if((player.speed) < walkSpeed/fps){
            player.speed += walkSpeed/fps;
        }
    }

    if(e.key === "W"){
        if(player.speed > runSpeed/fps){
            player.speed = runSpeed/fps;
        }
        if((player.speed) < runSpeed/fps){
            player.speed += runSpeed/fps;
        }
    }

    if(e.key === "s"){
        if(player.speed < -walkSpeed/fps){
            player.speed = -walkSpeed/fps;
        }
        if((player.speed) > -walkSpeed/fps){
            player.speed -= walkSpeed/fps;
        }
    }

    if(e.key === "S"){
        if(player.speed < -runSpeed/fps){
            player.speed = -runSpeed/fps;
        }
        if((player.speed) > -runSpeed/fps){
            player.speed -= runSpeed/fps;
        }
    }
    
})

document.addEventListener("keyup", (e) =>{
    if(e.key === "w" || e.key === "s"
    || e.key === "W" || e.key === "S"){
        player.speed = 0;
    }
})


document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e){
    player.angle += toRadians(e.movementX/2);
}

