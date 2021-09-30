#ifdef SY_HIGH_PRECISION
precision highp float;
#elif defined(SY_MEDIUM_PRECISION)
precision mediump float;
#elif defined(SY_LOW_PRECISION)
precision lowp float;
#else
precision mediump float;
#endif

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform float u_alpha;

void main(){
    vec4 normal=texture2D(u_texture,vec2(v_uv.x,v_uv.y));
    
    if(normal.a>.01)
    {
        gl_FragColor=vec4(1.,0.,0.,1.);
    }
    else
    {
        //对于png图片而言 透明度过小的部分 应该不要渲染 也就是不要将这个片元的数据写入颜色缓冲中
        //我们看不见一个颜色的时候 那么该颜色通道为0.0，它意味着没有颜色
        //这个区域里都是有颜色的【0.0,0.0,0.0】-》【1.0,1.0,1.0】
        //所以对于那些不透明的区域是需要丢弃的 注意如果我们不丢弃 就算我们在shader中不给gl_FragColor赋值 系统也会默认赋值的
        //所以对于png图片来说需要透明度测试 即丢弃
        discard;
    }
}