--邮件数据
local BaseData = require("app.data.BaseData")
local MailData = class("MailData", BaseData)
local MailInfo = require("app.config.mail")
local MailConst = require("app.const.MailConst")

MailData.GET_MAIL_CONTENT_MAX_NUM = 20 --一次性获取邮件最大数量

function MailData:c2sGetMail(mailIdList)
    local message = {ids = mailIdList}
    G_NetworkManager:send(MessageIDConst.ID_C2S_GetMail, message)
end

--领取领奖邮件 或者查看普通邮件
function MailData:c2sProcessMail(mailId)
    local message = {
        id  = mailId
    }
    G_NetworkManager:send(MessageIDConst.ID_C2S_ProcessMail, message)
end

--一键领取
function MailData:c2sProcessAllMail(ids)
    G_NetworkManager:send(MessageIDConst.ID_C2S_ProcessAllMail, {ids  = ids})
end

--删除已读邮件
function MailData:c2sDelMail(id)
    G_NetworkManager:send(MessageIDConst.ID_C2S_DelMail, {id = id})
end

--删除所有已读邮件
function MailData:c2sDelAllMail(ids)
    G_NetworkManager:send(MessageIDConst.ID_C2S_DelAllMail, {ids = ids})
end

--给玩家发送邮件
--<uid 收件方的uid(0为发给本军团),content 邮件内容>
function MailData:c2sMail(uid,title,content)
    G_NetworkManager:send(MessageIDConst.ID_C2S_Mail, {uid = uid,title = title,content = content})
end


function MailData:ctor(properties)
	MailData.super.ctor(self, properties)
  
	self._recvGetSimpleMail  = G_NetworkManager:add(MessageIDConst.ID_S2C_SendSimpleMail,handler(self, self._s2cSendSimpleMail))  --推送给前端简单邮件列表
    self._recvAddSimpleMail  = G_NetworkManager:add(MessageIDConst.ID_S2C_AddSimpleMail,handler(self,self._s2cAddSimpleMail))--玩家获得新邮件后端推送过来
    self._recvGetMail        = G_NetworkManager:add(MessageIDConst.ID_S2C_GetMail,handler(self,self._s2cGetMail))--获取邮件详细信息
    self._recvProcessMail 	 = G_NetworkManager:add(MessageIDConst.ID_S2C_ProcessMail,handler(self, self._s2cProcessMail))--领取领奖邮件 或者查看普通邮件
    self._recvProcessAllMail = G_NetworkManager:add(MessageIDConst.ID_S2C_ProcessAllMail,handler(self, self._s2cProcessAllMail))--批量领取奖励
    self._recvDelMail        = G_NetworkManager:add(MessageIDConst.ID_S2C_DelMail,handler(self, self._s2cDelMail))--删除邮件
    self._recvDelAllMail     = G_NetworkManager:add(MessageIDConst.ID_S2C_DelAllMail,handler(self, self._s2cDelAllMail))--批量删除邮件
    self._recvMail           = G_NetworkManager:add(MessageIDConst.ID_S2C_Mail,handler(self, self._s2cMail))--玩家发送邮件
  

	self._simpleMailList = {}
    self._mailList = {}
end

-- 清除
function MailData:clear()
    self._recvGetSimpleMail:remove()
    self._recvGetSimpleMail = nil
    self._recvAddSimpleMail:remove()
    self._recvAddSimpleMail = nil
    self._recvGetMail:remove()
    self._recvGetMail = nil
    self._recvProcessMail:remove()
    self._recvProcessMail = nil
    self._recvProcessAllMail:remove()
    self._recvProcessAllMail =nil
    self._recvDelMail:remove()
    self._recvDelMail = nil 
    self._recvDelAllMail:remove()
    self._recvDelAllMail = nil
    self._recvMail:remove()
    self._recvMail = nil
end

-- 重置
function MailData:reset()
	self._simpleMailList = {}
    self._mailList = {}
end

