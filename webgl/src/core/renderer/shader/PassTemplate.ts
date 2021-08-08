
var template:any = {
    name: "Rtt/shader",
    template:true,
    state:[
        {
            key: "depthFunc",
            value: "glEnums.DS_FUNC_LESS"
        },
        {
            key: "depthTest",
            value: true
        },
        {
            key: "depthWrite",
            value: true
        },
        {
            key: "blend",
            value: true
        },
        {
            key: "blendSrcAlpha",
            value: "glEnums.BLEND_SRC_ALPHA"
        },
        {
            key: "blendDstAlpha",
            value: "glEnums.BLEND_ONE_MINUS_SRC_ALPHA"
        }
    ],
    custom:[
        {key:"DrawingOrder",value:1},
        {key:"ShaderType",value:"Rtt"}
    ]
}