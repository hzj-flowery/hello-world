precision mediump float;
uniform float u_time;
uniform vec4 u_resolution;
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

vec3 getFinalColor(float i,vec3 finalColor,vec2 uv){
	float t=abs(1./((uv.x+fbm(uv+(mod(u_time/1000.,90.)*5.0)/i))*(i*50.)));
	finalColor+=t*vec3(i*.075+.1,.5,2.);
	return finalColor;
}

void main(void)
{

	vec2 uv=(gl_FragCoord.xy/u_resolution.xy)*2.-1.;
	uv.x*=u_resolution.x/u_resolution.y;

	vec3 finalColor=vec3(0.0);
	finalColor = getFinalColor(1.0,finalColor,uv);
	finalColor = getFinalColor(2.0,finalColor,uv);
	finalColor = getFinalColor(3.0,finalColor,uv);
	finalColor = getFinalColor(4.0,finalColor,uv);
    // finalColor = getFinalColor(5.0,finalColor,uv);
	// finalColor = getFinalColor(6.0,finalColor,uv);
	// finalColor = getFinalColor(7.0,finalColor,uv);
	// finalColor = getFinalColor(8.0,finalColor,uv);
	// finalColor = getFinalColor(9.0,finalColor,uv);
	// finalColor = getFinalColor(10.0,finalColor,uv);
	// finalColor = getFinalColor(11.0,finalColor,uv);
	// finalColor = getFinalColor(12.0,finalColor,uv);
	// finalColor = getFinalColor(13.0,finalColor,uv);
	// finalColor = getFinalColor(14.0,finalColor,uv);
	// finalColor = getFinalColor(15.0,finalColor,uv);
	// finalColor = getFinalColor(16.0,finalColor,uv);
	// finalColor = getFinalColor(17.0,finalColor,uv);
	// finalColor = getFinalColor(18.0,finalColor,uv);
	// finalColor = getFinalColor(19.0,finalColor,uv);
	// finalColor = getFinalColor(20.0,finalColor,uv);


	if(finalColor.r<=0.9
	 &&finalColor.g<=0.9
	 &&finalColor.b<=1.0)
	discard;
    gl_FragColor=vec4(finalColor,1.);

}
