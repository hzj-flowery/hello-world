-- Author: nieming
-- Date:2017-10-16 18:33:37
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupSellFragment = class("PopupSellFragment", PopupBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local FragmentConfig = require("app.config.fragment")
local DataConst = require("app.const.DataConst")
PopupSellFragment.HERO_FRAGMENT_SELL = 1 --武将碎片
PopupSellFragment.EQUIPMENT_FRAGMENT_SELL = 2 --装备碎片
PopupSellFragment.TREASURE_FRAGMENT_SELL = 3 --宝物碎片
PopupSellFragment.INSTRUMENT_FRAGMENT_SELL = 4 --神兵碎片
PopupSellFragment.GEMSTONE_SELL = 8 --觉醒道具 宝石, 宝石碎片
PopupSellFragment.PET_FRAGMENT_SELL = 10 --神兽碎片
PopupSellFragment.SILKBAG_SELL = 11 --锦囊出售
PopupSellFragment.HORSE_FRAGMENT_SELL = 13 --战马碎片
PopupSellFragment.HORSE_EQUIP_FRAGMENT_SELL = 14 --马具碎片
PopupSellFragment.ITEM_SEAL_SELL = 101 -- 道具出售
PopupSellFragment.JADESTONE_SELL = 102 -- 玉石出售

PopupSellFragment.CHANGE_MODEL = {
    [PopupSellFragment.HERO_FRAGMENT_SELL] = {
        selectQualitys = {3, 4},
        getData = function()
            return G_UserData:getFragments():getFragListByType(
                PopupSellFragment.HERO_FRAGMENT_SELL,
                G_UserData:getFragments().SORT_FUNC_HERO_FRAGMENT_SELL
            )
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_hero_title")
            data.recycleValue = DataConst.RES_SOUL --将魂资源值
        end
    },
    [PopupSellFragment.EQUIPMENT_FRAGMENT_SELL] = {
        selectQualitys = {3, 4},
        getData = function()
            return G_UserData:getFragments():getFragListByType(
                PopupSellFragment.EQUIPMENT_FRAGMENT_SELL,
                G_UserData:getFragments().SORT_FUNC_SELL
            )
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_equipment_title")
            data.recycleValue = DataConst.RES_JADE --精铁资源值
        end
    },
    [PopupSellFragment.TREASURE_FRAGMENT_SELL] = {
        selectQualitys = {3, 4},
        getData = function()
            return G_UserData:getFragments():getFragListByType(
                PopupSellFragment.TREASURE_FRAGMENT_SELL,
                G_UserData:getFragments().SORT_FUNC_SELL
            )
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_treasure_title")
            data.recycleValue = DataConst.RES_BAOWUZHIHUN --资源值
        end
    },
    [PopupSellFragment.INSTRUMENT_FRAGMENT_SELL] = {
        selectQualitys = {3, 4},
        getData = function()
            return G_UserData:getFragments():getFragListByType(
                PopupSellFragment.INSTRUMENT_FRAGMENT_SELL,
                G_UserData:getFragments().SORT_FUNC_SELL
            )
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_instrument_title")
            data.recycleValue = DataConst.RES_HONOR --功勋资源值
        end
    },
    [PopupSellFragment.GEMSTONE_SELL] = {
        selectQualitys = {2, 3},
        getData = function()
            local data = {}
            local isInsertGemstone = false
            local gemstoneData = G_UserData:getGemstone():getGemstonesData(1)
            local gemstoneFragmentData =
                G_UserData:getFragments():getFragListByType(
                PopupSellFragment.GEMSTONE_SELL,
                G_UserData:getFragments().SORT_FUNC_SELL
            )

            for k, gemstoneFragment in ipairs(gemstoneFragmentData) do
                table.insert(data, gemstoneFragment)
            end
            for _, gemstone in ipairs(gemstoneData) do
                table.insert(data, gemstone)
            end
            return data
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_gemstone_title")
            data.recycleValue = DataConst.RES_SHENHUN -- 资源值
        end
    },
    [PopupSellFragment.PET_FRAGMENT_SELL] = {
        selectQualitys = {3, 4},
        getData = function()
            return G_UserData:getFragments():getFragListByType(
                PopupSellFragment.PET_FRAGMENT_SELL,
                G_UserData:getFragments().SORT_FUNC_SELL
            )
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_pet_title")
            data.recycleValue = DataConst.RES_PET -- 兽魂
        end
    },
    [PopupSellFragment.SILKBAG_SELL] = {
        selectQualitys = {4},
        getData = function()
            return G_UserData:getSilkbag():getListDataOfSell()
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_silkbag_title") --锦囊出售
            data.recycleValue = DataConst.RES_DIAMOND --
        end
    },
    [PopupSellFragment.HORSE_FRAGMENT_SELL] = {
        selectQualitys = {3, 4},
        getData = function()
            local data =
                G_UserData:getFragments():getFragListByType(
                TypeConvertHelper.TYPE_HORSE,
                G_UserData:getFragments().SORT_FUNC_COMMON
            )
            return data
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_horse_title") --战马碎片出售
            data.recycleValue = DataConst.RES_HORSE_SOUL --将魂资源值
        end
    },
    [PopupSellFragment.HORSE_EQUIP_FRAGMENT_SELL] = {
        selectQualitys = {4},
        getData = function()
            local data =
                G_UserData:getFragments():getFragListByType(
                TypeConvertHelper.TYPE_HORSE_EQUIP,
                G_UserData:getFragments().SORT_FUNC_COMMON
            )
            return data
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_horse_equip_title") --马具碎片出售
            data.recycleValue = DataConst.RES_HORSE_SOUL --将魂资源值
        end
    },
    [PopupSellFragment.ITEM_SEAL_SELL] = {
        selectQualitys = {3, 4},
        getData = function()
            return G_UserData:getItems():getItemSellData()
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_office_seal_title") --道具出售、
            data.recycleValue = DataConst.RES_DIAMOND -- 元宝
            data.recycleValue1 = DataConst.RES_GOLD --银币
            data.recycleSize1 = 0
        end
    },
    [PopupSellFragment.JADESTONE_SELL] = {
        selectQualitys = {4},
        getData = function(data)
            return G_UserData:getJade():getJadeListBySell()
        end,
        getBaseData = function(data)
            data.title = Lang.get("lang_sellfragment_jade_title") --玉石出售
            data.recycleValue = DataConst.RES_JADE_SOUL --玉魂资源值
        end
    }
}

function PopupSellFragment:ctor(sellType)
    --csb bind var name
    self._totalGet = nil --CommonResourceInfoList
    self._commonNodeBk = nil --CommonNormalSmallPop
    self._btnSell = nil --CommonButtonHighLight
    self._selectNum = nil --Text
    self._btnSelectType = nil --CommonButtonHighLight
    self._listView = nil --ListView

    local resource = {
        file = Path.getCSB("PopupSellFragment", "sell"),
        binding = {
            _btnSell = {
                events = {{event = "touch", method = "_onBtnSell"}}
            },
            _btnSelectType = {
                events = {{event = "touch", method = "_onBtnSelectType"}}
            }
        }
    }

    self._sellType = sellType
    if not self._sellType then
        self._sellType = PopupSellFragment.HERO_FRAGMENT_SELL
    end
    self._data = self:_getBaseDataBySellType()
    PopupSellFragment.super.ctor(self, resource, false)
end

-- Describle：
function PopupSellFragment:onCreate()
    self._commonNodeBk:setTitle(self._data.title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.close))
    -- self._totalGet:setTextColorToDTypeColor()
    self._btnSelectType:setString(Lang.get("lang_sellfragment_btnselecttype_text"))
    self._btnSell:setString(Lang.get("lang_sellfragment_btnsell_text"))
    self._selectNum:setString(self._data.selectNum)
    self._totalGet:updateUI(self._data.recycleType, self._data.recycleValue, self._data.recycleSize)
    self._totalGet1:setVisible(self._sellType == PopupSellFragment.ITEM_SEAL_SELL)
    if self._totalGet1:isVisible() then
        -- self._totalGet1:setTextColorToDTypeColor()
        self._totalGet1:updateUI(self._data.recycleType, self._data.recycleValue1, self._data.recycleSize1)
    end
    self:_initSelectBtnState()
    self:_initListView()
