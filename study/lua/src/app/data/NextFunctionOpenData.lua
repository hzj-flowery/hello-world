-- Author: nieming
-- Date:2017-12-29 17:54:17
-- Describle：

local BaseData = require("app.data.BaseData")
local NextFunctionOpenData = class("NextFunctionOpenData", BaseData)

local schema = {}
--schema
NextFunctionOpenData.schema = schema


function NextFunctionOpenData:ctor(properties)
	NextFunctionOpenData.super.ctor(self, properties)
	self._curLevel = 0
	self._nextFunctionInfo = nil
	self._isNotInit =  true
	self._signalUserLevelUpdate = G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventUserLevelUpdate))
end

function NextFunctionOpenData:clear()
	self._signalUserLevelUpdate:remove()
	self._signalUserLevelUpdate = nil
end

function NextFunctionOpenData:reset()
	 self._curLevel = 0
	 self._nextFunctionInfo = nil
	 self._isNotInit =  true
end

function NextFunctionOpenData:_onEventUserLevelUpdate()
	self:getNextFunctionOpenInfo()
end

function NextFunctionOpenData:getNextFunctionOpenInfo()
	local curLevel = G_UserData:getBase():getLevel()
	if self._curLevel ~= curLevel or self._isNotInit then
		self._isNotInit = nil
		self._curLevel = curLevel
		self._nextFunctionInfo = nil
		local functionPreviewConfig = require("app.config.function_preview")
		local functionLevelConfig = require("app.config.function_level")
		local curLevel = G_UserData:getBase():getLevel()
		local indexs = functionPreviewConfig.index()
		local TextHelper = require("app.utils.TextHelper")
		local functionsConfig = {}
		for _, v in pairs(indexs) do
			local config = functionPreviewConfig.indexOf(v)
			local functionID = config.function_id
			local functionConfig = functionLevelConfig.get(functionID)
			assert(functionConfig ~= nil, string.format("can not find function id = %s", functionID or "nil"))
			if curLevel < functionConfig.level then
				local temp = {}
				temp.functionID = functionID
				temp.text = TextHelper.convertKeyValuePair(config.text, {key = "level", value = functionConfig.level})
				temp.icon = functionConfig.icon
				temp.level = functionConfig.level
				temp.name = functionConfig.name
				temp.nameImage = config.name_pic
				table.insert(functionsConfig, temp)
			end
		end
		table.sort(functionsConfig, function(a, b)
			return a.level < b.level
		end)
		for _, v in pairs(functionsConfig) do
			if v.level > curLevel then
				self._nextFunctionInfo = v
				break
			end
		end
	end
	return self._nextFunctionInfo
end


return NextFunctionOpenData
