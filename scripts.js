const cvs = document.getElementById("tetris");
const ctx = cvs.getContext("2d");
const scoreElement = document.getElementById("score");

const ROW = 20;
const COL = COLUMN = 10;
const SQ = squareSize = 20;
const VACANT = "#eee"; // цвет пустого квадрата

// рисуем квадрат
function drawSquare(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*SQ,y*SQ,SQ,SQ);

    ctx.strokeStyle = "#333";
    ctx.strokeRect(x*SQ,y*SQ,SQ,SQ);
}

// создание доски

let board = [];
for( r = 0; r <ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

// рисуем доску
function drawBoard(){
    for( r = 0; r <ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c,r,board[r][c]);
        }
    }
}

drawBoard();

// фигуры и их цвета

const PIECES = [
    [Z,"red"],
    [S,"green"],
    [T,"gold"],
    [O,"blue"],
    [L,"purple"],
    [I,"olive"],
    [J,"orange"]
];

// генерация случайных фигур

function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECES.length) // 0 -> 6
    return new Piece( PIECES[r][0],PIECES[r][1]);
}

let p = randomPiece();

// Предметная Часть

function Piece(tetromino,color){
    this.tetromino = tetromino;
    this.color = color;
    
    this.tetrominoN = 0; // начинаем с первого паттерна
    this.activeTetromino = this.tetromino[this.tetrominoN];
    
    // контролируем фигуры
    this.x = 3;
    this.y = -2;
}

// функция заполнения

Piece.prototype.fill = function(color){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // рисуем только занятые квадраты
            if( this.activeTetromino[r][c]){
                drawSquare(this.x + c,this.y + r, color);
            }
        }
    }
}

// рисуем фигуру на доске

Piece.prototype.draw = function(){
    this.fill(this.color);
}


Piece.prototype.unDraw = function(){
    this.fill(VACANT);
}

// движение вниз по фигуре

Piece.prototype.moveDown = function(){
    if(!this.collision(0,1,this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
    }else{
        // фиксируем фигуру и генерируем новый
        this.lock();
        p = randomPiece();
    }
    
}

// движение вправо
Piece.prototype.moveRight = function(){
    if(!this.collision(1,0,this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// движение влево
Piece.prototype.moveLeft = function(){
    if(!this.collision(-1,0,this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// переворачиваем фигуру
Piece.prototype.rotate = function(){
    let nextPattern = this.tetromino[(this.tetrominoN + 1)%this.tetromino.length];
    let kick = 0;
    
    if(this.collision(0,0,nextPattern)){
        if(this.x > COL/2){
            // это правая стена
            kick = -1; // нам нужно сдвинуть фигуру влево
        }else{
            // это левая стена
            kick = 1; // нам нужно сдвинуть фигуру вправо
        }
    }
    
    if(!this.collision(kick,0,nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1)%this.tetromino.length; // (0+1)%4 => 1
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function(){
    for( r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // пропускаем свободные квадраты
            if( !this.activeTetromino[r][c]){
                continue;
            }
            // фигуры, которые нужно зафиксировать сверху = игра окончена
            if(this.y + r < 0){
                alert("Игра окончена");
                // остановка кадра анимации запроса
                gameOver = true;
                break;
            }
            // фиксируем кусок
            board[this.y+r][this.x+c] = this.color;
        }
    }
    // удаляем полные строки
    for(r = 0; r < ROW; r++){
        let isRowFull = true;
        for( c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if(isRowFull){
            // если строка заполнена
            // перемещаем вниз все строки над ним
            for( y = r; y > 1; y--){
                for( c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // верхняя строка [0] [..] не имеет строки над ней
            for( c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
            // увеличиваем счет
            score += 10;
        }
    }
    // обновляем доску
    drawBoard();
    
    // обновляем счет
    scoreElement.innerHTML = score;
}

// функция столкновения

Piece.prototype.collision = function(x,y,piece){
    for( r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // если квадрат пуст, пропускаем его
            if(!piece[r][c]){
                continue;
            }
            // координаты детали после перемещения
            let newX = this.x + c + x;
            let newY = this.y + r + y;
            
            // условия
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }
            // пропускаем newY <0; доска [-1] сокрушит нашу игру
            if(newY < 0){
                continue;
            }
            // проверяем, есть ли уже заблокированная деталь
            if( board[newY][newX] != VACANT){
                return true;
            }
        }
    }
    return false;
}

// Управление

document.addEventListener("keydown",CONTROL);

function CONTROL(event){
    if(event.keyCode == 37){
        p.moveLeft();
        dropStart = Date.now();
    }else if(event.keyCode == 38){
        p.rotate();
        dropStart = Date.now();
    }else if(event.keyCode == 39){
        p.moveRight();
        dropStart = Date.now();
    }else if(event.keyCode == 40){
        p.moveDown();
    }
}

// бросаем кусок каждые 1сек

let dropStart = Date.now();
let gameOver = false;
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > 1000){
        p.moveDown();
        dropStart = Date.now();
    }
    if( !gameOver){
        requestAnimationFrame(drop);
    }
}

drop();



















