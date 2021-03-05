
local PopupBase = require("app.ui.PopupBase")
local PopupGuildContribution = class("PopupGuildContribution", PopupBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local GuildConst = require("app.const.GuildConst")
local GuildContributionItemCell = require("app.scene.view.guild.GuildContributionItemCell")
local GuildContributionBoxNode = require("app.scene.view.guild.GuildContributionBoxNode")

function PopupGuildContribution:ctor()
	self._guildContributionBoxNode = nil
	self._textRemainCount = nil
	local resource = {
		file = Path.getCSB("PopupGuildContribution", "guild"),
		binding = {
		}
	}
	PopupGuildContribution.super.ctor(self, resource, false)
end

function PopupGuildContribution:onCreate()
	self._guildContributionBoxNode = GuildContributionBoxNode.new(self._nodeBox)
    self._panelBg:addCloseEventListener(handler(self, self._onClickClose))
    self._panelBg:setTitle("军团祭祀")

	self._listItemSource:setTemplate(GuildContributionItemCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupGuildContribution:onEnter()
	self._signalGuildContribution = G_SignalManager:add(SignalConst.EVENT_GUILD_CONTRIBUTION, handler(self, self._onEventGuildContribution))
	self._signalGuildContributionBoxReward = G_SignalManager:add(SignalConst.EVENT_GUILD_CONTRIBUTION_BOX_REWARD, handler(self, self._onEventGuildContributionBoxReward))
	self._signalGuildBaseInfoUpdate = G_SignalManager:add(SignalConst.EVENT_GUILD_BASE_INFO_UPDATE, handler(self, self._onEventGuildBaseInfoUpdate))
	self._signalGuildGetUserGuild = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_USER_GUILD, handler(self, self._onEventGuildGetUserGuild))
	
	--self:_updateList()
	--self._guildContributionBoxNode:refreshBoxView()

	G_UserData:getGuild():c2sGetGuildBase()
end

function PopupGuildContribution:onExit()
	self._signalGuildContribution:remove()
	self._signalGuildContribution = nil
	self._signalGuildContributionBoxReward:remove()
	self._signalGuildContributionBoxReward = nil
	self._signalGuildBaseInfoUpdate:remove()
	self._signalGuildBaseInfoUpdate = nil
	self._signalGuildGetUserGuild:remove()
	self._signalGuildGetUserGuild = nil
end

function PopupGuildContribution:_onClickClose()
	self:close()
end

function PopupGuildContribution:_updateList()
	self._guildContributionList = UserDataHelper.getGuildContributionList()
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._guildContributionList)
end


function PopupGuildContribution:_onItemUpdate(item, index)
	if self._guildContributionList[index + 1] then
		item:update(self._guildContributionList[index + 1] )
	end
end

function PopupGuildContribution:_onItemSelected(item, index)

end

function PopupGuildContribution:_onItemTouch(index)
	local data = self._guildContributionList[index + 1]
	if not data then
		return
	end
	--判断次数
	local remainCount = UserDataHelper.getGuildContributionRemainCount()
	if remainCount <= 0 then
		G_Prompt:showTip(Lang.get("guild_contribution_not_count"))
		return
	end
	local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
	local success, errorMsg,funcName  = LogicCheckHelper.enoughValue(data.cost_type,data.cost_value,data.cost_size)
	if not success then
		return
	end
	G_UserData:getGuild():c2sGuildDonate(data.id)
end

function PopupGuildContribution:_onEventGuildContribution(event,rewards)
	if rewards then
		G_Prompt:showAwards(rewards)
	end

	G_Prompt:showTip(Lang.get("guild_contribution_success"))
end

function PopupGuildContribution:_onEventGuildContributionBoxReward(event,rewards)
	if rewards then
		G_Prompt:showAwards(rewards)
	end
end

function PopupGuildContribution:_onEventGuildBaseInfoUpdate(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_refreshRemainCount()
	self:_updateList()
	self._guildContributionBoxNode:refreshBoxView()
end

function PopupGuildContribution:_onEventGuildGetUserGuild(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_refreshRemainCount()
	self:_updateList()
	self._guildContributionBoxNode:refreshBoxView()
end

function PopupGuildContribution:_refreshRemainCount()
	local remainCount = UserDataHelper.getGuildContributionRemainCount()
	self._textRemainCount:setString(Lang.get("guild_contribution_remain_count",{value = remainCount}))
end

return PopupGuildContribution
