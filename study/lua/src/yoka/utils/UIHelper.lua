
--UI 帮助函数
local UIHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

--根据百分比设置node位置
--相对于node父节点，cc.p(0.5,0.5)-- 代表正中间
--anchorPoint可选
function UIHelper.setPosByPercent(node, percent, anchorPoint)
    if node == nil or percent == nil then
        return
    end
    local parent = node:getParent()
    if parent == nil then
        return
    end
    local containerSize = parent:getContentSize()
    local xPos = containerSize.width * percent.x;
    local yPos = containerSize.height * percent.y;
    node:setPosition(xPos,yPos)
    if anchorPoint then
        node:setAnchorPoint(anchorPoint)
    end
end


--传入一组widget，计算大小
function UIHelper.computeWidgetSize( ... )
    -- body
    local maxSize = cc.size(0,0)
    local nodeList = {...}
	for i,node in pairs(nodeList) do
		if node then
			local contentSize = node:getContentSize()
            maxSize.width = contentSize.width + maxSize.width
            maxSize.height = contentSize.height + maxSize.height
		end
	end
    return maxSize
end

--计算文本行数
function UIHelper.computeTextLineSize(contentSize, limitWidth)
    local line = math.ceil(contentSize.width / limitWidth)
    return line
end

--
function UIHelper.updateNodeInfo(node,params)
    assert( node, params, string.format("Invalid node: %s param: %s",tostring(node), tostring(params)) )

    if params.contentSize then
        node:setContentSize(params.contentSize)
    end

    if params.name then
       node:setName(params.name)
    end

    if params.anchorPoint then
        node:setAnchorPoint(params.anchorPoint)
    end

    if params.position then
        node:setPosition(params.position.x, params.position.y)
    end

    node:setCascadeOpacityEnabled(true)
end

--创建Panel层
function UIHelper.createPanel(params)
    local panel = ccui.Layout:create()

    UIHelper.updateNodeInfo(panel,params)
    return panel
end

--创建ImageView
function UIHelper.createImage(params)

	local uiImage = ccui.ImageView:create()


    UIHelper.updateNodeInfo(uiImage,params)
    if params.adaptWithSize then
        uiImage:ignoreContentAdaptWithSize(true)
    end

    if params.texture then
        uiImage:loadTexture(params.texture, ccui.TextureResType.localType)
    end

    if params.name then
       uiImage:setName(params.name)
    end

    if params.scale then
        uiImage:setScale(params.scale)
    end

    if params.rotation then
        uiImage:setRotation(params.rotation)
    end

    return uiImage
end


--创建ColorLayer
function UIHelper.createColorLayer()
    local colorLayer = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*0.4))
	colorLayer:setAnchorPoint(0.5,0.5)
	colorLayer:setIgnoreAnchorPointForPosition(false)
	colorLayer:setContentSize(cc.size(98,98))
    colorLayer:setPosition(cc.p(49,49))
    return colorLayer
end


--创建Label
function UIHelper.createLabel(params)
    local fontSize = params.fontSize or 22
    local fontPath = params.fontName or Path.getCommonFont()
    local text = params.text or ""
	local uiText = ccui.Text:create(text, fontPath, fontSize)



    if params.color ~= nil then
        uiText:setColor(params.color)
    end

    if params.outlineColor ~= nil then
        uiText:enableOutline(params.outlineColor, params.outlineSize or 2)
    end

    UIHelper.updateNodeInfo(uiText,params)
    return uiText
end


