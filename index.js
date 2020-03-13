var loadedPdf;
var canvas;
var canvasContext;

var rectCanvas;
var rectCanvasContext;

var typeNumber = 4;
var errorCorrectionLevel = "L";
var qr = qrcode(typeNumber, errorCorrectionLevel);

var currPage = 1;
var numPages = 0;

var MOUSE_STATE = {
  IDLE: 1,
  DRAWING: 2,
  MOUSE_DOWN: 3
};
var mouseState = MOUSE_STATE.IDLE;

var lastRectangleDrawn = {};

onFileChanged();

function init(inputFile) {
  var loadingTask = pdfjsLib.getDocument(inputFile);
  loadingTask.promise.then(
    function(pdf) {
      console.log("PDF loaded");
      loadedPdf = pdf;

      numPages = pdf.numPages;
      onPdfLoaded(currPage);
    },
    function(reason) {
      console.error(reason);
    }
  );
}

function onPdfLoaded(pageNumber) {
  loadedPdf.getPage(pageNumber).then(function(page) {
    console.log("Page loaded");

    var viewport = page.getViewport(1);

    canvas = document.getElementById("the-canvas");
    canvasContext = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    rectCanvas = document.getElementById("rect-canvas");
    rectCanvasContext = rectCanvas.getContext("2d");
    rectCanvas.height = viewport.height;
    rectCanvas.width = viewport.width;

    var renderContext = {
      canvasContext: canvasContext,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.promise.then(function() {
      console.log("Page rendered");
      onPageRendered();
    });
  });
}

function onPageRendered() {
  var canvasx = $(rectCanvas).offset().left;
  var canvasy = $(rectCanvas).offset().top;
  var last_mousex = (last_mousey = 0);
  var mousex = (mousey = 0);
  var mousedown = false;

  $(rectCanvas).on("mousedown", function(e) {
    console.log("mousedown");

    switch (mouseState) {
      case MOUSE_STATE.MOUSE_DOWN:
        console.warn("MOUSE_DOWN -> MOUSE_DOWN     NOT POSSIBLE!");
        break;
      case MOUSE_STATE.DRAWING:
        console.warn("DRAWING -> MOUSE_DOWN     NOT POSSIBLE!");
        break;
      case MOUSE_STATE.IDLE:
        mouseState = MOUSE_STATE.MOUSE_DOWN;
        console.log("IDLE -> MOUSE_DOWN     Çizim başlangıç potansiyeli!");
        break;
    }

    last_mousex = parseInt(e.clientX - canvasx);
    last_mousey = parseInt(e.clientY - canvasy);
    mousedown = true;
  });

  $(rectCanvas).on("mouseup", function(e) {
    console.log("mouseup");

    switch (mouseState) {
      case MOUSE_STATE.MOUSE_DOWN:
        mouseState = MOUSE_STATE.IDLE;
        console.warn("MOUSE_DOWN -> MOUSE_UP     Çizim noktadan ibaret!");
        break;
      case MOUSE_STATE.DRAWING:
        mouseState = MOUSE_STATE.IDLE;
        console.log("DRAWING -> IDLE     Çizim bitti!");
        //placeQrOnPdf();
        break;
      case MOUSE_STATE.IDLE:
        console.warn("IDLE -> MOUSE_UP     NOT POSSIBLE!");
        break;
    }

    mousedown = false;
  });

  $(rectCanvas).on("mousemove", function(e) {
    //console.log("mousemove");

    switch (mouseState) {
      case MOUSE_STATE.MOUSE_DOWN:
        mouseState = MOUSE_STATE.DRAWING;
        lastRectangleDrawn = {};
        console.warn("MOUSE_DOWN -> DRAWING     Çizim başladı!");
        break;
      case MOUSE_STATE.DRAWING:
        //console.log("DRAWING -> DRAWING     Çizim devam ediyor!");
        break;
      case MOUSE_STATE.IDLE:
        //console.log("IDLE -> IDLE     Mouse hareketi!");
        break;
    }

    mousex = parseInt(e.clientX - canvasx);
    mousey = parseInt(e.clientY - canvasy);

    if (mousedown) {
      var width = mousex - last_mousex;
      var height = mousey - last_mousey;

      rectCanvasContext.clearRect(0, 0, rectCanvas.width, rectCanvas.height);

      rectCanvasContext.beginPath();
      rectCanvasContext.rect(last_mousex, last_mousey, width, height);
      rectCanvasContext.strokeStyle = "black";
      rectCanvasContext.lineWidth = 5;
      rectCanvasContext.stroke();

      lastRectangleDrawn = {
        x: last_mousex,
        y: last_mousey,
        width: width,
        height: height
      };
    }
  });
}

function placeQrOnPdf() {
  if (!lastRectangleDrawn) return;

  qr.addData("Hi!");
  qr.make();

  var imageObj = new Image();
  imageObj.src = qr.createDataURL();

  imageObj.onload = function() {
    rectCanvasContext.clearRect(0, 0, rectCanvas.width, rectCanvas.height); //clear canvas
    canvasContext.drawImage(
      imageObj,
      lastRectangleDrawn.x,
      lastRectangleDrawn.y
    );
  };
}

const toBase64 = file => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
};

function onFileChanged() {
  var inputElement = document.getElementById("pdf-input");

  // console.log(toBase64(inputElement));

  inputElement.onchange = function(event) {
    var file = event.target.files[0];

    var fileReader = new FileReader();

    fileReader.onload = function() {
      var typedarray = new Uint8Array(this.result);

      init(typedarray);
    };

    fileReader.readAsArrayBuffer(file);
  };
}
