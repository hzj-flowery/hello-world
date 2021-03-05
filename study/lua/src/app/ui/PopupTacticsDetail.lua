--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法描述详情弹窗
local PopupBase = require("app.ui.PopupBase")
local PopupTacticsDetail = class("PopupTacticsDetail", PopupBase)

function PopupTacticsDetail:ctor(fromNode, baseId)
	self._fromNode = fromNode
	self._baseId = baseId
	local resource = {
		file = Path.getCSB("PopupTacticsDetail", "common"),
		binding = {
			
		}
	}
	PopupTacticsDetail.super.ctor(self, resource, false, true)
end

function PopupTacticsDetail:onCreate()
	self._label = nil
	self._panelTouch:setContentSize(display.width, display.height)
	self._panelTouch:setSwallowTouches(true)
	self._panelTouch:addClickEventListener(handler(self, self._onClick)) --避免0.5秒间隔
	
	self._fromNodePos = self._fromNode:convertToWorldSpaceAR(cc.p(0,0))
end

function PopupTacticsDetail:onEnter()
	self:_updateView()
end

function PopupTacticsDetail:onExit()
	
end

--重写opne&close接口，避免黑底层多层时的混乱现象
function PopupTacticsDetail:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function PopupTacticsDetail:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
end

function PopupTacticsDetail:_updateView()
    local unitData = G_UserData:getTactics():getUnitDataWithBaseId(self._baseId)
    local config = unitData:getConfig()
	
	self._textName:setString(Lang.get("tactics_description_pop_name", {name=config.name}))
	if self._label == nil then
		self._label = cc.Label:createWithTTF("", Path.getCommonFont(), 22)
		self._label:setAnchorPoint(cc.p(0, 1))
		self._label:setColor(Colors.DARK_BG_ONE)
		self._label:setWidth(436)
		self._desNode:addChild(self._label)
	end

	local description = config.description
	self._label:setString(description)

	local txtHeight = self._label:getContentSize().height
	local panelHeight = 132
	if txtHeight > 132 - 60 then
		panelHeight = 60 + txtHeight
		self._textName:setPositionY(panelHeight - 14)
		self._desNode:setPositionY(panelHeight - 49)
		local bgSize = self._panelBg:getContentSize()
		self._panelBg:setContentSize(cc.size(bgSize.width, panelHeight))
	end

	--确定位置
	local nodePos = self._fromNodePos
	local posX = nodePos.x + self._panelBg:getContentSize().width / 2 + 50
	local posY = nodePos.y - self._panelBg:getContentSize().height / 2 - 20
	local size = self._panelBg:getContentSize()
	local ccSize = G_ResolutionManager:getDesignCCSize()

	local offsetSize = cc.size(0, 0)
	offsetSize.width = math.max(0, (display.width - CC_DESIGN_RESOLUTION.width)*0.5)
	offsetSize.height = math.max(0, (display.height - CC_DESIGN_RESOLUTION.height)*0.5)

	if posX+size.width*0.5>ccSize.width then
		posX = nodePos.x - self._panelBg:getContentSize().width / 2 - 50
	end
	if posY-size.height*0.5<offsetSize.height then
		posY = nodePos.y + self._panelBg:getContentSize().height / 2 + 20
	end
	local dstPos = self:convertToNodeSpace(cc.p(posX, posY))
	self._panelBg:setPosition(dstPos)
end

function PopupTacticsDetail:_onClick()
	self:close()
end

return PopupTacticsDetail