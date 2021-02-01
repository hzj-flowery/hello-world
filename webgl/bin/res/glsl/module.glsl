// module.glsl

highp float sum(highp float x, highp float y) {
  return x + y;
}

highp float sub(highp float x, highp float y) {
  return x - y;
}

#pragma glslify: export(sum)

// 其中，最后一句#pragma glslify: export(sum)非常重要，表示该模块导出时的名字。