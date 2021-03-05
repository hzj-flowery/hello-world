--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- icon构建帮助类

local UIHelper = require("yoka.utils.UIHelper")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ComponentIconHelper = {

}


--Icon坐标转换
function ComponentIconHelper._setPostion(params, posDesc)
    local position = cc.p(0,0)
    local anchorPoint = cc.p(0,0)
    --左下
    if posDesc == "leftBottom" then
         position = cc.p(8,8)
         anchorPoint = cc.p(0,0)
    end
    --左上
    if posDesc == "leftTop" then
        position = cc.p(8, 95)
        anchorPoint = cc.p(0, 1)
    end
    --中上
    if posDesc == "midTop" then
        position = cc.p(50, 88)
        anchorPoint = cc.p(0.5, 1)
    end
    --正中
    if posDesc == "midcenter" then
        position = cc.p(49, 49)
        anchorPoint = cc.p(0.5, 0.5)
    end
    --右下
    if posDesc == "rightBottom" then
    	position = cc.p(88, 3)
		anchorPoint = cc.p(1, 0)
    end
    --中下下
    if posDesc == "midEnd" then
    	position = cc.p(50, -3)
		anchorPoint = cc.p(0.5, 1)
    end

    --武将列表-“已上阵”等
    if posDesc == "leftTop2" then
        position = cc.p(21, 75)
        anchorPoint = cc.p(0.5, 0.5)
    end

    --选中Icon
    if posDesc == "selectIcon" then
        position = cc.p(49, 39)
        anchorPoint = cc.p(0.5, 0.5)
    end

    params.position = position
    params.anchorPoint = anchorPoint
end

function ComponentIconHelper.buildItemContentPanel()
    local params = {
        name = "_panelItemContent",
        contentSize = cc.size(98,98),
        anchorPoint = cc.p(0.5,0.5),
        position = cc.p(0, 0)
    }
    local panelItemContent = UIHelper.createPanel(params)

    return panelItemContent
end



--动态创建UIIcon， 传入Type Value
function ComponentIconHelper.createIcon(type,value,size)

    local className = TypeConvertHelper.getTypeClass(type)
    -- assert(className,"item contorl can't be nil")
    local iconNode = UIHelper.createBaseIcon(type)

    if className then 
        if cc.isRegister(className) then
            logDebug("ComponentIconHelper.createIcon bind icon class name : "..className)
            cc.bind( iconNode, className)
        end

        if value and value > 0 then
            if type == TypeConvertHelper.TYPE_HEAD_FRAME or
               type == TypeConvertHelper.TYPE_TITLE then 
                size = 1 * (100/130)
            end
            iconNode:updateUI(value,size)
            iconNode:isClickFrame()
        end
    else
        cc.bind(iconNode,"CommonDefaultIcon")
        -- iconNode:updateUI(value,size)
    end

    return iconNode

end



return ComponentIconHelper