function UIHelper.createBaseIcon(type)
    local rootNode = cc.Node:create()

    rootNode:setCascadeOpacityEnabled(true)

    if type == TypeConvertHelper.TYPE_EQUIPMENT or TypeConvertHelper.TYPE_PET then --装备加特效底层
        local nodeEffectDown = cc.Node:create()
        nodeEffectDown:setName("NodeEffectDown")
        rootNode:addChild(nodeEffectDown)
    end

    local imageBkParam = {
        contentSize = cc.size(98,98),
        anchorPoint = cc.p(0.5,0.5),
        position = cc.p(0,0),
        name = "ImageBg",
        texture = TypeConvertHelper.getTypeClass(type) ~= nil and "" or Path.getUICommonFrame("img_frame_bg01")
    }
    local imageBg = UIHelper.createImage(imageBkParam)
    rootNode:addChild(imageBg)

    if type == TypeConvertHelper.TYPE_SILKBAG then --锦囊加中间层
        local imageMidParam = {
            contentSize = cc.size(82,82),
            anchorPoint = cc.p(0.5,0.5),
            position = cc.p(0,0),
            name = "ImageMidBg",
        }
        local imageMidBg = UIHelper.createImage(imageMidParam)
        rootNode:addChild(imageMidBg)
    end
    local ParameterIDConst = require("app.const.ParameterIDConst")
    local Parameter = require("app.config.parameter")
    local res = Parameter.get(ParameterIDConst.DEFAULT_ICON).content
    local imageIconParam = {
        contentSize = cc.size(50,50),
        anchorPoint = cc.p(0.5,0.5),
        position = cc.p(0,0),
        name = "ImageIcon",
        texture = TypeConvertHelper.getTypeClass(type) ~= nil and "" or Path.getDefaultIcon(res)
    }
    local imageIcon = UIHelper.createImage(imageIconParam)
    rootNode:addChild(imageIcon)

    if type == TypeConvertHelper.TYPE_EQUIPMENT or TypeConvertHelper.TYPE_PET then --装备加特效顶层
        local nodeEffectUp = cc.Node:create()
        nodeEffectUp:setName("NodeEffectUp")
        rootNode:addChild(nodeEffectUp)
    end

    if type == TypeConvertHelper.TYPE_EQUIPMENT or type == TypeConvertHelper.TYPE_TREASURE then
        -- 添加玉石槽节点
        local NodeJadeSlot = cc.Node:create()
        NodeJadeSlot:setName("NodeJadeSlot")
        NodeJadeSlot:setPosition(-1, -44)
        rootNode:addChild(NodeJadeSlot)
    end

    if type == TypeConvertHelper.TYPE_HORSE then
        -- 战马icon，需要添加装备简介节点
        local imageEquipBriefParam = {
            anchorPoint = cc.p(0.5,0.5),
            position = cc.p(0,-44),
            name = "ImageEquipBrief",
            texture = Path.getHorseImg("img_horse01"),
        }
        local imageEquipBrief = UIHelper.createImage(imageEquipBriefParam)
        imageEquipBrief:setVisible(false)
        rootNode:addChild(imageEquipBrief)

        -- 3给装备icon
        for i = 1, 3 do
            local imgBriefParam = {
                anchorPoint = cc.p(0.5,0.5),
                position = cc.p(12 + 21 *(i-1),11.8),
                name = "imgBrief_"..i,
                texture = Path.getHorseImg("img_horse04"),
            }
            local imgBrief = UIHelper.createImage(imgBriefParam)
            imgBrief:setVisible(false)
            imageEquipBrief:addChild(imgBrief)
        end
    end

    local imageDoubleParam = {
        contentSize = cc.size(98,98),
        anchorPoint = cc.p(0.5,0.5),
        position = cc.p(-22.28, 33.54),
        name = "ImageDoubleTips",
        texture = Path.getTextSignet("txt_com_double01"),
        rotation = 5,
    }
    local ImageDoubleTips = UIHelper.createImage(imageDoubleParam)
    ImageDoubleTips:setVisible(false)
    rootNode:addChild(ImageDoubleTips)

    if type == TypeConvertHelper.TYPE_PET then
        local starRoot = cc.Node:create()
        starRoot:setName("starRoot")
        starRoot:setPosition(cc.p(-42, -47))
        starRoot:setScale(0.6)
        rootNode:addChild(starRoot)

        for i = 1, 5 do
            local imgStarParam = {
                anchorPoint = cc.p(0, 0),
                position = cc.p(0 + 26 *(i-1), 0),
                name = "ImageStar"..i,
                texture = Path.getCommonImage("img_lit_stars02"),
            }

            local starImg = UIHelper.createImage(imgStarParam)
            starImg:setVisible(false)
            starRoot:addChild(starImg)
        end
    end


    return rootNode
