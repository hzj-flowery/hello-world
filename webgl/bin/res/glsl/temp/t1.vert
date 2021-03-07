#version 300 es
#define GLSLIFY 1
in vec4 aPosition;
in vec4 aNormal;
uniform mat4 modelMatrix;
uniform mat4 vpMatrix;
out vec3 vPosition;
out vec3 vNormal;

void main() {
	gl_Position = vpMatrix * modelMatrix * aPosition;
	vNormal = vec3(transpose(inverse(modelMatrix)) * aNormal);
	vPosition = vec3(modelMatrix * aPosition);
}