attribute vec4 a_position;
  attribute vec3 a_normal;
  attribute vec2 a_uv;
  uniform vec3 u_lightWorldPosition;
  uniform vec3 u_cameraWorldPosition;
  uniform mat4 u_Mmat;
  uniform mat4 u_Pmat;
  uniform mat4 u_Vmat;
  uniform mat4 u_Mmat_I_T;
  varying vec3 v_normal;
  varying vec2 v_uv;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  void main() {
  
  v_normal = mat3(u_Mmat_I_T) * a_normal;
  vec3 surfaceWorldPosition = (u_Mmat * a_position).xyz;
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
  v_surfaceToView = u_cameraWorldPosition - surfaceWorldPosition;
  v_uv = a_uv;
  gl_Position = u_Pmat *u_Vmat*u_Mmat* a_position;
  }