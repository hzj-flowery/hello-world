precision mediump float;
uniform sampler2D gDepth;
uniform sampler2D gUv;

varying vec4 v_position;
void main(){
    vec3 homogeneousDivisionPos = v_position.xyz/v_position.w; //齐次除法
    vec2 screenPos = homogeneousDivisionPos.xy*0.5+vec2(0.5);
    gl_FragColor=vec4(texture2D(gUv,screenPos).r,0.0,0.0,1.0);
}