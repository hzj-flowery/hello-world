
#ifdef SY_HIGH_PRECISION
precision highp float;
#elif defined(SY_MEDIUM_PRECISION)
precision mediump float;
#elif defined(SY_LOW_PRECISION)
precision lowp float;
#else
precision mediump float;
#endif

uniform vec4 u_color;
void main(){
    gl_FragColor=u_color;//线的颜色
}