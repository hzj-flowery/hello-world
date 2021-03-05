--
-- Author: Liangxu
-- Date: 2018-8-13
-- 武将界限详情弹框
local PopupBase = require("app.ui.PopupBase")
local PopupPetLimitDetail = class("PopupPetLimitDetail", PopupBase)
local PetDetailAttrModule = require("app.scene.view.petDetail.PetDetailAttrModule")
local PetDetailSkillModule = require("app.scene.view.petDetail.PetDetailSkillModule")
local PetDetailTalentModule = require("app.scene.view.petDetail.PetDetailTalentModule")
local PetDetailBriefModule = require("app.scene.view.petDetail.PetDetailBriefModule")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UIHelper = require("yoka.utils.UIHelper")

function PopupPetLimitDetail:ctor(petUnitData)
    self._petUnitData = petUnitData
    local resource = {
        file = Path.getCSB("PopupPetLimitDetail", "pet"),
        binding = {
            _buttonClose = {
                events = {{event = "touch", method = "_onButtonClose"}}
            }
        }
    }
    PopupPetLimitDetail.super.ctor(self, resource)
end

function PopupPetLimitDetail:onCreate()
    self._textTitle:setString(Lang.get("limit_break_title"))
end


function PopupPetLimitDetail:onEnter()
    local config = self:_getCurPetData(self._petUnitData):getConfig() --self._petUnitData:getConfig()
    local configAfter = self:_getNextUnitData(self._petUnitData):getConfig()
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, config.id)
    local paramAfter = TypeConvertHelper.convert(TypeConvertHelper.TYPE_PET, configAfter.id)
    self._textName1:setString(config.name)
    self._textName2:setString(configAfter.name)
    self._textName1:setColor(Colors.getColor(config.color))
    self._textName2:setColor(Colors.getColor(configAfter.color))
    self._textTitle:setString(Lang.get("limit_break_title"))
    UIHelper.updateTextOutline(self._textName1, param)
    UIHelper.updateTextOutline(self._textName2, paramAfter)
    self:_updateList()
end

function PopupPetLimitDetail:onExit()
end

function PopupPetLimitDetail:_updateList()
    self._listView:removeAllChildren()
    local module1 = self:_buildAttrModule()
    local module2 = self:_buildSkillModule()
    local module3 = self:_buildTalentModule()
    -- local module4 = self:_buildBreifModule()
    self._listView:pushBackCustomItem(module1)
    self._listView:pushBackCustomItem(module2)
    self._listView:pushBackCustomItem(module3)
    -- self._listView:pushBackCustomItem(module4)
    self._listView:doLayout()
end

function PopupPetLimitDetail:_getNextUnitData(unitData)
    local unitData2 = clone(unitData)
    if unitData2:getConfig().color < 6 then
        local newConfig = require("app.config.pet").get(unitData2:getConfig().potential_after) --界限突破后的id
        local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
        local afterLevel = PetTrainHelper.limitAfterLevel(unitData)
        local afterStar = PetTrainHelper.limitReduceStar(unitData:getStar())
        unitData2:setLevel(afterLevel)
        unitData2:setStar(afterStar)
        unitData2:setBase_id(newConfig.id)
        if newConfig then
            unitData2:setConfig(newConfig)
        end
    end
    return unitData2
end

function PopupPetLimitDetail:_buildAttrModule()
    local unitData = self:_getCurPetData(self._petUnitData)--self._petUnitData
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local attrModule = PetDetailAttrModule.new(unitData)
    attrModule:setAnchorPoint(cc.p(0, 0))
    widget:addChild(attrModule)

    local unitData2 = self:_getNextUnitData(self._petUnitData)
    local attrModule1 = PetDetailAttrModule.new(unitData2)
    attrModule1:setAnchorPoint(cc.p(0, 0))
    widget:addChild(attrModule1)
    local size = attrModule:getContentSize()
    attrModule1:setPositionX(size.width + 132)
    widget:setContentSize(cc.size(858.00, size.height))
    return widget
end

