const socket = io();

//Connect user
socket.on('users', function (count) {
    document.getElementById('user-count').textContent = count + ' online';
});

//Initalise drawing canvas with default parameters
let brush = document.getElementById('brush');
let brushCtx = brush.getContext('2d');
let brushCenterX = brush.width / 2;
let brushCenterY = brush.height / 2;
brushCtx.lineWidth = 1;
function drawBrush(width) {
    brushCtx.clearRect(0, 0, brush.width, brush.height);
    brushCtx.beginPath();
    brushCtx.arc(brushCenterX, brushCenterY, width / 2, 0, 2 * Math.PI, false);
    brushCtx.stroke();
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

let currentStroke = null;
// When undo is pressed, pop top stroke off and redraw
let strokes = [];

// Eraser tool
let eraserTool = document.getElementById('eraser-tool');
eraserTool.onclick = function () {
    currentLineWeight = lineWeightSlider.value * 3;
    ctx.globalCompositeOperation = "destination-out";
    brushCtx.clearRect(0, 0, brush.width, brush.height);
    drawBrush(currentLineWeight);
    currentColor = '#FFFFFF';
};

// Pencil tool
let pencilTool = document.getElementById('pencil-tool');
pencilTool.onclick = function () {
    currentLineWeight = lineWeightSlider.value;
    ctx.globalCompositeOperation = "source-over";
    drawBrush(currentLineWeight);
    currentColor = '#' + colorPicker.value;
}

// Line weight slider
let lineWeightSlider = document.getElementById("lineWeight-slider");
let currentLineWeight = lineWeightSlider.defaultValue;

drawBrush(currentLineWeight);
lineWeightSlider.onchange = function () {
    currentLineWeight = this.value;
    if (eraserTool.checked) {
        currentLineWeight *= 3;
    }
    brushCtx.clearRect(0, 0, brush.width, brush.height);
    drawBrush(currentLineWeight);
};

// Color picker
let colorPicker = document.getElementById('color-picker');

// Generate random starting brush color
function randomColor() {
    generate = Math.floor(Math.random()*16777215).toString(16);
    return generate;
}
colorPicker.setAttribute("value", randomColor());
let currentColor = '#' + colorPicker.value;

//Change color after selection
colorPicker.onchange = function () {
    currentColor = '#' + this.value;
};

// Undo button
// Disabled on intialisation since there is nothing to undo at first
let undoButton = document.getElementById('undo');
undoButton.disabled = true;

// Reset button
let clearAllButton = document.getElementById('clear-all');

//Save button
let saveButton = document.getElementById('save');

//Draw on canvas
//Create points
function drawNewPoint(e) {
    brush.style.top = e.clientY - brushCenterY + 'px';
    brush.style.left = e.clientX - brushCenterX + 'px';
    if (currentStroke === null)
        return;

    // cross-browser canvas coordinates
    let x = e.offsetX || e.layerX - canvas.offsetLeft;
    let y = e.offsetY || e.layerY - canvas.offsetTop;

    currentStroke.points.push({ x: x, y: y });
    drawOnCanvas(currentStroke.points, currentStroke.color, currentStroke.lineWeight);

    socket.emit('stroke-update', { x: x, y: y })
}
//Join the points to make strokes
function drawOnCanvas(point, color, lineWeight) {
    ctx.beginPath();
    ctx.moveTo(point[0].x, point[0].y);

    for (let i = 1; i < point.length; i++) {
        ctx.lineTo(point[i].x, point[i].y);
    }

    ctx.lineWidth = lineWeight;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function startDraw(e) {
    // Hack to draw even if cursor doesn't move
    let x = e.offsetX || e.layerX - canvas.offsetLeft;
    let y = e.offsetY || e.layerY - canvas.offsetTop;

    currentStroke = {
        lineWeight: currentLineWeight,
        color: currentColor,
        points: [{ x: x - 1, y: y - 1 }]
    };

    socket.emit('stroke-start', currentStroke);

    drawNewPoint(e);
}

function endDraw() {
    strokes.push(currentStroke);
    currentStroke = null;
    undoButton.disabled = false;
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

saveButton.onclick = function () {
    var imageName = prompt('Save As:');
    var canvasDataURL = canvas.toDataURL();
    var a = document.createElement('a');
    if (imageName === null) { 
        return 
    } else {
        a.href = canvasDataURL;
        a.download = imageName || 'drawing';
        a.click();
    }
}

undoButton.onclick = function () {
    strokes.pop();
    if (strokes.length === 0) {
        undoButton.disabled = true;
    }

    socket.emit('stroke-delete');
};

clearAllButton.onclick = function () {
    clearBoard();
    lineWeightSlider.value = lineWeightSlider.defaultValue;
    lineWeightSlider.onchange(null);
    socket.emit('clear-board');
};

//Mouse events on canvas
canvas.addEventListener('mousedown', startDraw, false);
canvas.addEventListener('mousemove', throttle(drawNewPoint, 25), false);
canvas.addEventListener('mouseup', endDraw, false);
canvas.addEventListener('mouseout', endDraw, false);

//Touch support for mobile devices
canvas.addEventListener('touchstart', startDraw, false);
canvas.addEventListener('touchmove', throttle(drawNewPoint, 25), false);
canvas.addEventListener('touchend', endDraw, false);
canvas.addEventListener('touchcancel', endDraw, false);

//Limit number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function () {
        var time = new Date().getTime();

        if ((time - previousCall) >= delay) {
            previousCall = time;
            callback.apply(null, arguments);
        }
    };
}

socket.on('clear-board', clearBoard);

socket.on('draw-new-stroke', function (data) {
    drawOnCanvas(data.points, data.color, data.lineWeight);
});

socket.on('draw-strokes', function (data) {
    for (let i = 0; i < data.length; i++) {
        let stroke = data[i];
        drawOnCanvas(stroke.points, stroke.color, stroke.lineWeight);
    }
});