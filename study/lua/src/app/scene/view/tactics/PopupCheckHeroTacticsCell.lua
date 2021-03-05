--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法研习列表界面 列表项
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCheckHeroTacticsCell = class("PopupCheckHeroTacticsCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local AudioConst = require("app.const.AudioConst")

function PopupCheckHeroTacticsCell:ctor()
	local resource = {
		file = Path.getCSB("PopupCheckHeroTacticsCell", "common"),
		binding = {
			
		}
	}
	PopupCheckHeroTacticsCell.super.ctor(self, resource)
end

function PopupCheckHeroTacticsCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox3:addEventListener(handler(self, self._onCheckBoxClicked3))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
	self._checkBox3:setSwallowTouches(false)
end

function PopupCheckHeroTacticsCell:update(tacticsUnitData, dataList, isAddedList)
	local function updateCell(index, data, isAdded)
		if data then
			self["_item"..index]:setVisible(true)
			local heroBaseId = data:getBase_id()
			local limitLevel = data:getLimit_level()
			local limitRedLevel = data:getLimit_rtg()
			self["_item"..index]:updateUI(TypeConvertHelper.TYPE_HERO, heroBaseId)
			local icon = self["_item"..index]:getCommonIcon()
			icon:getIconTemplate():updateUI(heroBaseId, nil, limitLevel, limitRedLevel)
			local params = icon:getItemParams()
			local rank = data:getRank_lv()
			local heroName = params.name
			if rank > 0 then
				if params.color == 7 and limitLevel == 0 and params.type ~= 1 then -- 金将
					heroName = heroName .. " " .. Lang.get("goldenhero_train_text") .. rank
				else
					heroName = heroName .. "+" .. rank
				end
			end
			
			if not data:isPureGoldHero() and params.color==7 then
				self["_item" .. index]:setName(heroName, params.icon_color, params)
			else
				self["_item" .. index]:setName(heroName, params.icon_color)
			end

			local num = tacticsUnitData:getStudyNumByHero(data:getBase_id())

			local UserDataHelper = require("app.utils.UserDataHelper")
			local isYoke = UserDataHelper.isShowYokeMark(data:getBase_id())

			self["_imageMark"..index]:setVisible(isYoke)
			self["_item"..index]:setTouchEnabled(true)

			local des = Lang.get("tactics_title_study")
			local value = Lang.get("tactics_title_study_add_desc2", {num=num/10})
			self["_nodeDes"..index]:updateUI(des, value)
			self["_nodeDes"..index]:setValueColor(Colors.TacticsBlueColor)
			self["_nodeDes"..index]:setVisible(true)

			self["_checkBox"..index]:setSelected(isAdded)
		else
			self["_item"..index]:setVisible(false)
		end
	end
    for i=1,3 do
        updateCell(i, dataList[i], isAddedList[i])
    end
end

function PopupCheckHeroTacticsCell:_onCheckBoxClicked1(sender)
	local selected = self._checkBox1:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(1, selected, self)
	else
		self._checkBox1:setSelected(not selected)
	end
	G_AudioManager:playSoundWithId(AudioConst.SOUND_BUTTON)
end

function PopupCheckHeroTacticsCell:_onCheckBoxClicked2(sender)
	local selected = self._checkBox2:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(2, selected, self)
	else
		self._checkBox2:setSelected(not selected)
	end
	G_AudioManager:playSoundWithId(AudioConst.SOUND_BUTTON)
end

function PopupCheckHeroTacticsCell:_onCheckBoxClicked3(sender)
	local selected = self._checkBox3:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(3, selected, self)
	else
		self._checkBox3:setSelected(not selected)
	end
	G_AudioManager:playSoundWithId(AudioConst.SOUND_BUTTON)
end

function PopupCheckHeroTacticsCell:setCheckBoxSelected(t, selected)
	self["_checkBox"..t]:setSelected(selected)
	self:dispatchCustomCallback(t, selected, self)
end

function PopupCheckHeroTacticsCell:getSelectedState()
	local list = {}
	for i=1,3 do
		local node = self["_checkBox"..i]
		local isSelected = node:isSelected()
		table.insert(list, isSelected)
	end
	return list
end

function PopupCheckHeroTacticsCell:getItem( index )
	local item = self["_item"..index]
	local icon = nil
	if item then
		icon = item:getCommonIcon()
	end
	return icon
end

return PopupCheckHeroTacticsCell