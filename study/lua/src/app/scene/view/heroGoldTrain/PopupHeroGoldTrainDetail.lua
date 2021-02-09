--
-- Author: Liangxu
-- Date: 2018-8-13
-- 武将界限详情弹框
local PopupBase = require("app.ui.PopupBase")
local PopupHeroGoldTrainDetail = class("PopupHeroGoldTrainDetail", PopupBase)
local HeroDetailAttrModule = require("app.scene.view.heroDetail.HeroDetailAttrModule")
local HeroDetailTalentModule = require("app.scene.view.heroDetail.HeroDetailTalentModule")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")
local HeroConst = require("app.const.HeroConst")

function PopupHeroGoldTrainDetail:ctor(unitData)
    self._unitData = unitData
    local resource = {
        file = Path.getCSB("PopupHeroGoldTrainDetail", "hero"),
        binding = {
            _buttonClose = {
                events = {{event = "touch", method = "_onButtonClose"}}
            }
        }
    }
    PopupHeroGoldTrainDetail.super.ctor(self, resource)
end

function PopupHeroGoldTrainDetail:onCreate()
    self._textTitle:setString(Lang.get("gold_limit_title"))
end

function PopupHeroGoldTrainDetail:onEnter()
    local baseId = self._unitData:getBase_id()
    local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId)
    local goldLevel = self._unitData:getRank_lv()
    local name1 = heroParam.name
    local afterLevel = goldLevel
    if goldLevel < HeroConst.HERO_GOLD_MAX_RANK then
        afterLevel = goldLevel + 1
    end
    local name2 = heroParam.name .. " " .. Lang.get("goldenhero_train_text") .. (afterLevel)
    goldLevel = goldLevel >= HeroConst.HERO_GOLD_MAX_RANK and 0 or goldLevel
    if goldLevel > 0 then
        name1 = name1 .. " " .. Lang.get("goldenhero_train_text") .. goldLevel
    end
    self._textName1:setString(name1)
    self._textName2:setString(name2)
    self._textName1:setColor(heroParam.icon_color)
    self._textName1:enableOutline(heroParam.icon_color_outline,2)
    self._textName2:setColor(heroParam.icon_color)
    self._textName2:enableOutline(heroParam.icon_color_outline,2)
    self:_updateList()
end

function PopupHeroGoldTrainDetail:onExit()
end

function PopupHeroGoldTrainDetail:_updateList()
    self._listView:removeAllChildren()
    local attrModule = self:_buildAttrModule()
    local talentModule = self:_buildTalentModule()
    self._listView:pushBackCustomItem(attrModule)
    self._listView:pushBackCustomItem(talentModule)
    self._listView:doLayout()
end

function PopupHeroGoldTrainDetail:_getNextUnitData(unitData)
    local unitData2 = clone(unitData)
    local HeroConst = require("app.const.HeroConst")
    if unitData:getRank_lv() < HeroConst.HERO_GOLD_MAX_RANK then
        unitData2:setRank_lv(unitData:getRank_lv() + 1)
    end
    return unitData2
end

function PopupHeroGoldTrainDetail:_buildAttrModule()
    local unitData = clone(self._unitData)
    if unitData:getRank_lv() >= HeroConst.HERO_GOLD_MAX_RANK then
        unitData:setRank_lv(0)
    end
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local attrModule = HeroDetailAttrModule.new(unitData, nil, true)
    local HeroDataHelper = require("app.utils.data.HeroDataHelper")
    local attr = HeroDataHelper.getBreakAttr(unitData)
    local param = {
        heroUnitData = unitData
    }
    local attrInfo = HeroDataHelper.getTotalBaseAttr(param)
    attrModule:showAttrBottom(attr)
    attrModule:reUpdateAttr(attrInfo)
    attrModule:setAnchorPoint(cc.p(0, 0))
    attrModule:setPositionX(7)
    widget:addChild(attrModule)

    local unitData2 = self:_getNextUnitData(self._unitData)
    local attrModule1 = HeroDetailAttrModule.new(unitData2, nil, true)
    local attr1 = HeroDataHelper.getBreakAttr(unitData2)
    local param1 = {
        heroUnitData = unitData2
    }
    local attrInfo1 = HeroDataHelper.getTotalBaseAttr(param1)
    attrModule1:showAttrBottom(attr1)
    attrModule1:reUpdateAttr(attrInfo1)
    attrModule1:setAnchorPoint(cc.p(0, 0))
    widget:addChild(attrModule1)
    local size = attrModule:getPanelSize()
    attrModule1:setPositionX(size.width + 125)
    widget:setContentSize(cc.size(858.00, size.height))
    return widget
end

function PopupHeroGoldTrainDetail:_buildTalentModule()
    local unitData = clone(self._unitData)
    if unitData:getRank_lv() >= HeroConst.HERO_GOLD_MAX_RANK then
        unitData:setRank_lv(0)
    end
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local talentModule = HeroDetailTalentModule.new(unitData, nil, nil, true, true)
    talentModule:setAnchorPoint(cc.p(0, 0))
    talentModule:setPositionX(7)
    widget:addChild(talentModule)

    local unitData2 = self:_getNextUnitData(self._unitData)
    local talentModule1 = HeroDetailTalentModule.new(unitData2, nil, nil, true)
    talentModule1:setAnchorPoint(cc.p(0, 0))
    widget:addChild(talentModule1)
    local size = talentModule:getContentSize()
    local size1 = talentModule1:getContentSize()
    local height = size.height > size1.height and size.height or size1.height
    talentModule1:setPositionX(size.width + 125)
    local offsetY = size.height - size1.height
    if offsetY > 0 then
        talentModule1:setPositionY(-offsetY)
    else
        talentModule:setPositionY(-offsetY)
    end
    widget:setContentSize(cc.size(858.00, height))
    return widget
end

function PopupHeroGoldTrainDetail:_onButtonClose()
    self:close()
end

return PopupHeroGoldTrainDetail
