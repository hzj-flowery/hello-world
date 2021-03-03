precision mediump float;

   uniform samplerCube u_skybox;
   uniform mat4 u_PVInverseMatrix;

   varying vec4 v_position;
   void main() {
   vec4 t = u_PVInverseMatrix * v_position;
   vec3 pos = normalize(t.xyz / t.w);
   vec4 color =  textureCube(u_skybox,pos);
   gl_FragColor = color;
   }