
-- Author: nieming
-- Date:2017-10-25 10:07:08
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PackageGemstoneCell = class("PackageGemstoneCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
function PackageGemstoneCell:ctor()

	--csb bind var name
	self._btnFragment2 = nil  --CommonButtonSwitchLevel1
	self._gemstonePropInfo2 = nil  --SingleNode
	self._btnFragment1 = nil  --CommonButtonSwitchLevel1
	self._nodeAttr21 = nil  --CommonDesValue
	self._nodeAttr22 = nil  --CommonDesValue
	self._nodeAttr11 = nil  --CommonDesValue
	self._nodeCount2 = nil  --CommonDesValue
	self._nodeAttr12 = nil  --CommonDesValue
	self._nodeAttr13 = nil  --CommonDesValue
	self._gemstonePropInfo1 = nil  --SingleNode
	self._nodeAttr14 = nil  --CommonDesValue
	self._fragmentInfo2 = nil  --SingleNode
	self._nodeAttr23 = nil  --CommonDesValue
	self._item1 = nil  --CommonListCellBase
	self._item2 = nil  --CommonListCellBase
	self._fragmentInfo1 = nil  --SingleNode
	self._nodeCount1 = nil  --CommonDesValue
	self._nodeAttr24 = nil  --CommonDesValue

	local resource = {
		file = Path.getCSB("PackageGemstoneCell", "package"),
		binding = {
			_btnFragment2 = {
				events = {{event = "touch", method = "_onBtnFragment2"}}
			},
			_btnFragment1 = {
				events = {{event = "touch", method = "_onBtnFragment1"}}
			},
		},
	}
	PackageGemstoneCell.super.ctor(self, resource)
end

function PackageGemstoneCell:onCreate()
	-- body
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._nodeAttr11:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeAttr12:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeAttr13:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeAttr14:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeAttr21:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeAttr22:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeAttr23:setValueColor(Colors.BRIGHT_BG_GREEN)
	self._nodeAttr24:setValueColor(Colors.BRIGHT_BG_GREEN)

	self._fragmentInfo1:setVisible(false)
	self._fragmentInfo2:setVisible(false)
	self._gemstonePropInfo1:setVisible(false)
	self._gemstonePropInfo2:setVisible(false)
end


function PackageGemstoneCell:_updateGemStoneAttr(keyName, id)
	local attrInfo = UserDataHelper.getGemstoneAttr(id)
	local desInfo = TextHelper.getAttrInfoBySort(attrInfo)
	for i = 1, 4 do
		local one = desInfo[i]
		if one then
			local attrName, attrValue = TextHelper.getAttrBasicText(one.id, one.value)
			self[keyName..i]:updateUI(attrName, "+"..attrValue)
			self[keyName..i]:setVisible(true)
		else
			self[keyName..i]:setVisible(false)
		end
	end
end


function PackageGemstoneCell:_updateSingleCell(index, data)
	local itemKey = "_item"..index

	if not data then
		self[itemKey]:setVisible(false)
		return
	end
	local tp = data:getType()
	local id = data:getId()
	local num = data:getNum()

	local gemstoneKey = "_gemstonePropInfo"..index
	local fragmentKey = "_fragmentInfo"..index
	local attrName = "_nodeAttr"..index
	local fragmentCountKey = "_nodeCount"..index
	local btnFragmentKey = "_btnFragment"..index

	self[itemKey]:setVisible(true)
	if tp == TypeConvertHelper.TYPE_FRAGMENT then
		self[itemKey]:updateUI(tp, id)
		self[gemstoneKey]:setVisible(false)
		self[fragmentKey]:setVisible(true)

		local fragmentNum = data:getConfig().fragment_num
		local isEnough = num >= fragmentNum
		self[fragmentCountKey]:updateUI(Lang.get("hero_list_cell_frag_des"), num, fragmentNum)
		local btnDes = isEnough and Lang.get("fragment_list_cell_btn_compose") or Lang.get("fragment_list_cell_btn_get")
		self[btnFragmentKey]:setString(btnDes)
		if isEnough then
			self[btnFragmentKey]:switchToHightLight()
			self[fragmentCountKey]:setValueColor(Colors.BRIGHT_BG_GREEN)
			self[fragmentCountKey]:setMaxColor(Colors.BRIGHT_BG_GREEN)
		else
			self[btnFragmentKey]:switchToNormal()
			self[fragmentCountKey]:setValueColor(Colors.BRIGHT_BG_ONE)
			self[fragmentCountKey]:setMaxColor(Colors.BRIGHT_BG_ONE)
		end
	elseif tp == TypeConvertHelper.TYPE_GEMSTONE then

		self[itemKey]:updateUI(tp, id, num)
		self[gemstoneKey]:setVisible(true)
		self[fragmentKey]:setVisible(false)
		self:_updateGemStoneAttr(attrName, id)
	end
end

function PackageGemstoneCell:updateUI(index, itemLine)
	-- body
	self._cellIndex = index
	self:_updateSingleCell(1, itemLine[1])
	self:_updateSingleCell(2, itemLine[2])
end
-- Describle：
function PackageGemstoneCell:_onBtnFragment2()
	-- body
	self:dispatchCustomCallback(2)
end
-- Describle：
function PackageGemstoneCell:_onBtnFragment1()
	-- body
	self:dispatchCustomCallback(1)
end

return PackageGemstoneCell
