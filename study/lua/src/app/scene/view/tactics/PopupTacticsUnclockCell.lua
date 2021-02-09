--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法位解锁选择武将界面 列表项
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupTacticsUnclockCell = class("PopupTacticsUnclockCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")


function PopupTacticsUnclockCell:ctor()
    local resource = {
        file = Path.getCSB("PopupTacticsUnclockCell", "tactics"),
    }
    PopupTacticsUnclockCell.super.ctor(self, resource)
end

function PopupTacticsUnclockCell:onCreate()
    self:setContentSize(self._resource:getContentSize())
    for index = 1, 6 do
        self["_item"..index]:setVisible(false)
    end
end

function PopupTacticsUnclockCell:_onPanelTouch(sender, state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            local subIndex = sender:getTag()
            self:dispatchCustomCallback(subIndex, not self:getSelectState(subIndex), self)
		end
	end
end

function PopupTacticsUnclockCell:getSelectState(index)
    local res = self._checkList[index] and true or false
    return res
end

function PopupTacticsUnclockCell:setSelectState(index, isSel)
    self._checkList[index] = isSel
    if isSel then
        self["_fileNodeCommon"..index]:setIconMask(true)
        self["_imageCheck"..index]:setVisible(true)
    else
        self["_fileNodeCommon"..index]:setIconMask(false)
        self["_imageCheck"..index]:setVisible(false)
    end
end

function PopupTacticsUnclockCell:updateUI(unitDataList, checkList)
    self._unitDataList = unitDataList
    self._checkList = checkList

    for i = 1, 6 do
        self["_item"..i]:setVisible(false)
    end

    local function updateItem(i, unitData, isCheck)
        self["_item"..i]:setVisible(true)
        self["_imageMask"..i]:setVisible(false)

        local params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, unitData:getBase_id())

        self["_fileNodeCommon"..i]:setVisible(true)
        self["_fileNodeCommon"..i]:unInitUI()
        self["_fileNodeCommon"..i]:initUI(TypeConvertHelper.TYPE_HERO, unitData:getBase_id())

        self["_textHeroName"..i]:setString(params.name)
        self["_textHeroName"..i]:setColor(params.icon_color)
        if params.color==7 then
            self["_textHeroName"..i]:enableOutline(params.icon_color_outline, 2)
        else
            self["_textHeroName"..i]:disableEffect(cc.LabelEffect.OUTLINE)
        end

        self:setSelectState(i, isCheck)

        self["_panelTouch"..i]:setTag(i)
        self["_panelTouch"..i]:setSwallowTouches(false)
        self["_panelTouch"..i]:setTouchEnabled(true)
        self["_panelTouch"..i]:addClickEventListenerEx(handler(self, self._onPanelTouch))
    end

    for i, unitData in ipairs(unitDataList) do
        updateItem(i, unitData, checkList[i]) 
     end
end


return PopupTacticsUnclockCell