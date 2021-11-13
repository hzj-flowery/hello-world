precision mediump float;
	//通过传入的时间值控制燃烧的程度
uniform float u_time;
uniform sampler2D u_texture;
varying vec2 v_uv;
	//取随机值
float random (in vec2 st) {
	return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
	
float handle_time(){
    return mod(u_time/1000.,90.);
}
	//噪声
float noise (in vec2 st) {
	vec2 i = floor(st);
	vec2 f = fract(st);
	float a = random(i);
	float b = random(i + vec2(1.0, 0.0));
	float c = random(i + vec2(0.0, 1.0));
	float d = random(i + vec2(1.0, 1.0));
    // vec2 u = smoothstep(0.,1.,f);
    // return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    vec2 u = sin(f * 3.1415926 / 2.);
	return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
/*
fragColor:
v_uv:
centerPos:
fireColor:
time:
c2s:
f2b
*/
vec4 getCatchFire(vec4 fragColor,vec2 v_uv,vec2 centerPos,vec4 fireColor,float time,float c2s,float f2b){

      //取噪声的值
	vec2 pos = vec2(v_uv * 100.0);
	float n = noise(pos);
	//设置火焰燃烧的走势
	//设置目标中心点 
	vec2 ct = centerPos;
	//方案1 由四周向设置的中心集中
	// float d = 1. - distance (v_uv, ct) / sqrt(0.5);    //直接输出vec4(d, d, d, 1.)见图2
	//方案2 由设置的中心向四周扩散
    // float d = distance (v_uv, ct) / sqrt(0.5);    //直接输出vec4(d, d, d, 1.)见图2

	c2s = step(1.0,c2s);
	float d = c2s*distance (v_uv, ct) / sqrt(0.5)+(1.0-c2s)*(1. - distance (v_uv, ct) / sqrt(0.5));


	//设置火焰区域的紧密程度
	//方案1  火焰燃烧过的地方为纹理的颜色，没有燃烧到的地方是黑色 一点点向四周扩散
	// float s = 1. - smoothstep(d - 0.3, d + 0.3, time);
    //方案2 火焰燃烧过的地方为黑色 没有燃烧到的地方是纹理的颜色
	// float s = smoothstep(d - 0.3, d + 0.3, time);

    f2b = step(1.0,f2b);
	float s = f2b*smoothstep(d - 0.3, d + 0.3, time)+(1.0-f2b)*(1. - smoothstep(d - 0.3, d + 0.3, time));
	s = mix(mix(n, d, 0.5), (s - 0.5) * 4., 0.5);		//直接输出vec4(s, s, s, 1.)见图3

	

	//燃烧后的颜色
	float f1 = step(0.3, s);
	vec4 fv1 = f1 * fireColor;
	//将要燃烧的区域
	float f2 = smoothstep(-0.2, 0.3, s) * step(s, 0.3);
	vec4 fv2 = f2 * vec4(-0.5, -1., -1., 0.);
	//燃烧的火焰的区域
	float f3 = step(s, 0.31) * step(0.3, s);
	vec4 fv3 = f3 * vec4(1.0, 1.0, 0., 1.);
	//未燃烧的区域
	float f4 = step(s, 0.3);
	vec4 fv4 = f4 * fragColor;

	return fv4 + fv2 + fv3 + fv1;
}
	
void main() {
	gl_FragColor = getCatchFire(texture2D(u_texture, v_uv),v_uv,vec2(0.5, 0.5),vec4(0.0, 0., 0., 1.),handle_time(),1.0,1.0);
}
