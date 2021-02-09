-- Author: nieming
-- Date:2017-10-16 18:33:44
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSellFragmentCell = class("PopupSellFragmentCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local FragmentConfig = require("app.config.fragment")

function PopupSellFragmentCell:ctor()
    --csb bind var name

    self._resInfoVaule1 = nil --CommonResourceInfoList
    self._resourceNode = nil --Panel
    self._resInfoVaule2 = nil --CommonResourceInfoList
    self._checkBox2 = nil --CheckBox
    self._item1 = nil --CommonListCellBase
    self._item2 = nil --CommonListCellBase
    self._checkBox1 = nil --CheckBox

    self._line21 = nil
    self._line22 = nil

    local resource = {
        file = Path.getCSB("PopupSellFragmentCell", "sell")
    }
    PopupSellFragmentCell.super.ctor(self, resource)
end

function PopupSellFragmentCell:onCreate()
    -- body
    local size = self._resourceNode:getContentSize()
    self:setContentSize(size.width, size.height)

    self._checkBox1:addEventListener(handler(self, self._onBtnCheckBox1))
    self._checkBox2:addEventListener(handler(self, self._onBtnCheckBox2))
end

--觉醒道具
function PopupSellFragmentCell:_updateGemstoneCell(index, data)
    local id = data:getId()
    local num = data:getNum()

    self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_GEMSTONE, id, num)
    self["_item" .. index]:setCountText(nil)
    local config = data:getConfig()
    local fragmentId = config.fragment_id
    local fragmentConfig = FragmentConfig.get(fragmentId)
    assert(fragmentConfig ~= nil, "fragmentConfig == nil")
    local resType = fragmentConfig.recycle_type
    local resValue = fragmentConfig.recycle_value
    local resSize = fragmentConfig.recycle_size * fragmentConfig.fragment_num
    self["_resInfoVaule" .. index]:updateUI(resType, resValue, resSize)
    self["_imageTop" .. index]:setVisible(false)
end
--官印
function PopupSellFragmentCell:_updateOfficeSeal(index, data)
    local id = data:getId()
    local num = data:getNum()
    self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_ITEM, id, num)
    -- self["_item"..index]:setCountText(num)
    local config = data:getConfig()
    local resType = config.recycle_type
    local resValue = config.recycle_value
    local resSize = config.recycle_size
    self["_resInfoVaule" .. index]:updateUI(resType, resValue, resSize)
    self["_imageTop" .. index]:setVisible(false)
end

--锦囊
function PopupSellFragmentCell:_updateSilkbag(index, data)
    local id = data:getBase_id()
    local num = 1
    self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_SILKBAG, id, num)
    -- self["_item"..index]:setCountText(num)
    local config = data:getConfig()
    local resType = config.recycle_type
    local resValue = config.recycle_value
    local resSize = config.recycle_size
    self["_resInfoVaule" .. index]:updateUI(resType, resValue, resSize)
    self["_imageTop" .. index]:setVisible(false)
end

--碎片
function PopupSellFragmentCell:_updateFragmentCell(index, data)
    local id = data:getId()
	local num = data:getNum()

	self["_item"..index]:updateUI(TypeConvertHelper.TYPE_FRAGMENT, id)
	local config = data:getConfig()
	-- self["_numValue"..index]:setString(string.format("%d/%d", num, config.fragment_num))
	local colorCount = num >= config.fragment_num and Colors.colorToNumber(Colors.BRIGHT_BG_GREEN) or Colors.colorToNumber(Colors.BRIGHT_BG_RED)
	local content = Lang.get("fragment_count_text", {
		count1 = num,
		color = colorCount,
		count2 = config.fragment_num,
	})
	local textCount = ccui.RichText:createWithContent(content)
	self["_item"..index]:setCountText(textCount)

	local resType = config.recycle_type
	local resValue = config.recycle_value
	local resSize = config.recycle_size
	self["_resInfoVaule"..index]:updateUI(resType, resValue, resSize)
	if config.comp_type == TypeConvertHelper.TYPE_HERO and G_UserData:getKarma():isHaveHero(config.comp_value) then
		self["_imageTop"..index]:setVisible(true)
	end
end

-- 玉石
function PopupSellFragmentCell:_updateJadeCell(index, data)
    local id = data:getSys_id()
    local num = 1
    self["_item" .. index]:updateUI(TypeConvertHelper.TYPE_JADE_STONE, id, num)
    local config = data:getConfig()
    local resType = config.recycle_type
    local resValue = config.recycle_value
    local resSize = config.recycle_size
    self["_resInfoVaule" .. index]:updateUI(resType, resValue, resSize)
    self["_imageTop" .. index]:setVisible(false)
end

function PopupSellFragmentCell:_updateSingleCell(index, data, isSelected)
    local itemKey = "_item" .. index
    if not data then
        self[itemKey]:setVisible(false)
        return
    end
    self[itemKey]:setVisible(true)
    local tp = data:getType()

    self["_imageTop" .. index]:setVisible(false)
    if tp == TypeConvertHelper.TYPE_GEMSTONE then
        --觉醒材料 整件
        self:_updateGemstoneCell(index, data)
    elseif tp == TypeConvertHelper.TYPE_FRAGMENT then
        --碎片
        self:_updateFragmentCell(index, data)
    elseif tp == TypeConvertHelper.TYPE_ITEM then
        --官印
        self:_updateOfficeSeal(index, data)
    elseif tp == TypeConvertHelper.TYPE_SILKBAG then
        --锦囊代码需要调整 先不处理锦囊
        self:_updateSilkbag(index, data)
    elseif tp == TypeConvertHelper.TYPE_JADE_STONE then
        self:_updateJadeCell(index, data)
    end
    self["_checkBox" .. index]:setSelected(isSelected)
end

function PopupSellFragmentCell:updateUI(data1, data2, isSelected1, isSelected2)
    -- body
    self:_updateSingleCell(1, data1, isSelected1)
    self:_updateSingleCell(2, data2, isSelected2)
end

function PopupSellFragmentCell:_onBtnCheckBox1()
    self:dispatchCustomCallback(1)
end

function PopupSellFragmentCell:_onBtnCheckBox2()
    self:dispatchCustomCallback(2)
end

return PopupSellFragmentCell
