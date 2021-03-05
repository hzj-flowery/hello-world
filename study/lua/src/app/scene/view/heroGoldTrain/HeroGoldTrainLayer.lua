-- Author: liangxu
-- Date:2017-10-18 16:26:18
-- Describle：

local CommonLimitBaseView = require("app.scene.view.heroGoldTrain.CommonLimitBaseView")
local HeroGoldTrainLayer = class("HeroGoldTrainLayer", CommonLimitBaseView)
local HeroGoldLevelNode = require("app.scene.view.heroGoldTrain.HeroGoldLevelNode")
local LimitCostConst = require("app.const.LimitCostConst")
local HeroConst = require("app.const.HeroConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
local HeroGoldMidNode = require("app.scene.view.heroGoldTrain.HeroGoldMidNode")
local UIConst = require("app.const.UIConst")

HeroGoldTrainLayer.limitPopupPanel = require("app.scene.view.heroGoldTrain.HeroGoldCostPanel")
HeroGoldTrainLayer.limitCostNode = require("app.scene.view.heroGoldTrain.HeroGoldCostNode")

local NORNAL_WIDTH = 420
local MAX_WIDTH = 600

function HeroGoldTrainLayer:ctor(parentView)
    self._parentView = parentView

    local resource = {
        file = Path.getCSB("HeroGoldTrainLayer", "hero"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _buttonDetail = {
                events = {{event = "touch", method = "_onButtonDetailClicked"}}
            }
        }
    }
    HeroGoldTrainLayer.super.ctor(self, resource)
end

function HeroGoldTrainLayer:onCreate()
    self:_initUI()
    self:setLvUpCallback(handler(self, self._lvUpCallBack))
end

function HeroGoldTrainLayer:onEnter()
    self._signalEventHeroGoldPutRes =
        G_SignalManager:add(
        SignalConst.EVENT_GOLD_HERO_RESOURCE_SUCCESS,
        handler(self, self._onEventHeroGoldRankUpPutRes)
    )

    self:_updateData()
    self:_updateCost()
    self:_updateView()
    self:_updateNodeSliver()
    self:_checkCostNodeRedPoint()
    self._cost1:updateNode(self._heroUnitData)
end

function HeroGoldTrainLayer:onExit()
    self._signalEventHeroGoldPutRes:remove()
    self._signalEventHeroGoldPutRes = nil
end

function HeroGoldTrainLayer:_lvUpCallBack()
    self:_updateView()
    self:_updateCost()
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        self["_cost" .. key]:clearEffect()
    end
    self._cost1:updateNode(self._heroUnitData)
    G_UserData:getAttr():recordPowerWithKey(FunctionConst.FUNC_TEAM)
    G_Prompt:playTotalPowerSummaryWithKey(FunctionConst.FUNC_TEAM, UIConst.SUMMARY_OFFSET_X_GOLD, -5)
end

function HeroGoldTrainLayer:_updateData()
    local heroId = G_UserData:getHero():getCurHeroId()
    self._heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
end

function HeroGoldTrainLayer:_initUI()
    local DataConst = require("app.const.DataConst")

    self._goldLevelNode = HeroGoldLevelNode.new(self._levelNode)
    for costKey = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        self["_cost" .. costKey] =
            self.class.limitCostNode.new(
            self["_costNode" .. costKey],
            self["_costDetail" .. costKey],
            costKey,
            handler(self, self._onClickCostAdd)
        )
    end
    self._cost1 = HeroGoldMidNode.new(self._costNode1, handler(self, self._onButtonBreakClicked))
    self._buttonHelp:updateLangName("gold_hero_rank_up_help_txt")
    self._heroAvatar:setScale(0.8)

    G_EffectGfxMgr:createPlayMovingGfx(self._nodeBgEffect, "moving_jinjiangyangcheng_beijing", nil, nil)
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect1, "moving_jinjiangyangcheng_dabagua", nil, nil)
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeBgMoving, "moving_tujie_huohua", nil, nil, false)
end

function HeroGoldTrainLayer:_checkIsMaterialFull(costKey)
    local curCount = self._heroUnitData:getGoldResValue(costKey)
    return curCount >= self._materialMaxSize[costKey]
