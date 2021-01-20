export enum ShaderUseVariantType {
    UndefinedMin = 0,

    Vertex,  //顶点缓冲
    Normal, //法线缓冲
    Tangent,
    UVs,    //uv坐标缓冲

    //目前支持同时使用9块纹理单元
    TEX_COORD, //纹理0号单元
    TEX_COORD1, //纹理1号单元
    TEX_COORD2, //纹理2号单元
    TEX_COORD3, //纹理3号单元
    TEX_COORD4, //纹理4号单元
    TEX_COORD5, //纹理5号单元
    TEX_COORD6, //纹理6号单元
    TEX_COORD7, //纹理7号单元
    TEX_COORD8, //纹理8号单元
    CUBE_COORD, //立方体纹理单元
    SKYBOX,//cube纹理单元


    Model,  //模型世界矩阵
    View,       //视口矩阵
    Projection,  //投影矩阵
    CustomMatrix,       //万能矩阵
    ModelInverse, //模型世界矩阵的逆矩阵
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
    LightColor,         //光的颜色
    LightDirection,     //光的方向
    SpecularColor,      //高光
    AmbientColor,       //环境光
    PointColor,         //点光
    Color,                    //节点颜色
    VertColor,          //顶点的颜色
    NodeCustomMatrix,         //节点的自定义矩阵
    UndefinedMax,//无效
}