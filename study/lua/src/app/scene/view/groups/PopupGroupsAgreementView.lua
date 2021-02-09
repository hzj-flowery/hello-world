
-- Author: zhanglinsen
-- Date:2018-09-11 15:40:05
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupGroupsAgreementView = class("PopupGroupsAgreementView", PopupBase)
local GroupsConst = require("app.const.GroupsConst")
local GroupsDataHelper = require("app.utils.data.GroupsDataHelper")
local SchedulerHelper = require("app.utils.SchedulerHelper")

function PopupGroupsAgreementView:ctor()
	local resource = {
		file = Path.getCSB("PopupGroupsAgreementView", "groups"),
		binding = {
			_btnOk = {
				events = {{event = "touch", method = "_onBtnOk"}}
			},
		},
	}
	self:setName("PopupGroupsAgreementView")
	PopupGroupsAgreementView.super.ctor(self, resource, false)
end

function PopupGroupsAgreementView:onCreate()
	self:_initData()
	self:_initView()
end

function PopupGroupsAgreementView:_initData()
	self._data = nil
	self._configInfo = nil
	self._refreshTime = 0
	self._countDownHandler = nil --倒计时计时器
end

function PopupGroupsAgreementView:_initView()
	self._panelBg:addCloseEventListener(handler(self,self._onCloseClick))
	self._panelBg:setCloseVisible(true)
	self._panelBg:setTitle("")
	self._btnOk:setString(Lang.get("groups_prepare"))
	self._btnOk:setVisible(false)
	self._imgProgress:setVisible(false)
end

function PopupGroupsAgreementView:onEnter()
	self._signalUpdateEnterSceneState = G_SignalManager:add(SignalConst.EVENT_GROUP_UPDATE_ENTER_SCENE_STATE, handler(self, self._onUpdateEnterSceneState)) --更新确认通知
	self._signalOpEnterScene = G_SignalManager:add(SignalConst.EVENT_GROUP_OP_ENTER_SCENE, handler(self, self._onOpEnterScene)) --同意进入玩法场景

	self:_updateData()
	self:_startCountDown()
	self:_updateView()
end

function PopupGroupsAgreementView:onExit()
	self:_stopCountDown()

	self._signalUpdateEnterSceneState:remove()
	self._signalUpdateEnterSceneState = nil
	self._signalOpEnterScene:remove()
	self._signalOpEnterScene = nil
end

function PopupGroupsAgreementView:_startCountDown()
	self:_stopCountDown()
	self._countDownHandler = SchedulerHelper.newSchedule(handler(self, self._onCountDown), 1)
	self:_onCountDown()
end

function PopupGroupsAgreementView:_stopCountDown()
	if self._countDownHandler then
		SchedulerHelper.cancelSchedule(self._countDownHandler)
		self._countDownHandler = nil
	end
end

function PopupGroupsAgreementView:_onCountDown()
	local agreeTime = self._data:getAgreeTime()
	local leftTime = G_ServerTime:getLeftSeconds(agreeTime)	
	if leftTime >= 0 then
		self._nodeTime:removeAllChildren()
		local richText = ccui.RichText:createWithContent(Lang.get("groups_agreement_time", {second = leftTime}))
		richText:setAnchorPoint(cc.p(0, 0.5))
		self._nodeTime:addChild(richText)
		local percent = leftTime / self._configInfo.agree_activity_time
		self._loadingBar:setPercent(percent * 100)
	else
		self:_stopCountDown()
		self:close()
	end
end

function PopupGroupsAgreementView:_updateData()
	self._data = G_UserData:getGroups():getMyGroupData():getPreSceneInfo()
	local teamTarget = self._data:getTeam_target()
	self._configInfo = GroupsDataHelper.getTeamTargetConfig(teamTarget)
end

function PopupGroupsAgreementView:_updateView()
	self._panelBg:setTitle(Lang.get("qin_title"))
	
	self:_updateAgreeCount()
	self:_updateIcons()
end

function PopupGroupsAgreementView:_updateAgreeCount()
	local currentNum = self._data:getAgreeCount()
	local totalNum = self._data:getMemberCount()
	self._txtNum:setString(Lang.get("groups_agreement_num", {current = currentNum, total = totalNum}))
end

function PopupGroupsAgreementView:_checkIsAllAgree()
	local currentNum = self._data:getAgreeCount()
	local totalNum = self._data:getMemberCount()
	if currentNum >= totalNum then
		return true
	else
		return false
	end
end

function PopupGroupsAgreementView:_updateIcons()
	local playerId = G_UserData:getBase():getId()

	for i = 1, GroupsConst.MAX_PLAYER_SIZE do
		local icon = self["_fileNodeIcon"..i]
		local frameNode = self["_commonHeadFrame"..i]
		local userData = self._data:getUserDataWithLocation(i)
		local ImgMask = ccui.Helper:seekNodeByName(icon, "ImgMask")
		-- local ImgSeclet = ccui.Helper:seekNodeByName(icon, "ImgSeclet")
		local TextName = ccui.Helper:seekNodeByName(icon, "TextName")
		if userData then
			icon:updateUI(userData:getCovertId(), nil, userData:getLimitLevel())
			-- frameNode:setLevel(userData:getLevel())
			frameNode:updateUI(userData:getHead_frame_id(),icon:getScale())
			frameNode:setLevel(userData:getLevel())
			icon:showHeroUnknow(false)
			-- icon:setLevel(userData:getLevel())
			TextName:setString(userData:getName())
			TextName:setColor(Colors.getOfficialColor(userData:getOffice_level()))
			require("yoka.utils.UIHelper").updateTextOfficialOutline(TextName, userData:getOffice_level())

			local isConfirm = userData:isConfirmEnterScene()
			ImgMask:setVisible(not isConfirm)
			frameNode:setSelected(isConfirm)

			if userData:getUser_id() == playerId and isConfirm then
				self._btnOk:setVisible(false)
				self._imgProgress:setVisible(true)
			end
			if userData:getUser_id() == playerId and not isConfirm then
				self._imgProgress:setVisible(false)
				self._btnOk:setVisible(true)
			end
		else
			TextName:setString("")
			ImgMask:setVisible(true)
			frameNode:setSelected(false)
			icon:showHeroUnknow(true)	
		end
	end
end

function PopupGroupsAgreementView:_onUpdateEnterSceneState(event)
	self:_updateData()
	self:_updateAgreeCount()
	self:_updateIcons()
	local isAllAgree = self:_checkIsAllAgree()
	if isAllAgree then
		self:close()
	end
end

function PopupGroupsAgreementView:_onOpEnterScene(event,state)
	if state == GroupsConst.NO then
		self:close()
	end
end

function PopupGroupsAgreementView:_onCloseClick()
	-- if G_UserData:getGroups():isSelfLeader() == false then --不是队长
	-- 	G_UserData:getGroups():c2sOpEnterScene(GroupsConst.NO) 
	-- end
	self:close()
end

function PopupGroupsAgreementView:_onBtnOk()
	G_UserData:getGroups():c2sOpEnterScene(GroupsConst.OK)
end

return PopupGroupsAgreementView