function PopupPetLimitDetail:_buildSkillModule()
    --技能
    local PetDataHelper = require("app.utils.data.PetDataHelper")
    local unitData = self:_getCurPetData(self._petUnitData)--self._petUnitData
    local rank = unitData:getStar()
    local showSkillIds = PetDataHelper.getPetSkillIds(unitData:getBase_id(), rank)
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local skillModule = PetDetailSkillModule.new(showSkillIds, true, unitData:getBase_id(), rank, unitData)
    skillModule:setAnchorPoint(cc.p(0, 0))
    widget:addChild(skillModule)

    local unitData2 = self:_getNextUnitData(self._petUnitData)
    local rank2 = unitData2:getStar()
    local showSkillIds2 = PetDataHelper.getPetSkillIds(unitData2:getBase_id(), rank2)
    local skillModule2 = PetDetailSkillModule.new(showSkillIds2, true, unitData2:getBase_id(), rank2, unitData2)
    skillModule2:setAnchorPoint(cc.p(0, 0))
    widget:addChild(skillModule2)
    local size = skillModule:getContentSize()
    local size2 = skillModule2:getContentSize()
    local height = size.height > size2.height and size.height or size2.height
    if size.height > size2.height then
        skillModule2:setPositionY(size.height - size2.height)
        self._skillHeightDiffRight = size.height - size2.height
        self._skillHeightDiffLeft = 0
    else
        skillModule:setPositionY(size2.height - size.height)
        self._skillHeightDiffLeft = size2.height - size.height
        self._skillHeightDiffRight = 0
    end
    skillModule2:setPositionX(size.width + 132)
    widget:setContentSize(cc.size(858.00, height))
    return widget
end

function PopupPetLimitDetail:_buildTalentModule()
    local unitData = self:_getCurPetData(self._petUnitData)--self._petUnitData
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local talentModule = PetDetailTalentModule.new(unitData)
    talentModule:setAnchorPoint(cc.p(0, 0))
    widget:addChild(talentModule)

    local unitData2 = self:_getNextUnitData(self._petUnitData)
    local talentModule1 = PetDetailTalentModule.new(unitData2)
    talentModule1:setAnchorPoint(cc.p(0, 0))
    widget:addChild(talentModule1)
    local size = talentModule:getContentSize()
    local size2 = talentModule1:getContentSize()
    talentModule1:setPositionX(size.width + 132)
    local height = size.height > size2.height and size.height or size2.height
    if size.height > size2.height then
        talentModule:setPositionY(self._skillHeightDiffLeft)
        talentModule1:setPositionY(size.height - size2.height + self._skillHeightDiffRight)
    else
        talentModule:setPositionY(size2.height - size.height + self._skillHeightDiffLeft)
        talentModule1:setPositionY(self._skillHeightDiffRight)
    end
    widget:setContentSize(cc.size(858.00, height))
    return widget
end

function PopupPetLimitDetail:_buildBreifModule()
    local unitData = self:_getCurPetData(self._petUnitData)--self._petUnitData
    local widget = ccui.Widget:create()
    widget:setAnchorPoint(cc.p(0, 0))
    local breifModule = PetDetailBriefModule.new(unitData)
    breifModule:setAnchorPoint(cc.p(0, 0))
    widget:addChild(breifModule)

    local unitData2 = self:_getNextUnitData(self._petUnitData)
    local breifModule1 = PetDetailBriefModule.new(unitData2)
    breifModule1:setAnchorPoint(cc.p(0, 0))
    widget:addChild(breifModule1)
    local size = breifModule:getContentSize()
    local size1 = breifModule1:getContentSize()
    local height = 0
    if size.height > size1.height then
        height = size.height
        breifModule:setPositionY(math.abs(size.height - size1.height))
    else
        height = size1.height
        breifModule1:setPositionY(math.abs(size1.height - size.height))
    end
    breifModule1:setPositionX(size.width + 132)
    widget:setContentSize(cc.size(858.00, height))
    return widget
end

function PopupPetLimitDetail:_onButtonClose()
    self:close()
end

--当前已经是红色了 就显示突破前的神兽
function PopupPetLimitDetail:_getCurPetData(petUnitData)
	local PetConst = require("app.const.PetConst")
    local unitData2 = clone(petUnitData)
    if unitData2:getQuality() == PetConst.QUALITY_RED then
        local beforeId = unitData2:getConfig().potential_before
        if beforeId > 0 then
            local newConfig = require("app.config.pet").get(beforeId) --界限突破前的id
            local PetTrainHelper = require("app.scene.view.petTrain.PetTrainHelper")
            unitData2:setLevel(petUnitData:getLevel())
            unitData2:setStar(0)
            unitData2:setBase_id(newConfig.id)
            if newConfig then
                unitData2:setConfig(newConfig)
            end
        end
    end
    return unitData2
end

return PopupPetLimitDetail
