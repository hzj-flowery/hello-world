export enum ShaderUseVariantType {
    UndefinedMin = 0,

    Position,  //顶点缓冲
    Normal, //法线缓冲
    Tangent, //切线
    TEXTURE_COORD0,    //uv坐标缓冲

    //目前支持同时使用9块纹理单元
    TEXTURE0, //纹理0号单元
    TEXTURE1, //纹理1号单元
    TEXTURE2, //纹理2号单元
    TEXTURE3, //纹理3号单元
    TEXTURE4, //纹理4号单元
    TEXTURE5, //纹理5号单元
    TEXTURE6, //纹理6号单元
    TEXTURE7, //纹理7号单元
    TEXTURE8, //纹理8号单元
    CUBE_TEXTURE, //立方体纹理单元
    SKYBOX,//cube纹理单元
    TEX_CUSTOM, //自定义纹理 万能纹理
    
    GPosition,//延迟渲染--位置纹理
    GNormal,  //延迟渲染--法线纹理
    GColor,   //延迟渲染--颜色纹理
    GUv,      //延迟渲染--uv纹理
    GDepth,   //延迟渲染--深度纹理

    Model,  //模型世界矩阵
    View,       //视口矩阵
    Projection,  //投影矩阵
    CustomMatrix,       //万能矩阵
    ModelInverse, //模型世界矩阵的逆矩阵
    ViewModelInverseTransform, //视口矩阵*模型世界矩阵的逆矩阵的转置矩阵
    ModelTransform, //模型世界矩阵的转置矩阵
    ModelInverseTransform,//模型世界矩阵的逆矩阵的转置矩阵
    ViewModel,//视口*模型世界矩阵
    ProjectionViewModel,//投影*视口*模型世界矩阵
    ProjectionView,//投影*视口矩阵
    ProjectionViewInverse,//投影*视口矩阵的逆矩阵
    ProjectionInverse,//投影矩阵的逆矩阵
    ProjectionViewModelInverse,//(投影*视口*模型世界矩阵)的逆矩阵
    LightWorldPosition, //世界中光的位置
    CameraWorldPosition,//世界中相机的位置
    ParallelLight,     //平行光
    SpotLight,               //聚光
    SpecularLight,      //高光
    AmbientLight,       //环境光
    PointLight,         //点光
    Fog,                //雾
    Time,               //时间
    Color,                    //节点颜色
    EMISSIVE,             //自发光
    Diffuse,             //漫反射
    Alpha,                  //节点的透明度
    VertColor,          //顶点颜色
    VertMatrix,         //顶点矩阵
    ShadowInfo,             //阴影信息
    ShadowMap,              //阴影的深度纹理
    Mouse,             //鼠标按下的位置信息
    Resolution,       //设计分辨率
    FloatArray,            //数组
    Custom_Float_Value, //自定义一个float 变量
    UndefinedMax,//无效
}