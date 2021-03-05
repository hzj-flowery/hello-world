local CommonLimitCostNode = require("app.ui.component.CommonLimitCostNode")
local HeroGoldCostNode = class("HeroGoldCostNode", CommonLimitCostNode)
local LimitCostConst = require("app.const.LimitCostConst")
local UIActionHelper = require("app.utils.UIActionHelper")
local LimitCostConst = require("app.const.LimitCostConst")

local RES_CONST = {
    [LimitCostConst.LIMIT_COST_KEY_2] = {
        imageButtom = "img_gold_cultivate_bg01b",
        imageFront = "",
        effectBg = "effect_tujieorange",
        imageName = "txt_goldhero_cultivate_03",
        ripple = "orange",
        effectFull = "effect_tujie_mannengliangorange",
        smoving = "smoving_tujiehuanblue",
        effectReceive = "effect_tujiedianjiorange",
        fullName = "img_gold_cultivate_01b"
    },
    [LimitCostConst.LIMIT_COST_KEY_3] = {
        imageButtom = "img_gold_cultivate_bg01a",
        imageFront = "",
        ripple = "orange",
        imageName = "txt_goldhero_cultivate_01",
        effectBg = "effect_tujiepurple",
        smoving = "smoving_tujiehuanpurple",
        effectReceive = "effect_tujiedianjipurple",
        effectFull = "effect_tujie_mannengliangpurple",
        fullName = "img_gold_cultivate_01a"
    },
    [LimitCostConst.LIMIT_COST_KEY_4] = {
        imageButtom = "img_gold_cultivate_bg01c",
        imageFront = "",
        ripple = "orange",
        imageName = "txt_goldhero_cultivate_02",
        effectBg = "effect_tujieorange",
        smoving = "smoving_tujiehuanorange",
        effectReceive = "effect_tujiedianjiorange",
        effectFull = "effect_tujie_mannengliangorange",
        fullName = "img_gold_cultivate_01c"
    }
}

local HERO_NAME_RES = {
    [250] = "txt_goldhero_cultivate_shu01", -- 水镜
    [450] = "txt_goldhero_cultivate_qun01", -- 南华
    [350] = "txt_goldhero_cultivate_wu01", -- 周姬
    [150] = "txt_goldhero_cultivate_wei01" -- 子上
}
HeroGoldCostNode.POSY_START = -50 --0%水纹位置
HeroGoldCostNode.POSY_END = 50 --100%水纹位置

function HeroGoldCostNode:ctor(target, target2, costKey, callback)
    self._target2 = target2
    HeroGoldCostNode.super.ctor(self, target, costKey, callback)
end

function HeroGoldCostNode:_init()
    self._nodeNormal = ccui.Helper:seekNodeByName(self._target, "NodeNormal")
    self._nodeFull = ccui.Helper:seekNodeByName(self._target, "NodeFull")
    self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "ButtonAdd")
    self._buttonAdd:addClickEventListenerEx(handler(self, self._onClickAdd))
    UIActionHelper.playBlinkEffect2(self._buttonAdd)
    self._imageButtom = ccui.Helper:seekNodeByName(self._target, "ImageButtom")
    self._imageFront = ccui.Helper:seekNodeByName(self._target, "ImageFront")
    self._nodeRipple = ccui.Helper:seekNodeByName(self._target, "NodeRipple")

    self._imageName = ccui.Helper:seekNodeByName(self._target2, "ImageName")
    self._textPercent = ccui.Helper:seekNodeByName(self._target2, "TextPercent")
    self._nodeCount = ccui.Helper:seekNodeByName(self._target2, "NodeCount")
    self._nodeEffectBg = ccui.Helper:seekNodeByName(self._target2, "NodeEffectBg")
    self._nodeEffect = ccui.Helper:seekNodeByName(self._target2, "NodeEffect")
    self._redPoint = ccui.Helper:seekNodeByName(self._target2, "RedPoint")
    self:initImageFront()
    self:initRipple()
    self:changeImageName()
    self:initEffectBg()

    self._redPoint:setPosition(65, -10)
    local posX, posY = self._target:getPosition()
    self._initPos = cc.p(posX, posY)
    self._isFirst = true
