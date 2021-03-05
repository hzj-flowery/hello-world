--弹出界面
--邮件奖励界面

local PopupBase = require("app.ui.PopupBase")
local PopupMailReward = class("PopupMailReward", PopupBase)
local Path = require("app.utils.Path")

local PopupMailRewardCell = require("app.scene.view.mail.PopupMailRewardCell")
local MailConst = require("app.const.MailConst")
local MailHelper = require("app.scene.view.mail.MailHelper")
local TextHelper = require("app.utils.TextHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function PopupMailReward:ctor(title, callback )
	self._title = title or Lang.get("mail_title_reward")
	self._callback = callback
	self._btnTakeAll = nil
	self._listView = nil
	self._listView2 = nil--邮件内容的容器
 	self._nodeMailDetail = nil
	self._selectIndex = nil
	self._selectMailInfo = nil
	self._dataList = {}
	self._clickDeleteFlag = false
	local resource = {
		file = Path.getCSB("PopupMailReward", "mail"),
		binding = {
			_btnTakeAll = {
				events = {{event = "touch", method = "_onBtnTakeAll"}}
			},
			_btnDeleteReaded = {
				events = {{event = "touch", method = "_onBtnDeleteReaded"}}
			},
			_btnTake = {
				events = {{event = "touch", method = "_onBtnTake"}}
			},
		}
	}
	PopupMailReward.super.ctor(self, resource, true)
end


function PopupMailReward:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)

	self._commonItemList:setMaxItemSize(3)
	self._commonItemList:setItemsMargin(18)
	self._commonItemList:setListViewSize(335)
	
	local listView = self._listView
	listView:setTemplate(PopupMailRewardCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))

	self._btnTakeAll:setString(Lang.get("mail_get_all_award"))
	self._btnDeleteReaded:setString(Lang.get("mail_btn_delete_readed"))
	self._btnTake:setString(Lang.get("common_btn_get_award"))

	self._commonEmptyNode:setTipsString(Lang.get("mail_empty_mail_tips"))

	self._emptyTips:setString(Lang.get("mail_text_no_tips_3"))

	self:_updateListView()
end


function PopupMailReward:_sendGetMailInfo()
	local needRequestData, mailIdList = G_UserData:getMails():getMailIdList()

	--判定是否需要重新请求数据
    if needRequestData then
		G_UserData:getMails():c2sGetMail(mailIdList)	
	end
	return needRequestData
end

function PopupMailReward:_selectItem(index)
	logWarn(tostring(self._selectIndex) .." selectItem "..tostring(index))
	if self._selectIndex == index then
		return
	end

	local mailInfo = self._dataList[index + 1]
	if mailInfo and not mailInfo.isRead  then--邮件未读
		local hasAttachment =  mailInfo.awards and  #mailInfo.awards >= 1
		if not hasAttachment then	
			mailInfo.read = true
			G_UserData:getMails():c2sProcessMail(mailInfo.id)
		end
	end


	local oldSelectItem = self._listView:getItemByTag(self._selectIndex)
	if oldSelectItem then 
		oldSelectItem:setSelected(false) 
	end
	local item = self._listView:getItemByTag(index)
	if item then 
		item:setSelected(true) 
	end

	self._selectIndex = index
	self._selectMailInfo = mailInfo

	local mailInfo = self._dataList[index + 1]
	if mailInfo then
		self:_updateMailDetailView(mailInfo)
	end
end

--点击领取按钮
function PopupMailReward:_onItemTouch(index, item)
	self:_selectItem(index)
end

function PopupMailReward:_onItemUpdate(item, index)
	local mailInfo = self._dataList[index + 1]
	if mailInfo then
		item:updateUI(mailInfo,index,self._selectIndex)
	end
end


function PopupMailReward:_onItemSelected()
end


function PopupMailReward:onEnter()
	self._signalMailOnGetMailList  = G_SignalManager:add(SignalConst.EVENT_MAIL_ON_GET_MAILS, handler(self, self._onEventGetMailList))
	self._signalMailOnProcessMail 	= G_SignalManager:add(SignalConst.EVENT_MAIL_ON_PROCESS_MAIL, handler(self, self._onEventProcessMail))
	self._signalMailOnProcessAllMail = G_SignalManager:add(SignalConst.EVENT_MAIL_ON_PROCESS_ALL_MAIL, handler(self, self._onEventProcessAllMail))
	self._signalMailOnRemoveMail = G_SignalManager:add(SignalConst.EVENT_MAIL_ON_REMOVE_MAIL, handler(self, self._onEventMailOnRemoveMail ))


	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onUpdate),2)
