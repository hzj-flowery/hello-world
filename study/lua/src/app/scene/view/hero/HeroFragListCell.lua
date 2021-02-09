--
-- Author: Liangxu
-- Date: 2017-07-13 17:54:35
-- 武将碎片Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local HeroFragListCell = class("HeroFragListCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

function HeroFragListCell:ctor()
	local resource = {
		file = Path.getCSB("HeroFragListCell", "hero"),
		binding = {
			_button1 = {
				events = {{event = "touch", method = "_onButtonClicked1"}}
			},
			_button2 = {
				events = {{event = "touch", method = "_onButtonClicked2"}}
			},
		}
	}
	HeroFragListCell.super.ctor(self, resource)
end

function HeroFragListCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end


function HeroFragListCell:_setTopImage(image, heroID)
	assert(image ~= nil, "HeroFragListCell:_setTopImage image == nil")
	assert(heroID ~= nil, "HeroFragListCell:_setTopImage heroID == nil")
	local inBattle = G_UserData:getTeam():isInBattleWithBaseId(heroID)
	local isKaram = UserDataHelper.isHaveKarmaWithHeroBaseId(heroID)
	local yokeCount = UserDataHelper.getWillActivateYokeCount(heroID)
	if inBattle then
		image:loadTexture(Path.getTextSignet("img_iconsign_shangzhen"))
		image:setVisible(true)
	elseif isKaram then
		image:loadTexture(Path.getTextSignet("img_iconsign_mingjiangce"))
		image:setVisible(true)
	elseif yokeCount > 0 then
		image:loadTexture(Path.getTextSignet("img_iconsign_jiban"))
		image:setVisible(true)
	else
		image:setVisible(false)
	end
end

function HeroFragListCell:update(data1, data2)
	local function updateCell(index, data)
		if data then
			if type(data) ~= "table" then
				return
			end
			self["_item"..index]:setVisible(true)
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_FRAGMENT, data:getId())
			self["_item"..index]:setTouchEnabled(true)
			local image = self["_imageTop"..index]
			self:_setTopImage(image, data:getConfig().comp_value)

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

function HeroFragListCell:_onButtonClicked1()
	self:dispatchCustomCallback(1)
end

function HeroFragListCell:_onButtonClicked2()
	self:dispatchCustomCallback(2)
end

return HeroFragListCell
