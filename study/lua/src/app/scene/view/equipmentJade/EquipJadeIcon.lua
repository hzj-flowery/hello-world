--
-- Author: Liangxu
-- Date: 2017-02-20 17:35:20
--
local EquipJadeIcon = class("EquipJadeIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local TreasureTrainHelper = require("app.scene.view.treasureTrain.TreasureTrainHelper")
local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")

EquipJadeIcon.EFFECTS = {
    [4] = "effect_jinnang_zisejihuo",
    [5] = "effect_jinnang_chengsejihuo",
    [6] = "effect_jinnang_hongsejihuo"
}

EquipJadeIcon.EMPTY_FRAME = {
    [1] = "img_jade_frame05", -- 特性空框
    [2] = "img_jade_frame04", -- 特性框
    [3] = "img_jade_frame00", -- 空框
    [4] = "img_jade_frame01", -- 品质框
    [5] = "img_jade_frame02", -- 品质框
    [6] = "img_jade_frame03" -- 品质框
}

function EquipJadeIcon:ctor(target, slot, type)
    self._target = target
    self._slot = slot --装备位
    self._equipId = nil
    self._treasureId = nil
    self._jadeId = nil
    self._effect1 = nil
    self._effect2 = nil
    self._type = type and type or FunctionConst.FUNC_EQUIP_TRAIN_TYPE3

    self._spriteAdd = ccui.Helper:seekNodeByName(self._target, "SpriteAdd")
    self._imageLock = ccui.Helper:seekNodeByName(self._target, "ImageLock")

    self._fileNodeCommon = ccui.Helper:seekNodeByName(self._target, "FileNodeCommon")
    cc.bind(self._fileNodeCommon, "CommonJadeAvatar")
    self._imageRedPoint = ccui.Helper:seekNodeByName(self._target, "ImageRedPoint")
    self._imageArrow = ccui.Helper:seekNodeByName(self._target, "ImageArrow")
    self._panelTouch = ccui.Helper:seekNodeByName(self._target, "ThePanelTouch")
    self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
    self._nodeRich = ccui.Helper:seekNodeByName(self._target, "NodeRich")
    self._jadeName = ccui.Helper:seekNodeByName(self._target, "JadeName")
    self._imageEmpty = ccui.Helper:seekNodeByName(self._target, "ImageEmpty")
    self._imageEmpty:ignoreContentAdaptWithSize(true)
    self._imageDesBg = ccui.Helper:seekNodeByName(self._target, "ImageDesBg")
    self._jadeTip = ccui.Helper:seekNodeByName(self._target, "JadeTip")
    self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
    self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")

    self:_initUI()
end

function EquipJadeIcon:_initUI()
    self:_resetUI()
    local emptyres = self._slot > 1 and "img_jadebg01" or "img_jadebg02"
    self._imageEmpty:loadTexture(Path.getJadeImg(emptyres))
end

function EquipJadeIcon:_resetUI()
    self._spriteAdd:setVisible(false)
    self._fileNodeCommon:setVisible(false)
    self._imageRedPoint:setVisible(false)
    self._imageArrow:setVisible(false)
    self._nodeRich:setVisible(false)
    self._imageEmpty:setVisible(false)
    self._jadeName:setVisible(false)
    self._imageLock:setVisible(false)
    self._jadeTip:setVisible(false)
end

function EquipJadeIcon:lockIcon()
    self:_resetUI()
    self._lock = true
    self._imageLock:setVisible(true)
    self._jadeTip:setVisible(true)
    self._imageEmpty:setVisible(true)
    local desc1 = ""
    local desc2 = ""
    if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
        desc1 = Lang.get("lang_jade_open_des1")
        desc2 = Lang.get("lang_jade_open_des2")
    elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        desc1 = Lang.get("lang_jade_open_treasure_des1")
        desc2 = Lang.get("lang_jade_open_treasure_des2")
    end

    if self._slot == 1 then
        self._jadeTip:setString(desc2)
    else
        self._jadeTip:setString(desc1)
    end
    
    if self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        if self._slot == 2 then
            self._jadeTip:setString(desc1)
        else
            self._jadeTip:setString(desc2)
        end
    end
    self._jadeTip:setColor(Colors.DARK_BG_RED)
    self._jadeTip:setFontSize(18)
end

function EquipJadeIcon:unlockIcon()
    self._lock = false
    self._imageLock:setVisible(false)
    self._jadeTip:setVisible(false)
end

function EquipJadeIcon:updateIcon(equipId, jadeId)
    self._jadeId = jadeId
    self:unlockIcon()
    local isHave, isBetter = false, false
    if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
        self._equipId = equipId
        isHave, isBetter = EquipTrainHelper.haveBetterAndCanEquipJade(equipId, jadeId, self._slot)
    elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        self._treasureId = equipId
        isHave, isBetter = TreasureTrainHelper.haveBetterAndCanEquipJade(equipId, jadeId, self._slot)
    end
    if jadeId == 0 then
        self._nodeRich:setVisible(false)
        self._jadeName:setVisible(false)
        self._fileNodeCommon:setVisible(false)
        self._imageEmpty:setVisible(true)
        self:showAddSprite(isHave)
        self:showRedPoint(isHave)
    else
        self:showAddSprite(false)
        self._imageEmpty:setVisible(false)
        self._fileNodeCommon:setVisible(true)
        self._nodeRich:setVisible(true)
        self._jadeName:setVisible(true)
        self:showRedPoint(isBetter)
        local jadeUnitData = G_UserData:getJade():getJadeDataById(jadeId)
        local _, heroBaseId = jadeUnitData:getEquipHeroBaseId()
        local isSuitable = jadeUnitData:isSuitableHero(heroBaseId)
        self._fileNodeCommon:updateUI(jadeUnitData:getSys_id(), not isSuitable)
        local config = jadeUnitData:getConfig()
        self:_createDesRichText(config, isSuitable)
        self._jadeName:setFontSize(22)
        self._jadeName:setString(config.name)
        self._jadeName:setColor(Colors.getColor(config.color))
        self._jadeName:enableOutline(Colors.getColorOutline(config.color), 2)
    end
end

function EquipJadeIcon:onlyShow(jadeSysId, isTe)
    self:_resetUI()
    if not jadeSysId then
        return
    end
    local config = require("app.config.jade").get(jadeSysId)
    self._imageEmpty:setVisible(true)
    self._jadeName:setVisible(true)
    self._jadeName:setFontSize(18)
    if config then
        self._fileNodeCommon:setVisible(true)
        self._fileNodeCommon:updateUI(jadeSysId, true)
        self._jadeName:setString(config.name)
        self._jadeName:setColor(Colors.getColor(config.color))
        if config.property == 2 then
            self._imageEmpty:loadTexture(Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[config.color]))
        else
            self._imageEmpty:loadTexture(Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[2]))
        end
    else
        self._jadeName:setString(Lang.get("no_inject"))
        self._jadeName:setColor(Colors.NO_INJECT_COLOR)
        if isTe then
            self._imageEmpty:loadTexture(Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[1]))
        else
            self._imageEmpty:loadTexture(Path.getJadeImg(EquipJadeIcon.EMPTY_FRAME[3]))
        end
    end
