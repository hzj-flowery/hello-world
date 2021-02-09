--
-- Author: hedl
-- Date: 2017-02-22 18:02:15
-- 装备Icon

local CommonIconBase = import(".CommonIconBase")
local CommonEquipIcon = class("CommonEquipIcon", CommonIconBase)
local UIHelper = require("yoka.utils.UIHelper")
local ComponentIconHelper = require("app.ui.component.ComponentIconHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")

local EXPORTED_METHODS = {
    "setTopNum", --setTopNum(number)
    "setLevel",
    "setRlevel",
    "setId",
    "updateJadeSlot"
}

CommonEquipIcon.R_LEVEL_NORMAL_POSY = 20 -- 精炼等级正常时y坐标
CommonEquipIcon.R_LEVEL_JADE_POSY = 26 -- 精炼等级有玉石槽y坐标

function CommonEquipIcon:ctor()
    CommonEquipIcon.super.ctor(self)
    self._textItemTopNum = nil -- 顶部数字按钮
    self._equipId = nil
    self._type = TypeConvertHelper.TYPE_EQUIPMENT
    self._effect1 = nil
    self._effect2 = nil
end

function CommonEquipIcon:_init()
    CommonEquipIcon.super._init(self)
    self:setTouchEnabled(false)
end

function CommonEquipIcon:bind(target)
    CommonEquipIcon.super.bind(self, target)

    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonEquipIcon:unbind(target)
    CommonEquipIcon.super.unbind(self, target)

    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonEquipIcon:setId(equipId)
    self._equipId = equipId
end

--根据传入参数，创建并，更新UI
function CommonEquipIcon:updateUI(value, size)
    local itemParams = CommonEquipIcon.super.updateUI(self, value, size)
    self._value = value
    if itemParams.size ~= nil then
        self:setCount(itemParams.size)
    end
    if self._textRlevel then
        self._textRlevel:setPositionY(CommonEquipIcon.R_LEVEL_NORMAL_POSY)
    end
    self:showIconEffect()
end

function CommonEquipIcon:setTopNum(size)
    if self._textItemTopNum == nil then
        local params = {
            name = "_textItemTopNum",
            text = "x" .. "0",
            fontSize = 18,
            color = Colors.WHITE_DEFAULT,
            outlineColor = Colors.DEFAULT_OUTLINE_COLOR
        }
        ComponentIconHelper._setPostion(params, "leftTop")

        local uiWidget = UIHelper.createLabel(params)

        self:appendUI(uiWidget)
        self._textItemTopNum = uiWidget
    end
    self._textItemTopNum:setString("" .. size)
    self._textItemTopNum:setVisible(size > 0)
end

--设置强化等级
function CommonEquipIcon:setLevel(level)
    if self._textLevel == nil then
        local params = {
            name = "_textLevel",
            text = "0",
            fontSize = 20,
            color = Colors.COLOR_QUALITY[1],
            outlineColor = Colors.COLOR_QUALITY_OUTLINE[1]
        }

        local label = UIHelper.createLabel(params)
        label:setAnchorPoint(cc.p(0.5, 0.5))
        label:setPosition(cc.p(18, 10))

        self._textLevel = label
    end

    local equipParam = self:getItemParams()
    if self._imageLevel == nil then
        local params = {
            name = "_imageLevel",
            texture = Path.getUICommonFrame("img_iconsmithingbg_0" .. equipParam.color)
        }
        local imageBg = UIHelper.createImage(params)
        imageBg:addChild(self._textLevel)
        imageBg:setAnchorPoint(cc.p(0, 1))
        imageBg:setPosition(cc.p(0, 95))

        self._imageLevel = imageBg
        self:appendUI(imageBg)
    end
    self._textLevel:setString(level)
    self._textLevel:enableOutline(Colors.COLOR_QUALITY_OUTLINE[equipParam.color])
    self._imageLevel:loadTexture(Path.getUICommonFrame("img_iconsmithingbg_0" .. equipParam.color))
    self._imageLevel:setVisible(level > 0)
end

--设置精炼等级
function CommonEquipIcon:setRlevel(rLevel)
    if self._textRlevel == nil then
        local params = {
            name = "_textRlevel",
            text = "+" .. "0",
            fontSize = 20,
            color = Colors.COLOR_QUALITY[2],
            outlineColor = Colors.COLOR_QUALITY_OUTLINE[2]
        }

        local label = UIHelper.createLabel(params)
        label:setAnchorPoint(cc.p(0.5, 0.5))
        label:setPosition(cc.p(49, CommonEquipIcon.R_LEVEL_NORMAL_POSY))

        self:appendUI(label)
        self._textRlevel = label
    end
    self._textRlevel:setString("+" .. rLevel)
    self._textRlevel:setVisible(rLevel > 0)
