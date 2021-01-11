export namespace ShaderCode {
    export var shadowMap = {
        vert: `attribute vec4 a_position;
        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_world;
        void main() {
        gl_Position = u_projection * u_view * u_world * a_position;
        }`
        ,
        frag: `precision mediump float;
    //分解保存深度值
    vec4 pack (float depth) {
        // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
        const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
        const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
        // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
        vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
        rgbaDepth -= rgbaDepth.rgba * bitMask; // Cut off the value which do not fit in 8 bits
        return rgbaDepth;
    }
    void main() {
    gl_FragColor =  vec4(gl_FragCoord.z,0.0,0.0,1.0);  //将深度值存在帧缓冲的颜色缓冲中 如果帧缓冲和窗口绑定 那么就显示出来 如果帧缓冲和纹理绑定就存储在纹理中
    }`
    }
    export var line = {
        vert: `attribute vec4 a_position;
        uniform mat4 u_projection;
        uniform mat4 u_view;
        uniform mat4 u_world;
        void main() {
        gl_Position = u_projection * u_view * u_world * a_position;
        }`,
        frag:
            `precision mediump float;
        uniform vec4 u_color;
    void main() {
    gl_FragColor =  u_color;  //线的颜色
    }`

    }
}