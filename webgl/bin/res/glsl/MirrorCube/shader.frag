precision highp float;
varying vec3 v_position;
varying vec3 v_normal;
uniform samplerCube u_cubeTexture;
uniform vec3 u_cameraWorldPosition;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 eyeToSurfaceDir = normalize(v_position - u_cameraWorldPosition);
    vec3 direction = reflect(eyeToSurfaceDir,normal);
    gl_FragColor = textureCube(u_cubeTexture, direction);
}