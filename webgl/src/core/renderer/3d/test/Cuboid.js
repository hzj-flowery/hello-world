// 顶点着色器程序
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +  //位置
  'attribute vec4 a_Color;\n' + //颜色
  'uniform mat4 u_MvpMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' + // 设置顶点坐标
  '  v_Color = a_Color;\n' +
  '}\n';

// 片元着色器程序
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

//定义一个矩形体：混合构造函数原型模式
function Cuboid(minX, maxX, minY, maxY, minZ, maxZ) {
  this.minX = minX;
  this.maxX = maxX;
  this.minY = minY;
  this.maxY = maxY;
  this.minZ = minZ;
  this.maxZ = maxZ;
}

Cuboid.prototype = {
  constructor: Cuboid,
  CenterX: function () {
    return (this.minX + this.maxX) / 2.0;
  },
  CenterY: function () {
    return (this.minY + this.maxY) / 2.0;
  },
  CenterZ: function () {
    return (this.minZ + this.maxZ) / 2.0;
  },
  LengthX: function () {
    return (this.maxX - this.minX);
  },
  LengthY: function () {
    return (this.maxY - this.minY);
  }
}

//定义DEM
function Terrain() {
}
Terrain.prototype = {
  constructor: Terrain,
  setWH: function (col, row) {
    this.col = col;
    this.row = row;
  }
}

var currentAngle = [0.0, 0.0]; // 绕X轴Y轴的旋转角度 ([x-axis, y-axis])
var curScale = 1.0;   //当前的缩放比例

function main() {
  var demFile = document.getElementById('demFile');
  if (!demFile) {
    console.log("Failed to get demFile element!");
    return;
  }

  //加载文件后的事件
  demFile.addEventListener("change", function (event) {
    //判断浏览器是否支持FileReader接口
    if (typeof FileReader == 'undefined') {
      console.log("你的浏览器不支持FileReader接口！");
      return;
    }

    //读取文件后的事件
    var reader = new FileReader();
    reader.onload = function () {
      if (reader.result) {
        var terrain = new Terrain();
        if (!readDEMFile(reader.result, terrain)) {
          console.log("文件格式有误，不能读取该文件！");
        }

        //绘制函数
        onDraw(gl, canvas, terrain);
      }
    }

    var input = event.target;
    reader.readAsText(input.files[0]);
  });

  // 获取 <canvas> 元素
  var canvas = document.getElementById('webgl');

  // 获取WebGL渲染上下文
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // 初始化着色器
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // 指定清空<canvas>的颜色
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 开启深度测试
  gl.enable(gl.DEPTH_TEST);

  //清空颜色和深度缓冲区
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

//绘制函数
function onDraw(gl, canvas, terrain) {
  // 设置顶点位置
  //var cuboid = new Cuboid(399589.072, 400469.072, 3995118.062, 3997558.062, 732, 1268); 
  var n = initVertexBuffers(gl, terrain);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }

  //注册鼠标事件
  initEventHandlers(canvas);

  //绘制函数
  var tick = function () {
    //设置MVP矩阵
    setMVPMatrix(gl, canvas, terrain.cuboid);

    //清空颜色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制矩形体
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
    //gl.drawArrays(gl.Points, 0, n);

    //请求浏览器调用tick
    requestAnimationFrame(tick);
  };

  //开始绘制
  tick();
}

//读取DEM函数
function readDEMFile(result, terrain) {
  var stringlines = result.split("\n");
  if (!stringlines || stringlines.length <= 0) {
    return false;
  }

  //读取头信息
  var subline = stringlines[0].split("\t");
  if (subline.length != 6) {
    return false;
  }
  var col = parseInt(subline[4]);       //DEM宽
  var row = parseInt(subline[5]);      //DEM高
  var verticeNum = col * row;
  if (verticeNum + 1 > stringlines.length) {
    return false;
  }
  terrain.setWH(col, row);

  //读取点信息
  var ci = 0;
  terrain.verticesColors = new Float32Array(verticeNum * 6);
  for (var i = 1; i < stringlines.length; i++) {
    if (!stringlines[i]) {
      continue;
    }

    var subline = stringlines[i].split(',');
    if (subline.length != 9) {
      continue;
    }

    for (var j = 0; j < 6; j++) {
      terrain.verticesColors[ci] = parseFloat(subline[j]);
      ci++;
    }
  }

  if (ci !== verticeNum * 6) {
    return false;
  }

  //包围盒
  var minX = terrain.verticesColors[0];
  var maxX = terrain.verticesColors[0];
  var minY = terrain.verticesColors[1];
  var maxY = terrain.verticesColors[1];
  var minZ = terrain.verticesColors[2];
  var maxZ = terrain.verticesColors[2];
  for (var i = 0; i < verticeNum; i++) {
    minX = Math.min(minX, terrain.verticesColors[i * 6]);
    maxX = Math.max(maxX, terrain.verticesColors[i * 6]);
    minY = Math.min(minY, terrain.verticesColors[i * 6 + 1]);
    maxY = Math.max(maxY, terrain.verticesColors[i * 6 + 1]);
    minZ = Math.min(minZ, terrain.verticesColors[i * 6 + 2]);
    maxZ = Math.max(maxZ, terrain.verticesColors[i * 6 + 2]);
  }

  terrain.cuboid = new Cuboid(minX, maxX, minY, maxY, minZ, maxZ);

  return true;
}