end

--[[
    cellValue = {
        type,
        value,
        size,
    }
]]
function UIHelper.createIconTemplate(cellValue, scale)
    if cellValue == nil then
        return nil
    end
    scale = scale or 1.0
	local widget = ccui.Widget:create()
    local CSHelper = require("yoka.utils.CSHelper")
    local uiNode = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
	uiNode:initUI(cellValue.type, cellValue.value, cellValue.size)
    uiNode:setScale(scale)
    uiNode:setTouchEnabled(true)
    
	local panelSize = uiNode:getPanelSize()
    if rawequal(cellValue.type, TypeConvertHelper.TYPE_TITLE) then
        uiNode:setScale(0.8)
        panelSize.width = panelSize.width * 0.9
	    panelSize.height = panelSize.height* 0.9
    else
        panelSize.width = panelSize.width * scale
        panelSize.height = panelSize.height* scale     
    end
   
	widget:setContentSize(panelSize)
	widget:setAnchorPoint(cc.p(0,0))
	uiNode:setPositionX(panelSize.width*0.5)
	uiNode:setPositionY(panelSize.height*0.5)
	widget:addChild(uiNode)

	return widget,uiNode
end

function UIHelper.createRichText()

end

function UIHelper.getRichTextSizeWithContent(width, des, font, fontSize)
    local font = font == nil and Path.getCommonFont() or font
    local fontSize = fontSize == nil and 22 or fontSize

    local label = cc.Label:createWithTTF(des, font, fontSize)
    label:setWidth(width)

    return label:getContentSize()
end

--根据时间戳差值 获取格式化的时间 HH:MM:SS 08:10:33
function UIHelper.fromatHHMMSS(diff_timestamp)
    local sec=diff_timestamp >= 0 and diff_timestamp or 0

    local h=math.floor(sec/3600)
    local m=math.floor((sec-h*3600) / 60)
    local s=sec-h*3600-m*60
    return string.format("%02d:%02d:%02d",h,m,s)
end




