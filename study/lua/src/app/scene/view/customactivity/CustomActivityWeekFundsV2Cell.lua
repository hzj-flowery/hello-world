-- @Author panhoa
-- @Date 3.12.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local CustomActivityWeekFundsV2Cell = class("CustomActivityWeekFundsV2Cell", ListViewCellBase)
local CustomActivityConst = require("app.const.CustomActivityConst")


function CustomActivityWeekFundsV2Cell:ctor(rewardCallback)
    self._rewardCallback = rewardCallback

    local resource = {
        file = Path.getCSB("CustomActivityWeekFundsV2Cell", "customactivity"),
    }
    CustomActivityWeekFundsV2Cell.super.ctor(self, resource)
end

function CustomActivityWeekFundsV2Cell:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

-- @Role    Create Effect
function CustomActivityWeekFundsV2Cell:_createEffect(effect, state)
    -- body
    if effect == 0 then return end
    local selectedFlash = self["_nodeEffect"]:getChildByName("flash_effect")
    if selectedFlash == nil then
        local lightEffect = require("app.effect.EffectGfxNode").new("effect_chongzhi_guangyun6")
        lightEffect:setAnchorPoint(0, 0)
        lightEffect:play()
        --lightEffect:setScale(1.1)
        lightEffect:setVisible(state == 0)
        lightEffect:setName("flash_effect")
        self["_nodeEffect"]:addChild(lightEffect)
        lightEffect:setPosition(self["_nodeEffect"]:getContentSize().width* 0.5,
                                self["_nodeEffect"]:getContentSize().height * 0.5 + 8)
    else
        selectedFlash:setVisible(state == 0)
    end
end

-- @Role    UpdateUI
function CustomActivityWeekFundsV2Cell:updateUI(data)
    -- body
    local effect = tonumber(data.effects)
    local curDay = tonumber(data.day)
    --self._imageNormal:loadTexture(Path.getCustomActivityUI(data.reward_background1))
    --self._imageNormal:ignoreContentAdaptWithSize(true)
    self._imageDay:loadTexture(Path.getCustomActivityUI(CustomActivityConst.FUNDS_V2_DAY[curDay]))
    self._imageDay:ignoreContentAdaptWithSize(true)
    self._imageYuanBao:loadTexture(Path.getCustomActivityUI(CustomActivityConst.FUNDS_YUANBAO[effect+1]))
    self._imageYuanBao:ignoreContentAdaptWithSize(true)
    --self._imageSelected:loadTexture(Path.getCustomActivityUI(data.reward_effect))
    --self._imageSelected:ignoreContentAdaptWithSize(true)
    self._textNum:setString("x" ..tostring(data.reward_size_1))

    if data.isActived and data.canSignedDay then
        self:_createEffect(effect, data.canGet)
        self._imageShade:setVisible(data.canGet == 1)
        self._imageDuiGou:setVisible(data.canGet == 1)
        self._imageLarge:setVisible(data.canGet == 0)
        self._imageSelected:setVisible(data.canGet == 0)
        self._panelTouch:setVisible(data.canGet == 0)
        self._textState:setString(data.canGet == 1 and Lang.get("weekfunds_v2_state2") or Lang.get("weekfunds_v2_state3"))
        self._textState:setColor(data.canGet == 0 and Colors.FUNDSWEEK_V2_GOT or Colors.FUNDSWEEK_V2_NOTGOT)
    else
        self:_createEffect(effect, 0)
        self._imageShade:setVisible(false)
        self._imageDuiGou:setVisible(false)
        self._imageLarge:setVisible(false)
        self._imageSelected:setVisible(false)
        self._panelTouch:setVisible(false)
        self._textState:setString(Lang.get("weekfunds_v2_state1"))
        self._textState:setColor(Colors.FUNDSWEEK_V2_NOTGOT)
    end

    self._panelTouch:setEnabled(true)
    self._panelTouch:setSwallowTouches(false)
    self._panelTouch:setTouchEnabled(true)
    self._panelTouch:addClickEventListenerEx(function()
        -- body
        if self._rewardCallback then
            self._rewardCallback(curDay)
        end
    end)
end



return CustomActivityWeekFundsV2Cell