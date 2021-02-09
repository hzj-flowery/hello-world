--造成伤害
local ComponentBase = require("app.scene.view.settlement.ComponentBase")
local ComponentDamage = class("ComponentDamage", ComponentBase)

local CSHelper  = require("yoka.utils.CSHelper")

function ComponentDamage:ctor(damage, position,richText, richTextParams)
    self._damage = damage
    self._richText = richText
	self._richTextParams = richTextParams
    self:setPosition(position)
    ComponentDamage.super.ctor(self)
end

function ComponentDamage:start()
    self:_createExpAnim()
    ComponentDamage.super.start(self)
end

--传入富文本，隐藏正常文字功能
function ComponentDamage:showRichNode(richText)
    self._richText = richText
end

function ComponentDamage:_updateRichText()
    if self._richText == nil then
        return
    end
    --dump(self._richText)、
	self._nodeText:removeAllChildren()
	if self._richTextParams then
		local UIHelper = require("yoka.utils.UIHelper")
		local widget = UIHelper.createMultiAutoCenterRichText(self._richText, self._richTextParams.defaultColor,
			self._richTextParams.fontSize, self._richTextParams.YGap,
			self._richTextParams.alignment,self._richTextParams.widthLimit)
		widget:setAnchorPoint(cc.p(0.5,0.5))
		self._nodeText:addChild(widget)
	else
		local widget = ccui.RichText:createWithContent(self._richText)
		widget:setAnchorPoint(cc.p(0.5,0.5))
		self._nodeText:addChild(widget)
	end
	self._nodeText:setVisible(true)
	self._textCount:setVisible(false)
	self._textDamage:setVisible(false)
end

function ComponentDamage:_createCsbNode()
    local Panel = CSHelper.loadResourceNode(Path.getCSB("PanelDamage", "settlement"))
    self._textCount = ccui.Helper:seekNodeByName(Panel, "TextCount")
    self._textCount:setString(self._damage)
    self._nodeText = ccui.Helper:seekNodeByName(Panel,"Node_Text")
    self._textDamage = ccui.Helper:seekNodeByName(Panel,"TextDamage")

    --有richText则使用richText
    self:_updateRichText()
    return Panel
end

function ComponentDamage:_createExpAnim()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if effect == "pingjia" then
            local node = self:_createCsbNode()
            return node
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self, "moving_win_pingjia", effectFunction, handler(self, self.checkEnd) , false )
end

return ComponentDamage