end


function PopupMailReward:onExit()
	self._signalMailOnGetMailList:remove()
	self._signalMailOnGetMailList = nil

	self._signalMailOnProcessMail:remove()
	self._signalMailOnProcessMail = nil

	self._signalMailOnProcessAllMail:remove()
	self._signalMailOnProcessAllMail = nil

	self._signalMailOnRemoveMail:remove()
	self._signalMailOnRemoveMail = nil


	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function PopupMailReward:_onUpdate()
	--每隔一段拉取邮件的具体信息
	--logWarn("PopupMailReward  _onUpdate ")
	self:_sendGetMailInfo()
end

function PopupMailReward:onShowFinish()
	local needRequestData = self:_sendGetMailInfo()
	if not needRequestData then
		logWarn("PopupMailReward **************")
		self:_updateListView()
	end
	G_UserData:getMails():openAllMail()
end


function PopupMailReward:onBtnCancel()
	self:close()
end

--全部领取
function PopupMailReward:_onBtnTakeAll(sender)
	local ids  = {}
	local hasExpiredMail = false
    for i, value in ipairs(self._dataList) do
        local hasAttachment =  value.awards and  #value.awards >= 1
        local canReceive = hasAttachment and not value.isRead
		local isExpired = UserDataHelper.isMailExpired(value)
		if isExpired then
			hasExpiredMail = true
		end
        if canReceive and not isExpired then
            table.insert(ids, value.id)
        end
      
    end
	if #ids <= 0 then
		if hasExpiredMail then
			self:_updateListView()
			G_Prompt:showTip(Lang.get("mail_expired_tips"))
		else
			G_Prompt:showTip(Lang.get("mail_take_all_tips"))
		end
		return
	end
	G_UserData:getMails():c2sProcessAllMail(ids)
end

--删除已读
function PopupMailReward:_onBtnDeleteReaded(sender)
	local ids = {}
	local hasExpiredMail = false
	for i, value in ipairs(self._dataList) do
		local isExpired = UserDataHelper.isMailExpired(value)
		if isExpired then
			hasExpiredMail = true
		end
		if value.isRead and not isExpired then
			table.insert(ids, value.id)
		end
    end

	if #ids <= 0 then
		if hasExpiredMail then
			self:_updateListView()
			G_Prompt:showTip(Lang.get("mail_expired_tips"))
		else
			G_Prompt:showTip(Lang.get("mail_delete_readed_tips"))
		end
		return
	end
	self._clickDeleteFlag = true
	G_UserData:getMails():c2sDelAllMail(ids)
end

