local GroupsViewHelper = {}
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local GroupsConst = require("app.const.GroupsConst")

--退队提示
function GroupsViewHelper.quitGroupTip()
	local data = G_UserData:getGroups():getMyGroupData()
	if data == nil then
		return
	end

	local isSelfLeader = G_UserData:getGroups():isSelfLeader()
	local content = ""
	local onBtnGo = nil
	local onBtnCancel = nil

	if isSelfLeader then --队长
		content = Lang.get("groups_leader_quit_content")
		onBtnGo = function()
			G_UserData:getGroups():c2sLeaveTeam(GroupsConst.LEADER_DISSOLVE)
		end
		onBtnCancel = function()
			G_UserData:getGroups():c2sLeaveTeam(GroupsConst.NORMAL_QUIT)
		end
	else
		content = Lang.get("groups_quit_content")
		onBtnGo = function()
			G_UserData:getGroups():c2sLeaveTeam(GroupsConst.NORMAL_QUIT)
		end
		onBtnCancel = nil
	end

	local popup = require("app.ui.PopupSystemAlert").new(Lang.get("groups_quit_title"), content, onBtnGo, onBtnCancel)
	if isSelfLeader then
		popup:setBtnOk(Lang.get("groups_btn_name_dissolve"))
		popup:setBtnCancel(Lang.get("groups_btn_name_quit"))
		popup:setCloseCallback(function()  end)
	end
	popup:setCheckBoxVisible(false)
	popup:setCloseVisible(true)
	popup:openWithAction()
end

--推送申请
function GroupsViewHelper.pushApply(userData)
	local noticeView = require("app.scene.view.groups.GroupsMainNode").new()
	local data = {}
	local targetName = userData:getGuild_name()
	if targetName == "" then
		targetName = Lang.get("siege_rank_no_crops")
	end

	data.showImageTips = false
	data.imageRes = Path.getQinTomb("img_qintomb_shouye1")
	data.name = userData:getName()
	data.nameColor = Colors.getOfficialColor(userData:getOffice_level())
	data.targetName = targetName
	data.covertId = userData:getCovertId()
	data.limitLevel = userData:getLimitLevel()
	data.headFrameId = userData:getHead_frame_id()
	data.level = userData:getLevel()
	if not userData:isEndApply() then
		data.endTime = userData:getApplyEndTime()
	end
	
	noticeView:setParam(userData, GroupsConst.APPLY)
	noticeView:slideOut(data, {"groups"})
end

--推送邀请
function GroupsViewHelper.pushInvite(userData, teamId, teamType, teamTarget)
	local isTip = G_UserData:getGroups():isTipInvite()
	if not isTip then
		return
	end
	
	local noticeView = require("app.scene.view.groups.GroupsMainNode").new()
	local data = {}
	data.showImageTips = true
	data.imageRes = Path.getQinTomb("img_qintomb_shouye2")
	data.name = userData:getName()
	data.nameColor = Colors.getOfficialColor(userData:getOffice_level())
	data.targetName = GroupsDataHelper.getTeamTargetConfig(teamTarget).name
	data.covertId = userData:getCovertId()
	data.limitLevel = userData:getLimitLevel()
	data.headFrameId = userData:getHead_frame_id()
	data.level = userData:getLevel()
	if not userData:isEndInvite() then
		data.endTime = userData:getInviteEndTime()
	end

	noticeView:setParam(userData, GroupsConst.INVITE, teamId)
	noticeView:slideOut(data, {"fight", "seasonSport", "seasonCompetitive"})
end

--弹出提示，进入活动场景
function GroupsViewHelper.popupEnterActiveScene(memberData)
	local teamType = memberData:getTeam_type()
	local teamTarget = memberData:getTeam_target()
	local targetCfg = GroupsDataHelper.getTeamTargetConfig(teamTarget)
	local targetName = targetCfg.name
	local function onBtnGo()
		G_UserData:getGroups():c2sTeamEnterScene(teamType)
	end 
	local function onBtnCancel()

	end 
	local popup = require("app.ui.PopupSystemAlert").new(Lang.get("groups_enter_scene_title"), Lang.get("groups_Enter_scene_content"), onBtnGo,onBtnCancel)
	popup:setBtnOk(Lang.get("groups_btn_enter_scene"))
	popup:setBtnCancel(Lang.get("groups_target_cancel"))
	popup:setCheckBoxVisible(false)
	popup:setCloseVisible(true)
	popup:openWithAction()
end

--弹出提示，审批请求带队
function GroupsViewHelper.popupAppTransferLeaderNotice(userId, userName, endTime)
	local function onBtnGo()
		G_UserData:getGroups():c2sOpTransferLeader(userId, GroupsConst.OK)
	end 
	local function onBtnCancel()
		G_UserData:getGroups():c2sOpTransferLeader(userId, GroupsConst.NO)
	end

	local popup = require("app.ui.PopupSystemAutoAlert").new(Lang.get("groups_transfer_title"), 
															Lang.get("groups_transfer_content", {name=userName}), 
															onBtnGo,
															onBtnCancel)
	popup:setBtnOk(Lang.get("groups_agree"))
	popup:setBtnCancel(Lang.get("groups_refuse"))
	popup:setCheckBoxVisible(false)
	popup:setCloseVisible(true)
	popup:setAutoContent(endTime)
	popup:openWithAction()
end

function GroupsViewHelper.popupGroupsAgreementDlg()
	local runningScene = G_SceneManager:getRunningScene()
	local sceneName = runningScene:getName()
	if sceneName == "fight" then --在某些场景时，不弹出
		return
	end

    if sceneName == "guildTrain" and not G_UserData:getGuild():getTrainEndState() then -- 演武未结束不弹出
        return
    end

	local popupView = G_SceneManager:getRunningScene():getPopupByName("PopupGroupsAgreementView")
	if popupView then --存在此弹框时，不再弹出
		return
	end

	local popup = require("app.scene.view.groups.PopupGroupsAgreementView").new()
	popup:openWithAction()
end

--检测是否能创建队伍
function GroupsViewHelper.checkIsCanCreate(groupType)
	local functionId = GroupsDataHelper.getTeamInfoConfig(groupType).function_id
	if functionId == FunctionConst.FUNC_MAUSOLEUM then
		local leftSec = GroupsDataHelper.getMyActiveLeftTime(functionId)
		local assistTime = GroupsDataHelper.getMyActiveAssistTime(functionId)
		if leftSec+assistTime <= 0 then
			local function func()
		        G_Prompt:showTip(Lang.get("groups_can_not_create_tips_1"))
		    end
		    return false, func
		end
	end
	return true
end

--检测是否能申请入队
function GroupsViewHelper.checkIsCanApplyJoin(groupType)
	local functionId = GroupsDataHelper.getTeamInfoConfig(groupType).function_id
	if functionId == FunctionConst.FUNC_MAUSOLEUM then
		local leftSec = GroupsDataHelper.getMyActiveLeftTime(functionId)
		local assistTime = GroupsDataHelper.getMyActiveAssistTime(functionId)
		if leftSec+assistTime <= 0 then
			local function func()
		        G_Prompt:showTip(Lang.get("groups_can_not_create_tips_1"))
		    end
		    return false, func
		end
	end
	return true
end

return GroupsViewHelper