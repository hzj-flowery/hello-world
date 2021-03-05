--
-- Author: hedili
-- Date: 2017-08-30 15:17:50
-- 官衔进阶结果
local PopupBase = require("app.ui.PopupBase")
local PopupOfficialRankUpResult = class("PopupOfficialRankUpResult", PopupBase)

local EffectGfxNode = require("app.effect.EffectGfxNode")
local TextHelper = require("app.utils.TextHelper")

function PopupOfficialRankUpResult:ctor()
    self._parentView = parentView
	self._heroId = heroId
	self._textAddPlayerJoint = nil
	
	local resource = {
		file = Path.getCSB("PopupOfficialRankUpResult", "official"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onClickTouch"}},
			}
		}
	}
	PopupOfficialRankUpResult.super.ctor(self, resource)
end

function PopupOfficialRankUpResult:onCreate()

end

function PopupOfficialRankUpResult:onEnter()
	--self:_updateInfo()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
	self._textAddPlayerJoint:setVisible(false)
	self:_initEffect()
	self:_createPlayEffect()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_OFFICIAL_LEVELUP)
end


function PopupOfficialRankUpResult:onExit()
	
end

function PopupOfficialRankUpResult:onClose( ... )
	--抛出新手事件出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PopupOfficialRankUpResult:_updateAttr(index, name, value, nextValue)
	local node = self["_fileNodeAttr"..index]
	node:updateLabel("TextName", name)
	node:updateLabel("TextName2", name)
	node:updateLabel("TextCurValue", "+"..value)
	node:updateLabel("TextAddValue", "+"..nextValue)
end


function PopupOfficialRankUpResult:_onClickTouch()
	if self._nodeContinue:isVisible() == true then
		self:close()
	end
end

--播放总战力飘字
function PopupOfficialRankUpResult:_playTotalPowerSummary()
	local totalPower = G_UserData:getBase():getPower()
	self._fileNodePower:setVisible(true)
	local diffPower = totalPower - self._oldPower
	self._fileNodePower:updateUI(totalPower, diffPower)
	self._fileNodePower:playEffect(false)
end

function PopupOfficialRankUpResult:updateUI(currRank, oldPower)
	self._currRank = currRank -1
	self._nextRank = currRank

	local currInfo = G_UserData:getBase():getOfficialInfo(currRank - 1)
	local nextInfo = G_UserData:getBase():getOfficialInfo(currRank)
	local diffCombat = nextInfo.all_combat - currInfo.all_combat 
	self._oldPower = oldPower

	local function getInfoList(confInfo)
		local valueList = {}
		local attrConfig = require("app.config.attribute")	
		valueList[1] = { name = Lang.get("official_all_all_combat") , value = confInfo.all_combat}
		
		for i = 1, 4 do
			local nameStr = attrConfig.get(confInfo["attribute_type"..i]).cn_name 
			nameStr = Lang.get("official_all")..nameStr
			valueList[i+1] = { name = nameStr, value = confInfo["attribute_value"..i]}
		end
		return valueList
	end

	local currList = getInfoList(currInfo)
	local nextList = getInfoList(nextInfo)
	for index, value in ipairs(currList) do
		self:_updateAttr(index, value.name, value.value, nextList[index].value )
	end

end

function PopupOfficialRankUpResult:_initEffect()
	self._nodeContinue:setVisible(false)
	for i = 1, 5 do
		self["_fileNodeAttr"..i]:setVisible(false)
	end
	self._fileNodePower:setVisible(false)
end

function PopupOfficialRankUpResult:_createPlayEffect()
	local function effectFunction(effect)
        if effect == "effect_paiming_jiantou" then
            local subEffect = EffectGfxNode.new("effect_paiming_jiantou")
            subEffect:play()


	
            return subEffect
        end

        if effect == "effect_bg5" then
        	local subEffect = EffectGfxNode.new("effect_bg5")
            subEffect:play()
            return subEffect
        end

        if effect == 'effect_txt_bg' then
        	local subEffect = EffectGfxNode.new("effect_txt_bg")
            subEffect:play()
            return subEffect
        end

    	if effect == "effect_jinsheng_dazi" then
    		local subEffect = EffectGfxNode.new("effect_jinsheng_dazi")
            subEffect:play()
            return subEffect
    	end


    	if effect == "effect_hejilibao_xiaodi" then
    		local subEffect = EffectGfxNode.new("effect_hejilibao_xiaodi")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_win_2" then
    		local subEffect = EffectGfxNode.new("effect_win_2")
            subEffect:play()
            return subEffect
    	end

		if effect == "effect_bg4" then
    		local subEffect = EffectGfxNode.new("effect_bg4")
            subEffect:play()
            return subEffect
    	end
    	
		if effect == "effect_bg3" then
    		local subEffect = EffectGfxNode.new("effect_bg3")
            subEffect:play()
            return subEffect
    	end

		if effect == "effect_bg2" then
    		local subEffect = EffectGfxNode.new("effect_bg2")
            subEffect:play()
            return subEffect
    	end
		if effect == "effect_bg1" then
    		local subEffect = EffectGfxNode.new("effect_bg1")
            subEffect:play()
            return subEffect
    	end
		if effect == "touxian_1" then
			local info = G_UserData:getBase():getOfficialInfo(self._currRank)
			local image = display.newSprite(Path.getTextHero(info.picture))
			return image
		end
		if effect == "touxian_2" then
			local info = G_UserData:getBase():getOfficialInfo(self._nextRank)
			local image = display.newSprite(Path.getTextHero(info.picture))
			return image
		end

        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
			self:_playTotalPowerSummary()
			self._nodeContinue:setVisible(true)
			self._textAddPlayerJoint:setVisible(true)
			local info = G_UserData:getBase():getOfficialInfo(self._currRank)
			self._textAddPlayerJoint:setString(info.text_2)
        end
		local stc, edc = string.find(event, "play_txt")
    	if stc then
    		local index = tonumber( string.sub(event, edc+1, -1) )
			if index and index > 0 then
				self["_fileNodeAttr"..index]:setVisible(true)
				--self["_fileNodeAttr"..index]:showArrow(false)
				G_EffectGfxMgr:applySingleGfx(self["_fileNodeAttr"..index], "smoving_jinsheng_txt", nil, nil, nil)
			end
		end
    end

	local effect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeEffect, "moving_jinsheng", effectFunction, eventFunction , false)
	effect:setPosition(cc.p(0, 0))
    return effect
end

return PopupOfficialRankUpResult