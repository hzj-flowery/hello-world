local HeroGoldMidNode = class("HeroGoldMidNode")
local LimitCostConst = require("app.const.LimitCostConst")

function HeroGoldMidNode:ctor(target, callback)
    self._target = target
    self._effectNode1 = ccui.Helper:seekNodeByName(self._target, "EffectNode1")
    self._effectNode2 = ccui.Helper:seekNodeByName(self._target, "EffectNode2")
    self._imageHead = ccui.Helper:seekNodeByName(self._target, "ImageHead")
    self._imageName = ccui.Helper:seekNodeByName(self._target, "ImageName")
    self._textPercent = ccui.Helper:seekNodeByName(self._target, "TextPercent")
    self._imageTips = ccui.Helper:seekNodeByName(self._target, "ImageTips")
    self._panelTouch = ccui.Helper:seekNodeByName(self._target, "TouchPanel")
    self._panelTouch:addClickEventListenerEx(handler(self, self._panelTouchClicked))
    self._callback = callback
    self._imageHead:ignoreContentAdaptWithSize(true)
    self._imageName:ignoreContentAdaptWithSize(true) 
    self:_playMoving(self._effectNode1, "moving_jinjiangyangcheng_touxiang")
end

function HeroGoldMidNode:_panelTouchClicked()
    if self._callback then
        self._callback()
    end
end

function HeroGoldMidNode:updateNode(unitData)
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local UserDataHelper = require("app.utils.UserDataHelper")
    local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
    local oweCount =
        UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, unitData:getBase_id(), unitData:getId())
    local costInfo = HeroGoldHelper.heroGoldTrainCostInfo(unitData)
    local txt = oweCount .. "/" .. costInfo["cost_hero"]
    local iconRes = HeroGoldHelper.getHeroIconRes(unitData:getBase_id())
    self._imageHead:loadTexture(Path.getGoldHero(iconRes))
    if HeroGoldHelper.heroGoldCanRankUp(unitData) then
        self:_switchUI(true)
        self:_playMoving(self._effectNode2, "moving_jinjiangyangcheng_touxiangkedianji")
    else
        self:_switchUI(false)
        self._textPercent:setString(txt)
        local nameRes = HeroGoldHelper.getHeroNameRes(unitData:getBase_id())
        self._imageName:loadTexture(Path.getTextLimit(nameRes))
    end
end

function HeroGoldMidNode:_playMoving(node, movingName)
    node:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx(
        node,
        movingName,
        function(key)
            if key == "touxiang" then
                return self:_getHeadIamge()
            end
        end,
        nil
    )
end

function HeroGoldMidNode:_switchUI(switch)
    self._imageTips:setVisible(switch)
    self._effectNode2:setVisible(switch)
    self._imageName:setVisible(not switch)
    self._textPercent:setVisible(not switch)
end

function HeroGoldMidNode:_getHeadIamge()
    local image = ccui.ImageView:create()
    return image
end

return HeroGoldMidNode