end

function CommonEquipIcon:_onTouchCallBack(sender, state)
    -----------防止拖动的时候触发点击
    if (state == ccui.TouchEventType.ended) then
        local moveOffsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
        local moveOffsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._callback then
                self._callback(sender, self._itemParams)
            else
                if self._equipId then
                    local EquipConst = require("app.const.EquipConst")
                    G_SceneManager:showScene("equipmentDetail", self._equipId, EquipConst.EQUIP_RANGE_TYPE_1)
                else
                    local PopupEquipDetail =
                        require("app.scene.view.equipmentDetail.PopupEquipDetail").new(
                        TypeConvertHelper.TYPE_EQUIPMENT,
                        self._itemParams.cfg.id
                    )
                    PopupEquipDetail:openWithAction()
                end
            end
        end
    end
end

function CommonEquipIcon:removeLightEffect()
    if self._effect1 then
        self._effect1:runAction(cc.RemoveSelf:create())
        self._effect1 = nil
    end
    if self._effect2 then
        self._effect2:runAction(cc.RemoveSelf:create())
        self._effect2 = nil
    end
end

function CommonEquipIcon:showIconEffect(scale)
    self:removeLightEffect()
    if self._itemParams == nil then
        return
    end

    local baseId = self._itemParams.cfg.id
    local effects = require("app.utils.data.EquipDataHelper").getEquipEffectWithBaseId(baseId)
    if effects == nil then
        return
    end

    if self._nodeEffectUp == nil then
        self._nodeEffectUp = ccui.Helper:seekNodeByName(self._target, "NodeEffectUp")
    end
    if self._nodeEffectDown == nil then
        self._nodeEffectDown = ccui.Helper:seekNodeByName(self._target, "NodeEffectDown")
    end

    if #effects == 1 then
        local effectName = effects[1]
        self._effect1 = EffectGfxNode.new(effectName)
        self._nodeEffectUp:addChild(self._effect1)
        self._effect1:play()
    end

    if #effects == 2 then
        local effectName1 = effects[1]
        self._effect1 = EffectGfxNode.new(effectName1)
        self._nodeEffectDown:addChild(self._effect1)
        self._effect1:play()
        local effectName2 = effects[2]
        self._effect2 = EffectGfxNode.new(effectName2)
        self._nodeEffectUp:addChild(self._effect2)
        self._effect2:play()
    end
end

-- 玉石槽
function CommonEquipIcon:updateJadeSlot(jadeDatas, heroBaseId)
    local nodeJadeSlot = ccui.Helper:seekNodeByName(self._target, "NodeJadeSlot")
    if not nodeJadeSlot then
        return false
    end
    nodeJadeSlot:setVisible(false)
    if not jadeDatas then
        return false
    end
    local EquipConst = require("app.const.EquipConst")
    local config = require("app.config.equipment").get(self._value)
    if config and config.suit_id > 0 then
        nodeJadeSlot:setVisible(true)
        if self._textRlevel then
            self._textRlevel:setPositionY(CommonEquipIcon.R_LEVEL_JADE_POSY)
        end
        local imageSlot = nodeJadeSlot:getChildByName("imageSlot")
        if not imageSlot then
            imageSlot = UIHelper.createImage({name = "imageSlot", adaptWithSize = true})
            nodeJadeSlot:addChild(imageSlot)
        end
        imageSlot:loadTexture(Path.getJadeImg(EquipConst.EQUIPMENT_JADE_SLOT_BG[config.suit_id]))
        imageSlot:removeAllChildren()
        self:_addJadeSlot(jadeDatas, imageSlot, heroBaseId, config)
        return true
    end
    return false
end

function CommonEquipIcon:_addJadeSlot(jadeDatas, imageSlot, heroBaseId, config)
    for i, v in pairs(jadeDatas) do
        if jadeDatas[i] > 0 then
            local jconfig = require("app.config.jade").get(jadeDatas[i])
            if jconfig then
                local texture = Path.getJadeImg("img_jade_" .. jconfig.color)
                local EquipJadeHelper = require("app.scene.view.equipmentJade.EquipJadeHelper")
                local isActive = EquipJadeHelper.isSuitableHero(jconfig, heroBaseId)
                if not isActive then
                    texture = Path.getJadeImg("img_jade_7")
                end
                local slot =
                    UIHelper.createImage(
                    {
                        name = "slot" .. i,
                        texture = texture,
                        adaptWithSize = true
                    }
                )
                local EquipConst = require("app.const.EquipConst")
                slot:setPosition(EquipConst.EQUIPMENT_JADE_SLOT_POS[config.suit_id][i])
                imageSlot:addChild(slot)
            end
        end
    end
end

return CommonEquipIcon
