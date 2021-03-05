--弹出界面
--购买一次确认框
--可以更新ICON，以及消耗的物品
local PopupBase = require("app.ui.PopupBase")
local PopupBuyOnce = class("PopupBuyOnce", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function PopupBuyOnce:ctor(title, callback )
	--
	self._title = title or Lang.get("common_title_buy_confirm") 
	self._callback = callback
	self._buyItemId = nil

	--control init
	self._btnOk = nil -- 
	self._btnCancel = nil

	self._itemName = nil -- 物品名称
	self._itemIcon = nil -- CommonItemIcon
	self._costResInfo1 = nil --消耗物品资源
	self._commonCheckBoxAnymoreHint = nil--登陆不提示CheckBox

	--
	local resource = {
		file = Path.getCSB("PopupBuyOnce", "common"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "onBtnOk"}}
			},
			_btnCancel = {
				events = {{event = "touch", method = "onBtnCancel"}}
			},

		}
	}
	PopupBuyOnce.super.ctor(self, resource, true)
end

--
function PopupBuyOnce:onCreate()
	-- button
	self._btnOk:setString(Lang.get("common_btn_sure"))
	self._btnCancel:setString(Lang.get("common_btn_cancel"))
	-- desc
	self._popupBG:setTitle(self._title)
	self._popupBG:hideCloseBtn()
end

--

function PopupBuyOnce:setCostInfo(costType, costValue, costSize)
	--self._costResInfo1:showResName(true,Lang.get("lang_common_buy_cost_desc"))
	self._costResInfo1:updateUI(costType,costValue,costSize)
	self._costResInfo1:setTextColorToATypeColor()
end


function PopupBuyOnce:updateUI(itemType, itemValue, itemNum)

	assert(itemValue, "PopupBuyOnce's itemId can't be empty!!!")
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(itemType, itemValue,itemNum)
	self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)
	--self._itemName:enableOutline(itemParams.icon_color_outline, 2)


	self._buyItemId = itemValue
end


function PopupBuyOnce:_onInit()

end


function PopupBuyOnce:onEnter()
    
end

function PopupBuyOnce:onExit()
    
end

--
function PopupBuyOnce:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._buyItemId)
	end
	if not isBreak then
		self:close()
	end
end

function PopupBuyOnce:onBtnCancel()
	if not isBreak then
		self:close()
	end
end


function PopupBuyOnce:setModuleName(moduleDataName)
	self._commonCheckBoxAnymoreHint:setModuleName(moduleDataName)
end
return PopupBuyOnce