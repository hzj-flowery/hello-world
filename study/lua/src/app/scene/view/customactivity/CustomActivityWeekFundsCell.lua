-- @Author panhoa
-- @Date 11.23.2018
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CustomActivityWeekFundsCell = class("CustomActivityWeekFundsCell", ListViewCellBase)
local CustomActivityConst = require("app.const.CustomActivityConst")
local SeasonSportConst = require("app.const.SeasonSportConst")


function CustomActivityWeekFundsCell:ctor()
    local resource = {
        file = Path.getCSB("CustomActivityWeekFundsCell", "customactivity"),
    }
    CustomActivityWeekFundsCell.super.ctor(self, resource)
end

function CustomActivityWeekFundsCell:onCreate()
    self:setContentSize(self._resource:getContentSize())
    for index = 1, CustomActivityConst.FUNDS_WEEKITEMNUM_MAX do
        self["_item"..index]:setVisible(false)
    end
end

function CustomActivityWeekFundsCell:_onPanelTouch(sender, state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            local day = sender:getTag()
            self:dispatchCustomCallback(day)
        end
    end
end

-- @Role    Create/Update Effect 
function CustomActivityWeekFundsCell:_updateEffect(index, state)
    local selectedFlash = self["_nodeEffect"..index]:getChildByName("flash_effect"..index)
    if selectedFlash == nil then
        local lightEffect = require("app.effect.EffectGfxNode").new(SeasonSportConst.SEASON_PET_SELECTEDEFFECT[1])
        lightEffect:setAnchorPoint(0, 0)
        lightEffect:play()
        lightEffect:setScale(1.1)
        lightEffect:setVisible(state == 0)
        lightEffect:setName("flash_effect"..index)
        self["_nodeEffect"..index]:addChild(lightEffect)
        lightEffect:setPosition(self["_nodeEffect"..index]:getContentSize().width* 0.5,
                                self["_nodeEffect"..index]:getContentSize().height * 0.5 + 1)
    else
        selectedFlash:setVisible(state == 0)
    end
end

-- @Role    UpdateUI
function CustomActivityWeekFundsCell:updateUI(cellData, fundsType, bFirstCell)
    for index = 1, CustomActivityConst.FUNDS_WEEKITEMNUM_MAX do
        self["_item"..index]:setVisible(false)
    end
    if cellData == nil or table.nums(cellData) <= 0 then
        return
    end

    local bExistSunday = false
    if fundsType == CustomActivityConst.FUNDS_TYPE_WEEK and CustomActivityConst.FUNDS_WEEKITEMNUM_SPECIAL == table.nums(cellData) then
        bExistSunday = true
    end

    -- Update
    local function updateItem(index, data, bSunday)
        if bSunday and index == CustomActivityConst.FUNDS_WEEKITEMNUM_SPECIAL then
            index = CustomActivityConst.FUNDS_WEEKITEMNUM_MAX
        end

        self["_item"..index]:setVisible(true)
        self["_textDay"..index]:setString(Lang.get("weekfunds_"..data.day))
        self["_fileNodeIcon"..index]:unInitUI()
        self["_fileNodeIcon"..index]:initUI(data.reward_type_1, data.reward_value_1, data.reward_size_1)

        if data.isActived and data.canSignedDay then
            self:_updateEffect(index, data.canGet)
            self["_fileNodeIcon"..index]:setIconMask(data.canGet == 1)
            self["_fileNodeIcon"..index]:setTouchEnabled(data.canGet == 1)
            self["_imageSelected"..index]:setVisible(data.canGet == 0)
            self["_imageGot"..index]:setVisible(data.canGet == 1)
            self["_imageShade"..index]:setVisible(data.canGet == 1)
            self["_imageDay"..index]:setVisible(data.canGet == 0)
            self["_textDay"..index]:setVisible(data.canGet == 0)
            self["_panelTouch"..index]:setVisible(data.canGet == 0)
        else
            self:_updateEffect(index, 1)
            self["_fileNodeIcon"..index]:setIconMask(false)
            self["_fileNodeIcon"..index]:setTouchEnabled(true)
            self["_imageSelected"..index]:setVisible(false)
            self["_imageGot"..index]:setVisible(false)
            self["_imageShade"..index]:setVisible(false)
            self["_imageDay"..index]:setVisible(true)
            self["_textDay"..index]:setVisible(true)
            self["_panelTouch"..index]:setVisible(false)
        end

        local param = self["_fileNodeIcon"..index]:getItemParams()
        self["_textName"..index]:setString(param.name)
        self["_textName"..index]:setColor(param.icon_color)

        self["_panelTouch"..index]:setTag(data.day)
        self["_panelTouch"..index]:setEnabled(true)
        self["_panelTouch"..index]:setSwallowTouches(false)
        self["_panelTouch"..index]:setTouchEnabled(true)
        self["_panelTouch"..index]:addClickEventListenerEx(handler(self, self._onPanelTouch))
    end

    for index = 1, #cellData do
        updateItem(index, cellData[index], bExistSunday)
    end
end



return CustomActivityWeekFundsCell