precision mediump float;

const int NUM_STEPS=8;
const float PI=3.1415;
const float EPSILON=1e-3;
//设计分辨率
uniform vec4 u_resolution;
//时间
uniform float u_time;
//鼠标
uniform vec4 u_mouse;
// sea
const int ITER_GEOMETRY=3;
const int ITER_FRAGMENT=5;
const float SEA_HEIGHT=.6;
const float SEA_CHOPPY=4.;
const float SEA_SPEED=.8;
const float SEA_FREQ=.16;
const vec3 SEA_BASE=vec3(.1,.19,.22);
const vec3 SEA_WATER_COLOR=vec3(.8,.9,.6);

mat2 octave_m=mat2(1.6,1.2,-1.2,1.6);

// math
mat3 fromEuler(vec3 ang){
    vec2 a1=vec2(sin(ang.x),cos(ang.x));
    vec2 a2=vec2(sin(ang.y),cos(ang.y));
    vec2 a3=vec2(sin(ang.z),cos(ang.z));
    mat3 m;
    m[0]=vec3(a1.y*a3.y+a1.x*a2.x*a3.x,a1.y*a2.x*a3.x+a3.y*a1.x,-a2.y*a3.x);
    m[1]=vec3(-a2.y*a1.x,a1.y*a2.y,a2.x);
    m[2]=vec3(a3.y*a1.x*a2.x+a1.y*a3.x,a1.x*a3.x-a1.y*a3.y*a2.x,a2.y*a3.y);
    return m;
}
float hash(vec2 p){
    float h=dot(p,vec2(127.1,311.7));
    return fract(sin(h)*43758.5453123);
}

float handle_time(){
    return mod(u_time/1000.,90.);
}
float noise(in vec2 p){
    vec2 i=floor(p);
    vec2 f=fract(p);
    vec2 u=f*f*(3.-2.*f);
    return-1.+2.*mix(mix(hash(i+vec2(0.,0.)),
    hash(i+vec2(1.,0.)),u.x),
    mix(hash(i+vec2(0.,1.)),
    hash(i+vec2(1.,1.)),u.x),u.y);
}

// lighting
float diffuse(vec3 n,vec3 l,float p){
    return pow(dot(n,l)*.4+.6,p);
}
float specular(vec3 n,vec3 l,vec3 e,float s){
    float nrm=(s+8.)/(3.1415*8.);
    return pow(max(dot(reflect(e,n),l),0.),s)*nrm;
}

// sky
vec3 getSkyColor(vec3 e){
    e.y=max(e.y,0.);
    vec3 ret;
    ret.x=pow(1.-e.y,2.);
    ret.y=1.-e.y;
    ret.z=.6+(1.-e.y)*.4;
    return ret;
}

// sea
float sea_octave(vec2 uv,float choppy){
    uv+=noise(uv);
    vec2 wv=1.-abs(sin(uv));
    vec2 swv=abs(cos(uv));
    wv=mix(wv,swv,wv);
    return pow(1.-pow(wv.x*wv.y,.65),choppy);
}

float map(vec3 p){
    float freq=SEA_FREQ;
    float amp=SEA_HEIGHT;
    float choppy=SEA_CHOPPY;
    vec2 uv=p.xz;uv.x*=.75;
    float SEA_TIME=1.+handle_time()*SEA_SPEED;
    float d,h=0.;
    for(int i=0;i<ITER_GEOMETRY;i++){
        d=sea_octave((uv+SEA_TIME)*freq,choppy);
        d+=sea_octave((uv-SEA_TIME)*freq,choppy);
        h+=d*amp;
        uv*=octave_m;
        freq*=1.9;
        amp*=.22;
        choppy=mix(choppy,1.,.2);
    }
    return p.y-h;
}

float map_detailed(vec3 p){
    float freq=SEA_FREQ;
    float amp=SEA_HEIGHT;
    float choppy=SEA_CHOPPY;
    vec2 uv=p.xz;
    uv.x*=.75;
    float SEA_TIME=1.+handle_time()*SEA_SPEED;
    float d,h=0.;
    for(int i=0;i<ITER_FRAGMENT;i++){
        d=sea_octave((uv+SEA_TIME)*freq,choppy);
        d+=sea_octave((uv-SEA_TIME)*freq,choppy);
        h+=d*amp;
        uv*=octave_m;
        freq*=1.9;
        amp*=.22;
        choppy=mix(choppy,1.,.2);
    }
    return p.y-h;
}

vec3 getSeaColor(vec3 p,vec3 n,vec3 l,vec3 eye,vec3 dist){
    float fresnel=clamp(1.-dot(n,-eye),0.,1.);
    fresnel=pow(fresnel,3.)*.65;
    
    vec3 reflected=getSkyColor(reflect(eye,n));
    vec3 refracted=SEA_BASE+diffuse(n,l,80.)*SEA_WATER_COLOR*.12;
    
    vec3 color=mix(refracted,reflected,fresnel);
    
    float atten=max(1.-dot(dist,dist)*.001,0.);
    color+=SEA_WATER_COLOR*(p.y-SEA_HEIGHT)*.18*atten;
    
    color+=vec3(specular(n,l,eye,60.));
    
    return color;
}

// tracing
vec3 getNormal(vec3 p,float eps){
    vec3 n;
    n.y=map_detailed(p);
    n.x=map_detailed(vec3(p.x+eps,p.y,p.z))-n.y;
    n.z=map_detailed(vec3(p.x,p.y,p.z+eps))-n.y;
    n.y=eps;
    return normalize(n);
}

float heightMapTracing(vec3 ori,vec3 dir,out vec3 p){
    float tm=0.;
    float tx=1000.;
    float hx=map(ori+dir*tx);
    if(hx>0.)return tx;
    float hm=map(ori+dir*tm);
    float tmid=0.;
    for(int i=0;i<NUM_STEPS;i++){
        tmid=mix(tm,tx,hm/(hm-hx));
        p=ori+dir*tmid;
        float hmid=map(p);
        if(hmid<0.){
            tx=tmid;
            hx=hmid;
        }else{
            tm=tmid;
            hm=hmid;
        }
    }
    return tmid;
}

// main
vec4 mainImage(){
    
    vec2 uv=gl_FragCoord.xy/u_resolution.xy;
    uv=uv*2.-1.;
    uv.x*=u_resolution.x/u_resolution.y;
    float time=handle_time()*.3+u_mouse.x*.01;
    
    // ray
    vec3 ang=vec3(sin(time*3.)*.1,sin(time)*.2+.3,time);
    vec3 ori=vec3(0.,3.5,time*5.);
    vec3 dir=normalize(vec3(uv.xy,-2.));dir.z+=length(uv)*.15;
    dir=normalize(dir)*fromEuler(ang);
    
    // tracing
    vec3 p;
    heightMapTracing(ori,dir,p);
    vec3 dist=p-ori;
    float EPSILON_NRM=.1/u_resolution.x;
    vec3 n=getNormal(p,dot(dist,dist)*EPSILON_NRM);
    vec3 light=normalize(vec3(0.,1.,.8));
    
    // color
    vec3 color=mix(getSkyColor(dir),getSeaColor(p,n,light,dir,dist),pow(smoothstep(0.,-.05,dir.y),.3));
    
    // post
    return vec4(pow(color,vec3(.75)),1.);
}

void main(){ 
    gl_FragColor = mainImage();
}