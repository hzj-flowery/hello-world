--
-- Author: hedili
-- Date: 2018-01-24 17:54:35
-- 神兽碎片Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PetFragListCell = class("PetFragListCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local TOPIMAGERES = {
	"img_iconsign_shangzhen", --上阵
	"img_iconsign_shangzhen",--已护佑
}

function PetFragListCell:ctor()
	local resource = {
		file = Path.getCSB("PetFragListCell", "pet"),
		binding = {
			_button1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_button2 = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
		}
	}
	PetFragListCell.super.ctor(self, resource)
end

function PetFragListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end


function PetFragListCell:_showTopImage(index, petBaseId)
	local imageTop = self["_imageTop"..index]
	local isInBless  = G_UserData:getTeam():isInHelpWithPetBaseId(petBaseId)
	local isInBattle = G_UserData:getTeam():isInBattleWithPetBaseId(petBaseId)

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


function PetFragListCell:update(data1, data2)
	local function updateCell(index, data)
		if data then
			if type(data) ~= "table" then
				return
			end
			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_FRAGMENT, data:getId())
			self["_item"..index]:setTouchEnabled(true)
			local iconNode = self["_item"..index]:getCommonIcon()

			self:_showTopImage(index,data:getConfig().comp_value)

			local myCount = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, data:getId())
			local maxCount = data:getConfig().fragment_num
			local isEnough = myCount >= maxCount
			local btnDes = isEnough and Lang.get("fragment_list_cell_btn_compose") or Lang.get("fragment_list_cell_btn_get")
			local colorCount = isEnough and Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) or Colors.colorToNumber(Colors.BRIGHT_BG_RED)

			self["_button"..index]:setString(btnDes)
			if isEnough then
				self["_button"..index]:switchToHightLight()
			else
				self["_button"..index]:switchToNormal()
			end
			self["_button"..index]:showRedPoint(isEnough)
			local content = Lang.get("fragment_count_text", {
				count1 = myCount,
				color = colorCount,
				count2 = maxCount,
			})
			local textCount = ccui.RichText:createWithContent(content)
			self["_item"..index]:setCountText(textCount)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, data1)
	updateCell(2, data2)
end

function PetFragListCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function PetFragListCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return PetFragListCell
