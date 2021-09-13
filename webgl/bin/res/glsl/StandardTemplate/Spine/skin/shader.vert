attribute vec4 a_position;  //顶点位置
attribute vec3 a_normal;    //法线
attribute vec4 a_weights; //权重
attribute vec4 a_joints;  //受到哪些骨骼节点的影响
attribute vec2 a_texcoord;
uniform mat4 u_projection;  //投影
uniform mat4 u_view;        //观察空间
uniform mat4 u_world;       //世界空间
uniform sampler2D u_texture2;   //骨骼矩阵纹理

uniform float u_float_custom;  //[6,7,8,9,10,11]
varying vec3 v_normal;
varying vec2 v_uv;
    //获取骨骼矩阵
    //一共有6个骨骼矩阵
    //0 1 2 3 4 5
    //每个顶点受到4个骨骼矩阵的影响
    /**
    RGBA RGBA RGBA RGBA  --矩阵1  16
    RGBA RGBA RGBA RGBA  --矩阵2  16
    RGBA RGBA RGBA RGBA  --矩阵3  16
    RGBA RGBA RGBA RGBA  --矩阵4  16
    RGBA RGBA RGBA RGBA  --矩阵5  16
    RGBA RGBA RGBA RGBA  --矩阵6  16
     */
mat4 getBoneMatrix(float jointNdx) {
float v = (jointNdx + 0.5) / u_float_custom;       //算出行
return mat4(                                                 //s      
texture2D(u_texture2, vec2(((0.5 + 0.0) / 4.), v)),  //0.125 
texture2D(u_texture2, vec2(((0.5 + 1.0) / 4.), v)),  //0.375 
texture2D(u_texture2, vec2(((0.5 + 2.0) / 4.), v)),  //0.625 
texture2D(u_texture2, vec2(((0.5 + 3.0) / 4.), v))); //0.875 
}
void main() {
mat4 skinMatrix =   getBoneMatrix(a_joints[0]) * a_weights[0] + getBoneMatrix(a_joints[1]) * a_weights[1] +
getBoneMatrix(a_joints[2]) * a_weights[2] +
getBoneMatrix(a_joints[3]) * a_weights[3];
mat4 world = u_world * skinMatrix;
gl_Position = u_projection * u_view * world * a_position;
v_normal = mat3(world) * a_normal;
v_uv = a_texcoord;
}