end

-- Describle：
function PopupSellFragment:onEnter()
    self._signalSellObjects =
        G_SignalManager:add(SignalConst.EVENT_SELL_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))
    self._signalSellOnlyObjects =
        G_SignalManager:add(SignalConst.EVENT_SELL_ONLY_OBJECTS_SUCCESS, handler(self, self._onSellFragmentsSuccess))
end

-- Describle：
function PopupSellFragment:onExit()
    self._signalSellObjects:remove()
    self._signalSellObjects = nil
    self._signalSellOnlyObjects:remove()
    self._signalSellOnlyObjects = nil
end

function PopupSellFragment:_getUnitNum(unitData)
    if self._sellType == PopupSellFragment.SILKBAG_SELL or self._sellType == PopupSellFragment.JADESTONE_SELL then
        return 1
    else
        return unitData:getNum()
    end
end
--觉醒材料文本提示
function PopupSellFragment:_gemStoneSellTips()
    if self._data.selectNum <= 0 then
        G_Prompt:showTip(Lang.get("lang_sellfragment_gemstone_notselected"))
        return
    end
    local objects = {}
    local isHighQuality = false
    local num1 = 0 -- 碎片数目
    local num2 = 0 -- 整件数目
    for k, v in pairs(self._data.selectIndexs) do
        local temp = self._data.sellDatas[k]
        local singleData = {}
        local tp = temp:getType()
        singleData.type = tp
        singleData.id = temp:getConfig().id
        singleData.num = self:_getUnitNum(temp)
        table.insert(objects, singleData)
        if not isHighQuality and temp:getConfig().color >= 5 then
            isHighQuality = true
        end
        if tp == TypeConvertHelper.TYPE_GEMSTONE then
            num2 = num2 + singleData.num
        else
            num1 = num1 + singleData.num
        end
    end

    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local itemParams = TypeConvertHelper.convert(self._data.recycleType, self._data.recycleValue)

    local tipsContent = ""

    if num1 > 0 and num2 > 0 then
        tipsContent =
            Lang.get(
            "lang_sellfragment_tips_content_gemstone_3",
            {num1 = num1, num2 = num2, size = self._data.recycleSize, name = itemParams.name}
        )
    elseif num1 > 0 then
        tipsContent =
            Lang.get(
            "lang_sellfragment_tips_content_gemstone_1",
            {num1 = num1, size = self._data.recycleSize, name = itemParams.name}
        )
    elseif num2 > 0 then
        tipsContent =
            Lang.get(
            "lang_sellfragment_tips_content_gemstone_2",
            {num2 = num2, size = self._data.recycleSize, name = itemParams.name}
        )
    end

    if isHighQuality then
        tipsContent = string.format("%s|%s", tipsContent, Lang.get("lang_sellfragment_tips_content_gemstone_highlight"))
    end

    local PopupAlert =
        require("app.ui.PopupAlert").new(
        Lang.get("lang_sellfragment_tips_title"),
        "",
        function()
            G_UserData:c2sSellObjects(objects)
        end
    )
    PopupAlert:addRichTextType2(tipsContent, Colors.BRIGHT_BG_TWO, 22)
    PopupAlert:openWithAction()
