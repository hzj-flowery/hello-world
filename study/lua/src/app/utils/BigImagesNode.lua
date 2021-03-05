--大尺寸 图片分割
local BigImagesNode = class("BigImagesNode", cc.Node)


function BigImagesNode:ctor(path)
    string.gsub(path, "(.+/)(.-)(%..+)",function(imagePath, imageName,imageExt)
        if not imagePath or not imageName or not imageExt then
            return
        end
        logWarn(string.format("parse path   imagePath = %s  imageName = %s  imageExt = %s", imagePath, imageName,imageExt))
        local bigImagePath = imagePath..imageName..imageExt
        local fileUtils = cc.FileUtils:getInstance()
        if fileUtils:isFileExist(bigImagePath) then
            local sp = cc.Sprite:create(bigImagePath)
            self:setContentSize(sp:getContentSize())
            sp:setAnchorPoint(cc.p(0, 0))
            self:addChild(sp)
            return
        end

        local bigImageConfigPath = imagePath..imageName..".json"
        if fileUtils:isFileExist(bigImageConfigPath) then
            local str = fileUtils:getStringFromFile(bigImageConfigPath)
            if not str then
                return
            end

            local cfg = json.decode(str)
            if not cfg then
                return
            end
            self:setContentSize(cc.size(cfg.width, cfg.height))
            for k , v in ipairs(cfg.children) do
                local childPath = imagePath..v.name
                local sp = cc.Sprite:create(childPath)
                if sp then
                    sp:setAnchorPoint(cc.p(0, 0))
                    sp:setPosition(cc.p(v.x, v.y))
                    self:addChild(sp)
                end
            end
        end
    end)
end

return BigImagesNode
