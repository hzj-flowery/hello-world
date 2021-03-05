local ViewBase = require("app.ui.ViewBase")
local GuildMemberListNodeTrain = class("GuildMemberListNodeTrain", ViewBase)
local GuildMemberListCellTrain = require("app.scene.view.guild.GuildMemberListCellTrain")
local PopupGuildMemberInfo = require("app.scene.view.guild.PopupGuildMemberInfo")
local PopupGuildCheckApplication = require("app.scene.view.guild.PopupGuildCheckApplication")
local GuildConst = require("app.const.GuildConst")
local GuildUIHelper = require("app.scene.view.guild.GuildUIHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local Parameter = require("app.config.parameter")
local ParameterIDConst = require("app.const.ParameterIDConst")
local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
local VipDataHelper = require("app.utils.data.VipDataHelper")


function GuildMemberListNodeTrain:ctor()
	self._categorySortFlag = {}
	self._lastestSortCategory = nil--按照默认排序
	local resource = {
		file = Path.getCSB("GuildMemberListNodeTrain", "guild"),
		binding = {
			_btnQuit = {
				events = {{event = "touch", method = "_onButtonQuit"}}
			},
			_btnDeclaration = {
				events = {{event = "touch", method = "_onButtonDeclaration"}}
			},
			_btnApplyList = {
				events = {{event = "touch", method = "_onButtonApplyList"}}
			},
			_btnSendMail = {
				events = {{event = "touch", method = "_onButtonSendMail"}}
			},
		}
	}
	GuildMemberListNodeTrain.super.ctor(self, resource)
end

function GuildMemberListNodeTrain:onCreate()
	self._listItemSource:setTemplate(GuildMemberListCellTrain)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

	self._btnQuit:setString(Lang.get("guild_btn_quit_guild"))
	self._btnDeclaration:setString(Lang.get("guild_title_declaration"))
	self._btnApplyList:setString(Lang.get("guild_btn_check_application"))
	self._btnSendMail:setString(Lang.get("guild_btn_mail"))
	
	self._activeLabel:setString(Lang.get("guild_active_times"))
	self._passiveLabel:setString(Lang.get("guild_passive_times"))

	for i = 1,7,1 do--7个分类
		local titlePanel = self["_titlePanel"..i]
		if titlePanel then
			self._categorySortFlag[i] = nil --标记成降序排序
			if i == 4 then--职位类
				self._categorySortFlag[i] = false
				titlePanel:updateImageView("Image", {visible = true} )
			else
				titlePanel:updateImageView("Image", {visible = false} )
			end
		
			titlePanel:setTag(i)
			titlePanel:addClickEventListenerEx(handler(self,self._onButtonTitle))
		end
	end
	
end


function GuildMemberListNodeTrain:onEnter()
	self._signalGuildQueryMall = G_SignalManager:add(SignalConst.EVENT_GUILD_QUERY_MALL, handler(self, self._onEventGuildQueryMall))
	self._signalKickSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(self, self._onEventGuildKickNotice))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalGuildUserPositionChange = G_SignalManager:add(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE, handler(self, self._onEventGuildUserPositionChange))
	self._signalPromoteSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, handler(self, self._onEventGuildPromoteSuccess))
	self._signalMailOnSendMail = G_SignalManager:add(SignalConst.EVENT_MAIL_ON_SEND_MAIL, handler(self, self._onEventMailOnSendMail))
	self._signalInviteTimeOut = G_SignalManager:add(SignalConst.EVENT_TRAIN_INVITE_TIME_OUT, handler(self, self._onEventInviteTimeOut))
	self._signalInviteSuccess = G_SignalManager:add(SignalConst.EVENT_TRAIN_INVITE_SUCCESS, handler(self,self._onEventInviteSucess))

	self:_refreshRedPoint()
	self:_refreshBtnState()
end

