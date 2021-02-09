local PopupBase = require("app.ui.PopupBase")
local PopupHorseRaceEnd = class("PopupHorseRaceEnd", PopupBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

local CSHelper  = require("yoka.utils.CSHelper")

local HorseRaceHelper = require("app.scene.view.horseRace.HorseRaceHelper")


function PopupHorseRaceEnd:ctor(distance, point, awards, isPerfectDis, isPercentGold)
    self._awards = awards
    self._distance = distance
    self._point = point
    self._isPerfectDis = isPerfectDis
    self._isPercentGold = isPercentGold
	local resource = {
        file = Path.getCSB("PopupHorseRaceEnd", "horseRace"),
		binding = {
		}
    }
	PopupHorseRaceEnd.super.ctor(self, resource, false, false)
end

function PopupHorseRaceEnd:onCreate()
    local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_HORSE_RACE_SUMMARY)
end

function PopupHorseRaceEnd:onEnter()
    self:_playEft()
end

function PopupHorseRaceEnd:onExit()
end

function PopupHorseRaceEnd:_onOKClick()
    G_SceneManager:popScene()
end

function PopupHorseRaceEnd:_onRetryClick()
    G_SignalManager:dispatch(SignalConst.EVENT_HORSE_REMATCH)
    self:close()
end

function PopupHorseRaceEnd:_playEft()
    local function effectFunction(effect)
        if effect == "shuoming_1" then 
            return self:_createHorseReward(Lang.get("horse_reward_distance"), Lang.get("horse_race_meter", {count = self._distance}), self._isPerfectDis)
        elseif effect == "shuoming_2" then 
            return self:_createHorseReward(Lang.get("horse_reward_point"), Lang.get("horse_race_point", {count = self._point}), self._isPercentGold)
        elseif effect == "shuoming_3" then 
            return self:_createHorseReward2(Lang.get("horse_reward_reward"), self._awards)
        elseif effect == "anniu" then 
            return self:_createButtons()
        end
        return cc.Node:create()
    end
    

    G_EffectGfxMgr:createPlayMovingGfx( self._effectNode, "moving_benpaojiesuan", effectFunction )
end

function PopupHorseRaceEnd:_createHorseReward(text, count, isPerfect)
    local nodeHorseReward = CSHelper.loadResourceNode(Path.getCSB("NodeHorseReward", "horseRace"))

    self._textTitle = ccui.Helper:seekNodeByName(nodeHorseReward, "TextTitle")
    self._textTitle:setString(text)  
    self._textCount = ccui.Helper:seekNodeByName(nodeHorseReward, "TextCount")
    self._textCount:setString(count)

    self._imagePerfect = ccui.Helper:seekNodeByName(nodeHorseReward, "ImagePerfect")
    self._imagePerfect:setVisible(false)
    if isPerfect then 
        self._imagePerfect:setVisible(true)
        self._imagePerfect:setPositionX(self._textCount:getPositionX() + self._textCount:getContentSize().width + 20)
    end

    return nodeHorseReward
end

function PopupHorseRaceEnd:_createHorseReward2(text, awards)
    local nodeHorseReward = CSHelper.loadResourceNode(Path.getCSB("NodeHorseReward2", "horseRace"))
    self._textTitle = ccui.Helper:seekNodeByName(nodeHorseReward, "TextTitle")
    self._textTitle:setString(text) 
    self._textFull = ccui.Helper:seekNodeByName(nodeHorseReward, "TextFull")
    self._textFull:setVisible(false)
    local posX = 0
    local isFull = HorseRaceHelper.isRewardFull()
    
    if #awards == 0 then 
        self._textTitle:setString(Lang.get("horse_race_no_reward"))
        self._textFull:setPositionX(0)
        self._textFull:setVisible(false)
        self._textTitle:setVisible(true)
    else
        for i, v in pairs(awards) do 
            if v.type ~= 0 then
                local icon = CSHelper.loadResourceNode(Path.getCSB("CommonResourceInfo", "common"))
                icon:updateUI(v.type, v.value, v.size)
                icon:setCountColorBeige()
                nodeHorseReward:addChild(icon)
                posX = 105 + (i-1)*90
                icon:setPosition(cc.p( posX, -20))
            end
        end
        self._textFull:setVisible(isFull)
        self._textFull:setString(Lang.get("horse_reward_full2"))
        self._textFull:setPositionX(posX+90)
    end

    return nodeHorseReward
end

function PopupHorseRaceEnd:_createButtons()
    local node = cc.Node:create()

    local btnOk = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common"))   --红色
    node:addChild(btnOk)
    btnOk:setPositionX(150)
    btnOk:setString(Lang.get("horse_ok"))
    btnOk:addClickEventListenerEx(handler(self, self._onOKClick))

    local btnRetry = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Normal", "common"))   --黄色
    node:addChild(btnRetry)
    btnRetry:setPositionX(-150)
    btnRetry:setString(Lang.get("horse_retry"))
    btnRetry:addClickEventListenerEx(handler(self, self._onRetryClick))

    return node
end


return PopupHorseRaceEnd