--
-- Author: Liangxu
-- Date: 2017-06-29 17:39:33
-- 军团请求增援
local ViewBase = require("app.ui.ViewBase")
local GuildRequestHelpNode = class("GuildRequestHelpNode", ViewBase)
local GuildRequestHelpCell = require("app.scene.view.guildHelp.GuildRequestHelpCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupSystemAlert = require("app.ui.PopupSystemAlert")
local ParameterIDConst = require("app.const.ParameterIDConst")

function GuildRequestHelpNode:ctor()

	
	local resource = {
		file = Path.getCSB("GuildRequestHelpNode", "guild"),
		binding = {
			_buttonReceive = {
				events = {{event = "touch", method = "_onButtonReceive"}}
			}
		
		}
	}
	GuildRequestHelpNode.super.ctor(self, resource)
end

function GuildRequestHelpNode:onCreate()
	self._curRequestPos = 0 --当前请求援助的位置索引
--[[
	local rewardInfo = UserDataHelper.getGuildRewardInfo()
	for i, info in ipairs(rewardInfo) do
		self["_fileNodeAward"..i]:initUI(info.type, info.value, info.size)
		local param = TypeConvertHelper.convert(info.type, info.value)
		local name = param.name
		self["_textAward"..i]:setString(name)
	end
]]
	self._buttonReceive:ignoreContentAdaptWithSize(true)
	self._listItemSource:setTemplate(GuildRequestHelpCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
end

function GuildRequestHelpNode:onEnter()
	self._signalGuildGetHelpListSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_HELP_LIST_SUCCESS, handler(self, self._onEventGuildGetHelpListSuccess))
	self._signalGuildAppHelp = G_SignalManager:add(SignalConst.EVENT_GUILD_APP_HELP_SUCCESS, handler(self, self._onApplySuccess))--请求帮助成功
	self._signalGuildReceiveHelp = G_SignalManager:add(SignalConst.EVENT_GUILD_RECEIVE_HELP_SUCCESS, handler(self, self._onReceiveSuccess))--领取帮助成功
	self._signalGuildReceiveHelpReward = G_SignalManager:add(SignalConst.EVENT_GUILD_RECEIVE_HELP_REWARD_SUCCESS, handler(self, self._onReceiveRewardSuccess))--领取总帮助奖励成功
end

function GuildRequestHelpNode:onExit()
	self._signalGuildGetHelpListSuccess:remove()
	self._signalGuildGetHelpListSuccess = nil
	self._signalGuildAppHelp:remove()
	self._signalGuildAppHelp = nil
	self._signalGuildReceiveHelp:remove()
	self._signalGuildReceiveHelp = nil
	self._signalGuildReceiveHelpReward:remove()
	self._signalGuildReceiveHelpReward = nil
end

function GuildRequestHelpNode:updateView()
	G_UserData:getGuild():c2sGetGuildHelp()
end

function GuildRequestHelpNode:_updateInfo()
	self:_updateProgress()
	self:_updateList()
end

function GuildRequestHelpNode:_updateList()
	self._listItemSource:clearAll()
	self._listItemSource:resize(3)
end

function GuildRequestHelpNode:_onItemUpdate(item, index)
	local pos = index + 1
	local data = G_UserData:getGuild():getMyRequestHelpBaseDataWithPos(pos)
	item:update(pos, data)
end

function GuildRequestHelpNode:_onItemSelected(item, index)
	
end

function GuildRequestHelpNode:_onItemTouch(index, key)
	self._curRequestPos = index + 1
	if key == "add" then
		local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")
		local popupChooseHero = require("app.ui.PopupChooseHero").new()
		local callBack = handler(self,self._onChooseHero)
		popupChooseHero:updateUI(PopupChooseHeroHelper.FROM_TYPE6, callBack)
		popupChooseHero:setTitle(Lang.get("guild_help_tab_title_1"))
		popupChooseHero:openWithAction()

	elseif key == "receive" then
		local helpNo = self._curRequestPos
		G_UserData:getGuild():c2sUseGuildHelp(helpNo)
	end
end

function GuildRequestHelpNode:_onButtonReceive()
	local isReceived = G_UserData:getGuild():getUserGuildInfo():getGet_help_reward() ~= 0 --是否已经领取
	local canReceived = G_UserData:getGuild():getUserGuildInfo():getFinish_help_cnt() >= 
		 UserDataHelper.getParameter(ParameterIDConst.GUILD_RECOURSE_TIMES_ID)

	local function callback() 
		G_UserData:getGuild():c2sGuildHelpReward()
	end
	local rewards = UserDataHelper.getGuildRewardInfo()
    local popupBoxReward = require("app.ui.PopupBoxReward").new(Lang.get("guild_help_box_title"), callback)
	popupBoxReward:updateUI(rewards)
	popupBoxReward:setDetailText("")
	if isReceived then
		popupBoxReward:setBtnText(Lang.get("common_btn_had_get_award"))
		popupBoxReward:setBtnEnable(false)
	elseif canReceived then
		popupBoxReward:setBtnText(Lang.get("common_btn_get_award"))
	else
		popupBoxReward:setBtnText(Lang.get("common_btn_get_award"))
		popupBoxReward:setBtnEnable(false)
	end


	popupBoxReward:openWithAction()              
end

function GuildRequestHelpNode:_showBoxEffect()
	if self._effect01 then
		return
	end
	self._effect01 = G_EffectGfxMgr:createPlayGfx(self._nodeBgEffect,"effect_juntuanbaoxiang_b")
	self._effect02 = G_EffectGfxMgr:createPlayGfx(self._buttonReceive,"effect_juntuanbaoxiang")
	--self._effect03 = G_EffectGfxMgr:createPlayGfx(self._buttonReceive,"effect_juntuanbaoxiang_xx")
	 
end

function GuildRequestHelpNode:_hideBoxEffect()
	if self._effect01 then
		self._effect01:removeFromParent()
		self._effect01 = nil
	end
	if self._effect02 then
		self._effect02:removeFromParent()
		self._effect02 = nil
	end
	if self._effect03 then
		self._effect03:removeFromParent()
		self._effect03 = nil
	end
end


--[[
function GuildRequestHelpNode:_showTalk()
	local text = UserDataHelper.getGuildRandomTalkText()
	self._textTalk:setString(text)
end
]]
function GuildRequestHelpNode:_updateProgress()
	local isReceived = G_UserData:getGuild():getUserGuildInfo():getGet_help_reward() ~= 0 --是否已经领取
	local count = G_UserData:getGuild():getUserGuildInfo():getFinish_help_cnt()
	local totalCount = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_RECOURSE_TIMES_ID).content)
	self._textProgress:setString(count)--Lang.get("guild_help_award_finish_progress", {value1 = count, value2 = totalCount})
	self._textMaxProgress:setString(totalCount)
	self._textProgress:setColor(count > 0 and Colors.DARK_BG_GREEN  or Colors.DARK_BG_ONE )
	if isReceived then
		self:_hideBoxEffect()
		self._buttonReceive:loadTextures(Path.getGuildRes("img_baoxiang01c"), nil, nil, 0)
	else
		if count >= totalCount then
			self._buttonReceive:loadTextures(Path.getGuildRes("img_baoxiang01b"), nil, nil, 0)
			self:_showBoxEffect()
		else
			self:_hideBoxEffect()
			self._buttonReceive:loadTextures(Path.getGuildRes("img_baoxiang01"), nil, nil, 0)
		end
	end