end

function HeroGoldTrainLayer:_doPutRes(costKey, materials)
    local heroId = self._heroUnitData:getId()
    self._curCostKey = costKey
    local heroIds, items = self:_getHeroIdsAndItems(costKey, materials)
    G_UserData:getHero():c2sGoldHeroResource(heroId, costKey, heroIds, items)
    self._costMaterials = materials
end

function HeroGoldTrainLayer:_getHeroIdsAndItems(costKey, materials)
    local heroIds = {}
    local items = {}
    local item = {}
    item.type = TypeConvertHelper.TYPE_ITEM
    item.value = materials[1].id
    item.size = materials[1].num
    table.insert(items, item)
    return heroIds, items
end

function HeroGoldTrainLayer:_updateView()
    self._goldLevelNode:setCount(self._heroUnitData:getRank_lv())
    local baseId = self._heroUnitData:getBase_id()
    local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId)
    local goldLevel = self._heroUnitData:getRank_lv()
    local name = heroParam.name
    if goldLevel > 0 then
        if HeroGoldHelper.isPureHeroGold(self._heroUnitData) then -- 金将
            name = name .. " " .. Lang.get("goldenhero_train_text") .. goldLevel
        else
            name = name .. "+" .. goldLevel
        end
    end

    if goldLevel == HeroConst.HERO_GOLD_MAX_RANK then
        self:_switchUI(false)
        self._heroAvatar:setVisible(true)
        self:_playFire(true)
        local base_id = self._heroUnitData:getBase_id()
        self._heroAvatar:updateUI(base_id, self._heroUnitData:getLimit_level())
    else
        self:_switchUI(true)
        self._heroAvatar:setVisible(false)
        self._nodeFire:setVisible(false)
        self:_updateTalentDes()
    end
end

function HeroGoldTrainLayer:_updateTalentDes()
    local UserDataHelper = require("app.utils.UserDataHelper")
    local limitLevel = self._heroUnitData:getLimit_level()
    local limitRedLevel = self._heroUnitData:getLimit_rtg()
    local talentLevel = self._heroUnitData:getRank_lv()
    if talentLevel < HeroConst.HERO_GOLD_MAX_RANK then
        talentLevel = talentLevel + 1
    end
    local config = UserDataHelper.getHeroRankConfig(self._heroUnitData:getBase_id(), talentLevel, limitLevel, limitRedLevel)
    local talentName = config.talent_name
    local talentDes = config.talent_description
    local breakDes = Lang.get("hero_gold_txt_break_des", {rank = talentLevel})
    local talentInfo =
        Lang.get(
        "hero_break_txt_talent_des",
        {
            name = talentName,
            des = talentDes,
            breakDes = breakDes
        }
    )
    local label = ccui.RichText:createWithContent(talentInfo)
    label:setAnchorPoint(cc.p(0, 1))
    label:ignoreContentAdaptWithSize(false)
    label:setContentSize(cc.size(MAX_WIDTH, 0))
    label:formatText()
    local virtualSize = label:getVirtualRendererSize()
    local offsetX = virtualSize.width - NORNAL_WIDTH
    offsetX = offsetX > 0 and offsetX * 0.5 or 0
    self._nodeOffset:setPositionX(-offsetX)
    self._nodeDes:removeAllChildren()
    self._nodeDes:addChild(label)
    if config and config.talent_target == 0 then
        self._imageTalent:setVisible(true)
    else
        self._imageTalent:setVisible(false)
    end
end

function HeroGoldTrainLayer:_playFire(isPlay)
    self._nodeFire:setVisible(true)
    self._nodeFire:removeAllChildren()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local effectName = "effect_jinjiangyangcheng_huoyan"
    local effect = EffectGfxNode.new(effectName)
    self._nodeFire:addChild(effect)
    effect:play()
end

function HeroGoldTrainLayer:_switchUI(visible)
    self._nodeTalent:setVisible(visible)
    self._nodeRes:setVisible(visible)
    self._nodeResDetail:setVisible(visible)
    self._levelNode:setVisible(visible)
    self._maskBg:setVisible(visible)
    self._nodeEffect1:setVisible(visible)
    self._costNode1:setVisible(visible)
