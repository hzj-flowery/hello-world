--弹出界面
--物品信息弹框
--点击物品时，弹出
local PopupBase = require("app.ui.PopupBase")
local PopupChangeJade = class("PopupChangeJade", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

function PopupChangeJade:ctor(title, slot, jadeUnitData, equipUnitData, isRed, callback, type)
	--
	self._title = title or Lang.get("common_title_item_info")
	self._callback = callback
	self._slot = slot
	self._jadeUnitData = jadeUnitData
	self._equipUnitData = equipUnitData
	self._isRed = isRed
	self._type = type and type or FunctionConst.FUNC_EQUIP_TRAIN_TYPE3
	--
	local resource = {
		file = Path.getCSB("PopupChangeJade", "common"),
		binding = {
			_btnChange = {
				events = {{event = "touch", method = "onBtnChange"}}
			},
			_btnUnload = {
				events = {{event = "touch", method = "onBtnUnload"}}
			}
		}
	}
	PopupChangeJade.super.ctor(self, resource, true)
end

--
function PopupChangeJade:onCreate()
	-- button
	self._btnChange:setString(Lang.get("equipment_choose_jade_cell_btn4"))
	self._btnChange:switchToHightLight()
	self._btnChange:showRedPoint(self._isRed)
	self._btnUnload:setString(Lang.get("equipment_choose_jade_cell_btn3"))
	self._btnUnload:switchToNormal()
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)
	self._commonNodeBk:hideCloseBtn()
end

function PopupChangeJade:_onInit()
end

function PopupChangeJade:onEnter()
	local config = self._jadeUnitData:getConfig()
	self._itemIcon:updateUI(config.id)
	self._itemIcon:setTouchEnabled(false)
	self._itemName:setColor(Colors.getColor(config.color))
	self._itemName:setString(config.name)

	self._itemDesc = cc.Label:createWithTTF("", Path.getCommonFont(), 20)
	self._itemDesc:setColor(Colors.BRIGHT_BG_TWO)
	self._itemDesc:setWidth(260)
	self._itemDesc:setAnchorPoint(cc.p(0, 1))
	self._scrollView:addChild(self._itemDesc)
	self._itemDesc:setString(config.description)
	local height = self._itemDesc:getContentSize().height
	local scrollHeight = self._scrollView:getContentSize().height
	if height > scrollHeight then		
		self._itemDesc:setPosition(cc.p(2, height))
		self._scrollView:setInnerContainerSize(cc.size(320, height + 5))
	else
		self._itemDesc:setPosition(cc.p(2, scrollHeight))
		self._scrollView:setInnerContainerSize(cc.size(320, scrollHeight))
	end

end

function PopupChangeJade:onExit()
end

--
function PopupChangeJade:onBtnChange()
	local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
	local list = EquipJadeHelper.getEquipJadeListByWear(self._slot, self._jadeUnitData, self._equipUnitData, false, self._type)
	if #list > 0 then
		EquipJadeHelper.popupChooseJadeStone(self._slot, self._jadeUnitData, self._equipUnitData, self._callback, true, self._type)
	else
		G_Prompt:showTip(Lang.get("equipment_choose_jade_tips"))
	end
	self:close()
end

function PopupChangeJade:onBtnUnload()
	if self._callback then
		self._callback(self._slot, 0)
	end
	self:close()
end

function PopupChangeJade:onBtnCancel()
	self:close()
end

return PopupChangeJade
