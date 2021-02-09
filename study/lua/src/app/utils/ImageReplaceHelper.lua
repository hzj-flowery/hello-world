--图片替换帮助类
--方便图片替换
--满足条件：1. csb名称匹配， 2.查找路径正确 3.指定替换图片
local ImageReplaceHelper = {}
local Path = require("app.utils.Path")

--外部调用，从image_convert表格中查找合适的控件，并替换对应图片
function ImageReplaceHelper.replaceImage(node,resFile)
    if not node then 
        return 
    end

    local findWiget, image = ImageReplaceHelper._matchConfig(node, resFile)
    if findWiget then
        logWarn("ImageReplaceHelper.replaceImage")
        ImageReplaceHelper._imageReplace(findWiget,image)
    end
end




function ImageReplaceHelper._imageReplace(node, file)
    if node == nil then
        return
    end

    local nodeType = tolua.type(node)
    if nodeType == "ccui.ImageView" then
        node:loadTexture(file)
    elseif nodeType == "cc.Sprite" then
        node:setTexture(file)
    elseif nodeType == "ccui.Button" then
        node:loadTextureNormal(file)
    elseif nodeType == "ccui.Layout" then
        node:setBackGroundImage(file)
    end
end



--根据资源名称查表
function ImageReplaceHelper._matchConfig(node,resFile)  
    local jsonFileName = "image_replace.json"
    local jsonString = cc.FileUtils:getInstance():getStringFromFile(jsonFileName)

    assert(jsonString, "Could not read the json file with path: "..tostring(jsonFileName))

    local jsonConfig = json.decode(jsonString)
    dump(jsonConfig)
    for i, value in ipairs(jsonConfig.covert_list) do
        local indexData = value
        if indexData.csb_name and indexData.csb_name ~= "" then
            local csbName = indexData.csb_name
            if csbName == resFile and indexData.control ~= "" then
                local findWidget = ccui.Helper:seekNodeByName(node, indexData.control)
                if findWidget then
                    return findWidget, indexData.image
                end
            end
        end
    end
    return nil
end

return ImageReplaceHelper