end

function HeroGoldTrainLayer:_updateNodeSliver()
    if self._heroUnitData:getRank_lv() == HeroConst.HERO_GOLD_MAX_RANK then
        self._nodeSilver:setVisible(false)
        return
    end

    local isCan = HeroGoldHelper.heroGoldCanRankUp(self._heroUnitData)
    self._nodeSilver:setVisible(isCan)
    if isCan then
        local TextHelper = require("app.utils.TextHelper")
        local silver = HeroGoldHelper.heroGoldTrainCostInfo(self._heroUnitData)["break_size"]
        local strSilver = TextHelper.getAmountText3(silver)
        self._textSilver:setString(strSilver)
    end
end

function HeroGoldTrainLayer:_onButtonBreakClicked()
    local isCan = HeroGoldHelper.heroGoldCanRankUp(self._heroUnitData)
    if isCan then
        self._curCostKey = LimitCostConst.BREAK_LIMIT_UP
        G_UserData:getHero():c2sGoldHeroRankUp(self._heroUnitData:getId())
    end
end

function HeroGoldTrainLayer:_onButtonDetailClicked()
    local PopupPetLimitDetail = require("app.scene.view.heroGoldTrain.PopupHeroGoldTrainDetail").new(self._heroUnitData)
    PopupPetLimitDetail:openWithAction()
end

function HeroGoldTrainLayer:_onEventHeroGoldRankUpPutRes(id)
    self:_updateData()
    local costKey = self._curCostKey
    if costKey ~= LimitCostConst.BREAK_LIMIT_UP then -- 非突破操作
        self:_putResEffect(costKey)
        self:_updateNodeSliver()
        self._cost1:updateNode(self._heroUnitData)
    else
        local AudioConst = require("app.const.AudioConst")
        G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TUPO)
        self:_playLvUpEffect()
        self:_updateNodeSliver()
    end
    self:_checkCostNodeRedPoint()
end

function HeroGoldTrainLayer:_checkCostNodeRedPoint()
    local rank_lv = self._heroUnitData:getRank_lv()
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        local curCount = self._heroUnitData:getGoldResValue(key)
        self["_cost" .. key]:checkRedPoint(rank_lv, curCount)
    end
end

-- 可重写，获取没次增加的进度值
function HeroGoldTrainLayer:_getCostSizeEveryTime(costKey, itemValue, realCostCount, costCountEveryTime)
    if costKey == LimitCostConst.LIMIT_COST_KEY_2 then
        return itemValue * realCostCount
    else
        return realCostCount
    end
end

-- 必须重写，获取当前材料进度
function HeroGoldTrainLayer:_getFakeCurSize(costKey)
    local heroId = G_UserData:getHero():getCurHeroId()
    local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
    return heroUnitData:getGoldResValue(costKey)
end

-- 必须重写，获取每种材料最大值
function HeroGoldTrainLayer:_getMaterialMaxSize()
    local materialMaxSize = {}
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        local heroId = G_UserData:getHero():getCurHeroId()
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local costInfo = HeroGoldHelper.heroGoldTrainCostInfo(heroUnitData)
        materialMaxSize[key] = costInfo["size_" .. key]
    end
    return materialMaxSize
end

-- 有哪些小球需要播放移动动画
function HeroGoldTrainLayer:_playCostNodeSMoving()
    -- for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
    --     self["_cost" .. key]:playSMoving()
    -- end
end

function HeroGoldTrainLayer:_getLimitLevel()
    return self._heroUnitData:getRank_lv()
end

function HeroGoldTrainLayer:_updateCost()
    local rank_lv = self._heroUnitData:getRank_lv()
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        local curCount = self._heroUnitData:getGoldResValue(key)
        self["_cost" .. key]:updateUI(rank_lv, curCount)
        local isFull, isCanFull = HeroGoldHelper.isHaveCanFullMaterialsByKey(key, self._heroUnitData)
        self["_cost" .. key]:showRedPoint(isCanFull and not isFull)
    end
end

return HeroGoldTrainLayer