end

-- 创建描述富文本
function EquipJadeIcon:_createDesRichText(config, isSuitable)
    if self._richDes then
        self._richDes:removeFromParent()
        self._richDes = nil
    end
    local name, value = self:_constructNameValue(config, isSuitable)
    local richText =
        Lang.get(
        "lang_jade_des_value",
        {
            name = name,
            value = value
        }
    )
    local des = ccui.RichText:createWithContent(richText)
    des:ignoreContentAdaptWithSize(false)
    des:setContentSize(cc.size(220, 0))
    des:formatText()
    self._nodeRich:addChild(des)
    self._richDes = des
    local virtualContentSize = self._richDes:getVirtualRendererSize()
    self._richDes:setPosition(0, -virtualContentSize.height * 0.5)
    local size = self._imageDesBg:getContentSize()
    self._imageDesBg:setContentSize(size.width, virtualContentSize.height + 10)
end

function EquipJadeIcon:_constructNameValue(config, isSuitable)
    local name, value = "", ""
    if not isSuitable then
        name = Lang.get("jade_not_effective")
        return name, value
    end
    if config.property == 1 then
        name = config.profile
    else
        local TextHelper = require("app.utils.TextHelper")
        local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
        name, value =
            TextHelper.getAttrBasicText(
            config.type,
            EquipJadeHelper.getRealAttrValue(config, G_UserData:getBase():getLevel())
        )
        value = "  +" .. value
    end
    return name, value
end

function EquipJadeIcon:_onPanelTouch()
    local unitData = nil
    if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
        unitData = G_UserData:getEquipment():getEquipmentDataWithId(self._equipId)
    elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        unitData = G_UserData:getTreasure():getTreasureDataWithId(self._treasureId)
    end
    if not self:_preCheck(unitData) then
        return
    end
    local jadeId = unitData:getJades()[self._slot]
    local jadeData = G_UserData:getJade():getJadeDataById(jadeId)
    local dataList = EquipJadeHelper.getEquipJadeListByWear(self._slot, jadeData, unitData, true, self._type)
    if jadeData then
        local popupChangeJade =
            require("app.ui.PopupChangeJade").new(
            Lang.get("equipment_choose_jade_title2"),
            self._slot,
            jadeData,
            unitData,
            self._imageRedPoint:isVisible(),
            handler(self, self._onChooseJade),
            self._type
        )
        popupChangeJade:openWithAction()
    else
        if #dataList > 0 then
            EquipJadeHelper.popupChooseJadeStone(self._slot, jadeData, unitData, handler(self, self._onChooseJade), nil, self._type)
        else
            local config = EquipJadeHelper.getMinSuitableJade(unitData:getBase_id(), self._slot > 1 and 2 or 1, self._type)
            local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
            PopupItemGuider:updateUI(TypeConvertHelper.TYPE_JADE_STONE, config.id)
            PopupItemGuider:openWithAction()
        end
    end