function GuildMemberListNodeTrain:onExit()
	self._signalGuildUserPositionChange:remove()
	self._signalGuildUserPositionChange = nil


	self._signalGuildQueryMall:remove()
	self._signalGuildQueryMall = nil


	self._signalPromoteSuccess:remove()
	self._signalPromoteSuccess = nil

	self._signalKickSuccess:remove()
	self._signalKickSuccess = nil

	self._signalRedPointUpdate:remove()
	self._signalRedPointUpdate = nil

	self._signalMailOnSendMail:remove()
	self._signalMailOnSendMail = nil

	self._signalInviteTimeOut:remove()
	self._signalInviteTimeOut = nil

	self._signalInviteSuccess:remove()
	self._signalInviteSuccess =nil
end

function GuildMemberListNodeTrain:_onEventInviteTimeOut( event )
	self:_updateList()
end

-- 邀请发送成功，更新ui
function GuildMemberListNodeTrain:_onEventInviteSucess(event, userId)
	local items = self._listItemSource:getItems()
	for k,v in pairs(items) do
		v:onInviteSucess(userId)
	end
end


function GuildMemberListNodeTrain:_onEventGuildUserPositionChange(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_refreshBtnState()
end

--提升职位
function GuildMemberListNodeTrain:_onEventGuildPromoteSuccess(eventName, uid, op)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:updateView()
end

--踢出
function GuildMemberListNodeTrain:_onEventGuildKickNotice(eventName, uid)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	if uid ~= G_UserData:getBase():getId() then
		self:updateView()
	end
end

function GuildMemberListNodeTrain:_onEventRedPointUpdate(event,funcId,param)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	if funcId and funcId ~= FunctionConst.FUNC_ARMY_GROUP then
		return
	end
	self:_refreshRedPoint()
end

function GuildMemberListNodeTrain:_onEventGuildQueryMall()
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateList()

	self:_updateMyTrainTimes()
end

function GuildMemberListNodeTrain:_onEventMailOnSendMail()
	 G_Prompt:showTip(Lang.get("mail_send_success_tips"))
end

function GuildMemberListNodeTrain:updateView()
	G_UserData:getGuild():c2sQueryGuildMall()
end

function GuildMemberListNodeTrain:_updateList()
	self._guildMemberList = UserDataHelper.getGuildMemberListBySort(
		self._lastestSortCategory,
		 self._categorySortFlag[self._lastestSortCategory] )
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._guildMemberList)

	self:_refreshRedPoint()
end

-- 更新我的演武次数 
function GuildMemberListNodeTrain:_updateMyTrainTimes( ... )
	-- local limitActive = tonumber(Parameter.get(ParameterIDConst.TRAIN_LIMIT_ACTIVE).content) -- 主动演武上限
	-- local limitPassive = tonumber(Parameter.get(ParameterIDConst.TRAIN_LIMIT_PASSIVE).content) -- 被动演武上限

	-- local myVip = G_UserData:getVip():getLevel()
	-- local limitActive = VipDataHelper.getVipCfgByTypeLevel(VipFunctionIDConst.VIP_FUNC_ID_TRAIN_ACTIVE_TIMES,myVip).value
	-- local limitPassive = VipDataHelper.getVipCfgByTypeLevel(VipFunctionIDConst.VIP_FUNC_ID_TRAIN_PASSIVE_TIMES,myVip).value
	local myMemberData = G_UserData:getGuild():getMyMemberData()
	local passive = myMemberData:getTrain_daily_acptcount()
	local active = myMemberData:getTrain_daily_count()
	-- self._activeTimes:setString(active.."/"..limitActive)
	-- self._passiveTimes:setString(passive.."/"..limitPassive)
	self._activeTimes:setString(active)
	self._passiveTimes:setString(passive)
end

function GuildMemberListNodeTrain:_onItemUpdate(item, index)
	if self._guildMemberList[index + 1] then
		item:update(self._guildMemberList[index + 1],index + 1)
	end
end

