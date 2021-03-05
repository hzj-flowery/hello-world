--
-- Author: hedili
-- Date: 2018-01-24 13:50:59
--
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetListCell = class("PetListCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local TOPIMAGERES = {
	"img_iconsign_shangzhen", --上阵
	"img_iconsign_shangzhen",--已护佑
}

function PetListCell:ctor()
	local resource = {
		file = Path.getCSB("PetListCell", "pet"),
		binding = {
			_buttonStrengthen1 = {
				events = {{event = "touch", method = "_onButtonStrengthenClicked1"}}
			},
			_buttonStrengthen2 = {
				events = {{event = "touch", method = "_onButtonStrengthenClicked2"}}
			},
		}
	}
	PetListCell.super.ctor(self, resource)
end

function PetListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	
	self._buttonStrengthen1:setString(Lang.get("hero_btn_strengthen"))
	self._buttonStrengthen2:setString(Lang.get("hero_btn_strengthen"))
end

function PetListCell:update(heroId1, heroId2)
	local function updateCell(index, heroId)
		if heroId then
			if type(heroId) ~= "number" then
				return
			end
			self["_item"..index]:setVisible(true)
			local data = G_UserData:getPet():getUnitDataWithId(heroId)
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_PET, data:getBase_id())
			self["_item"..index]:setCallBack(handler(self, self["_onClickIcon"..index]))
			self:_showTopImage(index, data)

			local icon = self["_item"..index]:getCommonIcon()
			local params = icon:getItemParams()
			local starLevel = data:getStar()
			local name = params.name

			self["_nodeStar"..index]:setCount(starLevel)
			self["_item"..index]:setName(name)
			self["_item"..index]:setTouchEnabled(true)
			self["_nodeLevel"..index]:updateUI(Lang.get("hero_list_cell_level_des"), Lang.get("hero_txt_level", {level = data:getLevel()}))
	
			self["_buttonStrengthen"..index]:setVisible(data:isCanTrain())
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, heroId1)
	updateCell(2, heroId2)
end

function PetListCell:_showTopImage(index, data)
	local imageTop = self["_imageTop"..index]
	local isInBattle = data:isInBattle()
	local isInBless = data:isPetBless()

	if isInBattle then
		imageTop:loadTexture(Path.getTextSignet(TOPIMAGERES[1]))
		imageTop:setVisible(true)
	elseif isInBless then
		imageTop:loadTexture(Path.getTextSignet(TOPIMAGERES[2]))
		imageTop:setVisible(true)
	else
		imageTop:setVisible(false)
	end
end

function PetListCell:_onButtonStrengthenClicked1() 
	self:dispatchCustomCallback(1)
end

function PetListCell:_onButtonStrengthenClicked2()
	self:dispatchCustomCallback(2)
end

function PetListCell:_onClickIcon1(sender, itemParams)
	--if itemParams.cfg.type == 3 then
	--	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	--	PopupItemGuider:updateUI(TypeConvertHelper.TYPE_PET, itemParams.cfg.id)
	--	PopupItemGuider:openWithAction()
	--else
		self:dispatchCustomCallback(1)
	--end
end

function PetListCell:_onClickIcon2(sender, itemParams)
	--local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
	--PopupItemGuider:updateUI(TypeConvertHelper.TYPE_PET, itemParams.cfg.id)
	--PopupItemGuider:openWithAction()

	self:dispatchCustomCallback(2)
end

return PetListCell