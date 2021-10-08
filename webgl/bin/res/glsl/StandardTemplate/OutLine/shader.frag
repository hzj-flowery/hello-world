precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_texture;

void main(){
    
    float radius=.01;//描边的宽度
    //在shader中颜色的范围是0.0-1.0,下面这样设置颜色也没有问题
    //只是有一点需要注意，就是临近边缘像素他们的透明度可能会有不同，这个时候如果我们还是传1.0过去，可能会导致颜色不是那么绿
    vec3 u_outlineColor=vec3(0.,255.,1.);//描边的颜色
    float u_threshold=1.;//描边的模糊度
    vec4 accum=vec4(0.);
    vec4 normal=vec4(0.);
    normal=texture2D(u_texture,vec2(v_uv.x,v_uv.y));
    
    //对于png图片本身而言 那些透明区域的透明通道本身就是0,可以看到的部分透明通道都是不为0的
    //下面这个公式的算法就是 取一个正方形，正方形的中心为当前要绘制的像素中心，另外取四个拐角点
    //想象一下，拿着这个正方形在png图片上滑动，
    //只要有一个拐角放在了可以显示的像素区域里，那么就说明这里是有可能显示描边的颜色，但不一定显示
    //因为下方还有一个判断，就是正方形的中心点不能包含在有颜色的像素里，否则的话会以当前点的像素显示
    //如果正方形的中心点也不在可以显示的像素区域里的话，那么就可以显示描边的颜色
    //正方形的中心点到一个拐角的距离，就是描边的宽度
    accum+=texture2D(u_texture,vec2(v_uv.x-radius,v_uv.y-radius));//左下一个点
    accum+=texture2D(u_texture,vec2(v_uv.x+radius,v_uv.y-radius));//右下一个点
    accum+=texture2D(u_texture,vec2(v_uv.x+radius,v_uv.y+radius));//右上一个点
    accum+=texture2D(u_texture,vec2(v_uv.x-radius,v_uv.y+radius));//左上一个点
    accum*=u_threshold;//模糊度
    accum.rgb=u_outlineColor*accum.a;
    accum.a=0.;
    //下面这个公式就是判断当前的正方形中心区域不能落在可以显示有颜色的像素区域里
    normal=(accum*(1.-normal.a))+(normal*normal.a);
    
    if(normal.a>.01)
    {
        gl_FragColor=normal;
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