end

function PopupSellFragment:_silkbagSellTips()
    if self._data.selectNum <= 0 then
        G_Prompt:showTip(Lang.get("lang_sellfragment_silkbag_notselected"))
        return
    end
    local objects = {}
    local isHighQuality = false
    local num1 = 0 -- 碎片数目
    for k, v in pairs(self._data.selectIndexs) do
        local temp = self._data.sellDatas[k]
        local singleData = {}
        local tp = temp:getType()
        singleData.object_type = tp
        singleData.object_id = temp:getId()
        table.insert(objects, singleData)
        if not isHighQuality and temp:getConfig().color >= 5 then
            isHighQuality = true
        end
        num1 = num1 + 1
    end
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local itemParams = TypeConvertHelper.convert(self._data.recycleType, self._data.recycleValue)
    local tipsContent =
        Lang.get(
        "lang_sellfragment_tips_content_silkbag",
        {num = num1, size = self._data.recycleSize, name = itemParams.name}
    )
    if isHighQuality then
        tipsContent = string.format("%s|%s", tipsContent, Lang.get("lang_sellfragment_tips_content_silkbag_highlight"))
    end
    local PopupAlert =
        require("app.ui.PopupAlert").new(
        Lang.get("lang_sellfragment_tips_title"),
        "",
        function()
            G_UserData:c2sSellOnlyObjects(objects)
        end
    )
    PopupAlert:addRichTextType2(tipsContent, Colors.BRIGHT_BG_TWO, 22)
    PopupAlert:openWithAction()
end

