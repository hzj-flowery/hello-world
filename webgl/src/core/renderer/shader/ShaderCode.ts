import { syRender } from "../data/RenderData"

export namespace ShaderCode {
    export var commonFuncion: Map<string, string> = new Map();
    export function init() {
        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_PACK, `
        //分解保存深度值
        vec4 pack (float depth) {
            // 使用rgba 4字节共32位来存储z值,1个字节精度为1/256
            const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
            const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
            // gl_FragCoord:片元的坐标,fract():返回数值的小数部分
            vec4 rgbaDepth = fract(depth * bitShift); //计算每个点的z值 
            rgbaDepth -= rgbaDepth.rgba * bitMask; // Cut off the value which do not fit in 8 bits
            return rgbaDepth;
        }
        `)
        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_UNPACK, `
        float unpack(const in vec4 rgbaDepth) {
            const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
            return dot(rgbaDepth, bitShift);
        }
        `)

        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_DITHERING, `
        float rand( vec2 seed ){

            // get pseudo-random number
                return fract( sin( dot( seed.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );
    
            }
        // based on https://www.shadertoy.com/view/MslGR8
	vec3 dithering( vec3 color,vec3 FragCoord) {
		//Calculate grid position
		float grid_position = rand( FragCoord.xy );

		//Shift the individual colors differently, thus making it even harder to see the dithering pattern
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );

		//modify shift acording to grid position.
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );

		//shift the color by dither_shift
		return color + dither_shift_RGB;
	}
        `)
        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_CATCH_FIRE, `
            /*
            fragColor: 片元的颜色
            v_uv:纹理的uv
            centerPos:设置目标的中心位置
            fireColor:火的颜色
            time:时间
            c2s:从目标中心向四周扩散，默认值为1.0，否则传入小于1.0的值
            f2b：燃烧过的地方为黑色，没有燃烧为纹理颜色，默认值为1.0，否则传入小于1.0的值
            */
            vec4 getCatchFire(vec4 fragColor,vec2 v_uv,vec2 centerPos,vec4 fireColor,float time,float c2s,float f2b){

                //取噪声的值
            vec2 pos = vec2(v_uv * 100.0);
            // float n = noise(pos);

            vec2 noise_i = floor(pos);
            vec2 noise_f = fract(pos);
            float noise_a = fract(sin(dot(noise_i.xy, vec2(12.9898,78.233))) * 43758.5453123);
            float noise_b = fract(sin(dot((noise_i + vec2(1.0, 0.0)).xy, vec2(12.9898,78.233))) * 43758.5453123);
            float noise_c = fract(sin(dot((noise_i + vec2(0.0, 1.0)).xy, vec2(12.9898,78.233))) * 43758.5453123);
            float noise_d = fract(sin(dot((noise_i + vec2(1.0, 1.0)).xy, vec2(12.9898,78.233))) * 43758.5453123);
            vec2 noise_u = sin(noise_f * 3.1415926 / 2.);
            float n = mix(mix(noise_a, noise_b, noise_u.x), mix(noise_c,noise_d, noise_u.x), noise_u.y);


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
        `)
        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_MAGNIFIER, `
        /*
        获取放大镜下的uv偏移
        v_uv:uv坐标
        resolution:屏幕分辨率
        mouse：鼠标位置
        circleRidus：放大镜半径 经验值 0.1
        zoomFact：放大倍数 经验值 0.3
        */
            vec2 getUVOffsetByMagnifier(vec2 v_uv,vec2 resolution,vec2 mouse,float circleRidus,float zoomFact){
                vec2 widthHeightScale = vec2(resolution.x/resolution.y,1.0);
                vec2 center = mouse.xy/resolution.xy;
                vec2 dir = center - v_uv;
                float circleEdgeStrength = 0.05;
                float dis = length(dir*widthHeightScale);
                float isZoomArea = smoothstep(circleRidus+circleEdgeStrength,circleRidus,dis);
                return dir*zoomFact*isZoomArea;
            }
        `)
        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_RIVER_FLOW, `
        //水面 波谷陡峭明显 适合大海 惊涛澎湃
        vec3 getRiverFlowPositionOne(vec3 position,float time){
            float x = position.x;
            float y = position.y;
            float PI = 3.141592653589;
        
            float sx = 0.0;
            float sy = 0.0;
            float sz = 0.0;
        
            float ti = 0.0;
            float index = 1.0;
            //水波方向
            vec2 dir;
            for(int i = 0;i<3;i++){
                ti = ti + 0.0005;
                index +=1.0;
                if(mod(index,2.0)==0.0){
                    dir = vec2(1.0,ti);
                }else{
                    dir = vec2(-1.0,ti);
                }
                //波长
                float l1 = 2.0 * PI / (0.5 + ti);
                //速度
                float s1 = 20.0 * 2.0 / l1;
                // float time=mod(u_time/1000.,90.);
                float x1 = 1.0 * dir.x * sin(dot(normalize(dir),vec2(x,y)) * l1 + time * s1);
                float y1 = 1.0 * dir.y * sin(dot(normalize(dir),vec2(x,y)) * l1 + time * s1);
                float z1 = 1.0 * sin(dot(normalize(dir),vec2(x,y)) * l1 + time * s1);
                sx +=x1;
                sy +=y1;
                sz +=z1;
            }
            sx = x + sx;
            sy = y + sy;
            return vec3(sx,sy,position.z+sin(sz)*10.0);
        }
        //水面 波浪明显
        vec3 getRiverFlowPositionTwo(vec3 position,float time){
            float x = position.x;
            float y = position.y;
            float PI = 3.141592653589;

            float sz = 0.0;
            float ti = 0.06;
            float index = 1.0;
            vec2 dir;//波的方向
            //四条正弦波相加
            for(int i = 0;i<4;i++){
                ti = ti + 0.0005;
                index = index + 0.1;
                if(mod(index,2.0)==0.0){
                    dir = vec2(1.0,ti);
                }else{
                    dir = vec2(-1.0,ti);
                }
                float l1 = 2.0 * PI / (0.5);//波长
                float s1 = 10.0 * 2.0 / l1;//速度
                float z1 = 1.0 * sin(dot(normalize(dir),vec2(x,y)) * l1 + time * s1);//正弦波方程式
                sz +=z1;
            }
            return vec3(x,y,position.z+sin(sz)*10.0);
        }
        //上下波动的小红旗
        vec3 getRiverFlowPositionThree(vec3 position,float time)
        {   
            //波长
            float sin_lamda = 5.0;
            //周期
            float sin_T = 1.0;
            //振幅
            float sin_A = 0.2;
            //y = A sin{ 2π ( t/T - x/λ ) }
            position.y = position.y + sin_A*sin(2.0*3.141592653*(time/sin_T - position.x/sin_lamda));
            return position;
        }
        vec3 getRiverFlowPosition(vec3 position,float time){
            return getRiverFlowPositionOne(position,time);
        }

        `)
        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_UNPACK_CUSTOM_TONE_MAPPING, `
        #ifndef saturate
        // <common> may have defined saturate() already
        #define saturate( a ) clamp( a, 0.0, 1.0 )
        #endif
        
        uniform float u_toneMappingExposure;
        
        // exposure only
        vec3 LinearToneMapping( vec3 color ) {
        
            return u_toneMappingExposure * color;
        
        }
        
        // source: https://www.cs.utah.edu/~reinhard/cdrom/
        vec3 ReinhardToneMapping( vec3 color ) {
        
            color *= u_toneMappingExposure;
            return saturate( color / ( vec3( 1.0 ) + color ) );
        
        }
        
        // source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
        vec3 OptimizedCineonToneMapping( vec3 color ) {
        
            // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
            color *= u_toneMappingExposure;
            color = max( vec3( 0.0 ), color - 0.004 );
            return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
        
        }
        
        // source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
        vec3 RRTAndODTFit( vec3 v ) {
        
            vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
            vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
            return a / b;
        
        }
        
        // this implementation of ACES is modified to accommodate a brighter viewing environment.
        // the scale factor of 1/0.6 is subjective. see discussion in #19621.
        
        vec3 ACESFilmicToneMapping( vec3 color ) {
        
            // sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
            const mat3 ACESInputMat = mat3(
                vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
                vec3( 0.35458, 0.90834, 0.13383 ),
                vec3( 0.04823, 0.01566, 0.83777 )
            );
        
            // ODT_SAT => XYZ => D60_2_D65 => sRGB
            const mat3 ACESOutputMat = mat3(
                vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
                vec3( -0.53108,  1.10813, -0.07276 ),
                vec3( -0.07367, -0.00605,  1.07602 )
            );
        
            color *= u_toneMappingExposure / 0.6;
        
            color = ACESInputMat * color;
        
            // Apply RRT and ODT
            color = RRTAndODTFit( color );
        
            color = ACESOutputMat * color;
        
            // Clamp to [0, 1]
            return saturate( color );
        
        }
        
        vec3 CustomToneMapping( vec3 color ) { return color; }
        `)
    }
}