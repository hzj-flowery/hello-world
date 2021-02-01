attribute vec4 a_position;
  attribute vec3 a_normal;
  attribute vec2 a_uv;
  uniform vec3 u_lightWorldPosition;
  uniform vec3 u_cameraWorldPosition;
  uniform mat4 u_MMatrix;
  uniform mat4 u_PMatrix;
  uniform mat4 u_VMatrix;
  uniform mat4 u_MITMatrix;
  varying vec3 v_normal;
  varying vec2 v_uv;
  varying vec3 v_surfaceToLight;
  varying vec3 v_surfaceToView;
  void main() {
  
  v_normal = mat3(u_MITMatrix) * a_normal;
  vec3 surfaceWorldPosition = (u_MMatrix * a_position).xyz;
  v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
  v_surfaceToView = u_cameraWorldPosition - surfaceWorldPosition;
  v_uv = a_uv;
  gl_Position = u_PMatrix *u_VMatrix*u_MMatrix* a_position;
  }