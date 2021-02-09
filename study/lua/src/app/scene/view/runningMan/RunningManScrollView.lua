
-- Author: hedili
-- Date:2018-04-19 14:10:18
-- Describle：跑道界面

local ViewBase = require("app.ui.ViewBase")
local RunningManScrollView = class("RunningManScrollView", ViewBase)
local RunningManConst = require("app.const.RunningManConst")
local RunningManAvatar = import(".RunningManAvatar")
local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
local temp_value = 200

local MAX_MID_SCROLL_COUNT = 8 * 3
local MAX_HERO_COUNT = 5

function RunningManScrollView:ctor()

	--csb bind var name
	self._panelbk = nil  --Panel

	local resource = {
		file = Path.getCSB("RunningManScrollView", "runningMan"),
		size =  G_ResolutionManager:getDesignSize(),
	}
	RunningManScrollView.super.ctor(self, resource)
end

-- Describle：
function RunningManScrollView:onCreate()
	self:_buildMapBk()
	self:_buildSceneEffect()
	--self:buildAvatar()
	--self:playIdle()
end

-- Describle：
function RunningManScrollView:onEnter()

end

-- Describle：
function RunningManScrollView:onExit()

end

--构建跑步地图
function RunningManScrollView:_buildMapBk( ... )
	-- body
	local virtualRenderList = {}
	local imageBegin = self._scrollView:getSubNodeByName("Image_begin")
	local imageEnd = self._scrollView:getSubNodeByName("Image_end")
	local Image_mid1 = self._scrollView:getSubNodeByName("Image_mid1")

	table.insert(virtualRenderList, imageBegin:getVirtualRenderer():getSprite())
	table.insert(virtualRenderList, imageEnd:getVirtualRenderer():getSprite())
	table.insert(virtualRenderList, Image_mid1:getVirtualRenderer():getSprite())

	local starX = imageBegin:getContentSize().width
	imageBegin:setPositionX(0)
	Image_mid1:setPositionX(starX)
	Image_mid1:setPositionY(0)
	for i = 1, MAX_MID_SCROLL_COUNT do
		local newWidget = Image_mid1:clone()
		newWidget:setPositionX(starX + Image_mid1:getContentSize().width*i)
		newWidget:setPositionY(0)
		newWidget:setName("Image_mid"..i+1)
		table.insert(virtualRenderList, newWidget:getVirtualRenderer():getSprite())
		self._scrollView:addChild(newWidget)
		--self._scrollView:setLocalZOrder(i)
	end

	local maxWidth = imageBegin:getContentSize().width + Image_mid1:getContentSize().width*MAX_MID_SCROLL_COUNT + imageEnd:getContentSize().width + Image_mid1:getContentSize().width
	imageEnd:setAnchorPoint(cc.p(1,0))
	imageEnd:setPositionX(maxWidth)
	imageEnd:setPositionY(0)
	
	--4290
	self._scrollView:setInnerContainerSize(cc.size(maxWidth,640))
	self._scrollView:setTouchEnabled(false)
	--for i, value in ipairs(virtualRenderList) do
	--	local texture = value:getTexture()
	--	texture:setAliasTexParameters()
	--end
end

function RunningManScrollView:reset( ... )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			avatar:removeFromParent()
		end
	end

	local spineNode = self._scrollView:getChildByName("saipaozhongdian1")
	if spineNode then
		spineNode:setAnimation("effect1",true)
	end
	local spineNode = self._scrollView:getChildByName("saipaozhongdian2")
	if spineNode then
		spineNode:setAnimation("effect3",true)
	end


	self._scrollView:setInnerContainerPosition(cc.p(0,0))
end
--构建跑步对象
function RunningManScrollView:buildAvatar( ... )
	-- body
	local runningList = G_UserData:getRunningMan():getBet_info()
	if runningList and #runningList > 0 then
		for i, value in ipairs(runningList) do
			local avatar = self._scrollView:getChildByName("avatar"..value.roadNum)
			if avatar == nil then
				local avatar = RunningManAvatar.new()
				avatar:setLocalZOrder(RunningManConst.START_AVATAR_ZORDER+i)

				avatar:updateUI(value)
				avatar:playIdle()
				avatar:setName("avatar"..i)
				self._scrollView:addChild(avatar)
			end
		end
	end
end

