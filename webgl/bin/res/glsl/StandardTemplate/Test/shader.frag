precision mediump float;
uniform float u_time;
uniform vec4 u_resolution;
const float count=2.;
float Hash(vec2 p,in float s)
{
	vec3 p2=vec3(p.xy,27.*abs(sin(s)));
	return fract(sin(dot(p2,vec3(27.1,61.7,12.4)))*273758.5453123);
}

float noise(in vec2 p,in float s)
{
	vec2 i=floor(p);
	vec2 f=fract(p);
	f*=f*(3.-2.*f);
	return mix(mix(Hash(i+vec2(0.,0.),s),Hash(i+vec2(1.,0.),s),f.x),mix(Hash(i+vec2(0.,1.),s),Hash(i+vec2(1.,1.),s),f.x),f.y)*s;
}

float fbm(vec2 p)
{
	float v=0.;
	v+=noise(p*1.,.35);
	v+=noise(p*2.,.25);
	v+=noise(p*4.,.125);
	v+=noise(p*8.,.0625);
	return v;
}

void main(void)
{

	vec2 uv=(gl_FragCoord.xy/u_resolution.xy)*2.-1.;
	uv.x*=u_resolution.x/u_resolution.y;

	vec3 finalColor=vec3(0.0);
	for(float i=1.;i<count;++i)
	{
		float t=abs(1./((uv.x+fbm(uv+(mod(u_time/1000.,90.)*5.0)/i))*(i*50.)));
		finalColor+=t*vec3(i*.075+.1,.5,2.);
	}
     
    gl_FragColor=vec4(finalColor,1.);

}