function GuildMemberListNodeTrain:_onItemSelected(item, index)
	--取出玩家阵容
	local data = self._guildMemberList[index + 1]
	if data then
		local isSelf = data:isSelf()
		if isSelf then
			return
		end

		local popup = PopupGuildMemberInfo.new(data)
		popup:openWithAction()
	end
end

function GuildMemberListNodeTrain:_onItemTouch(index)
end


function GuildMemberListNodeTrain:_onButtonQuit(sender)
	GuildUIHelper.quitGuild()
end

--修改宣言
function GuildMemberListNodeTrain:_onButtonDeclaration(sender)
	local lv = UserDataHelper.getParameter(G_ParameterIDConst.GUILD_DECLARATION_LV) 
	if G_UserData:getGuild():getMyGuildLevel() < lv then
		G_Prompt:showTip(Lang.get("guild_publish_declare_tips",{value = lv}))
		return
	end

	
	local PopupGuildAnnouncement = require("app.scene.view.guild.PopupGuildAnnouncement")
	local popup = PopupGuildAnnouncement.new(handler(self, self._onSaveDeclaration))
	popup:setTitle(Lang.get("guild_title_declaration"))
	local content = UserDataHelper.getGuildDeclaration(self._myGuild)  
	popup:setContent(content)
	popup:openWithAction()
end

--保存宣言
function GuildMemberListNodeTrain:_onSaveDeclaration(content)
	G_UserData:getGuild():c2sSetGuildMessage(content, GuildConst.GUILD_MESSAGE_TYPE_2)
end

--军团申请
function GuildMemberListNodeTrain:_onButtonApplyList(sender)
	local popup = PopupGuildCheckApplication.new()
	popup:openWithAction()
end

--军团邮件
function GuildMemberListNodeTrain:_onButtonSendMail(sender)
	local PopupGuildSendMail = require("app.scene.view.guild.PopupGuildSendMail")
	local popup = PopupGuildSendMail.new()
	popup:openWithAction()
end

function GuildMemberListNodeTrain:_onButtonTitle(sender)
	local tag = sender:getTag() 
	logWarn("GuildMemberListNodeTrain  "..tag.."  "..tostring(self._categorySortFlag[tag]) )

	if  self._categorySortFlag[tag] == nil then
		self._categorySortFlag[tag]  = false
	else
		self._categorySortFlag[tag] = not self._categorySortFlag[tag]
	end

	self._lastestSortCategory = tag

	self:_refreshOrderArrow()
	
	self:_updateList()
	
	
end

function GuildMemberListNodeTrain:_refreshOrderArrow()

	for i = 1,7,1 do--7个分类
		local titlePanel = self["_titlePanel"..i]
		if titlePanel then
			local image = ccui.Helper:seekNodeByName(titlePanel, "Image") 
			if self._lastestSortCategory == i then
				image:setVisible(true)
				image:setScaleY(self._categorySortFlag[i] and -1 or 1)
			else
				image:setVisible(false)
			end
			
		end
	end

end

function GuildMemberListNodeTrain:_refreshRedPoint()
	 local RedPointHelper = require("app.data.RedPointHelper")
	 local redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"checkApplicationRP")
	 self._btnApplyList:showRedPoint(redPointShow)
end

function GuildMemberListNodeTrain:_refreshBtnState()
	local haveCheckApplyPermission = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_6)
	local canSendMail = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_11)
	local canSetAnnouncement = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_7) --是否能修改公告
	local canSetDeclaration = UserDataHelper.isHaveGuildPermission( GuildConst.GUILD_JURISDICTION_8) --是否能修改宣言
	local canModifyGuildName = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_10) --是否能修改军团名

	self._btnApplyList:setVisible(haveCheckApplyPermission)
	self._btnDeclaration:setVisible(canSetDeclaration)
	self._btnSendMail:setVisible(canSendMail)
end



return GuildMemberListNodeTrain 