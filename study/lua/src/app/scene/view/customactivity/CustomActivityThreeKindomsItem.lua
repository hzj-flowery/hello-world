-- @Author panhoa
-- @Date 11.28.2018
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local CustomActivityThreeKindomsItem = class("CustomActivityThreeKindomsItem", ViewBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local CustomActivityConst = require("app.const.CustomActivityConst")

function CustomActivityThreeKindomsItem:ctor(touchCallback)
    self._resource     = nil
    self._fileNodeIcon = nil
    self._nodeEffect   = nil
    self._textDesc     = nil
    self._panelTouch   = nil
    self._touchCallback= touchCallback

    local resource = {
		file = Path.getCSB("CustomActivityThreeKindomsItem", "customactivity"),

	}
	CustomActivityThreeKindomsItem.super.ctor(self, resource)
end

function CustomActivityThreeKindomsItem:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

function CustomActivityThreeKindomsItem:onEnter()
end

function CustomActivityThreeKindomsItem:onExit()
end

-- @Role    Getting's effect
function CustomActivityThreeKindomsItem:_createEffect(index, data)
    local selectedFlash = self._nodeEffect:getChildByName("flash_effect"..index)
    if selectedFlash == nil then
        local lightEffect = require("app.effect.EffectGfxNode").new(SeasonSportConst.SEASON_PET_SELECTEDEFFECT[1])
        lightEffect:setAnchorPoint(0, 0)
        lightEffect:play()
        lightEffect:setScale(1.1)
        lightEffect:setVisible(data.taskStatus == 1)
        lightEffect:setName("flash_effect"..index)
        self._nodeEffect:addChild(lightEffect)
        lightEffect:setPosition(self._nodeEffect:getContentSize().width* 0.5,
                                self._nodeEffect:getContentSize().height * 0.5 + 1)
    else
        selectedFlash:setVisible(data.taskStatus == 1)
    end
end

-- @Role    创建描述
function CustomActivityThreeKindomsItem:_createDesc(color, data)
    local strDesc = Lang.getTxt(data.mission_description, {num = tonumber(data.value)})
    local descStr = ""
    local iconColor = nil
    if data.taskStatus == 1 then
        descStr = Lang.get("activity_linkage_notreceive")
        iconColor = CustomActivityConst.RECEIVED_OR_NOT[2]
    elseif data.taskStatus == 2 then
        descStr = Lang.get("activity_linkage_received")
        iconColor = CustomActivityConst.RECEIVED_OR_NOT[1]
    else
        descStr = strDesc
        iconColor = color
    end
    return iconColor, descStr
end

-- @Role    Listener Touch
function CustomActivityThreeKindomsItem:_onPanelTouch(sender, state)
    if state == ccui.TouchEventType.ended or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            local idx = sender:getTag()
            if sender:isEnabled() then
                if self._touchCallback then
                    self._touchCallback(idx)
                end
            end
        end
    end
end

-- @Role    ShowUI
function CustomActivityThreeKindomsItem:updateUI(index, data)
    self:_createEffect(index, data)
    self._fileNodeIcon:unInitUI()
    self._fileNodeIcon:initUI(data.reward_type, data.reward_value, data.reward_size)
    self._fileNodeIcon:setTouchEnabled(data.taskStatus ~= 1)
    self._fileNodeIcon:setIconMask(data.taskStatus == 2)

    local iconColor, strName = self:_createDesc(self._fileNodeIcon:getItemParams().icon_color, data)
    self._textDesc:setColor(iconColor)
    self._textDesc:setString(strName)

    self._panelTouch:setTag(index)
    self._panelTouch:setVisible(data.taskStatus == 1)
    self._panelTouch:setEnabled(data.taskStatus == 1)
    self._panelTouch:setSwallowTouches(false)
    self._panelTouch:setTouchEnabled(true)
    self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
end


return CustomActivityThreeKindomsItem