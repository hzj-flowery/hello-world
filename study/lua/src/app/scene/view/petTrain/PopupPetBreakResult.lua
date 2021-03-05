--
-- Author: hedili
-- Date: 2018-01-30 15:17:50
-- 神兽升星结果
local PopupBase = require("app.ui.PopupBase")
local PopupPetBreakResult = class("PopupPetBreakResult", PopupBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local AttributeConst = require("app.const.AttributeConst")
local CSHelper = require("yoka.utils.CSHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function PopupPetBreakResult:ctor(parentView, petId)
    self._parentView = parentView
	self._petId = petId

	local resource = {
		file = Path.getCSB("PopupPetBreakResult", "pet"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onClickTouch"}},
			}
		}
	}
	PopupPetBreakResult.super.ctor(self, resource)
end

function PopupPetBreakResult:onCreate()
	for i = 1, 1 do
		self["_fileNodeAttr"..i]:setNameColor(Colors.LIST_TEXT)
		self["_fileNodeAttr"..i]:setCurValueColor(Colors.DARK_BG_ONE)
		self["_fileNodeAttr"..i]:setNextValueColor(Colors.DARK_BG_ONE)
		self["_fileNodeAttr"..i]:showDiffValue(false)
	end
end

function PopupPetBreakResult:onEnter()
	self._canContinue = false
	self:_updateInfo()
	self:_initEffect()
	self:_playEffect()
end

function PopupPetBreakResult:onShowFinish( ... )
	-- body

end

function PopupPetBreakResult:onExit()
	
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,"PopupPetBreakResult:_createRoleEffect")
end

function PopupPetBreakResult:_onClickTouch()
	if self._canContinue then
        if self._parentView and self._parentView.showPetAvatar then
            self._parentView:showPetAvatar()
        end
		self:close()
	end
end

function PopupPetBreakResult:_updateInfo()
	self._petUnitData = G_UserData:getPet():getUnitDataWithId(self._petId)
	local petBaseId = self._petUnitData:getBase_id()

	local starLevel = self._petUnitData:getStar()
	local petStarConfig = UserDataHelper.getPetStarConfig(petBaseId, starLevel)
	self._talentName = petStarConfig.talent_name
	self._talentDes = petStarConfig.talent_description

	self._textOldLevel:setString(Lang.get("pet_break_result_level", {level = starLevel - 1}))
	local strStarLevel = Lang.get("pet_break_result_level", {level = starLevel})
	self._textNewLevel:setString(strStarLevel)

	local curBreakAttr = UserDataHelper.getPetBreakShowAttr(self._petUnitData, -1)
	local nextBreakAttr = UserDataHelper.getPetBreakShowAttr(self._petUnitData)

	self._fileNodeAttr1:updateValue(AttributeConst.PET_ALL_ATTR, 
	curBreakAttr[AttributeConst.PET_ALL_ATTR], 
	nextBreakAttr[AttributeConst.PET_ALL_ATTR], 3)

	local add = nextBreakAttr[AttributeConst.PET_ALL_ATTR] - curBreakAttr[AttributeConst.PET_ALL_ATTR]
	add = add / 10
	self._textDiffValue1:setString("+"..add.."%")
	
	self._commonStar:setCount(starLevel, self._petUnitData:getStarMax())
	self._commonStar:playStar(self._petUnitData:getStar(),1)
end



function PopupPetBreakResult:_initEffect()
	self._nodeContinue:setVisible(false)
	self._nodeTxt1:setVisible(false)
	self._nodeTxt3:setVisible(false)
	for i = 1, 1 do
		self["_fileNodeAttr"..i]:setVisible(false)
	end
end

