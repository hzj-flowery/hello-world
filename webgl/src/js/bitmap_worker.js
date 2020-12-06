var offscreen, ctx;
onmessage = function (e) {
  if (e.data.msg == 'init') {
    init();
    draw();
  } else if (e.data.msg == 'draw') {
    draw();
  }
}

function init() {
  offscreen = new OffscreenCanvas(512, 512);
  ctx = offscreen.getContext("2d");
}

function draw() {

  ctx.clearRect(0,0,offscreen.width,offscreen.height);
  ctx.fillRect(20,20,150,100);
  var imageBitmap = offscreen.transferToImageBitmap();
  postMessage({ imageBitmap: imageBitmap }, [imageBitmap]);
}