local ViewBase = require("app.ui.ViewBase")
local ExploreMainView = class("ExploreMainView", ViewBase)
local Path = require("app.utils.Path")
local AudioConst = require("app.const.AudioConst")
local BigImagesNode = require("app.utils.BigImagesNode")
ExploreMainView.NODE_WIDTH = 300

function ExploreMainView:ctor()
	self._scrollMap = nil	--底图
	self._topBar = nil		--顶部条

	self._citys = {}		--城市列表

	self._innerContainer = nil		--滚动容器内核

	--signal
	self._signalEnterExplore = nil
	-- self._mapX = nil
	self._lastWidth = 0
	--ui
	self._btnEvent = nil	--事件按钮
	self._topBar = nil		--顶部条
	self._scrollMap = nil		--滚动地图

	local resource = {
		file = Path.getCSB("ExploreMainView", "exploreMain"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
	self:setName("ExploreMainView")
	ExploreMainView.super.ctor(self, resource)
end

function ExploreMainView:onCreate()
    self._topBar:setImageTitle("txt_sys_com_youli")
 	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_EXPLORE)
	self._innerContainer = self._scrollMap:getInnerContainer()
	self._scrollMap:setScrollBarEnabled(false)
	self:_addMap(true)

	local explores = G_UserData:getExplore():getExplores()
	for index, data in pairs(explores) do
		self:_addNode(data, index)
	end

	self._passCityEffectNode = cc.Node:create()
	self._scrollMap:addChild(self._passCityEffectNode, 100)
end


function ExploreMainView:onEnter()
	G_AudioManager:playMusicWithId(AudioConst.MUSIC_EXPLORE)
	self._signalEnterExplore = G_SignalManager:add(SignalConst.EVENT_EXPLORE_ENTER, handler(self, self._onEventEnterExplore))
	self:_refreshNodes()

	--抛出新手事件出新手事件,只有在游历阶段

    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
	self:playPassMapEffect()
end

function ExploreMainView:onExit()
	self._signalEnterExplore:remove()
	self._signalEnterExplore = nil
end


function ExploreMainView:playPassMapEffect()
	local passCityId = G_UserData:getExplore():getFirstPassCity()
	local curCity = nil
	local nextCity = nil
	if passCityId ~= 0 then
		for _, city in pairs(self._citys) do
			if curCity then
				if city:isOpen() then
					nextCity = city
				end
				break
			end
			if city:getConfigId() == passCityId then
				curCity = city
			end
		end
	end

	if curCity and nextCity then
		nextCity:showSword(false)

		-- 调整一下位置 避免烟花看不见
		if -1 * self._innerContainer:getPositionX() + 200 > curCity:getPositionX() then
			local posx = 200 - curCity:getPositionX()
			if posx > 0 then
				posx = 0
			end
			self._innerContainer:setPositionX(posx)
		end

		local curCityID = curCity:getConfigId()
		local nextCityID = nextCity:getConfigId()
		--重置
		G_UserData:getExplore():setFirstPassCity(0)
		local movingEffectId = (curCity:getConfigId() % 8)
		if movingEffectId == 0 then
			movingEffectId = 8
		end
		local movingName = "moving_youlimache"..movingEffectId
		local effectNodePos = math.floor((curCity:getConfigId() -1)/ 8) * 1136 * 2 + 1136
		self._passCityEffectNode:setPosition(cc.p(effectNodePos, self._innerContainer:getContentSize().height/2))
		local eventFunction = function(event)
			if event == "lihua" then
				local city = self:getCityById(curCityID)
				if city then
					city:playFireWorksEffect()
				end
            elseif event == "shuangjian" then
				local city = self:getCityById(nextCityID)
				if city then
					nextCity:showSword(true)
				end
            end

		end
		local effect = G_EffectGfxMgr:createPlayMovingGfx( self._passCityEffectNode, movingName, nil, eventFunction, true )
	end

	--
end

--刷新节点
function ExploreMainView:_refreshNodes()
	local lastCity = nil
	local lastWidth = 0		--最后一个显示地图的宽度
	for i, v in pairs(self._citys) do
		v:refreshCity()
		v:showSword(false)
		if v:isOpen() then
			lastCity = v
		end
		if v:isVisible() then
			lastWidth = v:getNodePosition().x + ExploreMainView.NODE_WIDTH
		end
	end
	if not lastCity then
		lastCity = self._citys[1]
		lastWidth = G_ResolutionManager:getDesignWidth()
	end
	lastCity:showSword(true)

	if lastWidth ~= self._lastWidth then
		local height = math.min(640, display.height)
		self._scrollMap:setInnerContainerSize(cc.size(lastWidth, height))
		local lastPosition = lastCity:getNodePosition().x
		local minWidth = G_ResolutionManager:getDesignWidth()
		local x = minWidth*0.5 - lastPosition
		if x > 0 then
			x = 0
		elseif minWidth - lastWidth >= x then
			x = minWidth - lastWidth
		end

		self._innerContainer:setPositionX(x)
		self._lastWidth = lastWidth
	end
end


--添加节点
function ExploreMainView:_addNode(data, zorder)
	local exploreNode = require("app.scene.view.exploreMain.ExploreNode").new(self, data)
	self._innerContainer:addChild(exploreNode, zorder)
	table.insert(self._citys, exploreNode)

	if exploreNode:getNodePosition().x > self._innerContainer:getContentSize().width then
		self:_addMap()
	end
end

-- 设置当前点击游历节点
function ExploreMainView:setCurExploreId(id)
	self._curExploreId = id
end

-- 获取当前点击游历节点
function ExploreMainView:getCurExploreId()
	return self._curExploreId
end

--添加底图
function ExploreMainView:_addMap(isFirst)
	local innerSize = self._scrollMap:getInnerContainerSize()
	if isFirst then
		innerSize.width = 0
	end
	local spriteMap = BigImagesNode.new(Path.getExploreMainBG())

	spriteMap:setAnchorPoint(cc.p(0, 0))
	spriteMap:setPosition(cc.p(innerSize.width, 0))
	self._innerContainer:addChild(spriteMap)
	local spriteSize = spriteMap:getContentSize()
	innerSize.width = innerSize.width + spriteSize.width
	self._scrollMap:setInnerContainerSize(innerSize)
end

--收到进入大富翁消息
function ExploreMainView:_onEventEnterExplore(eventName, exploreId)
	G_SceneManager:showScene("exploreMap", exploreId)
end

function ExploreMainView:getCityById( cityId )
	-- body
	for i, value in ipairs(self._citys) do
		if value:getConfigId() == cityId then
			return value
		end
	end
	return nil
end


--刷新事件按钮

return ExploreMainView