function MailData:_s2cDelMail(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    local mailId = message.id
    self:removeMail(mailId) --删除邮件

    G_SignalManager:dispatch(SignalConst.EVENT_MAIL_ON_REMOVE_MAIL,message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)
    
end

function MailData:_s2cDelAllMail(id, message)
   if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    local ids = rawget(message,"ids") or {}
    for k,mailId in ipairs(ids) do
         self:removeMail(mailId) --删除邮件 
    end
    
    G_SignalManager:dispatch(SignalConst.EVENT_MAIL_ON_REMOVE_MAIL,message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)
end


function MailData:_s2cMail(id, message)
   if message.ret ~= MessageErrorConst.RET_OK then
        return
    end
    G_SignalManager:dispatch(SignalConst.EVENT_MAIL_ON_SEND_MAIL,message)
end

--处理邮件（领取奖励，已读）
function MailData:_s2cProcessMail(id, message)
	if message.ret ~= 1 then
		return
	end
    local mailInfo = G_UserData:getMails():processMail(message.id) --处理本地缓存邮件
    G_SignalManager:dispatch(SignalConst.EVENT_MAIL_ON_PROCESS_MAIL, message,mailInfo)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)

end

function MailData:_s2cProcessAllMail(id, message)
	if message.ret ~= 1 then
        --背包超了
		G_SignalManager:dispatch(SignalConst.EVENT_MAIL_ON_PROCESS_ALL_MAIL, message)
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)
		return
	end

    G_SignalManager:dispatch(SignalConst.EVENT_MAIL_ON_PROCESS_ALL_MAIL, message)
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)
end

--推送给前端简单邮件列表
function MailData:_s2cSendSimpleMail(id, message)
	local lastMailId = rawget(message, "last_mail_id") or 0
	local mailList = rawget(message, "mails") or {}
	self._lastMailId = lastMailId

    self:_setSimpleMailList(mailList)

    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)
end

--玩家获得新邮件后端推送过来
function MailData:_s2cAddSimpleMail(id, message)
	local mailList = rawget(message, "mails") or {}

    self:_addSimpleMail(mailList)

    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)

end


---获取邮件列表
function MailData:_s2cGetMail( id, message)

    if message.ret == 1 then
        local mailList = rawget(message, "mails") or {}
        self:_setMailList(mailList)
        G_SignalManager:dispatch(SignalConst.EVENT_MAIL_ON_GET_MAILS)
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)
     
   end

end

function MailData:_dispatchMailNumChange()

end

function MailData:_dispatchMailReadStateChange()
   
end

--获取服务器端日常任务数据
function MailData:getMailData()
    return self._simpleMailList
end

function MailData:getMailDetailData()
    return  self._mailList
end

--缓存邮件列表
function MailData:_setSimpleMailList(simpleMailList)
    assert(type(simpleMailList) == "table", "get simple mail list error~")

    self._simpleMailList = {}  --重置下

    for i = 1, #simpleMailList do
		local mail = {}
		mail.id = simpleMailList[i].id
		mail.mid = simpleMailList[i].mid
		mail.isRead = simpleMailList[i].is_deal
        mail.isOpen = false--打开标记
		self._simpleMailList[mail.id] = mail
	end

end


function MailData:getMailIdList()
	local needRequestData = false
    local idList = {}
	for id, sm in pairs(self._simpleMailList) do
        --没有请求过邮件详情的
		if not self._mailList[id]  then
			table.insert(idList, sm.id)
		end
	end
    table.sort(idList,function(mailId1,mailId2)
        return mailId1 > mailId2
    end)
    local newList = {}
    for k,v in ipairs(idList) do
        if k <= MailData.GET_MAIL_CONTENT_MAX_NUM then
             table.insert( newList, v )
        else
            break     
        end
    end
 
   
	-- 邮件id列表为空或者有未请求详细数据的邮件ID
	if #newList > 0 then
		needRequestData = true
	end

    return needRequestData, newList
end


--服务器返回的新邮件列表数据
function MailData:_addSimpleMail(idList)

    assert(type(idList) == "table" ,"add new mail error~")

    for i = 1, #idList do
    	local newMail = {}
    	newMail.id = idList[i].id
    	newMail.mid = idList[i].mid
    	newMail.isRead = false   --新邮件未读
        newMail.isOpen = false--打开标记

		self._simpleMailList[newMail.id] = newMail

    end
