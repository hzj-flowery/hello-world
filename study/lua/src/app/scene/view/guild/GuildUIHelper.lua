local UserDataHelper = require("app.utils.UserDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local GuildConst = require("app.const.GuildConst")
local GuildUIHelper = {}


function GuildUIHelper.quitGuild()
    local userMemberData = G_UserData:getGuild():getMyMemberData()
	local myPosition = userMemberData:getPosition()
	local canDissolve = UserDataHelper.isHaveJurisdiction(myPosition, GuildConst.GUILD_JURISDICTION_1)
	if canDissolve then
		local count = G_UserData:getGuild():getGuildMemberCount()
		if count > 1 then
			G_Prompt:showTip(Lang.get("guild_tip_can_not_dissolve"))
			return
		end

		local function callbackOK()
			G_UserData:getGuild():c2sGuildDismiss()
		end
		local content = Lang.get("guild_dissolve_hint")
		local title = Lang.get("guild_appoint_confirm_title")
		local popup = require("app.ui.PopupAlert").new(title, content, callbackOK)
		popup:openWithAction()
	else
		local userMemberData = G_UserData:getGuild():getMyMemberData()
		local time = userMemberData:getTime()
		if not UserDataHelper.checkCanQuitGuild(time) then
			return
		end

		local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.GUILD_QUIT_CD_ID).content)
		local timeStr = G_ServerTime:getDayOrHourOrMinFormat(timeLimit)
		local content = Lang.get("guild_leave_hint", {time = timeStr})
		local title = Lang.get("guild_appoint_confirm_title")
		local function callbackOK()
			G_UserData:getGuild():c2sGuildLeave()
		end

		local popup = require("app.ui.PopupAlert").new(title, content, callbackOK)
		popup:openWithAction()
	end
end

function GuildUIHelper.noticeBeKickGuild()
	local UIPopupHelper = require("app.utils.UIPopupHelper")
	UIPopupHelper.popupOkDialog(nil,Lang.get("guild_kick_hint"),function()
		G_SceneManager:popScene()
	end,Lang.get("common_btn_name_confirm"))
end


-- 发送邀请返回
function GuildUIHelper.getS2CQueryGuildTrain( ... )
	G_Prompt:showTipOnTop(Lang.get("guild_train_wait"))
end

function GuildUIHelper.getConfirmGuildTrain(name)
	local str = string.format(Lang.get("guild_cancel_invite"),name)
	G_Prompt:showTipOnTop(str)
end

function GuildUIHelper.getS2CStartGuildTrainNotify( data )
    local scene = G_SceneManager:getTopScene()
    local sceneName = scene:getName()
	if sceneName ~= "guildTrain" then
		G_SceneManager:showScene("guildTrain")
	else
		G_SignalManager:dispatch(SignalConst.EVENT_GET_TRAIN_NOTIFY)
	end
end

-- 推送邀请框
function GuildUIHelper.pushGuildTeamApply( userData )

	local isTip = G_UserData:getGuild():isTipInvite()
	if not isTip then
		return
	end

	local noticeView = require("app.scene.view.guildTrain.GuildPushTeamApply").new()
	local data = {}
	-- data.showImageTips = true
	data.imageRes = Path.getTrainAcceptImg("accept_train")
	data.name = userData:getName()
	data.nameColor = Colors.getOfficialColor(userData:getOffice_level())
	data.targetName = ""
	data.covertId = userData:getCovertId()
	data.limitLevel = userData:getLimit_level()
	data.level = userData:getLevel()
	data.imageBg = Path.getTrainInviteBg("img_train_shouye")
	if not userData:isEndInvite() then
		data.endTime = userData:getInviteEndTime()
	end

	noticeView:setParam(userData)
	noticeView:slideOut(data, {"fight", "seasonSport", "seasonCompetitive","qinTomb","groups"})
end





function GuildUIHelper.autoEndGuildTrain( ... )

end

return GuildUIHelper
