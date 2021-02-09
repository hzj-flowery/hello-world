--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法适配武将弹窗
local PopupBase = require("app.ui.PopupBase")
local PopupTacticsDes = class("PopupTacticsDes", PopupBase)
local TacticsConst = require("app.const.TacticsConst")

function PopupTacticsDes:ctor(fromNode, baseId)
	self._fromNode = fromNode
	self._baseId = baseId
	local resource = {
		file = Path.getCSB("PopupTacticsDes", "common"),
		binding = {
			
		}
	}
	PopupTacticsDes.super.ctor(self, resource, false, true)
end

function PopupTacticsDes:onCreate()
	self._label = nil
	self._panelTouch:setContentSize(display.width, display.height)
	self._panelTouch:setSwallowTouches(true)
	self._panelTouch:addClickEventListener(handler(self, self._onClick)) --避免0.5秒间隔
	
	self._fromNodePos = self._fromNode:convertToWorldSpaceAR(cc.p(0,0))
end

function PopupTacticsDes:onEnter()
	self:_updateView()
end

function PopupTacticsDes:onExit()
	
end

--重写opne&close接口，避免黑底层多层时的混乱现象
function PopupTacticsDes:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function PopupTacticsDes:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
end

function PopupTacticsDes:_updateView()
    local unitData = G_UserData:getTactics():getUnitDataWithBaseId(self._baseId)
    local config = unitData:getConfig()
	
	if self._label == nil then
		self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 22)
		self._label:setAnchorPoint(cc.p(0, 1))
		self._label:setColor(Colors.TacticsDescriptionColor)
		self._label:setWidth(375)
		self._desNode:addChild(self._label)
	end

	local description = ""
	local _, limitStrs, suitType = G_UserData:getTactics():getSuitInfoWithTacticsId(self._baseId)
	if suitType==TacticsConst.SUIT_TYPE_ALL then
		description = Lang.get("tactics_suitable_all")
	else
		for i,v in ipairs(limitStrs) do
			description = description .. v
			if i~=#limitStrs then
				description = description .. Lang.get("tactics_effective_des_contact")
			end
		end
	end
	self._label:setString(description)

	local txtHeight = self._label:getContentSize().height
	local panelHeight = 132
	if txtHeight > 132 - 60 then
		panelHeight = 60 + txtHeight
		self._imgTip:setPositionY(panelHeight - 20)
		self._desNode:setPositionY(panelHeight - 49)
		local bgSize = self._panelBg:getContentSize()
		self._panelBg:setContentSize(cc.size(bgSize.width, panelHeight))
	else
		self._label:setAnchorPoint(cc.p(0.5, 0.5))
		self._label:setPosition(cc.p(185, -35))
	end

	--确定位置
	local nodePos = self._fromNodePos
	local posX = nodePos.x - self._panelBg:getContentSize().width / 2
	local posY = nodePos.y - self._panelBg:getContentSize().height / 2
	local dstPos = self:convertToNodeSpace(cc.p(posX, posY))
	self._panelBg:setPosition(dstPos)
end

function PopupTacticsDes:_onClick()
	self:close()
end

return PopupTacticsDes