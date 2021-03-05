import { Path } from "./Path";

export default class ShaderHelper {

    public static filterNode(node: cc.Node, id, reset?) {
        // if (!node) {
        //     return;
        // }
        // var children = node.childrenCount;
        // if (children > 0) {
        //     for (var i = 0; i < children; i++) {
        //         ShaderHelper.filterNode(node.children[i], id, reset);
        //     }
        // } else {
        //     var targetNode = null;
        //     var mvp = false;
        //     if (node.getComponent(cc.Sprite)) {
        //         targetNode = node.getComponent(cc.Sprite);
        //     } else if (node.getComponent(cc.Label)) {
        //         targetNode = node.getComponent(cc.Label);
        //         mvp = true;
        //     }
        //     var state = null;
        //     if (mvp) {
        //         var shaderName = 'custom_' + (id + '_mvp');
        //         var program = null;
        //         if (reset) {

        //             program = cc.GLProgramCache.getInstance().getGLProgram('ShaderPositionTextureColor');
        //         } else {
        //             program = cc.GLProgramCache.getInstance().getGLProgram(shaderName);
        //             if (!program) {
        //                 var shader = Path.getShader(id);
        //                 program = cc.GLProgram.create('shaders/PositionTextureColor.vsh', shader);
        //                 cc.GLProgramCache.getInstance().addGLProgram(program, shaderName);
        //                 program.bindAttribLocation(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
        //                 program.bindAttribLocation(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
        //                 program.bindAttribLocation(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
        //                 program.link();
        //                 program.updateUniforms();
        //             }
        //         }
        //         state = cc.GLProgramState.getOrCreateWithGLProgram(program);
        //     } else {
        //         var shaderName = 'custom_' + id;
        //         var program = null;
        //         if (reset) {
        //             program = cc.GLProgramCache.getInstance().getGLProgram('ShaderPositionTextureColor_noMVP');
        //         } else {
        //             program = cc.GLProgramCache.getInstance().getGLProgram(shaderName);
        //             if (!program) {
        //                 var shader = Path.getShader(id);
        //                 program = cc.GLProgram.create('shaders/PositionTextureColor_noMVP.vsh', shader);
        //                 cc.GLProgramCache.getInstance().addGLProgram(program, shaderName);
        //                 program.bindAttribLocation(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
        //                 program.bindAttribLocation(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
        //                 program.bindAttribLocation(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
        //                 program.link();
        //                 program.updateUniforms();
        //             }
        //         }
        //         state = cc.GLProgramState.getOrCreateWithGLProgram(program);
        //     }
        //     if (targetNode) {
        //         targetNode.setGLProgramState(state);
        //     }
        // }
    };
}