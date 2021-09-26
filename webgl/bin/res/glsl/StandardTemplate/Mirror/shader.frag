precision highp float;
varying vec3 v_position;
varying vec3 v_normal;
uniform samplerCube u_cubeTexture;
uniform vec3 u_cameraWorldPosition;
#define USE_ENVMAP

void main(){
    vec3 normal=normalize(v_normal);
    vec3 eyeToSurfaceDir=normalize(v_position-u_cameraWorldPosition);
    vec3 direction=reflect(eyeToSurfaceDir,normal);
    #ifdef USE_ENVMAP
    gl_FragColor=textureCube(u_cubeTexture,direction);
    #else
    gl_FragColor=vec4(1.,0.,0.,1.);
    #endif
}