--
-- Author: Wangyu
-- Date: 2020-2-19 17:30:09
-- 战法位节点
local TeamTacticsPositionIcon = class("TeamTacticsPositionIcon")
local TacticsConst = require("app.const.TacticsConst")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local CommonTacticsIcon = require("app.ui.component.CommonTacticsIcon")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TacticsDataHelper = require("app.utils.data.TacticsDataHelper")
local ShaderHalper = require("app.utils.ShaderHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local PopupTacticsPositionUnlockInfo = require("app.ui.PopupTacticsPositionUnlockInfo")
local PopupTacticsUnclock = require("app.scene.view.tactics.PopupTacticsUnclock")
local PopupChooseTactics = require("app.ui.PopupChooseTactics")
local PopupTacticsDetail = require("app.ui.PopupTacticsDetail")


function TeamTacticsPositionIcon:ctor(target)
    self._target = target
    
	self._resourceNode = ccui.Helper:seekNodeByName(self._target, "_resourceNode")          -- 容器
	self._imgBg = ccui.Helper:seekNodeByName(self._target, "_imgBg")                        -- 背景
	self._imgLock = ccui.Helper:seekNodeByName(self._target, "_imgLock")                    -- 锁
	self._spriteEmpty = ccui.Helper:seekNodeByName(self._target, "_spriteEmpty")            -- 空
	self._nodeTacticsIcon = ccui.Helper:seekNodeByName(self._target, "_nodeTacticsIcon")    -- icon节点
	self._imgInfo = ccui.Helper:seekNodeByName(self._target, "_imgInfo")
	self._txtInfo = ccui.Helper:seekNodeByName(self._target, "_txtInfo")                    -- 提示文字
    self._panelTouch = ccui.Helper:seekNodeByName(self._target, "PanelTouch")               -- 触摸
    
	self._panelTouch:addClickEventListenerEx(handler(self, self._onPanelTouch))
	self._panelTouch:setSwallowTouches(false)
    self:_init()
end

function TeamTacticsPositionIcon:_init()
    self._nodeTacticsIcon:setVisible(false)
    self._nodeTacticsIcon:setTouchEnabled(false)
    
    self._subEffect = EffectGfxNode.new("effect_ui_jiesuo")
	self._subEffect:setAutoRelease(false)
    self._subEffect:play()
    self._subEffect:setPosition(cc.p(47, 50-5+1))
    self._subEffect:setVisible(false)
    self._subEffect:setLocalZOrder(-1)
    self._subEffect:setScale(0.9583)
    self._target:addChild(self._subEffect)

	local function eventFunc(event)
        if event == "finish" then
            if self._effUnlockCallback then
                self._effUnlockCallback()
            end
            self._panelTouch:setTouchEnabled(true)
			self:updateUI(self._pos, self._slot)
		end
	end
    self._subEffect2 = EffectGfxNode.new("effect_ui_suolie", eventFunc)
	self._subEffect2:setAutoRelease(false)
    -- self._subEffect2:play()
    self._subEffect2:setPosition(cc.p(48-2, 49-2))
    self._subEffect2:setVisible(false)
    self._subEffect2:setLocalZOrder(-1)
    self._subEffect2:setScale(0.9583)
    self._target:addChild(self._subEffect2)
end

function TeamTacticsPositionIcon:unlockPosition(callback)
    self._effUnlockCallback = callback
    self._imgBg:setVisible(true)
    self._imgLock:setVisible(true)
    self._spriteEmpty:setVisible(false)
    self._nodeTacticsIcon:setVisible(false)
    self._panelTouch:setTouchEnabled(false)

    local function eventFunction(event, frameIndex, node)
        if event == "finish" then
            -- node:setVisible(false)
            self._imgBg:setVisible(false)
            self._imgLock:setVisible(false)
            self._subEffect2:setVisible(true)
            self._subEffect2:play()
        end
    end
	local effect = G_EffectGfxMgr:createPlayGfx( self._target, "effect_tactics_unlock", eventFunction , true)
    -- effect:setPosition(cc.p(181+52, 29+57))
    effect:setPosition(cc.p(50, 29+57+20-1))
end

function TeamTacticsPositionIcon:updateUIWithFixState(state, slot, tacticsUnitData)
    self._state = state
    self._slot = slot

    local baseId = 0
    if tacticsUnitData~=nil then
        baseId = tacticsUnitData:getBase_id()
    end
    self._fixBaseId = baseId

    self._showState = 1

    self._subEffect:setVisible(false)
    self._subEffect2:setVisible(false)
    self._imgInfo:setVisible(false)
    self._txtInfo:setVisible(false)
    self._imgBg:setPositionY(49)
    self._imgBg:loadTexture(Path.getTacticsImage("img_tactis_zhanfawei02"))
    if state==TacticsConst.STATE_WEARED then
        self._imgBg:setVisible(true)
        self._imgLock:setVisible(false)
        self._spriteEmpty:setVisible(false)
        self._nodeTacticsIcon:setVisible(true)
        self._nodeTacticsIcon:updateUI(baseId)
    elseif state==TacticsConst.STATE_EMPTY then
        self._imgBg:setVisible(true)
        self._imgLock:setVisible(false)
        self._spriteEmpty:setVisible(false)
        self._nodeTacticsIcon:setVisible(false)
    else
        self._imgBg:loadTexture(Path.getTacticsImage("img_tactis_zhanfawei01"))
        self._imgBg:setPositionY(46)
        self._imgBg:setVisible(true)
        self._imgLock:setVisible(true)
        self._spriteEmpty:setVisible(false)
        self._nodeTacticsIcon:setVisible(false)
    end
end

function TeamTacticsPositionIcon:_updateUI(baseId)
    local state = self._state
    
    local _,_,funcLevelInfo = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_TACTICS_POS"..self._slot])

    self._subEffect:setVisible(false)
    self._subEffect2:setVisible(false)
    local isSetGray = false
    self._imgBg:setPositionY(49)
    self._target:setPositionY(0)
    self._imgBg:loadTexture(Path.getTacticsImage("img_tactis_zhanfawei02"))
    if state==TacticsConst.STATE_LOCK_LEVEL then
        isSetGray = true
        self._imgBg:setVisible(true)
        self._imgBg:loadTexture(Path.getTacticsImage("img_tactis_zhanfawei01"))
        self._imgBg:setPositionY(46)
        self._target:setPositionY(1)
        self._imgLock:setVisible(true)
        self._spriteEmpty:setVisible(false)
        self._nodeTacticsIcon:setVisible(false)
        self._imgInfo:setVisible(true)
        self._txtInfo:setVisible(true)
        local txtStr = Lang.get("hero_txt_level", {level = funcLevelInfo.level})
        self._txtInfo:setString(txtStr)

        ShaderHalper.filterNode(self._imgBg, "gray")
        ShaderHalper.filterNode(self._imgLock, "gray")
        ShaderHalper.filterNode(self._imgInfo, "gray")
        self._txtInfo:setColor(Colors.TacticsGrayColor)
    elseif state==TacticsConst.STATE_LOCK then
        self._imgBg:setVisible(false)
        self._imgLock:setVisible(false)
        self._spriteEmpty:setVisible(false)
        self._nodeTacticsIcon:setVisible(false)
        self._imgInfo:setVisible(true)
        self._txtInfo:setVisible(true)
        self._txtInfo:setString(Lang.get("tactics_unlock_tip"))
        self._txtInfo:setColor(Colors.TacticsActiveColor)
        self._subEffect:setVisible(true)
        self._target:setPositionY(1)
        
        ShaderHalper.filterNode(self._imgBg, "", true)
        ShaderHalper.filterNode(self._imgLock, "", true)
        ShaderHalper.filterNode(self._imgInfo, "", true)
    elseif state==TacticsConst.STATE_EMPTY then
        self._imgBg:setVisible(true)
        self._imgLock:setVisible(false)
        self._spriteEmpty:setVisible(true)
        local UIActionHelper = require("app.utils.UIActionHelper")
        UIActionHelper.playBlinkEffect(self._spriteEmpty)
        self._nodeTacticsIcon:setVisible(false)
        self._imgInfo:setVisible(false)
        self._txtInfo:setVisible(false)
        
        ShaderHalper.filterNode(self._imgBg, "", true)
        ShaderHalper.filterNode(self._imgLock, "", true)
        ShaderHalper.filterNode(self._imgInfo, "", true)
    else
        self._imgBg:setVisible(true)
        self._imgLock:setVisible(false)
        self._spriteEmpty:setVisible(false)
        self._nodeTacticsIcon:setVisible(true)

        self._imgInfo:setVisible(false)
        self._txtInfo:setVisible(false)

        self:_updateIcon(baseId)
    end
end

-- TODO 其他人
-- 是否适用
function TeamTacticsPositionIcon:_updateIcon(baseId)
    local heroId = G_UserData:getTeam():getHeroIdWithPos(self._pos)
    local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
    local heroBaseId = heroUnitData:getAvatarToHeroBaseId()
    local isEffect = G_UserData:getTactics():isSuitTacticsToHero(baseId, heroBaseId)
    local isEffective = require("app.utils.data.TacticsDataHelper").isEffectiveTacticsToHero(baseId, self._pos)
    
    self._nodeTacticsIcon:updateUI(baseId)

    if isEffect and isEffective then
        self._imgInfo:setVisible(false)
        self._txtInfo:setVisible(false)
    else
        self._imgInfo:setVisible(true)
        self._txtInfo:setVisible(true)
        self._txtInfo:setString(Lang.get("tactics_suit_not"))
        self._txtInfo:setColor(Colors.RED)
        ShaderHalper.filterNode(self._imgBg, "gray")
        ShaderHalper.filterNode(self._nodeTacticsIcon, "gray")
    end
end

function TeamTacticsPositionIcon:updateUI(pos, slot)
    self._pos = pos
    self._slot = slot
    local state, funcLevelInfo = self:_getState()
    self._state = state
    
    local baseId = 0
    local tacticsId = G_UserData:getBattleResource():getResourceId(pos, 5, slot)
    if tacticsId then
        local tacticsUnitData = G_UserData:getTactics():getUnitDataWithId(tacticsId)
        baseId = tacticsUnitData:getBase_id()
    end
    
    self:_updateUI(baseId)
end

-- 获取状态 等级锁定 锁定 空置 装备
function TeamTacticsPositionIcon:_getState()
    local pos = self._pos
    local slot = self._slot
	local slotList = G_UserData:getTactics():getUnlockInfoByPos(pos)	
    local isLock = true
    for i,v in ipairs(slotList) do
        if v==slot then
            isLock = false
            break
        end
    end
    if slot==1 then
        isLock = false
    end
    if isLock then
        local isOpenSlot,_,funcLevelInfo = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_TACTICS_POS"..slot])
        if not isOpenSlot then
            return TacticsConst.STATE_LOCK_LEVEL, funcLevelInfo
        else
            return TacticsConst.STATE_LOCK
        end
    else
        local tacticsId = G_UserData:getBattleResource():getResourceId(pos, 5, slot)
        if tacticsId==nil then
            return TacticsConst.STATE_EMPTY
        else
            return TacticsConst.STATE_WEARED
        end
    end
end

function TeamTacticsPositionIcon:setTouchEnabled(enabled)
    self._panelTouch:setTouchEnabled(enabled)
end

-- 自己的战法
function TeamTacticsPositionIcon:_onPanelTouchSelf()
    local state = self._state
    local slot = self._slot
    if state==TacticsConst.STATE_LOCK_LEVEL then
        -- local info = {slot=slot}
        -- local popup = PopupTacticsPositionUnlockInfo.new(info)
        -- popup:openWithAction()
        return
    elseif state==TacticsConst.STATE_LOCK then
        local needColor, needNum = require("app.utils.data.TacticsDataHelper").getTacticsPosUnlockParam(self._slot)
        if needNum==0 then
            self:_onUnlockConfirm({})
        else
            -- 解锁战法位
            local callBack = handler(self, self._onUnlockConfirm)
            local popup = PopupTacticsUnclock.new(self)
            popup:updateUI(self._pos, self._slot, callBack)
            popup:openWithAction()
        end
    elseif state==TacticsConst.STATE_EMPTY then
        -- 选择装备战法列表
        local callBack = handler(self, self._onPutonConfirm)
        local popup = PopupChooseTactics.new(self)
        popup:setTitle(Lang.get("tactics_puton_tip"))
        popup:updateUI(self._pos, self._slot, callBack)
        popup:openWithAction()
    else
        -- 选择装备战法列表
        local callBack = handler(self, self._onPutonConfirm)
        local popup = PopupChooseTactics.new(self)
        popup:setTitle(Lang.get("tactics_puton_tip"))
        popup:updateUI(self._pos, self._slot, callBack)
        popup:openWithAction()
    end
end

function TeamTacticsPositionIcon:_onPanelTouchOther( )
    local baseId = self._fixBaseId
    if baseId ~= nil and baseId ~= 0 then
        local popup = PopupTacticsDetail.new(self._imgBg, baseId)
        popup:open()
    end
end

-- 触摸事件处理
-- 通用触摸处理  查看别人战法处理
function TeamTacticsPositionIcon:_onPanelTouch()
    if self._showState==1 then
        self:_onPanelTouchOther()
    else
        self:_onPanelTouchSelf()
    end
end

function TeamTacticsPositionIcon:_onUnlockConfirm(list)
    local pos = self._slot

    local materials = {}
    for _,unitData in pairs(list) do
        table.insert(materials, unitData:getId())
    end
    
    G_UserData:getTactics():c2sUnlockTacticsPos(self._pos, pos, materials)
end

function TeamTacticsPositionIcon:_onPutonConfirm(tacticsId)
    local tactisIdList = G_UserData:getBattleResource():getTacticsIdsWithPos(self._pos)
    local heroId = G_UserData:getTeam():getHeroIdWithPos(self._pos)
    local isPutdown = false
    for i,v in ipairs(tactisIdList) do
        if v==tacticsId then
            isPutdown = true
            break
        end
    end
    if isPutdown then     -- 下阵
        local tacticsUnitData = G_UserData:getTactics():getUnitDataWithId(tacticsId)
        local pos = tacticsUnitData:getPos()
        G_UserData:getTactics():c2sPutDownTactics(tacticsId, heroId, pos)
    else
        G_UserData:getTactics():c2sPutOnTactics(tacticsId, heroId, self._slot)
    end
end


return TeamTacticsPositionIcon
