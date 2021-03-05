local UIDebugSystem = class("UIDebugSystem")


--
function UIDebugSystem:ctor()
	self._logList = {}
	self._logTypeList = {}
end

function UIDebugSystem:pushLog( logType, str )
	-- body
	if type(str) == "string" then
		table.insert( self._logList, {logType = logType, logStr = str})
		self._logTypeList[logType] = self._logTypeList[logType] or {}
		table.insert(self._logTypeList[logType], str)
	end

end
--

function UIDebugSystem:getLogList( )
	return self._logList	
end

function UIDebugSystem:getLogListByType( logType )
	-- body
	if logType == nil then
		return self._logList
	end
end

return UIDebugSystem