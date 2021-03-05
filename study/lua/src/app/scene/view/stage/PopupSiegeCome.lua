local PopupBase = require("app.ui.PopupBase")
local PopupSiegeCome = class("PopupSiegeCome", PopupBase)

local Color = require("app.utils.Color")
local Path = require("app.utils.Path")
local Hero = require("app.config.hero")
local HeroRes = require("app.config.hero_res")
local CSHelper = require("yoka.utils.CSHelper")

PopupSiegeCome.BACKGROUND = {nil, nil, "blue", "purple", "orange"}

function PopupSiegeCome:ctor(data)
	local id = data.id
	self._data = require("app.config.rebel_base").get(id)
	assert(self._data, "no rebel id = "..id)
	self._level = data.level
	self._signalShare = nil			--分享
	self._isEffectFinish = false
	-- --ui
	self._continueNode = nil		--点击继续
	self._panelTouch = nil		--点击面板
	self._imageBG = nil			--背景层

	local resource = {
		file = Path.getCSB("PopupSiegeCome", "stage"),
		binding = {
			_panelTouch = 
			{
				events = {{event = "touch", method = "_onCloseClick"}}
			},
		}
	} 
	self:setName("PopupSiegeCome")
	PopupSiegeCome.super.ctor(self, resource, true, true)
end

function PopupSiegeCome:onCreate()
	self._continueNode:setVisible(false)
	G_UserData:getSiegeData():refreshRebelArmy()		--刷新一下叛军信息
end

function PopupSiegeCome:onEnter()
	self._signalShare = G_SignalManager:add(SignalConst.EVENT_SIEGE_SHARE, handler(self, self._onEventSiegeShare))
	self:_createEffect()

	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_START, self.__cname)
end

function PopupSiegeCome:onExit()
	self._signalShare:remove()
	self._signalShare = nil
end

function PopupSiegeCome:_createNameNode()
    local nameNode = CSHelper.loadResourceNode(Path.getCSB("SiegeNameNode", "siege"))
	local textName = ccui.Helper:seekNodeByName(nameNode, "TextName")
	textName:setString(self._data.name)
	local quality = self._data.color
	textName:setColor(Color.getColor(quality))
	textName:enableOutline(Color.getColorOutline(quality), 2)
	local textLevel = ccui.Helper:seekNodeByName(nameNode, "TextLevel")
	textLevel:setString(Lang.get("siege_come_level", {count = self._level}))	
	local quality = self._data.color
    return nameNode
end

function PopupSiegeCome:_createActionNode(effect)
	if effect == "name" then
		return self:_createNameNode()
	elseif effect == "button_1" then
		local buttonShare = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Normal", "common")) 
		buttonShare:addClickEventListenerEx(handler(self, self._onShareClick))	
		buttonShare:setString(Lang.get("siege_share"))
		return buttonShare
	elseif effect == "button_2"	then
		local buttonFight = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common")) 
		buttonFight:addClickEventListenerEx(handler(self, self._onChallengeClick))	
		buttonFight:setString(Lang.get("siege_go_challenge"))
		buttonFight:setName("buttonFight")
		return buttonFight
	elseif effect == "role" then
		local roleNode = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
		roleNode:updateUI(self._data.res)
		return roleNode
	end
end

function PopupSiegeCome:_createEffect()
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
		if string.find(effect, "effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect) 
		end
	end
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_NANMAN)
    local effect = G_EffectGfxMgr:createPlayMovingGfx( self._imageBG, "moving_nanman", effectFunction, handler(self, self._checkFinish) , false )	

end

function PopupSiegeCome:_checkFinish(event)
	if event == "finish" then
		if G_TutorialManager:isDoingStep(80) then
			G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
		end
		self._isEffectFinish = true
		self._continueNode:setVisible(true)
	end
end

--点击挑战按钮
function PopupSiegeCome:_onChallengeClick(sender)
	G_SceneManager:showScene("siege")
	self:close()
end

--点击分享按钮
function PopupSiegeCome:_onShareClick(sender)
	G_UserData:getSiegeData():c2sRebArmyPublic(self._data.id)
end

--接收分享消息
function PopupSiegeCome:_onEventSiegeShare()
	self:closeWithAction()
	G_Prompt:showTip(Lang.get("siege_share_success"))
end

--关闭界面
function PopupSiegeCome:_onCloseClick()
	if self._isEffectFinish then
		self:close()
	end
end

return PopupSiegeCome