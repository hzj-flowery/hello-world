
-- Author: zhanglinsen
-- Date:2018-09-18 17:04:49
-- Describle：

local GroupsTipBar = require("app.ui.GroupsTipBar")
local GuildPushTeamApply = class("GuildPushTeamApply", GroupsTipBar)

local CountryBossHelper = require("app.scene.view.countryboss.CountryBossHelper")
local CountryBossConst = require("app.const.CountryBossConst")

function GuildPushTeamApply:ctor()
	GuildPushTeamApply.super.ctor(self)
end

function GuildPushTeamApply:onCreate()
	self._userData = nil

	GuildPushTeamApply.super.onCreate(self)
end

function GuildPushTeamApply:onEnter()
	self._signalDataClear = G_SignalManager:add(SignalConst.EVENT_TRAIN_DATA_CLEAR, handler(self, self._onDataClear))
	self._signalClearNotice = G_SignalManager:add(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE, handler(self, self._onEventClearInviteNotice))
	self:_updateTips()
end

function GuildPushTeamApply:onExit()
	self._signalDataClear:remove()
	self._signalDataClear = nil
	self._signalClearNotice:remove()
	self._signalClearNotice = nil
end

function GuildPushTeamApply:setParam(userData)
	self._userData = userData
end

-- 重写slideOut
function GuildPushTeamApply:slideOut(data, filterViewNames) 
	-- 三国战纪 屏蔽
	if G_SceneManager:getRunningSceneName() == "countrybossbigboss" or G_SceneManager:getRunningSceneName() == "countrybosssmallboss" 
	or G_SceneManager:getRunningSceneName() == "countryboss" then
		if CountryBossConst.NOTOPEN ~= CountryBossHelper.getStage() then
			return
		end
	end

	-- 军团boss规避
	if G_SceneManager:getRunningSceneName() == "worldBoss" then
		if G_UserData:getWorldBoss():isBossStart() then 
			return
		end
	end

	GuildPushTeamApply.super.slideOut(self,data,filterViewNames)
end



function GuildPushTeamApply:_updateTips()
	local isTip = G_UserData:getGuild():isTipInvite()
	local isSelected = not isTip
	self._checkBoxTip:setSelected(isSelected)
end



function GuildPushTeamApply:_onDataClear(event)
	self:removeFromParent()
end

function GuildPushTeamApply:onBtnCancel()
	self._userData:_endCountDown()
	G_UserData:getGuild():c2sConfirmGuildTrain(self._userData:getUser_id(),false)
	self:closeWindow()
end

function GuildPushTeamApply:onBtnOk()
	G_UserData:getGuild():c2sConfirmGuildTrain(self._userData:getUser_id(),true)
	self._userData:_endCountDown()
	self:closeWindow()
end

function GuildPushTeamApply:onCheckBoxClicked()
	local isTip = G_UserData:getGuild():isTipInvite()
	G_UserData:getGuild():setTipInvite(not isTip)
	self:_updateTips()
end

function GuildPushTeamApply:_onEventClearInviteNotice( event )
	self:removeFromParent()
end


return GuildPushTeamApply