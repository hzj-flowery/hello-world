--跑马灯数据
--@Author:Conley

local BaseData = require("app.data.BaseData")
local RollNoticeConst = require("app.const.RollNoticeConst")
local ChatConst = require("app.const.ChatConst")
local RollNoticeData = class("RollNoticeData", BaseData)
local schema = {}
RollNoticeData.schema = schema

function RollNoticeData:ctor(properties)
	RollNoticeData.super.ctor(self, properties)

    self._systemMsgList = {}

    self._s2cRollNoticeListener = G_NetworkManager:add(MessageIDConst.ID_S2C_RollNotice, handler(self, self._s2cRollNotice))
    self._signalRecvFlushData = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEventRecvFlushData))
end

-- 清除
function RollNoticeData:clear()
    self._s2cRollNoticeListener:remove()
    self._s2cRollNoticeListener = nil

    self._signalRecvFlushData:remove()
    self._signalRecvFlushData = nil
end

-- 重置
function RollNoticeData:reset()
    self._systemMsgList = {}
end

function RollNoticeData:_onEventRecvFlushData()
    --这时候确保了ChatData已经创建
    --local rollMsg = {msg = "恭喜#name#在酒馆中抽中#hero#！",noticeType = 2,param = "727514|1|0,张角|2|5",sendId = 0}
    if #self._systemMsgList > 0 then
        return
    end
    local rollMsg = {msg = Lang.get("system_msg"),noticeType = RollNoticeConst.NOTICE_TYPE_GM,param = "",sendId = 0}
    self:_onAddNewMessage(rollMsg)
end

function RollNoticeData:_s2cRollNotice(id,message)
	--optional string msg = 1;
	--optional uint32 notice_type = 2;
    --optional uint32 notice_id = 3;
	--repeated uint32 location = 4;

    --paomadeng not find id 0
       
    if RollNoticeConst.NOTICE_TYPE_GM ~= message.notice_type and message.notice_id == 0 then 
        local msg = rawget(message,"msg")
        local noticeType = rawget(message,"notice_type")
        local noticeId = rawget(message,"notice_id")
        assert(nil,string.format("RollNoticeData test %s %s %s",tostring(msg),tostring(noticeType),tostring(noticeId)))
        return
    end

 

    local location = rawget(message,"location")  or {}
    local rollMsg = {msg = nil,noticeType = message.notice_type,param = "",sendId = message.send_id}
    if RollNoticeConst.NOTICE_TYPE_GM == message.notice_type then
        rollMsg.msg = message.msg
    else
        local PaoMaDeng = require("app.config.paomadeng")
        local cfg = PaoMaDeng.get(message.notice_id)
        assert(cfg,"paomadeng not find id "..tostring(message.notice_id))

        rollMsg.msg = cfg.description
        rollMsg.param = message.msg
				rollMsg.noticeId = message.notice_id
    end

    for k,v in ipairs(location) do
        if v ==  RollNoticeConst.ROLL_POSITION_ROLL_MSG  then
             G_SignalManager:dispatch(SignalConst.EVENT_ROLLNOTICE_RECEIVE,rollMsg)
        end

        if v == RollNoticeConst.ROLL_POSITION_CHAT_MSG then
             self:_onAddNewMessage(rollMsg)

        end
    end
 
end

function RollNoticeData:_onAddNewMessage(newMsg)
    local chatMsgData = G_UserData:getChat():createChatMsgDataBySysMsg(newMsg)
    self._systemMsgList[#self._systemMsgList + 1] = chatMsgData
	if #self._systemMsgList > ChatConst.MAX_MSG_CACHE_NUM[ChatConst.CHANNEL_SYSTEM]then
		table.remove(self._systemMsgList, 1)
	end
	if newMsg then
		G_SignalManager:dispatch(SignalConst.EVENT_SYSTEM_MSG_RECEIVE,chatMsgData)
	end

	return newMsg
end

function RollNoticeData:getSystemMsgList()
    return  self._systemMsgList
end

return RollNoticeData
