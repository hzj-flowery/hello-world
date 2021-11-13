precision mediump float;
const int MAX_MARCHING_STEPS=255;
const float MIN_DIST=0.;
const float MAX_DIST=1000.;
const float EPSILON=.0001;
const float SPHERE_R=1.;
const float BOX_W=1.;
const float BOX_D=1.;
const float BOX_H=1.;
uniform vec4 u_resolution;
uniform float u_time;

#define M_PI 3.1415926535897932384626433832795
#define color1 vec4(1.,1.,1.,1.)
#define color2 vec4(1.,.8,.2,1.)
#define color3 vec4(1.,.03,0.,1.)
#define color4 vec4(.05,.02,.02,1.)
#define noiseSteps 1
#define noiseAmplitude .06
#define noiseFrequency 4.
#define animation vec3(0.,-6.,.5)
#define background vec4(.1,0.,0.,1.)

vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float saturate(float x)
{
     return max(0.0, min(1.0, x));

}
float handle_time(){
    return mod(u_time/1000.,90.)*5.0;
}
float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    vec3 i=floor(v+dot(v,C.yyy));// First corner
    vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);// Other corners
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;
    vec3 x2=x0-i2+C.yyy;// 2.0*C.x = 1/3 = C.y
    vec3 x3=x0-D.yyy;// -1.0+3.0*C.x = -0.5 = -D.y
    i=mod289(i);// Permutations
    vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
    float n_=.142857142857;// 1.0/7.0
    vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,7*7)
    vec4 x_=floor(j*ns.z);
    vec4 y_=floor(j-7.*x_);// mod(j,N)
    vec4 x=x_*ns.x+ns.yyyy;
    vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy);
    vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.+1.;
    vec4 s1=floor(b1)*2.+1.;
    vec4 sh=-step(h,vec4(0.));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
    vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);
    vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z);
    vec3 p3=vec3(a1.zw,h.w);
    //Normalise gradients
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;
    p1*=norm.y;
    p2*=norm.z;
    p3*=norm.w;
    // Mix final noise value
    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
    m=m*m;
    return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

float turbulence(vec3 position,float minFreq,float maxFreq,float qWidth){
    float value=0.;
    float cutoff=clamp(.5/qWidth,0.,maxFreq);
    float fade;
    float fOut=minFreq;
    for(int i=noiseSteps;i>=0;i--){
        if(fOut>=.5*cutoff)break;
        fOut*=2.;
        value+=abs(snoise(position*fOut))/fOut;
    }
    fade=clamp(2.*(cutoff-fOut)/cutoff,0.,1.);
    value+=fade*abs(snoise(position*fOut))/fOut;
    return 1.-value;
}

vec4 fireShade(float distance){
    float c1=saturate(distance*5.+.5);
    float c2=saturate(distance*5.);
    float c3=saturate(distance*3.4-.5);
    vec4 a=mix(color1,color2,c1);
    vec4 b=mix(a,color3,c2);
    return mix(b,color4,c3);
}

float maxcomp(in vec3 p){
    return max(p.x,max(p.y,p.z));
}

vec3 opTrans(vec3 p,vec3 d){
    return p-d;
}

vec3 opRep(vec3 p,vec3 spacing){
    return mod(p,spacing)-spacing/2.;
}

vec3 opTwist(vec3 p,float q){
    float c=cos(q*p.y+q);
    float s=sin(q*p.y+q);
    mat2 m=mat2(c,-s,s,c);
    return vec3(m*p.xz,p.y);
}

float sdPlane(vec3 p,vec4 n){
    return dot(p,n.xyz)+n.w;
}

float sdPyramid4(vec3 p,vec3 h){
    p.xz=abs(p.xz);
    vec3 n=normalize(h);
    return sdPlane(p,vec4(n,0.));
}

float sdTriPrism(vec3 p,vec2 h){
    vec3 q=abs(p);
    return max(q.z-h.y,max(q.x*.866025+p.y*.5,-p.y)-h.x*.5);
}

float sdBox(vec3 p,vec3 b,float r){
    vec3 d=abs(p)-b;
    return min(maxcomp(d),0.)-r+length(max(d,0.));
}

float sdSphere(vec3 p,float r){
    return length(p)-r;
}

vec2 sceneSDF(vec3 p){
    float time=handle_time();
    float noise=saturate(abs(turbulence(p*noiseFrequency+animation*time,.1,1.5,.03)*noiseAmplitude));
    vec3 q=p;
    float d=0.;
    d=sdSphere(q,.5)-noise;
    return vec2(d,noise);
}

vec2 shortestDistanceToSurface(vec3 eye,vec3 marchingDirection,float start,float end){
    float depth=start;
    for(int i=0;i<MAX_MARCHING_STEPS;i++){
        vec2 response=sceneSDF(eye+depth*marchingDirection);
        float dist=response.x;
        float noise=response.y;
        if(dist<EPSILON){
            return vec2(depth,noise);
        }
        depth+=dist;
        if(depth>=end){
            return vec2(end,noise);
        }
    }
    return vec2(end,0.);
}

vec3 rayDirection(float fieldOfView,vec2 size,vec2 fragCoord){
    vec2 xy=fragCoord-size/2.;
    float z=size.y/tan(radians(fieldOfView)/2.);
    return normalize(vec3(xy,-z));
}

mat3 rotationXY(vec2 angle){
    vec2 c=cos(angle);
    vec2 s=sin(angle);
    return mat3(
        c.y,0.,-s.y,
        s.y*s.x,c.x,c.y*s.x,
        s.y*c.x,-s.x,c.y*c.x
    );
}

vec3 hsb2rgb(in vec3 c){
    vec3 rgb=clamp(abs(mod(c.x*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);
    rgb=rgb*rgb*(3.-2.*rgb);
    return c.z*mix(vec3(1.),rgb,c.y);
}

void main(){
    vec3 viewDir=rayDirection(45.,u_resolution.xy,vec2(gl_FragCoord.xy));
    float time=handle_time()/6.;
    vec3 eye=vec3(0.,0.,5.);
    mat3 rot=rotationXY(vec2(0.,sin(time)*3.));
    eye=rot*eye;
    viewDir=rot*viewDir;
    vec3 dir=viewDir;
    vec2 distDisp=shortestDistanceToSurface(eye,dir,MIN_DIST,MAX_DIST);
    float dist=distDisp.x;
    float displacement=distDisp.y;
    if(dist>MAX_DIST-EPSILON){
       discard;
    }
    vec3 p=eye+dist*dir;
    vec3 K_a=vec3(.2,.2,.2);
    vec3 K_d=hsb2rgb(vec3(fract(handle_time()/8.),.9,.85));
    vec3 K_s=vec3(1.,1.,1.);
    float shininess=10.;
    vec4 color=mix(fireShade(displacement),vec4(K_s,1.),float(displacement>=.5));
    gl_FragColor=color;
}