function UIHelper.seekSpAndFilter(p_node,p_state)

    if( p_node == nil ) then return end
    local children=p_node:getChildren()
    if(#children>0)then
        for i=1,#children do
            UIHelper.seekSpAndFilter(children[i],p_state)
        end
    else
        local render = nil
        local is_mvp = false
        if(tolua.type(p_node)=="ccui.ImageView")then
            render = p_node:getVirtualRenderer():getSprite()
        elseif(tolua.type(p_node)=="cc.Sprite")then
            render = p_node
        elseif(tolua.type(p_node)=="cc.Scale9Sprite")then
            render = p_node:getSprite()
        end

        if(render~=nil)then
            render:setGLProgramState(p_state)
        end
    end
end


function UIHelper.removeFilter(sp)
    if(sp~=nil)then

        local p= cc.GLProgramState:getOrCreateWithGLProgramName("ShaderPositionTextureColor_noMVP")
        if(p~=nil)then
            UIHelper.seekSpAndFilter(sp,p)
        end
    end
end


function UIHelper.applyGrayFilter(sp)
    if(sp~=nil)then
        local p = cc.GLProgramState:getOrCreateWithGLProgramName("ShaderUIGrayScale")
        UIHelper.seekSpAndFilter(sp,p)
    end
end


--创建两个label。
--一般是 描述：数值 的形式
function UIHelper.createTwoLabel(params1, params2)
    local node = ccui.Widget:create()
    local label1 = UIHelper.createLabel(params1)
    label1:setAnchorPoint(cc.p(0,0))
    local label2 = UIHelper.createLabel(params2)
    label2:setAnchorPoint(cc.p(0,0))
    node:addChild(label1)
    local label1Size = label1:getContentSize()
    label2:setPositionX(label1Size.width)
    node:addChild(label2)
    local label2Size = label2:getContentSize()

    node:setContentSize(cc.size(label1Size.width+label2Size.width,label1Size.height))
    return node,label1,label2
end


--创建一组label。
function UIHelper.createLabels(paramsTable)
    local rangSize = cc.size(0,0)
    local node = ccui.Widget:create()
    for i, value in ipairs(paramsTable) do
        local label = UIHelper.createLabel(value)
        label:setAnchorPoint(cc.p(0,0))
        label:setPositionX(rangSize.width)
        local labelSize = label:getContentSize()
        rangSize.width = rangSize.width + labelSize.width
        rangSize.height = labelSize.height
        node:addChild(label)
    end
    node:setContentSize(rangSize)
    return node
end

function UIHelper.setTextLineSpacing(textWidget, space)
    if textWidget then
        local render = textWidget:getVirtualRenderer()
        if render then
            render:setLineSpacing(space)
        end
    end
end

--根据参数，创建image label
function UIHelper.createRichItems(paramsTable,adaptSize)
    local rangSize = cc.size(0,0)
    local node = ccui.Widget:create()
    for i, value in ipairs(paramsTable) do
        local widget = nil
        if value.type == "label" then
            widget = UIHelper.createLabel(value)
        elseif value.type == "image"then
            widget = UIHelper.createImage(value)
        end
        if widget == nil then
            assert(false, "params must set type name !!!")
        end
        widget:setAnchorPoint(cc.p(0,0))
        widget:setPositionX(rangSize.width)
        local widgetSize = widget:getContentSize()
        local widgetWidth =  widgetSize.width
        if value.scale then
            widget:setScale(value.scale)
            widgetWidth = widgetSize.width * value.scale
        end
        rangSize.width = rangSize.width + widgetWidth
        rangSize.height = math.max(widgetSize.height,rangSize.height)
        node:addChild(widget)
    end

    if adaptSize == nil then
         node:setContentSize(rangSize)
    end

    return node
end

function UIHelper.isClick(sender,state)
    -----------防止拖动的时候触发点击
    if not state or (state == ccui.TouchEventType.ended) then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            return true
        end
    end

    return false
end




--创建多行richtext 自动居中文本
-- | 分隔符 ParseRichTextStringHelp
--
function UIHelper.createMultiAutoCenterRichTextByParam(formatStr, param ,YGap, alignment, widthLimit,split)
	if not YGap then
		YGap = 5
	end

    local defaultColor = param.defaultColor
    local fontSize = param.defaultSize

	if not fontSize then
		fontSize = 22
	end

	if not defaultColor then
		defaultColor = Colors.BRIGHT_BG_ONE
	end

	if not alignment then
		alignment = 2
    end

	local formatStrArr = string.split(formatStr,split or  "|")
	local ParseRichTextStringHelp = require("app.utils.ParseRichTextStringHelp")
	local parentNode = ccui.Widget:create()
	local widgets = {}
	local maxWidth = 0
	local totalHeight = 0
	local heights = {}
    local widths = {}

    for k, v in ipairs(formatStrArr)do
        logWarn(v)
        local curWidth, curHeight
        if v == "" then
            -- 插入空格行
            table.insert(widgets, {type = "empty"})
            curWidth = widthLimit
            curHeight = fontSize
        else
            local richtext = ccui.RichText:createRichTextByFormatString(v, param)
            if widthLimit and widthLimit > 0 then
                richtext:setVerticalSpace(YGap)
                richtext:ignoreContentAdaptWithSize(false)
                richtext:setContentSize(cc.size(widthLimit,0))--高度0则高度自适应
                richtext:formatText()
            else
                richtext:formatText()
            end

            parentNode:addChild(richtext)
            local widgetSize = richtext:getContentSize()
            curWidth = widgetSize.width
            curHeight = widgetSize.height
            table.insert(widgets, {type = "richText", node = richtext})
        end
        if curWidth > maxWidth then
            maxWidth = curWidth
        end
        totalHeight = totalHeight + curHeight
        table.insert(heights, curHeight)
        table.insert(widths, curWidth)
	end
	if #heights >= 2 then
		totalHeight = totalHeight + (#heights - 1) * YGap
	end
	parentNode:setContentSize(cc.size(maxWidth, totalHeight))
	local curHeight = totalHeight

	if alignment == 1 then
		-- 左对齐
        for k, v in ipairs(widgets) do
            if v.type == "richText" then
                v.node:setAnchorPoint(cc.p(0,1))
                v.node:setPosition(cc.p(0, curHeight))
            end
			curHeight = curHeight - heights[k] - YGap
		end
	elseif alignment == 2 then
		--居中对齐
        for k, v in ipairs(widgets) do
            if v.type == "richText" then
                v.node:setAnchorPoint(cc.p(0,1))
                v.node:setPosition(cc.p((maxWidth - widths[k])/2, curHeight))
            end
			curHeight = curHeight - heights[k] - YGap
		end
	else
		-- 右对齐
        for k, v in ipairs(widgets) do
            if v.type == "richText" then
                v.node:setAnchorPoint(cc.p(1,1))
                v.node:setPosition(cc.p(maxWidth, curHeight))
            end
			curHeight = curHeight - heights[k] - YGap
		end
	end


	return parentNode
end


function UIHelper.createMultiAutoCenterRichText(formatStr, defaultColor, fontSize ,YGap, alignment, widthLimit)
    return UIHelper.createMultiAutoCenterRichTextByParam(formatStr, { defaultColor = defaultColor,defaultSize = fontSize},YGap, alignment, widthLimit)
end



--转换节点坐标
function UIHelper.convertSpaceFromNodeToNode(srcNode, tarNode, pos)
    local pos = pos or cc.p(0,0)
    local worldPos = srcNode:convertToWorldSpace(pos)
    return tarNode:convertToNodeSpace(worldPos)
end

--刷新Text描边
--params, TypeConvertHelper转换得出的结果
function UIHelper.updateTextOutline(text, params)
    if params.icon_color_outline_show then
        text:enableOutline(params.icon_color_outline, 2)
    else
        text:disableEffect(cc.LabelEffect.OUTLINE)
    end
end

function UIHelper.updateTextOutlineByGold(text, params)
    if params.isGold then
        text:enableOutline(params.icon_color_outline, 2)
    else
        text:disableEffect(cc.LabelEffect.OUTLINE)
    end
end

function UIHelper.updateTextOfficialOutline(text, officialLevel)
    local isShow = Colors.isOfficialColorOutlineShow(officialLevel)
    if isShow then
        local colorOutline = Colors.getOfficialColorOutline(officialLevel)
        text:enableOutline(colorOutline, 2)
    else
        text:disableEffect(cc.LabelEffect.OUTLINE)
    end
end

function UIHelper.updateTextOfficialOutlineForceShow(text, officialLevel)
    local colorOutline = Colors.getOfficialColorOutline(officialLevel)
    text:enableOutline(colorOutline, 2)
end

-- 为节点添加圆形裁减
function UIHelper.setCircleClip(node, radius)
    local pos = cc.p(node:getPosition())
    local parent = node:getParent()

    local drawNodeCircle = cc.DrawNode:create()
    local angle = 180
    local freg = 100
    local scaleX = 1.0
    local scaleY = 1.0
    local color = cc.c4f(1, 1, 1, 1)
    drawNodeCircle:drawSolidCircle(pos, radius, angle, freg, scaleX, scaleY, color)

    local stencil = cc.Node:create()
    stencil:addChild(drawNodeCircle)
    local clippingNode = cc.ClippingNode:create()
    clippingNode:setStencil(stencil)
    parent:addChild(clippingNode)
    clippingNode:setPosition(pos)
    node:removeFromParent(false)
    clippingNode:addChild(node)
    clippingNode:setInverted(false)
    clippingNode:setAlphaThreshold(1)
    clippingNode:setName("clippingNode")

    return clippingNode
end

return UIHelper
