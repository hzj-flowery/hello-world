local PopupCommonLimitCost = require("app.ui.PopupCommonLimitCost")
local HeroGoldCostPanel = class("HeroGoldCostPanel", PopupCommonLimitCost)
local LimitCostConst = require("app.const.LimitCostConst")

function HeroGoldCostPanel:ctor(costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode)
    HeroGoldCostPanel.super.ctor(self, costKey, onClick, onStep, onStart, onStop, limitLevel, fromNode)
end

function HeroGoldCostPanel:_initView()
    local HeroGoldHelper = require("app.scene.view.heroGoldTrain.HeroGoldHelper")
    local heroId = G_UserData:getHero():getCurHeroId()
    local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
    local costInfo, baseId = HeroGoldHelper.heroGoldTrainCostInfo(unitData)
    local DataConst = require("app.const.DataConst")
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    if self._costKey == LimitCostConst.LIMIT_COST_KEY_2 then
        local tbPos = {
            [1] = {46, 148},
            [2] = {110, 56},
            [3] = {225, 56},
            [4] = {290, 148}
        }
        for i = 1, 4 do
            local item =
                self:_createMaterialIcon(
                DataConst["ITEM_HERO_LEVELUP_MATERIAL_" .. i],
                costInfo["consume_" .. self._costKey],
                TypeConvertHelper.TYPE_ITEM
            )
            item:setPosition(cc.p(tbPos[i][1], tbPos[i][2]))
        end
    elseif self._costKey == LimitCostConst.LIMIT_COST_KEY_1 then
        self:_createMaterialIcon(baseId, costInfo.consume_hero, TypeConvertHelper.TYPE_HERO)
    else
        self:_createMaterialIcon(
            costInfo["value_" .. self._costKey],
            costInfo["consume_" .. self._costKey],
            costInfo["type_" .. self._costKey]
        )
    end
    self._panelTouch:setContentSize(G_ResolutionManager:getDesignCCSize())
    self._panelTouch:addClickEventListener(handler(self, self._onClickPanel)) --避免0.5秒间隔
end

function HeroGoldCostPanel:fitterItemCount(item)
    local type = item:getType()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    if type == TypeConvertHelper.TYPE_HERO then
        local value = item:getItemId()
        local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
        local UserDataHelper = require("app.utils.UserDataHelper")
        item:updateCount(UserDataHelper.getSameCardCount(type, value, G_UserData:getHero():getCurHeroId()))
    else
        item:updateCount()
    end
end

return HeroGoldCostPanel