-- 普通 提示
function PopupSellFragment:_getNormalTipsContent(num, size, size1, name, name1, isHighQuality)
    local str = ""
    if self._sellType == PopupSellFragment.ITEM_SEAL_SELL then
        str = Lang.get("lang_sellfragment_tips_content_item", {num = num, size = size, name = name})
        if size1 and size1 > 0 then
            str =
                string.format(
                "%s%s",
                str,
                Lang.get("lang_sellfragment_tips_content_item_gold", {size = size1, name = name1})
            )
        end
        if isHighQuality then
            str = string.format("%s|%s", str, Lang.get("lang_sellfragment_tips_content_item_highlight"))
        end
    else
        local content = "lang_sellfragment_tips_content_fragment"
        if self._sellType == PopupSellFragment.JADESTONE_SELL then
            content = "lang_sellfragment_tips_content_Jade"
        end
        local content1 = "lang_sellfragment_tips_content_fragment_highlight"
        if self._sellType == PopupSellFragment.JADESTONE_SELL then
            content1 = "lang_sellfragment_tips_content_jade_highlight"
        end
        str = Lang.get(content, {num = num, size = size, name = name})
        if isHighQuality then
            str = string.format("%s|%s", str, Lang.get(content1))
        end
    end
    return str
end

function PopupSellFragment:_getNotSelectedTipsContent(num, size, name, isHighQuality)
    if self._sellType == PopupSellFragment.ITEM_SEAL_SELL then
        return Lang.get("lang_sellfragment_office_seal_notselected")
    elseif self._sellType == PopupSellFragment.JADESTONE_SELL then
        return Lang.get("lang_sellfragment_jade_notselected")
    else
        return Lang.get("lang_sellfragment_fragment_notselected")
    end
end

function PopupSellFragment:_normalTips()
    if self._data.selectNum <= 0 then
        G_Prompt:showTip(self:_getNotSelectedTipsContent())
        return
    end
    local objects = {}
    local isHighQuality = false
    local num1 = 0 -- 碎片数目
    for k, v in pairs(self._data.selectIndexs) do
        local temp = self._data.sellDatas[k]
        local singleData = {}
        local tp = temp:getType()
        singleData.type = tp
        if self._sellType == PopupSellFragment.JADESTONE_SELL then
            singleData.id = temp:getId()
        else
            singleData.id = temp:getConfig().id
        end
        singleData.num = self:_getUnitNum(temp)
        table.insert(objects, singleData)
        if not isHighQuality and temp:getConfig().color >= 5 then
            isHighQuality = true
        end
        num1 = num1 + singleData.num
    end
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local itemParams = TypeConvertHelper.convert(self._data.recycleType, self._data.recycleValue)
    local name1 = itemParams.name
    local name2 = nil
    if self._data.recycleValue1 then
        local itemParams2 = TypeConvertHelper.convert(self._data.recycleType, self._data.recycleValue1)
        name2 = itemParams2.name
    end
    local tipsContent =
        self:_getNormalTipsContent(num1, self._data.recycleSize, self._data.recycleSize1, name1, name2, isHighQuality)
    local PopupAlert =
        require("app.ui.PopupAlert").new(
        Lang.get("lang_sellfragment_tips_title"),
        "",
        function()
            if self._sellType == PopupSellFragment.JADESTONE_SELL then
                G_UserData:getJade():c2sJadeSell(objects)
            else
                G_UserData:c2sSellObjects(objects)
            end
        end
    )
    PopupAlert:addRichTextType2(tipsContent, Colors.BRIGHT_BG_TWO, 22)
    PopupAlert:openWithAction()
end

-- Describle：
function PopupSellFragment:_onBtnSell()
    local richTextConfig = nil
    if self._sellType == PopupSellFragment.GEMSTONE_SELL then
        self:_gemStoneSellTips()
    elseif self._sellType == PopupSellFragment.SILKBAG_SELL then
        self:_silkbagSellTips()
    else
        self:_normalTips()
    end
end
-- Describle：
function PopupSellFragment:_onBtnSelectType()
    -- body
    local params = PopupSellFragment.CHANGE_MODEL[self._sellType].selectQualitys
    local popupSellFragment =
        require("app.scene.view.sell.PopupSellSelect").new(params, handler(self, self._selectByType))
    popupSellFragment:openWithAction()
end