end

function GuildRequestHelpNode:_onChooseHero(heroId,pos,heroData)
	
	local unitData = heroData-- G_UserData:getHero():getUnitDataWithId(heroId)
	local baseId = unitData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId)

	G_UserData:getGuild():c2sAppGuildHelp(self._curRequestPos, param.cfg.fragment_id)
	--[[
	local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local baseId = unitData:getBase_id()
	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId)
	local name = param.name
	local color = param.icon_color

	local content = Lang.get("guild_help_confirm_request_des", {
		name = name,
		color = Colors.colorToNumber(color),
	})
	local title = Lang.get("guild_appoint_confirm_title")
	local function callbackOK()
		G_UserData:getGuild():c2sAppGuildHelp(self._curRequestPos, param.cfg.fragment_id)
	end

	local popup = PopupSystemAlert.new(title, content, callbackOK)
	popup:setCheckBoxVisible(false)
	popup:openWithAction()
	]]
end

--申请成功回调
function GuildRequestHelpNode:_onApplySuccess()
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateList()
end

--领取成功回调
function GuildRequestHelpNode:_onReceiveSuccess(eventName, award)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateList()
	self:_updateProgress()
	-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	-- PopupGetRewards:showRewards(award)
	
    G_Prompt:showAwards(award) 
end

--领取完成奖励回调
function GuildRequestHelpNode:_onReceiveRewardSuccess(eventName, award)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateProgress()
	-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
    -- PopupGetRewards:showRewards(award)
	 
	G_Prompt:showAwards(award)
end

function GuildRequestHelpNode:_onEventGuildGetHelpListSuccess(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateInfo()
end

return GuildRequestHelpNode