--构建场景特效
function  RunningManScrollView:_buildSceneEffect( ... )
	-- body
	local function createEffectByData( data )
		-- body
		local spineNode = require("yoka.node.SpineNode").new()
		spineNode:setAsset( Path.getEffectSpine(data.name) )
		spineNode:setPosition(cc.p(data.x_coordinate, data.y_coordinate))
		spineNode:setAnimation(data.animation,true)
		spineNode:setScaleX(data.orientation)
		spineNode:setSize(cc.size(300,100))
		spineNode:setLocalZOrder(data.zorder)
		if data.name == "saipaozhongdian" and data.animation == "effect1" then
			spineNode:setName("saipaozhongdian1")
		end
		if data.name == "saipaozhongdian" and data.animation == "effect3" then
			spineNode:setName("saipaozhongdian2")
		end
		return spineNode
	end

	local config = require("app.config.play_horse_scene_effect")
	for i =1 , config.length() do
		local data = config.indexOf(i)
		local node = createEffectByData(data)
		self._scrollView:addChild(node)
	end
end

--到达终点
function RunningManScrollView:playOverRunning( ... )
	logWarn("RunningManScrollView:playOverRunning")
	local spineNode = self._scrollView:getChildByName("saipaozhongdian1")
	if spineNode then
		spineNode:setAnimation("effect2",false)
	end
	local spineNode = self._scrollView:getChildByName("saipaozhongdian2")
	if spineNode then
		spineNode:setAnimation("effect4",false)
	end
end

function RunningManScrollView:playIdle( ... )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			avatar:playIdle()
		end
	end

end

function RunningManScrollView:resetAvatar( ... )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			avatar:resetAvatar()
		end
	end
end
--出现英雄时，跑入跑到效果
function RunningManScrollView:playRunningAndIdle( ... )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			avatar:playRunningAndIdle()
		end
	end
end

function RunningManScrollView:playRunning( ... )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			avatar:playRunning()
		end
	end
end

function RunningManScrollView:stopRunningByHeroId(heroId)
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar and avatar:getHeroId() == heroId then
			avatar:playIdle()
		end
	end
end

--相机跟随
function RunningManScrollView:updateCamera( ... )
	-- body

	local unit = RunningManHelp.getTopUnitDistance()
	if unit == nil then
		return
	end
	local dst = unit:getRunningDistance()
	local moveOffset = dst - G_ResolutionManager:getDesignCCSize().width*0.2
	local maxWidth = self._scrollView:getInnerContainerSize().width - G_ResolutionManager:getDesignCCSize().width
	if moveOffset > maxWidth  then
		moveOffset = maxWidth
	end
	if moveOffset < 0 then
		moveOffset = 0
	end
	self._scrollView:setInnerContainerPosition(cc.p(-moveOffset,0))
end


function RunningManScrollView:updateWait( ... )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			avatar:playWaitChat()
		end
	end
end

function RunningManScrollView:syncRuningPos( ... )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			local heroId = avatar:getHeroId()
			local unitData = G_UserData:getRunningMan():getRunningUnit(heroId)
			if unitData then
				local avatarInfo = RunningManConst["AVATA_INFO"..unitData:getRoad_num()]
				local distance = unitData:getRunningDistance()

				avatar:setPositionX(avatarInfo.startPos.x + distance)
				avatar:setPositionY(avatarInfo.startPos.y)
				avatar:setAvatarScale(avatarInfo.scale)
				if unitData:isRunning() == false then
					avatar:playIdle()
					G_SignalManager:dispatch(SignalConst.EVENT_PLAY_HORSE_HERO_RUNNING_END, unitData:getHero_id())
				end
			end

		end
	end
end


--更新
function RunningManScrollView:updateRunning( dt )
	-- body
	for i = 1, MAX_HERO_COUNT do
		local avatar = self._scrollView:getChildByName("avatar"..i)
		if avatar then
			local heroId = avatar:getHeroId()
			local unitData = G_UserData:getRunningMan():getRunningUnit(heroId)
			if unitData and unitData:isRunning() then
				local avatarInfo = RunningManConst["AVATA_INFO"..unitData:getRoad_num()]
				unitData:updateRunning(dt)
				local distance = unitData:getRunningDistance()
				avatar:setPositionX(avatarInfo.startPos.x + distance)
				avatar:setPositionY(avatarInfo.startPos.y)
				avatar:setAvatarScale(avatarInfo.scale)
				avatar:playRuningChat()
			end
		end
	end
	self:updateCamera()
end

return RunningManScrollView