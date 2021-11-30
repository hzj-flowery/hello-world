#version 300 es
precision highp float;
#define GLSLIFY 1
uniform vec3 viewPosition;
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform vec3 ambientColor;
uniform float shininess;
uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gColor;

struct PointLight { 
	vec3 position; 
	vec3 color; 
	float shininess; 
	float line;
	float quad;
};
uniform PointLight u_pointLights[10];

struct SpotLight { 
	vec3 position; 
	vec3 direction; 
	vec3 color;
	float outerRad; 
	float innerRad;
	float shininess;
}; 
uniform SpotLight spotLights[3];

in vec2 texcoord;
out vec4 FragColor;

/*
 * \u70B9\u5149\u6E90
 */
vec3 getPointLights(vec3 fragPos, vec3 normal, vec3 color, vec3 viewDir) {
	vec3 ret = vec3(0.0);
	for(int i = 0; i < 10; i++) {
		vec3 lightPos = u_pointLights[i].position;
		vec3 lightColor = u_pointLights[i].color;
		float lightShininess = u_pointLights[i].shininess;

		vec3 lightDir = normalize(lightPos - fragPos);
		float cosTheta = max(dot(lightDir, normal), 0.0);
		vec3 diffuse = lightColor * color * cosTheta;
		// \u9AD8\u5149
		vec3 halfwayDir = normalize(lightDir + viewDir);
		float specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), lightShininess);
		vec3 specular = lightColor * specularIntensity;
		// \u5149\u5F3A\u8870\u51CF
		float dis = distance(lightPos, fragPos);
		float att = 1.0 / (1.0 + u_pointLights[i].line * dis + u_pointLights[i].quad * (dis * dis));

		ret += (diffuse + specular) * att;
	}
	return ret;
}

/*
 * \u805A\u5149\u706F
 */
vec3 getSpotLights(vec3 fragPos, vec3 normal, vec3 color, vec3 viewDir) {
	vec3 ret = vec3(0.0);
	for(int i = 0; i < 3; i++) {
		vec3 lightPos = spotLights[i].position;
		vec3 lightColor = spotLights[i].color;
		float lightShininess = spotLights[i].shininess;
		vec3 lightDir = normalize(spotLights[i].direction);
		float outerLimit = cos(spotLights[i].outerRad); //\u7167\u5C04\u8303\u56F4\u89D2\u5EA6|\u6A21\u7CCA\u5916\u5F84\u89D2\u5EA6
		float innerLimit = cos(spotLights[i].innerRad); //\u6A21\u7CCA\u5185\u5F84\u89D2\u5EA6

		vec3 surToLightDir = normalize(lightPos - fragPos); // \u70B9\u5149\u6E90\u53CD\u5411 \u5149\u6E90\u4F4D\u7F6E-\u9876\u70B9\u4F4D\u7F6E
		float dotFromDirection = dot(surToLightDir, lightDir); //\u5149\u6E90\u65B9\u5411\u4E0E\u8868\u9762\u5149\u7EBF\u65B9\u5411\u7684\u5939\u89D2
		float inlightBloom = smoothstep(outerLimit, innerLimit, dotFromDirection); //\u805A\u5149\u706F\u8303\u56F4 + \u8FB9\u7F18\u6A21\u7CCA
		float cosTheta = max(dot(surToLightDir, normal), 0.0); // \u5149\u7EBF\u65B9\u5411\u548C\u6CD5\u5411\u91CF\u7684\u5939\u89D2\uFF0C\u5B83\u4EEC\u7684\u70B9\u79EF\u5373\u53EF\u6C42\u51FA\u5939\u89D2\u4F59\u5F26\u503C(\u8303\u56F40-90\u5EA6)
		vec3 diffuse = lightColor * color * cosTheta * inlightBloom;
		// \u9AD8\u5149
		vec3 halfwayDir = normalize(surToLightDir + viewDir);
		float specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), lightShininess);
		vec3 specular = lightColor * specularIntensity * inlightBloom;

		ret += (diffuse + specular);
	}
	return ret;
}

void main() {
  vec3 fragPos = texture(gPosition, texcoord).rgb;
  vec3 normal = texture(gNormal, texcoord).rgb;
  vec3 color = texture(gColor, texcoord).rgb;
 
	vec3 viewDir = normalize(viewPosition - fragPos); //\u89C6\u70B9\u65B9\u5411 
	vec3 lightDir = normalize(lightDirection); // \u5E73\u884C\u5149\u65B9\u5411
	// vec3 lightDir = normalize(lightPos - fragPos); // \u70B9\u5149\u65B9\u5411
	float cosTheta = max(dot(lightDir, normal), 0.0); // \u5149\u7EBF\u65B9\u5411\u548C\u6CD5\u5411\u91CF\u5939\u89D2
	// \u73AF\u5883\u5149
	vec3 ambient = ambientColor * color;
	// \u6F2B\u53CD\u5C04
	vec3 diffuse = lightColor * color * cosTheta;
	// \u9AD8\u5149
	// vec3 halfwayDir = normalize(lightDir + viewDir);
	// float specularIntensity = pow(max(dot(normal, halfwayDir), 0.0), shininess);
	// vec3 specular = lightColor * specularIntensity;

	FragColor = vec4(ambient + diffuse + getPointLights(fragPos, normal, color, viewDir) + getSpotLights(fragPos, normal, color, viewDir), 1.0);
}