end

function EquipJadeIcon:_preCheck(unitData)
    if self._lock then
        if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
            local EquipConst = require("app.const.EquipConst")
            if LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4) then
                G_SignalManager:dispatch(SignalConst.EVENT_EQUIP_TRAIN_CHANGE_VIEW, EquipConst.EQUIP_TRAIN_LIMIT)
            else
                G_Prompt:showTip(Lang.get("common_tip_function_not_open"))
            end
        elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
            local TreasureConst = require("app.const.TreasureConst")
            if LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4) then
                G_SignalManager:dispatch(SignalConst.EVENT_TREASURE_TRAIN_CHANGE_VIEW, TreasureConst.TREASURE_TRAIN_LIMIT)
            else
                G_Prompt:showTip(Lang.get("common_tip_function_not_open"))
            end
        end
        
        return false
    end

    local isOpen, des, info = false, false, false
    if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
        isOpen, des, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)
    elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        isOpen, des, info = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TREASURE_TRAIN_TYPE3)
    end
    if not isOpen then
        G_Prompt:showTip(des)
        return false
    end
    if not unitData:isInBattle() then
        G_Prompt:showTip(Lang.get("not_in_battle_can_not_inject_jade"))
        return false
    end
    return true
end

function EquipJadeIcon:_onChooseJade(pos, jadeId)
    logWarn("EquipTrainJadeLayer:_changeJade")

    local unitData = nil
    if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
        unitData = G_UserData:getEquipment():getEquipmentDataWithId(self._equipId)
    elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        unitData = G_UserData:getTreasure():getTreasureDataWithId(self._treasureId)
    end

    local isSame, slots = unitData:isHaveTwoSameJade(jadeId)
    if isSame and not slots[pos] then
        G_Prompt:showTip(Lang.get("not_inject_same_jade_more_two"))
        return
    end
    if self._type == FunctionConst.FUNC_EQUIP_TRAIN_TYPE3 then
        G_UserData:getJade():c2sJadeEquip(jadeId, self._equipId, pos - 1)
    elseif self._type == FunctionConst.FUNC_TREASURE_TRAIN_TYPE3 then
        G_UserData:getJade():c2sJadeTreasure(jadeId, self._treasureId, pos - 1)
    end
end

function EquipJadeIcon:showRedPoint(visible)
    self._imageRedPoint:setVisible(visible)
end

function EquipJadeIcon:haveRedPoint()
    return self._imageRedPoint:getVisible()
end

function EquipJadeIcon:showUpArrow(visible)
    local UIActionHelper = require("app.utils.UIActionHelper")
    self._imageArrow:setVisible(visible)
    if visible then
        UIActionHelper.playFloatEffect(self._imageArrow)
    end
end

function EquipJadeIcon:showAddSprite(visible)
    self._spriteAdd:setVisible(visible)
    if visible then
        local UIActionHelper = require("app.utils.UIActionHelper")
        UIActionHelper.playBlinkEffect(self._spriteAdd)
    end
end

function EquipJadeIcon:showEffect()
    self:_clearEffect()
    self._fileNodeCommon:showIconEffect()
end

function EquipJadeIcon:_clearEffect()
    self._fileNodeCommon:removeLightEffect()
end

function EquipJadeIcon:setPosition(pos)
    self._target:setPosition(pos)
end

function EquipJadeIcon:setVisible(visible)
    self._target:setVisible(visible)
end

-- 被装备时播放特效
function EquipJadeIcon:playEquipEffect()
    local jadeUnitData = G_UserData:getJade():getJadeDataById(self._jadeId)
    if jadeUnitData then
        local cfg = jadeUnitData:getConfig()
        self._nodeEffectDown:removeAllChildren()
        G_EffectGfxMgr:createPlayGfx(self._nodeEffectDown, EquipJadeIcon.EFFECTS[cfg.color])
    end
end

function EquipJadeIcon:setTouchEnabled(b)
    self._panelTouch:setTouchEnabled(b)
end

return EquipJadeIcon
