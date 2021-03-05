precision mediump float;

  varying vec2 vTextureCoordinates;
  uniform sampler2D u_texture;

  void main() {
   vec4 texcolor = texture2D(u_texture, vTextureCoordinates);
    if((texcolor.x+texcolor.y+texcolor.z)<0.1) discard;
   gl_FragColor = texcolor;
  }