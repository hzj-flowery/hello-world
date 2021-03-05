--
-- Author: Liangxu
-- Date: 2017-06-22 15:14:04
-- 军团大厅成员列表
local ViewBase = require("app.ui.ViewBase")
local GuildMemberListNode = class("GuildMemberListNode", ViewBase)
local GuildMemberListCell = require("app.scene.view.guild.GuildMemberListCell")
local PopupGuildMemberInfo = require("app.scene.view.guild.PopupGuildMemberInfo")
local PopupGuildCheckApplication = require("app.scene.view.guild.PopupGuildCheckApplication")
local GuildConst = require("app.const.GuildConst")
local GuildUIHelper = require("app.scene.view.guild.GuildUIHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

function GuildMemberListNode:ctor()
	self._categorySortFlag = {}
	self._lastestSortCategory = nil--按照默认排序
	local resource = {
		file = Path.getCSB("GuildMemberListNode", "guild"),
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
	GuildMemberListNode.super.ctor(self, resource)
end

function GuildMemberListNode:onCreate()
	self._listItemSource:setTemplate(GuildMemberListCell)
	self._listItemSource:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onItemTouch))

	self._btnQuit:setString(Lang.get("guild_btn_quit_guild"))
	self._btnDeclaration:setString(Lang.get("guild_title_declaration"))
	self._btnApplyList:setString(Lang.get("guild_btn_check_application"))
	self._btnSendMail:setString(Lang.get("guild_btn_mail"))
	
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

function GuildMemberListNode:onEnter()
	self._signalGuildQueryMall = G_SignalManager:add(SignalConst.EVENT_GUILD_QUERY_MALL, handler(self, self._onEventGuildQueryMall))
	self._signalKickSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_KICK_NOTICE, handler(self, self._onEventGuildKickNotice))
	self._signalRedPointUpdate = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
	self._signalGuildUserPositionChange = G_SignalManager:add(SignalConst.EVENT_GUILD_USER_POSITION_CHANGE, handler(self, self._onEventGuildUserPositionChange))
	self._signalPromoteSuccess = G_SignalManager:add(SignalConst.EVENT_GUILD_PROMOTE_SUCCESS, handler(self, self._onEventGuildPromoteSuccess))
	self._signalMailOnSendMail = G_SignalManager:add(SignalConst.EVENT_MAIL_ON_SEND_MAIL, handler(self, self._onEventMailOnSendMail))
	
	self:_refreshRedPoint()
	self:_refreshBtnState()
end

function GuildMemberListNode:onExit()
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
end


function GuildMemberListNode:_onEventGuildUserPositionChange(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_refreshBtnState()
end

--提升职位
function GuildMemberListNode:_onEventGuildPromoteSuccess(eventName, uid, op)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:updateView()
end

--踢出
function GuildMemberListNode:_onEventGuildKickNotice(eventName, uid)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	if uid ~= G_UserData:getBase():getId() then
		self:updateView()
	end
end

function GuildMemberListNode:_onEventRedPointUpdate(event,funcId,param)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	if funcId and funcId ~= FunctionConst.FUNC_ARMY_GROUP then
		return
	end
	self:_refreshRedPoint()
end

function GuildMemberListNode:_onEventGuildQueryMall()
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateList()
end

function GuildMemberListNode:_onEventMailOnSendMail()
	 G_Prompt:showTip(Lang.get("mail_send_success_tips"))
end

function GuildMemberListNode:updateView()
	G_UserData:getGuild():c2sQueryGuildMall()
end

function GuildMemberListNode:_updateList()
	self._guildMemberList = UserDataHelper.getGuildMemberListBySort(
		self._lastestSortCategory,
		 self._categorySortFlag[self._lastestSortCategory] )
	self._listItemSource:clearAll()
	self._listItemSource:resize(#self._guildMemberList)

	self:_refreshRedPoint()
end

function GuildMemberListNode:_onItemUpdate(item, index)
	if self._guildMemberList[index + 1] then
		item:update(self._guildMemberList[index + 1],index + 1)
	end
end

function GuildMemberListNode:_onItemSelected(item, index)
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

function GuildMemberListNode:_onItemTouch(index)
end


function GuildMemberListNode:_onButtonQuit(sender)
	GuildUIHelper.quitGuild()
end

--修改宣言
function GuildMemberListNode:_onButtonDeclaration(sender)
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
function GuildMemberListNode:_onSaveDeclaration(content)
	G_UserData:getGuild():c2sSetGuildMessage(content, GuildConst.GUILD_MESSAGE_TYPE_2)
end

--军团申请
function GuildMemberListNode:_onButtonApplyList(sender)
	local popup = PopupGuildCheckApplication.new()
	popup:openWithAction()
end

--军团邮件
function GuildMemberListNode:_onButtonSendMail(sender)
	local PopupGuildSendMail = require("app.scene.view.guild.PopupGuildSendMail")
	local popup = PopupGuildSendMail.new()
	popup:openWithAction()
end

function GuildMemberListNode:_onButtonTitle(sender)
	local tag = sender:getTag() 
	logWarn("GuildMemberListNode  "..tag.."  "..tostring(self._categorySortFlag[tag]) )

	if  self._categorySortFlag[tag] == nil then
		self._categorySortFlag[tag]  = false
	else
		self._categorySortFlag[tag] = not self._categorySortFlag[tag]
	end

	self._lastestSortCategory = tag

	self:_refreshOrderArrow()
	
	self:_updateList()
	
	
end

function GuildMemberListNode:_refreshOrderArrow()

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

function GuildMemberListNode:_refreshRedPoint()
	 local RedPointHelper = require("app.data.RedPointHelper")
	 local redPointShow = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_ARMY_GROUP,"checkApplicationRP")
	 self._btnApplyList:showRedPoint(redPointShow)
end

function GuildMemberListNode:_refreshBtnState()
	local haveCheckApplyPermission = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_6)
	local canSendMail = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_11)
	local canSetAnnouncement = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_7) --是否能修改公告
	local canSetDeclaration = UserDataHelper.isHaveGuildPermission( GuildConst.GUILD_JURISDICTION_8) --是否能修改宣言
	local canModifyGuildName = UserDataHelper.isHaveGuildPermission(GuildConst.GUILD_JURISDICTION_10) --是否能修改军团名

	self._btnApplyList:setVisible(haveCheckApplyPermission)
	self._btnDeclaration:setVisible(canSetDeclaration)
	self._btnSendMail:setVisible(canSendMail)
end



return GuildMemberListNode 