--领取奖励 or 删除邮件
function PopupMailReward:_onBtnTake(sender)
	local mailInfo = self._dataList[self._selectIndex + 1]
	if mailInfo then 
		local canReceive = (mailInfo.awards and  #mailInfo.awards >= 1) and not mailInfo.isRead
		local isExpired = UserDataHelper.isMailExpired(mailInfo)
		if isExpired then
			self:_updateListView()
			G_Prompt:showTip(Lang.get("mail_expired_tips"))
			return
		end
		if canReceive then
			--切换到其他邮件
			G_UserData:getMails():c2sProcessMail(mailInfo.id)
		end
	end
end


function PopupMailReward:_onEventProcessAllMail(id, message)

	local function takeMailList( ... )
		local idList = rawget(message, "ids") or {}
		if #idList > 0 then
			local awardList = self:_getAwardList(idList)
			for i, id in ipairs(idList) do
				G_UserData:getMails():processMail(id)
			end

			if not (#awardList == 1 and TypeConvertHelper.getTypeClass(awardList[1].type) == nil) then 
				local PopupGetRewards = require("app.ui.PopupGetRewards").new()
				PopupGetRewards:showRewards(awardList)
			end

			self:_updateListView()
		end
	end

	if message.ret ~= MessageErrorConst.RET_OK then
		takeMailList()
		return
	end

	takeMailList()
end

--单个邮件奖励领取
function PopupMailReward:_onEventProcessMail(id, message,mailInfo)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end

	if mailInfo then
		--弹出获取奖励框
		local skipToNextCanReceiveMail = false
		if #mailInfo.awards > 0 then
			G_Prompt:showAwards(mailInfo.awards)
			skipToNextCanReceiveMail = true
		end

		
		self:_updateListView(skipToNextCanReceiveMail)
	end
end

function PopupMailReward:_onEventMailOnRemoveMail(event)
	self:_updateListView()
	if self._clickDeleteFlag == true then
		self._clickDeleteFlag = false 
		G_Prompt:showTip(Lang.get("mail_delete_success_tips"))
	end
end

--获取邮件详情
function PopupMailReward:_onEventGetMailList(id, message)
	self:_updateListView()
end

function PopupMailReward:_findIndexById(data,dataList)
	if not data then
		return nil
	end
	for k,v in ipairs(dataList) do
		if data.id == v.id then
			return k-1
		end
	end
	return nil
end

function PopupMailReward:_updateListView(skipToNextCanReceiveMail)
	local getNewIndex = function(newDataList,oldSelectMailInfo)
		local selectIndex = nil
		local defaultValue = 0 --默认值
		if #newDataList <= 0 then
			defaultValue = nil
		end

		local oldSelectIndex = self:_findIndexById(oldSelectMailInfo,newDataList )
		logWarn("PopupMailReward  kkkkkkkkkkkkkkk "..tostring(oldSelectIndex))
		local selectIndex = defaultValue 
		if oldSelectIndex and oldSelectIndex >= 0 then
			selectIndex = oldSelectIndex
		end
		return selectIndex
	end

	local listView = self._listView
	self._dataList = G_UserData:getMails():getEmailListByType(MailConst.MAIL_TYPE_AWARD)--获得奖励邮件数据列表

	self:_showEmptyView(#self._dataList <= 0 )

	local oldSelectIndex = self._selectIndex 
	local oldSelectMailInfo = self._selectMailInfo

	local nextCanReceiveMailIndex =  nil
	if skipToNextCanReceiveMail then
		 nextCanReceiveMailIndex = self:_getNextCanReceiveMailIndex(self._dataList,oldSelectMailInfo)
	end

	
	local selectIndex = nextCanReceiveMailIndex or getNewIndex(self._dataList,oldSelectMailInfo)
	
	self._selectIndex = nil
	self._selectMailInfo = nil
	
	local isSameMail = function(mailLeft,mailRight)
		logWarn("PopupMailReward  xxxxxxxxxxxxxxxx ")
		dump(mailLeft)
		dump(mailRight)
		logWarn("PopupMailReward  xxxxxxxxxxxxxxxx ")
		if mailLeft == nil and mailRight == nil then
			return true
		end
		if mailLeft == nil or mailRight == nil then
			return false
		end
		return mailLeft.id == mailRight.id
	end

	local lastMailToScreenDistance  = 0
	if oldSelectIndex then
		local scrollY = listView:getInnerContainer():getPositionY()
		local mailLocation = listView:getItemBottomLocation(oldSelectIndex+1)
		lastMailToScreenDistance = mailLocation + scrollY
	end

	local itemList = self._dataList
	if itemList then
		local lineCount = #itemList
		listView:clearAll()
		listView:resize(lineCount)
	end


	self:_selectItem(selectIndex)

	--1.选中邮件不变，保证邮件位置不变
	--2.连续领取奖励时保证下个可领邮件可见
	--3.非连续领奖非同邮件，邮件显示在最上面

	if not selectIndex then
		return selectIndex
	end

	logWarn("PopupMailReward  ----------------------- ")
	logWarn("PopupMailReward   "..tostring(selectIndex))

	if isSameMail(oldSelectMailInfo,self._selectMailInfo) then
		--刷新前记下位置
		--刷新后刷新到记录的位置

		

		local mailLocation = listView:getItemBottomLocation(selectIndex+1)
		local posY = mailLocation - lastMailToScreenDistance 
		logWarn("PopupMailReward   isSameMail")
		logWarn("PopupMailReward   "..tostring(mailLocation))
		logWarn("PopupMailReward   "..tostring(posY))
		listView:setLocationByPos(cc.p(0,-posY))


	elseif skipToNextCanReceiveMail then
		--查看邮件是否可见
		--定位到底部
		logWarn("PopupMailReward   skipToNextCanReceiveMail")
		
	

		if not listView:isInVisibleRegion(selectIndex+1) then
			logWarn("PopupMailReward   not isInVisibleRegion")
			listView:setLocation(selectIndex+1,318)
		else
			logWarn("PopupMailReward   isInVisibleRegion")
		end
	else
		logWarn("PopupMailReward   hahaha ")
		listView:setLocation(selectIndex+1)
	end
	logWarn("PopupMailReward  ----------------------- ")
end

function PopupMailReward:_showEmptyView(isShowEmpty)
	 self._listView:setVisible(not isShowEmpty)
	 self._nodeMailDetail:setVisible(not isShowEmpty)
	 self._commonEmptyNode:setVisible(isShowEmpty)
	 self._emptyIcon:setVisible(isShowEmpty)
end

function PopupMailReward:_updateMailDetailView(mailInfo)
	local refreshRichFunc = function(richNode,richText)
		richNode:removeAllChildren()
		local widget = ccui.RichText:createWithContent(richText)
		widget:setAnchorPoint(cc.p(1,0.5))
		richNode:addChild(widget)
	end
	local hasAttachment =  mailInfo.awards and  #mailInfo.awards >= 1
	local awardList = mailInfo.awards
	local canReceive = hasAttachment and not mailInfo.isRead

	local expiredTimeRichText = Lang.get("mail_expired_time_rich_text",{
		value = MailHelper.getMailExpiredTime(mailInfo)
	})

	local fromRichText = Lang.get("mail_from_who_rich_text",{
		value1 = Lang.get("mail_from"),
		value2 = TextHelper.convertKeyValuePairs(mailInfo.template.mail_name, mailInfo.mail_name),
	})

	refreshRichFunc(self._nodeExpiredTime,expiredTimeRichText)
	refreshRichFunc(self._nodeFrom,fromRichText)


	


	MailHelper.updateMailRichContent(mailInfo,self._textMailTitle,self._listView2)
	self._textSendTime:setString(MailHelper.getSendTimeString(mailInfo.time))

	self._nodeAttachment:setVisible(hasAttachment)
	self._commonItemList:updateUI(awardList)
	self._commonItemList:setIconMask(mailInfo.isRead)

	self._btnTake:setString(canReceive and Lang.get("common_btn_get_award") or 
		Lang.get("mail_delete_msg")
	)
	-- self._btnTake:enableHighLightStyle(not canReceive)

	self._btnTake:setVisible(canReceive)
	
end

function PopupMailReward:_getAwardList(mailIdList)
	local retList = {}

	local function procMailInfo(mailId)
		local mailInfo = G_UserData:getMails():getMailById(mailId)
		if mailInfo and #mailInfo.awards > 0 then
			return mailInfo.awards
		end
		return nil
	end

	--奖励合并
	local tempList = {}
	local function merageAward(award)
		local keyStr = award.type.."|"..award.value
		if tempList[keyStr] == nil then
			tempList[keyStr] = award.size
		else
			tempList[keyStr] = tempList[keyStr] + award.size
		end
	end

	for i, mailId in ipairs(mailIdList) do
		local awards = procMailInfo(mailId)
		if awards then
			for i, value in ipairs(awards) do
				merageAward(value)
			end
		end
	end

	for key, value in pairs(tempList) do
		local array = string.split(key,"|")
		local award = {
			type = tonumber(array[1]),
			value = tonumber(array[2]),
			size = value
		}
		table.insert(retList, award)
	end





	return retList
end

function PopupMailReward:_getNextCanReceiveMailIndex(newDataList,oldSelectMailInfo)
	if not oldSelectMailInfo then
		return nil
	end
	local nextIndex = nil
	local start = false
	for i = 1 ,#newDataList, 1 do
		local mailInfo = newDataList[i]
		local hasAttachment =  mailInfo.awards and  #mailInfo.awards >= 1
		local canReceive = hasAttachment and not mailInfo.isRead
		if start and canReceive then
			 nextIndex = i-1
			 break
		end
		if mailInfo.id == oldSelectMailInfo.id then
			start = true
		end
	end
	return nextIndex
end

return PopupMailReward
