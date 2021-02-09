--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法界面-解锁模块
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local UIHelper = require("yoka.utils.UIHelper")
local TacticsUnlockModule = class("TacticsUnlockModule")

function TacticsUnlockModule:ctor(parentView, target, unlockCallback)
    self._parentView = parentView
    self._target = target
    self._onClickUnlock = unlockCallback

    self._nodeTitle = ccui.Helper:seekNodeByName(self._target, "_nodeTitle")
	cc.bind(self._nodeTitle, "CommonDetailTitleWithBg")
    self._nodeHero1 = ccui.Helper:seekNodeByName(self._target, "_nodeHero1")
	cc.bind(self._nodeHero1, "CommonHeroIcon")
    self._nodeHero2 = ccui.Helper:seekNodeByName(self._target, "_nodeHero2")
	cc.bind(self._nodeHero2, "CommonHeroIcon")
    self._nodeHero3 = ccui.Helper:seekNodeByName(self._target, "_nodeHero3")
	cc.bind(self._nodeHero3, "CommonHeroIcon")
    self._imgBtnBg = ccui.Helper:seekNodeByName(self._target, "_imgBtnBg")
    self._btnUnlock = ccui.Helper:seekNodeByName(self._target, "_btnUnlock")
    self._imgState = ccui.Helper:seekNodeByName(self._target, "_imgState")
    self._btnUnlock:addClickEventListenerEx(handler(self, self._onButtonUnlockClicked))
    
    self:init()
end

function TacticsUnlockModule:_onHeroClick(node, itemParams)
    local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
    PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HERO, itemParams.cfg.id)
    PopupItemGuider:openWithAction()
end

function TacticsUnlockModule:init()
	self._nodeTitle:setFontSize(24)
    self._nodeTitle:setTitle(Lang.get("tactics_title_unlock"))

    self._nodeHero1:setCallBack(handler(self, self._onHeroClick))
    self._nodeHero2:setCallBack(handler(self, self._onHeroClick))
    self._nodeHero3:setCallBack(handler(self, self._onHeroClick))

    self._heroTip1 = self:_createNumText(self._nodeHero1)
    self._heroTip2 = self:_createNumText(self._nodeHero2)
    self._heroTip3 = self:_createNumText(self._nodeHero3)

    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local subEffect = EffectGfxNode.new("effect_zhanfa_jiesuo")
    -- subEffect:play()
    subEffect:setPositionY(-226)
    subEffect:setVisible(false)
    self._target:addChild(subEffect)
    self._subEffect = subEffect
end

function TacticsUnlockModule:_createNumText(parent)
    local params = {
        fontSize = 20,
        fontName = Path.getCommonFont(),
        text = "",
        outlineColor = Colors.TacticsBlackColor,
        outlineSize = 2,
    }
    local text = UIHelper.createLabel(params)
    text:setTextHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER)
    parent:addChild(text)
    text:setPosition(cc.p(0, -33))
    return text
end

function TacticsUnlockModule:updateInfo(tacticsUnitData)
    -- 是否可解锁
    local canUnlock = TacticsDataHelper.isCanUnlocked(tacticsUnitData)
    local statePath = TacticsConst.UNLOCK_STATE_YES
    if not canUnlock then
        statePath = TacticsConst.UNLOCK_STATE_NO
        self._subEffect:setVisible(false)
    else
        self._subEffect:setVisible(true)
        self._subEffect:play()
    end
    self._imgState:loadTexture(statePath)
    -- 解锁材料
    local materials = TacticsDataHelper.getUnlockedMaterials(tacticsUnitData)
    self._materials = materials
    local count = 0
    for i=1,3 do
        local node = self["_nodeHero"..i]
        local textNum = self["_heroTip"..i]
        local info = materials[i]
        if info then
            node:setVisible(true)
            node:updateHeroIcon(info.value)
            node:showName(true)
            node:setNameFontSize(27)
            textNum:setVisible(true)
            local num = UserDataHelper.getSameCardCount(TypeConvertHelper.TYPE_HERO, info.value)
            textNum:setString(Lang.get("common_list_count", {count1=num, count2=info.size}))
            if num>=info.size then
                local color = Colors.TacticsActiveColor
                textNum:setColor(color)
                node:setHeroIconMask(false)
            else
                local color = Colors.RED
                textNum:setColor(color)
                node:setHeroIconMask(true)
            end
            count = count + 1
        else
            node:setVisible(false)
            textNum:setVisible(false)
        end
    end
    local posXMap = {
        [1] = {0},
        [2] = {-60,60},
        [3] = {-100,0,100}
    }
    local posXList = posXMap[count] or {}
    for i,v in ipairs(posXList) do
        local node = self["_nodeHero"..i]
        node:setPositionX(v)
    end
end

function TacticsUnlockModule:playEffect(callback)
    self._effCallback = callback
    self:_playEffect()
end

--播放特效
function TacticsUnlockModule:_playEffect()
    local offsetIndex = {
        [1] = {{200, 100}},
        [2] = {{200, 100}, {-200, -100}},
        [3] = {{200, 100}, {-200, -100}, {200, 100}},
    }

    local materials = self._materials
    for i, info in ipairs(materials) do
        self["_effFly"..i] = 0
        local node = self["_nodeHero"..i]
        local param = TypeConvertHelper.convert(info.type, info.value)
        local color = param.cfg.color
        local sp = display.newSprite(Path.getBackgroundEffect("img_photosphere5"))
        local emitter = cc.ParticleSystemQuad:create("particle/particle_touch.plist")
        if emitter then
            emitter:setPosition(cc.p(sp:getContentSize().width / 2, sp:getContentSize().height / 2))
            sp:addChild(emitter)
            emitter:resetSystem()
        end
        
        local selItem = self._parentView:getSelectItem()
        
        local worldPos = node:convertToWorldSpace(cc.p(0, 0))
        local pos = self._target:convertToNodeSpace(worldPos)
        sp:setPosition(pos)
        self._target:addChild(sp)
        
        local startPos = cc.p(0, 0)
        local endPos = UIHelper.convertSpaceFromNodeToNode(selItem:getTarget(), self._target)
        local pointPos1 = cc.p(startPos.x, startPos.y + offsetIndex[#materials][i][1])
        local pointPos2 = cc.p((startPos.x + endPos.x) / 2, startPos.y + offsetIndex[#materials][i][2])
        local bezier = {
            pointPos1,
            pointPos2,
            endPos
        }
        local action1 = cc.BezierTo:create(1.0, bezier)
        local action2 = cc.EaseSineIn:create(action1)
        sp:runAction(
            cc.Sequence:create(
                action2,
                cc.CallFunc:create(function()
                    self:_effFlyOver(i)
                end),
                cc.RemoveSelf:create()
            )
        )
    end
end

function TacticsUnlockModule:_effFlyOver(index)
    self["_effFly"..index] = 1
    local over = true
    local materials = self._materials
    for i, info in ipairs(materials) do
        if self["_effFly"..i] ~= 1 then
            over = false
        end
    end
    if over then
        self._effCallback()
    end
end

function TacticsUnlockModule:_onButtonUnlockClicked()
	if self._onClickUnlock then
		self._onClickUnlock()
	end
end

function TacticsUnlockModule:setVisible(visible)
    self._target:setVisible(visible)
end


return TacticsUnlockModule
