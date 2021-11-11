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
        commonFuncion.set(syRender.ShaderDefineValue.SY_USE_FUNC_RIVER_FLOW,`
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
        vec3 getRiverFlowPosition(vec3 position,float time){
            return getRiverFlowPositionTwo(position,time);
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