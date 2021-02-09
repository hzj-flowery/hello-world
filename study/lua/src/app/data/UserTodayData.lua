--用户当天数据,比如弹出补签窗口时间
--@Author:Conley

local BaseData = import(".BaseData")
local UserTodayData = class("UserTodayData", BaseData)

UserTodayData.FILE_NAME = "firstloginstate"

local schema = {}
UserTodayData.schema = schema

function UserTodayData:ctor(properties)
	UserTodayData.super.ctor(self, properties)
	self._data = {}
	self._registeredPopupList = {}
	self._isInit = false
	self._signalEnterMainScene = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEnterMainScene))
end

-- 清除
function UserTodayData:clear()
	self._signalAllDataReady:remove()
    self._signalAllDataReady = nil

	self._signalEnterMainScene:remove()
    self._signalEnterMainScene = nil
end

-- 重置
function UserTodayData:reset()
	self._isInit = false
	self._data = {}
end

function UserTodayData:_onEnterMainScene()
	self:_init()
	for k,v in ipairs(self._registeredPopupList) do
		
	end
end

function UserTodayData:registerPopup(popupId)
	table.insert(self._registeredPopupList, popupId)
end

--从本地读取缓存
--前提：登陆并有玩家ID数据
function UserTodayData:_init()
	if self._isInit then
		return
	end
	self._isInit = true
	self._data = self:_getData()
end

function UserTodayData:flush()
	self:_saveData(self._data)
end

function UserTodayData:_saveData(data)
	G_StorageManager:setUserInfo("", G_UserData:getBase():getId())	
	G_StorageManager:saveWithUser(UserTodayData.FILE_NAME,
		data
	)
end

function UserTodayData:_getData()
	G_StorageManager:setUserInfo("", G_UserData:getBase():getId())
	return G_StorageManager:loadUser(UserTodayData.FILE_NAME) or {}
end

--是否第一次登陆
function UserTodayData:isFirstLogin(key)
	local data = self:_getData() 
	if not data[key] then
		return true
	end
	local TimeConst = require("app.const.TimeConst")
	local zeroSeconds = TimeConst.RESET_TIME * 3600
	local lastestTime = data[key]
	local seconds = G_ServerTime:secondsFromToday(lastestTime)
	return  seconds < zeroSeconds
end

--为Key设置处理时间
function UserTodayData:setLastestTime(key,time,instantUpdate)
	local data = self:_getData() 
	data[key] = time
	if instantUpdate then
		self:_saveData(data)
	end
end



return UserTodayData