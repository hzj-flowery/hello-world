precision mediump float;

//分解保存深度值
vec4 pack(float depth){
    // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
    const vec4 bitShift=vec4(1.,256.,256.*256.,256.*256.*256.);
    const vec4 bitMask=vec4(1./256.,1./256.,1./256.,0.);
    // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
    vec4 rgbaDepth=fract(depth*bitShift);//计算每个点的z值
    rgbaDepth-=rgbaDepth.rgba*bitMask;// Cut off the value which do not fit in 8 bits
    return rgbaDepth;
}

void main(){
    gl_FragColor=vec4(gl_FragCoord.z,0.,0.,1.);//将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
}