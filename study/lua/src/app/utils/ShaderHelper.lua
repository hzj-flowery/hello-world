local ShaderHelper = {}

local Path = require("app.utils.Path")

function ShaderHelper.filterNode(node, id, reset)
    if not node then 
        return 
    end

    local children = node:getChildren()
    if #children > 0 then
        for i = 1, #children do
            ShaderHelper.filterNode(children[i], id, reset)
        end
    else
        local targetNode = nil
        local mvp = false
        local nodeType = tolua.type(node)
        if nodeType == "ccui.ImageView" then
            targetNode = node:getVirtualRenderer():getSprite()
        elseif nodeType == "cc.Sprite" then
            targetNode = node
        elseif nodeType == "sp.SkeletonAnimation" or nodeType == "sp.SkeletonNode" then
            targetNode = node
        elseif nodeType == "cc.Scale9Sprite" then
            targetNode = node:getSprite()
        elseif nodeType == "ccui.Text" or nodeType =="ccui.TextBMFont" then
            targetNode = node:getVirtualRenderer()
            mvp = true
        end
        
        local state = nil
        if mvp then
            local shaderName = "custom_"..id.."_mvp"
            local program = nil
            if reset then
                program = cc.GLProgramCache:getInstance():getGLProgram("ShaderPositionTextureColor")
            else
                program = cc.GLProgramCache:getInstance():getGLProgram(shaderName)
                if not program then
                    local shader = Path.getShader(id)
                    program = cc.GLProgram:create("shaders/PositionTextureColor.vsh", shader)
                    cc.GLProgramCache:getInstance():addGLProgram(program, shaderName)
                    program:bindAttribLocation(cc.ATTRIBUTE_NAME_POSITION,cc.VERTEX_ATTRIB_POSITION)
                    program:bindAttribLocation(cc.ATTRIBUTE_NAME_COLOR,cc.VERTEX_ATTRIB_COLOR)
                    program:bindAttribLocation(cc.ATTRIBUTE_NAME_TEX_COORD,cc.VERTEX_ATTRIB_TEX_COORDS)
                    program:link()
                    program:updateUniforms()
                end
            end
            state = cc.GLProgramState:getOrCreateWithGLProgram(program)
        else
            local shaderName = "custom_"..id
            local program = nil
            if reset then
                program = cc.GLProgramCache:getInstance():getGLProgram("ShaderPositionTextureColor_noMVP")
            else
                program = cc.GLProgramCache:getInstance():getGLProgram(shaderName)
                if not program then
                    local shader = Path.getShader(id)
                    program = cc.GLProgram:create("shaders/PositionTextureColor_noMVP.vsh", shader)
                    cc.GLProgramCache:getInstance():addGLProgram(program, shaderName)
                    program:bindAttribLocation(cc.ATTRIBUTE_NAME_POSITION,cc.VERTEX_ATTRIB_POSITION)
                    program:bindAttribLocation(cc.ATTRIBUTE_NAME_COLOR,cc.VERTEX_ATTRIB_COLOR)
                    program:bindAttribLocation(cc.ATTRIBUTE_NAME_TEX_COORD,cc.VERTEX_ATTRIB_TEX_COORDS)
                    program:link()
                    program:updateUniforms()
                end
            end
            state = cc.GLProgramState:getOrCreateWithGLProgram(program)
        end
        if targetNode then
            targetNode:setGLProgramState(state)
        end
    end
end

return ShaderHelper
