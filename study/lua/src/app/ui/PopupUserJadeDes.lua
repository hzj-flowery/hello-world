-- 技能详情弹框
-- Author: Liangxu
--
local PopupBase = require("app.ui.PopupBase")
local PopupUserJadeDes = class("PopupUserJadeDes", PopupBase)
local EquipDesJadeIcon = require("app.scene.view.equipmentJade.EquipDesJadeIcon")

function PopupUserJadeDes:ctor(fromNode, equipData)
	self._fromNode = fromNode
	self._equipData = equipData
	local resource = {
		file = Path.getCSB("PopupUserJadeDes", "common"),
		binding = {}
	}
	PopupUserJadeDes.super.ctor(self, resource, false, true)
end

function PopupUserJadeDes:onCreate()
	self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
	self._panelTouch:setSwallowTouches(false)
	self._panelTouch:addClickEventListener(handler(self, self._onClick)) --避免0.5秒间隔
	self:_initSlots()
end

function PopupUserJadeDes:_initSlots()
	local nums = self._equipData:getJadeSlotNums()
	local size = self._panelBg:getContentSize()
	size.width = nums * 74 + 14
	self._panelBg:setContentSize(size)
end

function PopupUserJadeDes:onEnter()
	self:_updateView()
end

function PopupUserJadeDes:onExit()
end

--重写opne&close接口，避免黑底层多层时的混乱现象
function PopupUserJadeDes:open()
	local scene = G_SceneManager:getRunningScene()
	scene:addChildToPopup(self)
end

function PopupUserJadeDes:close()
	self:onClose()
	self.signal:dispatch("close")
	self:removeFromParent()
end

function PopupUserJadeDes:_updateView()
	--确定位置
	local jades = self._equipData:getUserDetailJades() or {}
	local config = self._equipData:getConfig()
	local slotinfo = string.split(config.inlay_type, "|")
	local count = 0
	self._panelBg:removeAllChildren()
	for i, value in ipairs(slotinfo) do
		if tonumber(value) > 0 then
			local slot, node = EquipDesJadeIcon.instance()
			self["_slot" .. i] = slot
			self._panelBg:addChild(node)
			node:setPosition(cc.p(count * 74 + 8 + 36, 80))
			slot:updateIcon(jades[i] or 0)
			count = count + 1
		end
	end
	local nodePos = self._fromNode:convertToWorldSpaceAR(cc.p(0, 0))
	local nodeSize = self._fromNode:getContentSize()
	local panelSize = self._panelBg:getContentSize()
	local posX = nodePos.x + panelSize.width * 0.5 + 48
	local posY = nodePos.y - (panelSize.height * 0.5 - 32)
	local dstPos = self:convertToNodeSpace(cc.p(posX, posY))
	self._panelBg:setPosition(dstPos)
end

function PopupUserJadeDes:_onClick()
	self:close()
end

return PopupUserJadeDes
