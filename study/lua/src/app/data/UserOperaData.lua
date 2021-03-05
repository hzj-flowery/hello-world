--用户操作数据,比如补签窗口弹出时间，用来判断今天是否需要弹出补签窗口
--TODO ：此类还需要整理下
--@Author:Conley

local BaseData = import(".BaseData")
local UserOperaData = class("UserOperaData", BaseData)

UserOperaData.FILE_NAME = "useroperatime"--保存用户操作时间的文件名

local schema = {}
UserOperaData.schema = schema

function UserOperaData:ctor(properties)
	UserOperaData.super.ctor(self, properties)
	self._data = {}
	self._registeredPopupList = {}
	self._isInit = false
	--此数据和玩家区服绑定，所以要在登录后才能读取本地数据
	self._signalEnterMainScene = G_SignalManager:add(SignalConst.EVENT_RECV_FLUSH_DATA, handler(self, self._onEnterMainScene))
end

-- 清除
function UserOperaData:clear()
	self._signalEnterMainScene:remove()
    self._signalEnterMainScene = nil
end

-- 重置
function UserOperaData:reset()
	self._isInit = false
	self._data = {}
end

function UserOperaData:_onEnterMainScene()
	self:_init()
	for k,v in ipairs(self._registeredPopupList) do
		
	end
end

function UserOperaData:registerPopup(popupId)
	table.insert(self._registeredPopupList, popupId)
end

--从本地读取缓存
--前提：登陆并有玩家ID数据
function UserOperaData:_init()
	if self._isInit then
		return
	end
	self._isInit = true
	self._data = self:_getData()
end

function UserOperaData:flush()
	self:_saveData(self._data)
end

function UserOperaData:_saveData(data)
	G_StorageManager:setUserInfo("", G_UserData:getBase():getId())	
	G_StorageManager:saveWithUser(UserOperaData.FILE_NAME,
		data
	)
end

function UserOperaData:_getData()
	G_StorageManager:setUserInfo("", G_UserData:getBase():getId())
	return G_StorageManager:loadUser(UserOperaData.FILE_NAME) or {}
end

--是否第一次登陆
function UserOperaData:isFirstLogin(key)
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
function UserOperaData:setLastestTime(key,time,instantUpdate)
	local data = self:_getData() 
	data[key] = time
	if instantUpdate then
		self:_saveData(data)
	end
end



return UserOperaData