//注册鼠标事件
function initEventHandlers(canvas) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  //鼠标按下
  canvas.onmousedown = function (ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x;
      lastY = y;
      dragging = true;
    }
  };

  //鼠标离开时
  canvas.onmouseleave = function (ev) {
    dragging = false;
  };

  //鼠标释放
  canvas.onmouseup = function (ev) {
    dragging = false;
  };

  //鼠标移动
  canvas.onmousemove = function (ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    if (dragging) {
      var factor = 100 / canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      currentAngle[0] = currentAngle[0] + dy;
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };

  //鼠标缩放
  canvas.onmousewheel = function (event) {
    if (event.wheelDelta > 0) {
      curScale = curScale * 1.1;
    } else {
      curScale = curScale * 0.9;
    }
  };
}

//设置MVP矩阵
function setMVPMatrix(gl, canvas, cuboid) {
  // Get the storage location of u_MvpMatrix
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  if (!u_MvpMatrix) {
    console.log('Failed to get the storage location of u_MvpMatrix');
    return;
  }

  //模型矩阵
  var modelMatrix = new Matrix4();
  modelMatrix.scale(curScale, curScale, curScale);
  modelMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis 
  modelMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis 
  modelMatrix.translate(-cuboid.CenterX(), -cuboid.CenterY(), -cuboid.CenterZ());

  //投影矩阵
  var fovy = 60;
  var near = 1;
  var projMatrix = new Matrix4();
  projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 10000);

  //计算lookAt()函数初始视点的高度
  var angle = fovy / 2 * Math.PI / 180.0;
  var eyeHight = (cuboid.LengthY() * 1.2) / 2.0 / angle;

  //视图矩阵  
  var viewMatrix = new Matrix4();  // View matrix   
  viewMatrix.lookAt(0, 0, eyeHight, 0, 0, 0, 0, 1, 0);

  //MVP矩阵
  var mvpMatrix = new Matrix4();
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

  //将MVP矩阵传输到着色器的uniform变量u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
}

//
function initVertexBuffers(gl, terrain) {
  //DEM的一个网格是由两个三角形组成的
  //      0------1            1
  //      |                   |
  //      |                   |
  //      col       col------col+1    
  var col = terrain.col;
  var row = terrain.row;

  var indices = new Uint16Array((row - 1) * (col - 1) * 6);
  var ci = 0;
  for (var yi = 0; yi < row - 1; yi++) {
    //for (var yi = 0; yi < 10; yi++) {
    for (var xi = 0; xi < col - 1; xi++) {
      indices[ci * 6] = yi * col + xi;
      indices[ci * 6 + 1] = (yi + 1) * col + xi;
      indices[ci * 6 + 2] = yi * col + xi + 1;
      indices[ci * 6 + 3] = (yi + 1) * col + xi;
      indices[ci * 6 + 4] = (yi + 1) * col + xi + 1;
      indices[ci * 6 + 5] = yi * col + xi + 1;
      ci++;
    }
  }

  //
  var verticesColors = terrain.verticesColors;
  var FSIZE = verticesColors.BYTES_PER_ELEMENT;   //数组中每个元素的字节数

  // 创建缓冲区对象
  var vertexColorBuffer = gl.createBuffer();
  var indexBuffer = gl.createBuffer();
  if (!vertexColorBuffer || !indexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // 将缓冲区对象绑定到目标
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // 向缓冲区对象写入数据
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  //获取着色器中attribute变量a_Position的地址 
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  // 将缓冲区对象分配给a_Position变量
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);

  // 连接a_Position变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);

  //获取着色器中attribute变量a_Color的地址 
  var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
    console.log('Failed to get the storage location of a_Color');
    return -1;
  }
  // 将缓冲区对象分配给a_Color变量
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  // 连接a_Color变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Color);

  // 将顶点索引写入到缓冲区对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return indices.length;
}