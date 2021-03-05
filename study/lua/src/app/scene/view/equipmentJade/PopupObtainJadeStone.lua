--
-- Author: liushiyin
-- Date:
--
local PopupBase = require("app.ui.PopupBase")
local PopupObtainJadeStone = class("PopupObtainJadeStone", PopupBase)
local CSHelper = require("yoka.utils.CSHelper")
local AudioConst = require("app.const.AudioConst")

local EFFECT_OPEN_STONE = {
    [701] = "moving_shuijingbaozha_qinglong",
    [702] = "moving_shuijingbaozha_xuanwu",
    [703] = "moving_shuijingbaozha_baihu",
    [704] = "moving_shuijingbaozha_zhuque",
    [721] = "moving_shuijingbaozha_zhulong",
    [722] = "moving_shuijingbaozha_jingwei"
}
local SOUND_OPEN_STONE = {
    [701] = AudioConst.SOUND_JADE_OPEN1,
    [702] = AudioConst.SOUND_JADE_OPEN2,
    [703] = AudioConst.SOUND_JADE_OPEN3,
    [704] = AudioConst.SOUND_JADE_OPEN4,
    [721] = AudioConst.SOUND_JADE_OPEN5,
    [722] = AudioConst.SOUND_JADE_OPEN6,
}

function PopupObtainJadeStone:ctor(itemId, awards)
    self._itemId = itemId
    self._awards = awards

    local resource = {
        file = Path.getCSB("PopupObtainJadeStone", "common"),
        binding = {}
    }
    self:setName("PopupObtainJadeStone")
    PopupObtainJadeStone.super.ctor(self, resource)
end

function PopupObtainJadeStone:onCreate()
end

function PopupObtainJadeStone:_onPanelTouch()
end

function PopupObtainJadeStone:onEnter()
    G_AudioManager:playSoundWithId(SOUND_OPEN_STONE[self._itemId])
    self:_playEffect()
end

function PopupObtainJadeStone:onExit()
end

function PopupObtainJadeStone:_playEffect()
    local eventHandler = function(event)
        if event == "get" then
            local PopupGetRewards =
                require("app.ui.PopupGetRewards").new(
                function()
                    self:close()
                end
            )
            PopupGetRewards:showRewards(self._awards)
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx(self._effectNode, EFFECT_OPEN_STONE[self._itemId], nil, eventHandler)
end

return PopupObtainJadeStone
