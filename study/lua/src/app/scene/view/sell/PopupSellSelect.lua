
-- Author: nieming
-- Date:2018-04-23 17:38:03
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupSellSelect = class("PopupSellSelect", PopupBase)


function PopupSellSelect:ctor(selectColors,callback)

	--csb bind var name
	self._btnCancel = nil  --CommonButtonNormal
	self._btnConfirm = nil  --CommonButtonHighLight
	self._commonMinPop = nil  --CommonNormalSmallPop
	self._parentNode = nil  --SingleNode
	self._selectColors = selectColors or {}
	self._closeCallBack = callback
	local resource = {
		file = Path.getCSB("PopupSellSelect", "sell"),
		binding = {
			_btnCancel = {
				events = {{event = "touch", method = "_onBtnCancel"}}
			},
			_btnConfirm = {
				events = {{event = "touch", method = "_onBtnConfirm"}}
			},
		},
	}
	PopupSellSelect.super.ctor(self, resource)
end

-- Describle：
function PopupSellSelect:onCreate()
	self._commonMinPop:hideCloseBtn()
	self._commonMinPop:setTitle(Lang.get("lang_sellfragmentselect_title"))
	self._btnConfirm:setString(Lang.get("common_btn_name_confirm"))
	self._btnCancel:setString(Lang.get("common_btn_name_cancel"))
	self:_initSelectColors()
end

function PopupSellSelect:_initSelectColors()
	local SelectQualityNode = require("app.scene.view.sell.SelectQualityNode")
	self._selectNodes = {}
	for k, v in pairs(self._selectColors) do
		local selectNode = SelectQualityNode.new(v)
		self._parentNode:addChild(selectNode)
		table.insert(self._selectNodes, selectNode)
	end

	if #self._selectNodes == 2 then
		self._selectNodes[1]:setPositionY(35)
		self._selectNodes[2]:setPositionY(-35)
	end
end

-- Describle：
function PopupSellSelect:onEnter()

end

-- Describle：
function PopupSellSelect:onExit()

end
-- Describle：
function PopupSellSelect:_onBtnCancel()
	-- body
	self:close()
end
-- Describle：
function PopupSellSelect:_onBtnConfirm()
	-- body
	local selects = {}
	for k, v in pairs(self._selectNodes) do
		if v:isSelected() then
			selects[v:getColorQuality()] = true
		end
	end
	if self._closeCallBack then
		self._closeCallBack(selects)
	end
	self:close()
end

return PopupSellSelect
