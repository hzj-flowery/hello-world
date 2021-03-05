--
-- Author: Liangxu
-- Date: 2017-07-15 15:39:09
-- 复选武将Cell
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCheckHeroCell = class("PopupCheckHeroCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupCheckHeroCell:ctor()
	local resource = {
		file = Path.getCSB("PopupCheckHeroCell", "common"),
		binding = {
			
		}
	}
	PopupCheckHeroCell.super.ctor(self, resource)
end

function PopupCheckHeroCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._checkBox1:addEventListener(handler(self, self._onCheckBoxClicked1))
	self._checkBox2:addEventListener(handler(self, self._onCheckBoxClicked2))
	self._checkBox1:setSwallowTouches(false)
	self._checkBox2:setSwallowTouches(false)
end

function PopupCheckHeroCell:update(data1, data2, isAdded1, isAdded2)
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
			self["_imageMark"..index]:setVisible(data.isYoke)
			self["_item"..index]:setTouchEnabled(true)

			for i = 1, 2 do
				local info = data.desValue[i]
				if info then
					local des = info.des
					local value = info.value
					if data:isPureGoldHero() and params.color == 7 and limitLevel == 0 then -- 金将
						des = Lang.get("hero_transform_cell_title_gold")
						value = rank
						if i == 2 then
							self["_nodeDes"..index.."_"..i]:setVisible(false)
							break
						end
					end
					self["_nodeDes"..index.."_"..i]:updateUI(des, value)
					self["_nodeDes"..index.."_"..i]:setValueColor(info.colorValue)
					self["_nodeDes"..index.."_"..i]:setVisible(true)
				else
					self["_nodeDes"..index.."_"..i]:setVisible(false)
				end
			end
			self["_checkBox"..index]:setSelected(isAdded)
		else
			self["_item"..index]:setVisible(false)
		end
	end

	updateCell(1, data1, isAdded1)
	updateCell(2, data2, isAdded2)
end

function PopupCheckHeroCell:_onCheckBoxClicked1(sender)
	local selected = self._checkBox1:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(1, selected, self)
	else
		self._checkBox1:setSelected(not selected)
	end
end

function PopupCheckHeroCell:_onCheckBoxClicked2(sender)
	local selected = self._checkBox2:isSelected()
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
		self:dispatchCustomCallback(2, selected, self)
	else
		self._checkBox2:setSelected(not selected)
	end
end

function PopupCheckHeroCell:setCheckBoxSelected(t, selected)
	self["_checkBox"..t]:setSelected(selected)
	self:dispatchCustomCallback(t, selected, self)
end

return PopupCheckHeroCell