function PopupSellFragment:_initListView()
    -- body
    local PopupSellFragmentCell = require("app.scene.view.sell.PopupSellFragmentCell")
    self._listView:setTemplate(PopupSellFragmentCell)
    self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
    self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))
    self._listView:resize(math.ceil(#self._data.sellDatas / 2))
end

-- Describle：
function PopupSellFragment:_onListViewItemUpdate(item, index)
    local index = index * 2
    item:updateUI(
        self._data.sellDatas[index + 1],
        self._data.sellDatas[index + 2],
        self._data.selectIndexs[index + 1] == true,
        self._data.selectIndexs[index + 2] == true
    )
end

-- Describle：
function PopupSellFragment:_onListViewItemSelected(item, index)
end

function PopupSellFragment:_getRecycleSizeByData(data)
    local tp = data:getType()
    local size = 0
    local config = data:getConfig()
    if tp == TypeConvertHelper.TYPE_GEMSTONE then
        local fragmentId = config.fragment_id
        local fragmentConfig = FragmentConfig.get(fragmentId)
        assert(fragmentConfig ~= nil, "fragmentConfig == nil")
        size = fragmentConfig.recycle_size * fragmentConfig.fragment_num
    else
        size = config.recycle_size
    end
    return size
end
-- Describle：
function PopupSellFragment:_onListViewItemTouch(index, singleCellIndex)
    local targetDataIndex = index * 2 + singleCellIndex
    local fragmentData = self._data.sellDatas[targetDataIndex]
    assert(fragmentData, "can not find fragmentData")
    local size = self:_getRecycleSizeByData(fragmentData)
    local num = self:_getUnitNum(fragmentData)
    local config = fragmentData:getConfig()
    size = size * num
    if self._data.selectIndexs[targetDataIndex] then
        self._data.selectIndexs[targetDataIndex] = nil
        self._data.selectNum = self._data.selectNum - num
        if self._totalGet1:isVisible() and config.recycle_value == DataConst.RES_GOLD then
            self._data.recycleSize1 = self._data.recycleSize1 or 0
            self._data.recycleSize1 = self._data.recycleSize1 - size
        else
            self._data.recycleSize = self._data.recycleSize - size
        end
    else
        self._data.selectIndexs[targetDataIndex] = true
        self._data.selectNum = self._data.selectNum + num
        if self._totalGet1:isVisible() and config.recycle_value == DataConst.RES_GOLD then
            self._data.recycleSize1 = self._data.recycleSize1 or 0
            self._data.recycleSize1 = self._data.recycleSize1 + size
        else
            self._data.recycleSize = self._data.recycleSize + size
        end
    end
    self:_updateUIBySelectedChange()
end

function PopupSellFragment:_getData()
    local data = PopupSellFragment.CHANGE_MODEL[self._sellType].getData()
    return data
end

--获取数据
function PopupSellFragment:_getBaseDataBySellType()
    local data = {}
    data.recycleType = 5 --资源类型
    data.recycleSize = 0 --数量
    data.sellDatas = self:_getData()
    PopupSellFragment.CHANGE_MODEL[self._sellType].getBaseData(data)
    data.selectIndexs = {}
    data.selectNum = 0
    return data
end

-- 碎片按品质选择 回调
function PopupSellFragment:_selectByType(selectQualitys)
    if not (selectQualitys and table.nums(selectQualitys) > 0) then
        return
    end
    self._data.selectIndexs = {}
    self._data.selectNum = 0
    self._data.recycleSize = 0
    for k, v in pairs(self._data.sellDatas) do
        local config = v:getConfig()
        local color = config.color
        if selectQualitys[color] then
            self._data.selectIndexs[k] = true
            local size = self:_getRecycleSizeByData(v)
            local num = self:_getUnitNum(v)
            size = size * num
            self._data.selectNum = self._data.selectNum + num
            self._data.recycleSize = self._data.recycleSize + size
        end
    end
    self._listView:resize(math.ceil(#self._data.sellDatas / 2))
    self:_updateUIBySelectedChange()
end

function PopupSellFragment:_updateUIBySelectedChange()
    self._totalGet:setCount(self._data.recycleSize)
    if self._totalGet1:isVisible() then
        self._totalGet1:setCount(self._data.recycleSize1 or 0)
    end
    self._selectNum:setString(self._data.selectNum)
end

function PopupSellFragment:_reset()
    self._data.selectIndexs = {}
    self._data.selectNum = 0
    self._data.recycleSize = 0
    self._data.recycleSize1 = 0
    self._data.sellDatas = self:_getData()
    self._listView:resize(math.ceil(#self._data.sellDatas / 2))
    self:_updateUIBySelectedChange()
end

function PopupSellFragment:_onSellFragmentsSuccess(id, awards)
    self:_reset()
    if self._data.sellDatas and #self._data.sellDatas == 0 then
        self:close()
    end
    local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    PopupGetRewards:showRewardsWithAutoMerge(awards)
end

function PopupSellFragment:_initSelectBtnState()
    if self._sellType == PopupSellFragment.ITEM_SEAL_SELL then
        self:setSelectBtnVisible(false)
    else
        self:setSelectBtnVisible(true)
    end
end
function PopupSellFragment:setSelectBtnVisible(trueOrFalse)
    self._btnSelectType:setVisible(trueOrFalse)
end

return PopupSellFragment
