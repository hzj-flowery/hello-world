-- 
-- Author: JerryHe
-- Date: 2019-02-22
-- Desc: 马具简介弹窗
-- 
local PopupBase = require("app.ui.PopupBase")
local PopupHorseEquipInfo = class("PopupHorseEquipInfo", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HorseEquipDataHelper = require("app.utils.data.HorseEquipDataHelper")
-- local UserDataHelper	= require("app.utils.UserDataHelper")

function PopupHorseEquipInfo:ctor(callback)
	--
	self._title = Lang.get("common_title_exchange_horse_equip")
	self._callback = callback
	self._itemId = nil
	self._useNum = 1
	--control init
    self._btnChange = nil --
    self._btnPutOff = nil
	self._itemName = nil -- 物品名称
	self._itemDesc = nil -- 物品描述
    self._itemIcon = nil -- CommonHorseEquipIcon
    self._itemEffect1 = nil
    self._itemEffect2 = nil
	--
	local resource = {
		file = Path.getCSB("PopupHorseEquipInfo", "common"),
		binding = {
			_btnChange = {
				events = {{event = "touch", method = "onBtnChange"}}
            },
            _btnPutOff   = {
                events = {{event = "touch", method = "onBtnPutOff"}}
            }
		}
	}
	PopupHorseEquipInfo.super.ctor(self, resource, true)
end

--
function PopupHorseEquipInfo:onCreate()
	-- button
    self._btnChange:setString(Lang.get("common_btn_change"))
    self._btnPutOff:setString(Lang.get("common_btn_put_off"))

	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)
end

function PopupHorseEquipInfo:updateUI( itemType ,itemId )
	assert(itemId, "PopupHorseEquipInfo's itemId can't be empty!!!")
	self._itemIcon:unInitUI()
	self._itemIcon:initUI(itemType, itemId)
	self._itemIcon:setTouchEnabled(false)
	self._itemIcon:setImageTemplateVisible(true)
	local itemParams = self._itemIcon:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)
    self._itemName:enableOutline(itemParams.icon_color_outline, 2)
    

    self._itemDesc:setString(itemParams.cfg.description)
    self._itemEffect1:setString(itemParams.effect_1)
    self._itemEffect2:setString(itemParams.effect_2)
end

function PopupHorseEquipInfo:_onInit()
end


function PopupHorseEquipInfo:onEnter()

end

function PopupHorseEquipInfo:onExit()

end

--
function PopupHorseEquipInfo:onBtnChange()
    if self._callback then
        self._callback("change")
    end

    self:close()
end


function PopupHorseEquipInfo:onBtnCancel()
	self:close()
end

function PopupHorseEquipInfo:onBtnPutOff()
    if self._callback then
        self._callback("put_off")
    end

    self:close()
end

return PopupHorseEquipInfo