end



function MailData:_setMailList(mailList)
    assert(type(mailList) == "table","get mail data list error")

    --self._mailList = {}  --改为不每次进入邮件系统都重新请求重置

    for i = 1, #mailList do
   		local mail = {}
   		mail.id = mailList[i].id
    	mail.mid = mailList[i].mid
    	mail.sender_id = mailList[i].sender_id
    	mail.time = mailList[i].time
    	mail.mail_contents = mailList[i].mail_contents   --KvPair 数组
    	mail.mail_title = mailList[i].mail_title   --KvPair 数组
    	mail.mail_name = mailList[i].mail_name   --KvPair 数组
    	mail.awards = mailList[i].awards   --awards数组
        mail.isRead = mailList[i].is_deal
        mail.template = self:_getMailTemplate(mail.mid)  --缓存模板数据
        self._mailList[mail.id] = mail
    end

end

function MailData:openAllMail()
    for id, sm in pairs(self._simpleMailList) do
		sm.isOpen = true
	end
    G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_MAIL)
    G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_MAIL_RED)
end


-- 获取模板邮件
function MailData:_getMailTemplate(moduleId)
    if(type(moduleId) == "number" and moduleId > 0) then
        local mailInfo = MailInfo.get(moduleId)

        return MailInfo.get(moduleId)
    end
    return nil
end


function MailData:processMail(id)
    assert(type(id) == "number" and id > 0,"process mail error")
    local mailInfo = self._mailList[id]
    if mailInfo then

    	--设置成已读取
    	self._mailList[id].isRead = true

        self._simpleMailList[id].isRead = true

    	local template = self._mailList[id].template

    	--领取后删除
        --[[
    	if template and template.mail_is_delete == 1 then
    		self:removeMail(id)
    	end
        ]]
    end
    return mailInfo
end

--删除邮件
function MailData:removeMail(id)
    assert(type(id) == "number" and id > 0,"id must be bigger than 0")
    --删除邮件id
    self._simpleMailList[id] = nil

    --删除邮件详情
    self._mailList[id] = nil
end

--判断是否有新邮件
function MailData:hasNewAwardMail()
    return true
end

function MailData:hasUnReadMail()
    local function hasNewAward(simpleMail)
        local template = self:_getMailTemplate(simpleMail.mid)
        if template then
            --有奖励邮件
            dump(template)
            --if template.mail_type == MailConst.MAIL_TYPE_AWARD then
                return true
            --end
        end
        return false
    end

    for id, sm in pairs(self._simpleMailList) do
        if not sm.isRead then
            --if hasNewAward(sm) then
            return true
           -- end
        end
    end
    return false
end

--当玩家通过上面两个途径点击弹出邮件框后，不论玩家有没有处理完未读邮件，本次登陆，若没有新的邮件发送过来，则红点不再提示。
function MailData:hasRedPoint()
     for id, sm in pairs(self._simpleMailList) do
        if not sm.isOpen and not sm.isRead then
            --if hasNewAward(sm) then
            return true
           -- end
        end
    end
    return false
end

function MailData:getEmailListByType(mailType)

    local emailList = {}

    local mailTypeList = {}
    for i, mail in pairs(self._mailList) do
    	local template = mail.template
    	if template then
	    	--奖励列表只显示奖励邮件，其他邮件在消息列表里显示
            --if template.mail_type == mailType then
            table.insert(mailTypeList,mail)
            --end
	    end
    end

    --根据优先级排序
    local sortFunc = function ( a, b )
    --[[
        if a.isRead ~= b.isRead then
            return a.isRead == false
        else
            return a.time > b.time
        end
        ]]
        return a.time > b.time
    end
    table.sort(mailTypeList, sortFunc)

    for i, mail in ipairs(mailTypeList) do
        table.insert(emailList,mail)
        --消息列表有上限
        --if #emailList >= MailConst.MAIL_MAX_COUNT then
        --    break
        --end
    end
    return emailList
end


function MailData:getMailById(id)
    assert(type(id) == "number" and id > 0,"id must be bigger than 0")
	return self._mailList[id]
end


return MailData
