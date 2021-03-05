--红包雨结算界面
local PopupBase = require("app.ui.PopupBase")
local PopupRedRainSettlement = class("PopupRedRainSettlement", PopupBase)

local POSX = {
	[1] = {0},
	[2] = {-81, 82}
}

function PopupRedRainSettlement:ctor(data, onExitCallback)
	self._data = data
	self._onExitCallback = onExitCallback

	local resource = {
		file = Path.getCSB("PopupRedRainSettlement", "redPacketRain"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onClickClose"}}
			}
		}
	}
	PopupRedRainSettlement.super.ctor(self, resource, false)
end

function PopupRedRainSettlement:onCreate()
	self._textNum:setString(tostring(self._data.money))
	local bigNum = self._data.bigNum
	local smallNum = self._data.smallNum
	self._textBigNum:setString(Lang.get("red_packet_rain_big_num", {num = bigNum}))
	self._textSmallNum:setString(Lang.get("red_packet_rain_small_num", {num = smallNum}))
	--数量为0的隐藏
	self._nodeBig:setVisible(bigNum > 0)
	self._nodeSmall:setVisible(smallNum > 0)
	local showCount = 0
	local showNodes = {}
	if bigNum > 0 then
		table.insert(showNodes, self._nodeBig)
		showCount = showCount + 1
	end
	if smallNum > 0 then
		table.insert(showNodes, self._nodeSmall)
		showCount = showCount + 1
	end
	--位置排版
	for i, node in ipairs(showNodes) do
		node:setPositionX(POSX[showCount][i])
	end

	local size = self._textNum:getVirtualRendererSize()
	local posX = self._textNum:getPositionX()
	self._imageTextMoney:setPositionX(posX + size.width)
	self._buttonClose:setString(Lang.get("red_pacekt_rain_settlement_confirm_btn"))
	
	G_EffectGfxMgr:createPlayMovingGfx(self._nodeMoving, "moving_gongxizhugong", nil, nil, false)
end

function PopupRedRainSettlement:onEnter()
	
end

function PopupRedRainSettlement:onExit()
	if self._onExitCallback then
		self._onExitCallback()
	end
end

function PopupRedRainSettlement:_onClickClose()
	self:close()
end

return PopupRedRainSettlement