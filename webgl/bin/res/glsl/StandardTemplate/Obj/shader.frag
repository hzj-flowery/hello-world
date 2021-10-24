precision mediump float;

  varying vec3 v_normal;
  varying vec3 v_tangent;
  varying vec3 v_surfaceToView;
  varying vec2 v_texcoord;
  varying vec4 v_color;

  uniform vec3 u_diffuse;
  uniform sampler2D u_diffuseMap;
  uniform vec3 u_ambient;
  uniform vec3 u_emissive;
  uniform vec3 u_specular;
  uniform sampler2D specularMap;
  uniform float u_specular_shininess;
  uniform sampler2D u_normalMap;
  uniform float u_alpha;
  uniform vec3 u_lightDirection;
  uniform vec3 u_ambientLight;

  void main () {
    //世界空间下的法线
    vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    //世界空间下的切线
    vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );

    //副切线
    vec3 bitangent = normalize(cross(normal, tangent));
    
    //创建一个矩阵 切线 副切线 法线
    mat3 tbn = mat3(tangent, bitangent, normal);
    normal = texture2D(u_normalMap, v_texcoord).rgb * 2. - 1.; 
    normal = normalize(tbn * normal);

    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
    vec4 specularMapColor = texture2D(specularMap, v_texcoord);
    vec3 effectiveSpecular = u_specular * specularMapColor.rgb;

    vec4 diffuseMapColor = texture2D(u_diffuseMap, v_texcoord);
    vec3 effectiveDiffuse = u_diffuse * diffuseMapColor.rgb * v_color.rgb;
    float effectiveOpacity = u_alpha * diffuseMapColor.a * v_color.a;

    gl_FragColor = vec4(
        u_emissive +
        u_ambient * u_ambientLight +
        effectiveDiffuse * fakeLight +
        effectiveSpecular * pow(specularLight, u_specular_shininess),
        effectiveOpacity);
  }