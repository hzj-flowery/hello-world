attribute vec4 a_position;
  attribute vec3 a_normal;
  attribute vec2 a_texcoord;
  uniform vec3 u_lightWorldPosition;
  uniform vec3 u_cameraWorldPosition;
  uniform mat4 u_world;
  uniform mat4 u_projection;
  uniform mat4 u_view;
  uniform mat4 u_world_I_T;
  varying vec3 v_normal;
  varying vec2 v_uv;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  void main() {
  
  v_normal = mat3(u_world_I_T) * a_normal;
  vec3 surfaceWorldPosition = (u_world * a_position).xyz;
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
  v_surfaceToView = u_cameraWorldPosition - surfaceWorldPosition;
  v_uv = a_texcoord;
  gl_Position = u_projection *u_view*u_world* a_position;
  }