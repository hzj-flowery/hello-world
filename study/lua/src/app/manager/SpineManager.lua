local SpineCache = sp.SpineCache:getInstance()

local SpineManager = class("SpineManager")

--
function SpineManager:ctor()
	self._spineLoadHandlers = {}

	self:startCacheFightKnight()
end

--
function SpineManager:clear()
	self._spineLoadHandlers = {}
	self:stopCacheFightKnight()
end

--
function SpineManager:isSpineExist(path)
	return SpineCache:isSpineExist(path)
end


--
function SpineManager:_onFightKnightUpdate()
	--[[local cacheIDs = {}
	-- 获取阵位上的神将spine资源路径
	for i=1,6 do
		local knightData = G_Me.teamData:getKnightDataByPos(i)
		if knightData then
			local resID = knightData.cfgRankData.res_id
			local character_performance = require("app.cfg.character_performance").get(resID)
			assert(character_performance, "Could not find the character_performance with id: "..tostring(resID))
			
			local spinePath = "spine/" .. tostring(character_performance.ui_character_spine)
			local spineForePath = spinePath .. "_fore"
			local spineBackPath = spinePath .. "_back"

			cacheIDs[#cacheIDs + 1] = spinePath
			cacheIDs[#cacheIDs + 1] = spineForePath
			cacheIDs[#cacheIDs + 1] = spineBackPath
		end
	end
	
	-- 
	SpineCache:setCacheNodes(cacheIDs)]]
end

--
function SpineManager:startCacheFightKnight()
	SpineCache:setCacheNodes({})
	--[[-- 神将替换
	uf_eventManager:addEventListener(G_EVENTMSGID.EVENT_FIGHT_KNIGHT_UPDATE, self._onFightKnightUpdate, self)
	-- 神将突破
	uf_eventManager:addEventListener(G_EVENTMSGID.EVENT_KNIGHT_QUALITY_UP, self._onFightKnightUpdate, self)
	-- 主角突破
	uf_eventManager:addEventListener(G_EVENTMSGID.EVENT_USER_BIBLE_PLAYER_COLOR_UPGRADE, self._onFightKnightUpdate, self)]]
end

--
function SpineManager:stopCacheFightKnight()
	SpineCache:setCacheNodes({})
	--uf_eventManager:removeListenerWithTarget(self)
end

--
function SpineManager:createSkeleton(...)
	return SpineCache:createSkeleton(...)
end

--
function SpineManager:addSpine(spinePath, scale)
	return SpineCache:addSpine(spinePath, scale)
end

--[[
	异步记载spine
	这里只记载spine的图片

	@param spinePath，spine文件的路径，相对路径
	@param callback spine加载完成的回调
	@param target key值，用来表示唯一的标识符，通常是一个节点对象，如果target和spinePath都已经存在则会顶掉原来的

	@return 返回是否成功（为true并不表示加载成功，而是开始加载）
--]]
function SpineManager:addSpineAsync(spinePath, scale, callback, target)
	local handlers = self._spineLoadHandlers

	-- 没有加载，则加载
	if not SpineCache:isSpineLoaded(spinePath) then
		-- 先建一个对应spinePath的组
		local group = handlers[spinePath] or {}
		handlers[spinePath] = group

		-- 然后记录一下回调函数
		group[target] = callback


		-- 开始加载，如果已经加载完成则直接回调，如果正在加载中则加入回调队列
		local ret = SpineCache:addSpineAsync(spinePath, scale, handler(self, self._onSpineLoaded))
		if not ret then 
			handlers[spinePath] = nil
			return false
		end
	-- 说明已经加载过了
	else
		-- 否则直接调用回调
		if callback then
			callback(spinePath)
		end
	end

	return true
end

--[[
	移除加载

	@param target key值，用来表示唯一的标识符，通常是一个节点对象
--]]
function SpineManager:removeSpineLoadHandlerByTarget(target)
	local handlers = self._spineLoadHandlers

	for _, group in pairs(handlers) do
		group[target] = nil
	end
end


-- spine加载完成的回调
function SpineManager:_onSpineLoaded(spinePath)
	local handlers = self._spineLoadHandlers
	local group = handlers[spinePath]

	if group then
		for _, func in pairs(group) do
			func(spinePath)
		end

		handlers[spinePath] = nil
	end
end

return SpineManager