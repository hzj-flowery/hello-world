--分辨率适配管理器

local ResolutionManager = class("ResolutionManager")
local NativeAgent = require("app.agent.NativeAgent")
--
function ResolutionManager:ctor()
	self._designSize = cc.size(math.min(CC_DESIGN_RESOLUTION.width, display.width),math.min(CC_DESIGN_RESOLUTION.height, display.height))

	self._deviceOffset = nil
end


function ResolutionManager:doLayout( node )
	-- body
	local panelScreen = node --ccui.Helper:seekNodeByName(node, "Panel_screen")
	if panelScreen then
		local size = panelScreen:getContentSize()
		local bangSize = self:getBangDesignCCSize()
		panelScreen:setContentSize(bangSize)
		panelScreen:setAnchorPoint(cc.p(0.5,0.5))
		panelScreen:setPosition(self:getDesignCCPoint())
		
		--panelScreen:setPositionX(panelScreen:getPositionX() - 50)
		--ccui.Helper:doLayout(panelScreen)
	end
end

--获取减去刘海的设计分辨率宽度
function ResolutionManager:getBangDesignCCSize()
	local bangWidth = self:getBangDesignWidth()
	return cc.size( bangWidth, self._designSize.height )
end

--获取减去刘海的设计分辨率宽度
function ResolutionManager:getBangDesignSize()
	local bangWidth = self:getBangDesignWidth()
	return { bangWidth, self._designSize.height }
end

--获取减去刘海的设计分辨率宽度
function ResolutionManager:getBangDesignWidth()
	local bangWidth = self._designSize.width - self:getBangOffset() * 2
	return bangWidth
end
--获取设计分辨率中心点位置
function ResolutionManager:getDesignCCPoint( ... )
	-- body
	return cc.p(self._designSize.width*0.5, self._designSize.height*0.5)
end


--获取设计分辨率
function ResolutionManager:getDesignCCSize( ... )
	-- body
	return self._designSize
end

--获取设计分辨率
function ResolutionManager:getDesignSize( ... )
	-- body
	return {self._designSize.width, self._designSize.height}
end

--设计分辨率宽度
function ResolutionManager:getDesignWidth( ... )
	-- body
	return self._designSize.width
end

--设计分辨率高度
function ResolutionManager:getDesignHeight( ... )
	-- body
	return self._designSize.height
end


function ResolutionManager:getDeviceOffset( )
	local name = NativeAgent.callStaticFunction("getDeviceModel", nil, "string")
	logWarn("ResolutionManager:getDeviceOffset native model name ", name)
	local function matchIPhoneXS(name)
		local matchTable = {}
		matchTable["iPhone11,2"] = 50
		matchTable["iPhone11,4"] = 50
		matchTable["iPhone11,6"] = 50
		matchTable["iPhone11,8"] = 50
		if matchTable[name] ~= nil then
			return matchTable[name]
		end
		return nil
	end

	-- name = "iPhone10,3"
	if name ~= nil and name ~= "" then
		local iPhonexs_offset = matchIPhoneXS(name)
		if iPhonexs_offset then
			return iPhonexs_offset
		end

		local device = require("app.config.device")
		local cfg = device.get(name)
		if cfg then
			return cfg.offset
		end
	end
	return 0 
end

--获取设备刘海偏移量
function ResolutionManager:getBangOffset( ... )
	if 	self._deviceOffset == nil then
		self._deviceOffset = self:getDeviceOffset()
	end
	return self._deviceOffset
end



return ResolutionManager