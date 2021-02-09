--提示文字
local PromptTip = class("PromptTip")

local PromptAction  = require("app.ui.prompt.PromptAction")

local CSHelper  = require("yoka.utils.CSHelper")

function PromptTip:ctor(callback)
    self._callback = callback
end

--[======================[
    通用tip消息弹框
    @params可以直接是一个字符串，也可以是一个富文本json格式
    local params = "xxx"
    local params = '[{"type":"text", "msg":"随便#name#", "color":16777215, "opacity":"255"}]'
]======================]

function PromptTip:_loadCsb()


    return node
end


function PromptTip:_updateRichText(node,content)

    local richText = ccui.RichText:createWithContent(content)
    local label = node:getSubNodeByName("Text_tip_content")
    richText:setPosition(label:getPosition())

    label:setVisible(false)
    richText:formatText()
    local richTextContentSize = richText:getVirtualRendererSize()
    if richTextContentSize.width > 420 then
        richText:ignoreContentAdaptWithSize(false)
        richText:setContentSize(contentSize or cc.size(440, 60))
        --richText:setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER)
        richText:setVerticalSpace(5)
    end

    local height = contentSize and contentSize.height or (richTextContentSize.width > 420 and 60)
    if height then
        local background = node:getSubNodeByName("Image_tip_background")
        local backContentSize = background:getContentSize()
        background:setContentSize(cc.size(backContentSize.width, height + 35))
    end
    node:addChild(richText)
end

function PromptTip:_updateText(node, text)
    -- 更新文本
    local label = node:updateLabel("Text_tip_content", tostring(text))
    local labelContentSize = label:getVirtualRendererSize()

    -- 宽度超过一定范围就换行
    if labelContentSize.width > 420 then
        label:setTextAreaSize(contentSize or cc.size(420, 60))
    end

    local height = contentSize and contentSize.height or (labelContentSize.width > 420 and 60)
    if height then
        local background = node:getSubNodeByName("Image_tip_background")
        local backContentSize = background:getContentSize()
        background:setContentSize(cc.size(backContentSize.width, height + 35))
    end
end

-- 多行 自动居中富文本
--
function PromptTip:_updateRichTextType2(node, params)
	if params and params.str then
		local UIHelper = require("yoka.utils.UIHelper")
		local richText = UIHelper.createMultiAutoCenterRichText(params.str, params.defaultColor or Colors.OBVIOUS_YELLOW, params.fontSize or 22, 5)
		local label = node:getSubNodeByName("Text_tip_content")
	    richText:setPosition(label:getPosition())
	    label:setVisible(false)

		local background = node:getSubNodeByName("Image_tip_background")
		local backContentSize = background:getContentSize()
		local richSize = richText:getContentSize()
		local bgWidth = backContentSize.width > richSize.width + 40 and backContentSize.width or richSize.width + 40
		local bgHeight = backContentSize.height > richSize.height + 35 and backContentSize.height or richSize.height + 35
		background:setContentSize(cc.size(bgWidth, bgHeight))
		node:addChild(richText)
	end
end


function PromptTip:show(params,delayTime)
    assert(params and (type(params) == "string" or type(params) == "table"),
        "Invalid params: "..tostring(params))

    -- 创建弹框
    local node =  CSHelper.loadResourceNode(Path.getCSB("PromptTipNode", "common"))
	if type(params) == "table" then
		self:_updateRichTextType2(node, params)
	else
		local content = json.decode(params)
		-- 如果解析json成功，这里认为是一个富文本
		if type(content) == "table" then
			self:_updateRichText(node, params)
		else
			self:_updateText(node, params)
		end
	end
    local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()
    local scene = G_SceneManager:getRunningScene()
	scene:addTips(node)

    node:setPosition(cc.p(width/2, height/5*2.6))
    node:setCascadeOpacityEnabled(true)

    local callBackAction = cc.CallFunc:create(function()
        if self._callback then
            self._callback()
        end
    end)
    if delayTime and delayTime > 0 then
        local seq1 = cc.Sequence:create( PromptAction.tipAction(), cc.RemoveSelf:create() )
        local seq2 = cc.Sequence:create( cc.DelayTime:create(delayTime), callBackAction)
        node:runAction( cc.Spawn:create(seq1,seq2) )
    else
        node:runAction(cc.Sequence:create(PromptAction.tipAction(), cc.RemoveSelf:create(),callBackAction))
    end

    return node
end

function PromptTip:showOnTop(params, delayTime)
    assert(params and (type(params) == "string" or type(params) == "table"),
    "Invalid params: "..tostring(params))

    -- 创建弹框
    local node =  CSHelper.loadResourceNode(Path.getCSB("PromptTipNode", "common"))
    if type(params) == "table" then
        self:_updateRichTextType2(node, params)
    else
        local content = json.decode(params)
        -- 如果解析json成功，这里认为是一个富文本
        if type(content) == "table" then
            self:_updateRichText(node, params)
        else
            self:_updateText(node, params)
        end
    end
    local width = G_ResolutionManager:getDesignWidth()
    local height = G_ResolutionManager:getDesignHeight()
    -- local scene = G_SceneManager:getRunningScene()
    -- scene:addTips(node)

    G_TopLevelNode:addToTipLevel(node)

    node:setPosition(cc.p(width/2, height/5*2.6))
    node:setCascadeOpacityEnabled(true)

    local callBackAction = cc.CallFunc:create(function()
        if self._callback then
            self._callback()
        end
    end)
    if delayTime and delayTime > 0 then
        local seq1 = cc.Sequence:create( PromptAction.tipAction(), cc.RemoveSelf:create() )
        local seq2 = cc.Sequence:create( cc.DelayTime:create(delayTime), callBackAction)
        node:runAction( cc.Spawn:create(seq1,seq2) )
    else
        node:runAction(cc.Sequence:create(PromptAction.tipAction(), cc.RemoveSelf:create(),callBackAction))
    end

    return node
end


return PromptTip