function PopupPetBreakResult:_playEffect()
	local function effectFunction(effect)
        if effect == "effect_shenshoubreak_jiesuotianfu" then
            local subEffect = EffectGfxNode.new("effect_shenshoubreak_jiesuotianfu")
            subEffect:play()
            return subEffect
        end

        if effect == "moving_wujiangbreak_jiesuo" then
        	local desNode = CSHelper.loadResourceNode(Path.getCSB("BreakResultTalentDesNode", "hero"))
            local textTalentName = ccui.Helper:seekNodeByName(desNode, "TextTalentName")
            local textTalentDes = ccui.Helper:seekNodeByName(desNode, "TextTalentDes")
            local imageButtomLine = ccui.Helper:seekNodeByName(desNode, "ImageButtomLine")
            textTalentName:setString(self._talentName..":")
            local nameSize = textTalentName:getContentSize()
            local namePosX = textTalentName:getPositionX()

            local render = textTalentDes:getVirtualRenderer()
			render:setMaxLineWidth(290 - nameSize.width)
            textTalentDes:setString(self._talentDes)
            textTalentDes:setPositionX(namePosX + nameSize.width + 5)
            local desSize = textTalentDes:getContentSize()
            local posLineY = textTalentDes:getPositionY() - desSize.height - 5
            posLineY = math.min(posLineY, 0)
            imageButtomLine:setPositionY(posLineY)
            return desNode
        end

    	if effect == "moving_shenshoubreak_txt_1" then
    		
    	end

    	if effect == "effect_shenshoubreak_jiantou" then
    		local subEffect = EffectGfxNode.new("effect_shenshoubreak_jiantou")
            subEffect:play()
            return subEffect
    	end

    	if effect == "moving_shenshoubreak_role" then
    		local node = self:_createRoleEffect()
    		return node
    	end

    	if effect == "effect_wujiangbreak_heidi" then
    		local subEffect = EffectGfxNode.new("effect_wujiangbreak_heidi")
            subEffect:play()
            return subEffect
    	end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
    	local stc, edc = string.find(event, "play_txt2_")
    	if stc then
    		local index = string.sub(event, edc+1, -1)
			if self["_fileNodeAttr"..index] == nil then
				return
			end
    		self["_fileNodeAttr"..index]:setVisible(true)
    		self["_fileNodeAttr"..index]:showArrow(false)
    		G_EffectGfxMgr:applySingleGfx(self["_fileNodeAttr"..index], "smoving_wujiangbreak_txt_2", nil, nil, nil)
    	elseif event == "play_txt1" then
    		self._nodeTxt1:setVisible(true)
    		G_EffectGfxMgr:applySingleGfx(self._nodeTxt1, "smoving_wujiangbreak_txt_1", nil, nil, nil)
        elseif event == "play_jiantou" then
        	
        elseif event == "play_txt3" then
        	self._nodeTxt3:setVisible(true)
        	G_EffectGfxMgr:applySingleGfx(self._nodeTxt3, "smoving_wujiangbreak_txt_3", nil, nil, nil)
        elseif event == "finish" then
        	self._canContinue = true
        	self._nodeContinue:setVisible(true)
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN,"PopupPetBreakResult")
        end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_shenshoubreak", effectFunction, eventFunction , false)
    effect:setPosition(cc.p(0, 0))
    
end

function PopupPetBreakResult:_createRoleEffect()
	local TypeConvertHelper = require("app.utils.TypeConvertHelper")
	local function effectFunction(effect)
        if effect == "effect_wujiangbreak_xingxing" then
            local subEffect = EffectGfxNode.new("effect_wujiangbreak_xingxing")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_wujiangbreak_guangxiao" then
        	local subEffect = EffectGfxNode.new("effect_wujiangbreak_guangxiao")
            subEffect:play()
            return subEffect
        end

        if effect == 'effect_shenshoubreak_tupochenggong' then
        	local subEffect = EffectGfxNode.new("effect_shenshoubreak_tupochenggong")
            subEffect:play()
            return subEffect
        end

    	if effect == "effect_wujiangbreak_luoxia" then
    		local subEffect = EffectGfxNode.new("effect_wujiangbreak_luoxia")
            subEffect:play()
            return subEffect
    	end

    	if effect == "levelup_role" then
    		local petSpine = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
            local petBaseId = self._petUnitData:getBase_id()
			petSpine:setConvertType(TypeConvertHelper.TYPE_PET)
			petSpine:updateUI(petBaseId)
			petSpine:setScale(0.8)
			petSpine:showShadow(false)
			return petSpine
    	end

    	if effect == "effect_wujiangbreak_fazhen" then
    		local subEffect = EffectGfxNode.new("effect_wujiangbreak_fazhen")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_wujiangbreak_txt_di" then
    		local subEffect = EffectGfxNode.new("effect_wujiangbreak_txt_di")
            subEffect:play()
            return subEffect
    	end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
			
        end
    end

    local node = cc.Node:create()
	local effect = G_EffectGfxMgr:createPlayMovingGfx(node, "moving_shenshoubreak_role", effectFunction, eventFunction , false)
    -- effect:setPosition(cc.p(0, 0))
    return node
end

return PopupPetBreakResult