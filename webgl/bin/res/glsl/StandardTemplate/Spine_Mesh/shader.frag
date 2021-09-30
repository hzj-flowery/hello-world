#ifdef SY_HIGH_PRECISION
precision highp float;
#elif defined(SY_MEDIUM_PRECISION)
precision mediump float;
#elif defined(SY_LOW_PRECISION)
precision lowp float;
#else
precision mediump float;
#endif
   varying vec3 v_normal;          //法线
   uniform vec4 u_diffuse;         //漫反射
   uniform sampler2D u_texture;   //骨骼矩阵纹理
   uniform vec3 u_spotDirection;  //光的方向
   varying vec2 a_texcoord;
   void main () {
   vec3 normal = normalize(v_normal);
   float light = dot(u_spotDirection,normal) * .5 + .5;
   vec4 color = texture2D(u_texture,normalize(a_texcoord)); 
   gl_FragColor = color+vec4(u_diffuse.rgb * light, u_diffuse.a);
   }