end

function HeroGoldCostNode:_panelTouchClicked()
    if self._panelCallback then
        self._panelCallback()
    end
end

function HeroGoldCostNode:setPanelTouchCallback(callback)
    self._panelCallback = callback
end

function HeroGoldCostNode:changeImageName()
    self._imageName:loadTexture(Path.getTextLimit(RES_CONST[self._costKey].imageName))
end

function HeroGoldCostNode:_check()
    if self._costKey == LimitCostConst.LIMIT_COST_KEY_1 then
        self._isShowCount = true
    else
        self._isShowCount = false
    end
end

function HeroGoldCostNode:initImageFront()
    self:_initImageFront(RES_CONST[self._costKey].imageButtom, RES_CONST[self._costKey].imageFront)
end

function HeroGoldCostNode:initEffectBg()
    self:_initEffectBg(RES_CONST[self._costKey].effectBg)
    self._nodeEffectBg:setVisible(false)
end

function HeroGoldCostNode:_updateState()
    self._lock = false
end

function HeroGoldCostNode:_initRipple(animation)
    local spineRipple = require("yoka.node.SpineNode").new()
    self._nodeRipple:addChild(spineRipple)
    spineRipple:setAsset(Path.getEffectSpine("jinjiangyangchengshui"))
    spineRipple:setAnimation("effect", true)
end

function HeroGoldCostNode:_playFullEffect()
    logWarn(" HeroGoldCostNode:_playFullEffect exp")
    if self._effectIng then
        return
    end
    self._effectIng =
        G_EffectGfxMgr:createPlayMovingGfx(
        self._nodeEffect,
        "moving_jinjiangyangcheng_man",
        function(key)
            if key == "wenzi" then
                return self:_getTextIamge()
            end
        end,
        function(event)
            if event == "finish" then
                self:_fullEffect()
            end
        end
    )
end

function HeroGoldCostNode:_getTextIamge()
    local txt = RES_CONST[self._costKey].fullName
    local image = ccui.ImageView:create()
    image:loadTexture(Path.getGoldHero(txt))
    image:setPosition(0, -3)
    return image
end

function HeroGoldCostNode:_fullEffect()
    G_EffectGfxMgr:createPlayMovingGfx(
        self._nodeEffect,
        "moving_jinjiangyangcheng_biankuangxunhuan",
        function(key)
            if key == "wenzi" then
                return self:_getTextIamge()
            end
        end
    )
end

function HeroGoldCostNode:clearEffect()
    self._nodeEffect:removeAllChildren()
    self._effectIng = nil
end

function HeroGoldCostNode:getEffectReceiveName()
    return RES_CONST[self._costKey].effectReceive
end

function HeroGoldCostNode:playSMoving()
    self:_playSmoving(RES_CONST[self._costKey].smoving)
end

function HeroGoldCostNode:updateUI(limitLevel, curCount)
    self:_updateCommonUI(limitLevel, curCount)
    if self._isFirst and self._isFull then
        self:_fullEffect()
    end
end

function HeroGoldCostNode:checkRedPoint(rank_lv, curCount)
    local percent = self:_calPercent(rank_lv, curCount)
    if percent >= 100 then
        self._redPoint:setVisible(false)
    end
end

function HeroGoldCostNode:_calPercent(rank_lv, curCount)
    local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
    local heroId = G_UserData:getHero():getCurHeroId()
    local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
    local costInfo = HeroGoldHelper.heroGoldTrainCostInfo(unitData)
    local size = 0
    if self._costKey == LimitCostConst.LIMIT_COST_KEY_1 then
        size = costInfo["cost_hero"]
    else
        size = costInfo["size_" .. self._costKey]
    end
    local percent = math.floor((curCount / size) * 100)
    if percent >= 100 then
        self._buttonAdd:setVisible(false)
    else
        self._buttonAdd:setVisible(true)
    end
    logWarn("HeroGoldCostNode:_calPercent " .. percent)
    return math.min(percent, 100), size
end

return HeroGoldCostNode
