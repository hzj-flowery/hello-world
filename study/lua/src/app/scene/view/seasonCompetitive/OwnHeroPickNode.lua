-- @Author panhoa
-- @Date 8.16.2018
-- @Role OwnHeroPickNode

local ViewBase = require("app.ui.ViewBase")
local OwnHeroPickNode = class("OwnHeroPickNode", ViewBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local SquadAvatar = require("app.scene.view.seasonCompetitive.SquadAvatar")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function OwnHeroPickNode:ctor(heroCallback, moveOutCallback)
	-- body
	self._heroCallback		= heroCallback	  -- 用于监听锁定或同步数据
	self._moveOutCallback	= moveOutCallback -- 用于监听移动到界外事件

	self._resourceNode		= nil	-- layout
	self._curSlot			= 0		-- 当前坑位
	self._squadAvatarData	= {}	-- 记录阵容信息
	self._isTouch 			= false	-- 滑动事件只对当前对象进行一系列操作
	self._originalPos 		= 0		-- 选择的pos
	self._targetPos 		= nil	-- 移动到目标位置
	self._curTouchAvatar	= nil	-- 当前Avatar
	self._curHeroViewTabIndex = 1	-- 记录选择的国家
	self._curUpdateAvatarHeroId= 0  -- 上阵武将Id记录
	self._curUpdateAvatarIndex= 1	-- 上阵武将下标记录
	self._curRound			= 0

    local resource = {
		file = Path.getCSB("OwnHeroPickNode", "seasonCompetitive"),
	}
	OwnHeroPickNode.super.ctor(self, resource)
end

function OwnHeroPickNode:onCreate()
	self._resourceNode:setSwallowTouches(false)
	self:_initInfo()
end

function OwnHeroPickNode:onEnter()
	self._ownSign = G_UserData:getSeasonSport():getPrior()
	self._resourceNode:addTouchEventListener(handler(self, self._onTouch))
end

function OwnHeroPickNode:onExit()
end

-- @Role 	“+”可见状态
function OwnHeroPickNode:_hideAdd()
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		self["_imageAdd"..index]:setVisible(false)
	end
end

-- @Role 	设置Add（加号）显示状态
function OwnHeroPickNode:switchAddVisible(bHide)
	if bHide then
		self:_hideAdd()
	else
		self:_updateAvatar()
	end
end


function OwnHeroPickNode:synchronizeData(callback)
	self._synchronizeDataCallBack = callback
end

-- @Export 	断线重连
-- @Param 	data 上阵武将数据
-- @Param 	typeDatas 上阵类型（0武将/1变身卡）
function OwnHeroPickNode:synchronizeUI(data, typeDatas)
	if not data then
		return
	end

	for key, value in pairs(data) do	
		if value > 0 then
			self._squadAvatarData[key].isLock = true
			self._squadAvatarData[key].heroId = value
			self._squadAvatarData[key].state  = typeDatas[key]
			self._squadAvatarData[key].isExchange = false

			-- tanslate transCardID
			if typeDatas[key] ~= 0 then	
				local transCardId = SeasonSportHelper.getTransformCardId(value)
				if transCardId ~= nil then
					self._squadAvatarData[key].heroId = transCardId
					value = SeasonSportHelper.getTransformCardsHeroId(transCardId)
				end
			end

			local avatar = self._resourceNode:getChildByName("avatar"..key)
			if avatar == nil then
				avatar = self:_createReconnectHeroAvatar(value, key)
				avatar:setName("avatar"..key)
				avatar:setTag(value)
				self._resourceNode:addChild(avatar, key * 10)
				self._squadAvatarData[key].avatar = avatar
			else
				if avatar:getTag() ~= nil and avatar:getTag() ~= value then
					local limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(value)
					avatar:updateUI(value, limitLevel)
					avatar:setTag(value)
					self._squadAvatarData[key].avatar = avatar
				end
			end
		elseif value == 0 then
			local avatar = self._resourceNode:getChildByName("avatar"..key)
			if avatar ~= nil then
				self._resourceNode:removeChildByName("avatar"..key)
				self._squadAvatarData[key] = {}
				self._squadAvatarData[key].isLock = false
				self._squadAvatarData[key].heroId = 0
				self._squadAvatarData[key].state  = 0
				self._squadAvatarData[key].avatar = nil
				self._squadAvatarData[key].isExchange = false
			end
		end
	end

	if self._synchronizeDataCallBack then
		self._synchronizeDataCallBack(self._squadAvatarData)
	end
end

-- @Role 	武将上阵动画特效（Boom）
function OwnHeroPickNode:_playWujiangPickAnimation(rootNode)
	local function effectFunction(effect)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		if effect == "effect_zm_boom" then
			local subEffect = EffectGfxNode.new("effect_zm_boom")
            subEffect:play()
			return subEffect
		end
    end
    local function eventFunction(event)
		if event == "finish" then
			-- 1: 插入数据要同步
			
		elseif event == "hero" then
			local avatar = self._resourceNode:getChildByName("avatar"..self._curUpdateAvatarIndex)
			self["_imageAdd"..self._curUpdateAvatarIndex]:setVisible(false)
			local limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(self._curUpdateAvatarHeroId)
			
			if avatar ~= nil then
				avatar:updateUI(self._curUpdateAvatarHeroId, limitLevel)
				self._squadAvatarData[self._curUpdateAvatarIndex].avatar = avatar
			else
				avatar = self:_createHeroAvatar(self._curUpdateAvatarHeroId, self._curUpdateAvatarIndex)
				avatar:setName("avatar"..self._curUpdateAvatarIndex)
				avatar:setTag(self._curUpdateAvatarHeroId)
				self._resourceNode:addChild(avatar, self._curUpdateAvatarIndex * 10)
				self._squadAvatarData[self._curUpdateAvatarIndex].avatar = avatar
			end
        end
	end
	
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, "moving_wuchabiebuzhen_wujiang", effectFunction, eventFunction , false)
end

-- @Role 	Init avatarInfo
function OwnHeroPickNode:_initInfo()
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
        self["_heroPedespal"..index]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[1]))
        self["_heroPedespal"..index]:ignoreContentAdaptWithSize(true)
		
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect(self["_imageAdd"..index])
		self["_imageAdd"..index]:setVisible(true)
		self["_imageAdd"..index]:setTag(index)
		self["_imageAdd"..index]:setSwallowTouches(false)
		self["_imageAdd"..index]:setTouchEnabled(true)
		self["_imageAdd"..index]:addClickEventListenerEx(handler(self, self._onClickAdd))
		if not self._squadAvatarData[index] then
			self._squadAvatarData[index] = {}
		end

		self._squadAvatarData[index].isLock = false			-- 是否锁定
		self._squadAvatarData[index].heroId = 0				-- 武将ID/变身卡ID
		self._squadAvatarData[index].state  = 0 			-- 类型（0武将/1变身卡）
		self._squadAvatarData[index].avatar = nil			-- avatar
		self._squadAvatarData[index].isExchange = false		-- 是否交换
	end
end

-- @Role 	当前阶段已选武将数量
function OwnHeroPickNode:_curStageSelectedPickCount()
	local selectCount = 0
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do	
		if tonumber(self._squadAvatarData[index].heroId) > 0 and self._squadAvatarData[index].isLock == false then
			selectCount = selectCount + 1
		end
	end
	return selectCount
end

-- @Role 	Click
function OwnHeroPickNode:_onClickAdd(sender)
	local ownSign = G_UserData:getSeasonSport():getPrior()
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound)
	if ownSign ~= tonumber(stageInfo.first) then
		G_Prompt:showTip(Lang.get("season_squad_otherround"))
		return
	end

	if self:_curStageSelectedPickCount() >= tonumber(stageInfo.number) and self:_curStageSelectedPickCount() ~= 0 then
		G_Prompt:showTip(Lang.get("season_squad_selectcountenough"))
		return
	end

	self._curSlot = sender:getTag()
	local PopupHeroView = require("app.scene.view.seasonCompetitive.PopupHeroView").new(false, self._curHeroViewTabIndex, handler(self, self._onSelectTab), handler(self, self._onPick))
	PopupHeroView:setCurOwnHeroData(self._squadAvatarData)
	PopupHeroView:openWithAction()
end

function OwnHeroPickNode:_onSelectTab(index)
	self._curHeroViewTabIndex = index
end

function OwnHeroPickNode:_onPick(tabIndex, heroId)
	self:updateUI(heroId, self._curSlot)
end

-- @Role 	Pick
-- @Param 	baseId 武将ID
-- @Param 	pos	 坑位
function OwnHeroPickNode:updateUI(heroId, index)
	--
	self._squadAvatarData[index].isLock = false
	self._squadAvatarData[index].heroId = heroId
	self._squadAvatarData[index].state  = 0
	self._squadAvatarData[index].isExchange = false
	if SeasonSportHelper.isHero(heroId) == false then
		heroId = SeasonSportHelper.getTransformCardsHeroId(heroId)
		self._squadAvatarData[index].state  = 1
	end

	self._curUpdateAvatarHeroId = heroId
	self._curUpdateAvatarIndex	= index

	self["_nodeEffect"..index]:removeAllChildren()
	self:_playWujiangPickAnimation(self["_nodeEffect"..index])
	if self._heroCallback then
		self._heroCallback(false, self._squadAvatarData, false)
	end
	self:_updateAvatar()
end

-- @Role 	Get CurSlot
function OwnHeroPickNode:getCurSlot()
	return self._curSlot
end

-- @Role 	Create Avatar
function OwnHeroPickNode:_createReconnectHeroAvatar(heroId, index)
	local avatar = SquadAvatar.new()
	local posX = self["_heroPedespal"..index]:getPositionX()
	local posY = self["_heroPedespal"..index]:getPositionY()
	avatar:setPositionX(posX)
	avatar:setPositionY(posY)
	avatar:setScale(0.65)

	local limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(heroId)
	avatar:updateUI(heroId, limitLevel)
	return avatar
end

-- @Role 	Create Avatar
function OwnHeroPickNode:_createHeroAvatar(heroId, index)
	local avatar = SquadAvatar.new()
	local posX = self["_heroPedespal"..index]:getPositionX()
	local posY = self["_heroPedespal"..index]:getPositionY()
	avatar:setPositionX(posX)
	avatar:setPositionY(posY)
	avatar:setScale(0.65)

	local limitLevel = SeasonSportHelper.getORedHeroLimitLevelById(self._curUpdateAvatarHeroId)
	avatar:updateUI(heroId, limitLevel)
	return avatar
end

-- @Role 
function OwnHeroPickNode:_onTouch(sender, state)
	if state == ccui.TouchEventType.began then
		local index = self:_checkInCurSlot(sender)
		if index ~= nil then
			self._isTouch = true
			self._originalPos = index

			self._curRound = G_UserData:getSeasonSport():getCurrentRound()
			local avatar = self._squadAvatarData[index].avatar
			local touchBeginPos = self._resourceNode:convertToNodeSpace(sender:getTouchBeganPosition())
			avatar:setPosition(touchBeginPos)
			local selectedAvatarPosX = avatar:getPositionX()
			local selectedAvatarPosY = avatar:getPositionY()
			self._distanceX = selectedAvatarPosX - touchBeginPos.x
			self._distanceY = selectedAvatarPosY - touchBeginPos.y

			--
			self:_onAvatarTouchMove(avatar)
			self:_onCheckOccupiedSlotHighlight(touchBeginPos)
			return true
		end
		self._isTouch = false
		return false
	elseif state == ccui.TouchEventType.moved then
		if self._isTouch then
			local movePos = sender:getTouchMovePosition()
			local localMovePos = self._resourceNode:convertToNodeSpace(movePos)
			local avatarPosX = localMovePos.x + self._distanceX
			local avatarPosY = localMovePos.y + self._distanceY
			self._curTouchAvatar:setPositionX(avatarPosX)
			self._curTouchAvatar:setPositionY(avatarPosY)
			
			--
			self:_onCheckOccupiedSlotHighlight(localMovePos)
		end
	elseif state == ccui.TouchEventType.ended then
		if self._isTouch then
			self:_onAvatarTouchMoveEnd()
		end
	elseif state == ccui.TouchEventType.canceled then
		if self._isTouch then
			self:_onAvatarTouchMoveEnd()
		end
	end
end

-- @Role Get Cur's slot
function OwnHeroPickNode:_checkInCurSlot(sender)
	for index =1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if self._squadAvatarData[index].isLock == false and tonumber(self._squadAvatarData[index].heroId) > 0 then
			if rawget(self._squadAvatarData[index], "avatar") ~= nil then
				local pos = sender:getTouchBeganPosition()
				if self._squadAvatarData[index].avatar:getSpine():getSpineHero() ~= nil then
					local location = self._squadAvatarData[index].avatar:getSpine():getSpineHero():convertToNodeSpace(pos)
					local rect = self._squadAvatarData[index].avatar:getSpine():getSpineHero():getBoundingBox()
					if cc.rectContainsPoint(rect, location) then
						return index
					end
				end
			end
		end
	end
	return nil
end

-- @Role 	Avatar state while touchmove
-- @Param 	target Avatar
function OwnHeroPickNode:_onAvatarTouchMove(target)
	self._curTouchAvatar = target
	self._curTouchAvatar:setScale(0.65)
	self._curTouchAvatar:setOpacity(180)
	self._curTouchAvatar:setLocalZOrder(100)
end

-- @Role 	Judge boundary
-- @Param 	location 当前位置 
function OwnHeroPickNode:_onCheckOccupiedSlotHighlight(location)
	self._targetPos = nil

	local rectLayout = self._resourceNode:getBoundingBox()
	if cc.rectContainsPoint(rectLayout, location) then
		if self._moveOutCallback then
			self._moveOutCallback(true)
		end

		for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
			local image = self["_heroPedespal"..index]
			local addImg = self["_imageAdd"..index]
			local rectImage = image:getBoundingBox()

			if self._squadAvatarData[index].isLock == nil or self._squadAvatarData[index].isLock == false then
                image:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[2]))
                image:ignoreContentAdaptWithSize(true)
				addImg:setVisible(false)
			else
                image:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[1]))
                image:ignoreContentAdaptWithSize(true)
				addImg:setVisible(false)
			end

			-- 落到坑位
			if cc.rectContainsPoint(rectImage, location) and self._squadAvatarData[index].isLock ~= true then
				self._targetPos = index
			end
		end
	else
		-- 落到界外
		if self._moveOutCallback then
			self._moveOutCallback(true)
		end
		for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
			local image = self["_heroPedespal"..index]
            image:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[1]))
            image:ignoreContentAdaptWithSize(true)
		end
		self._targetPos = SeasonSportConst.AVATAR_MOVETARGETPOS_OUT
	end
end

-- @Role 	MoveEnd
function OwnHeroPickNode:_onAvatarTouchMoveEnd()
	-- Moving TimeOut
	if self._curRound ~= G_UserData:getSeasonSport():getCurrentRound() then
		self._targetPos = nil
	end

	-- Situation 1：Avatar move out
	if self._targetPos == SeasonSportConst.AVATAR_MOVETARGETPOS_OUT then
		--
		self._resourceNode:removeChildByName("avatar"..self._originalPos)
		self._squadAvatarData[self._originalPos] = {}
		self._squadAvatarData[self._originalPos].isLock = false
		self._squadAvatarData[self._originalPos].heroId = 0
		self._squadAvatarData[self._originalPos].state  = 0
		self._squadAvatarData[self._originalPos].avatar = nil
		self._squadAvatarData[self._originalPos].isExchange = false
		self:_resetCurSlot()
	-- Situation 2：Avatar move cancel
	elseif self._targetPos == nil then
		--
		self._curSlot = self._originalPos
		self._curTouchAvatar:setScale(0.7)
		self._curTouchAvatar:setOpacity(255)
	-- Situation 3：Avatar move to another slot
	else
		self:_onMovedAvatarInRightScop()
	end

	if self._moveOutCallback then
		self._moveOutCallback(false)
	end
	self:_updateAvatar()
end

-- @Role	 Situation 1
function OwnHeroPickNode:_onMovedAvatarInRightScop()
	--
	if self._targetPos <= SeasonSportConst.HERO_SQUAD_USEABLECOUNT then
		local targetData = self._squadAvatarData[self._targetPos]
		local originalData = self._squadAvatarData[self._originalPos]
		self._squadAvatarData[self._targetPos] = originalData
		self._squadAvatarData[self._originalPos] = targetData
		self._squadAvatarData[self._targetPos].isExchange = true
		self._squadAvatarData[self._originalPos].isExchange = true
		
		if self._squadAvatarData[self._targetPos] and self._squadAvatarData[self._targetPos].avatar then
			self._squadAvatarData[self._targetPos].avatar:setName("avatar"..self._targetPos)
			self._squadAvatarData[self._targetPos].avatar:setTag(self._squadAvatarData[self._targetPos].heroId)
		end
		if self._squadAvatarData[self._originalPos] and self._squadAvatarData[self._originalPos].avatar then
			self._squadAvatarData[self._originalPos].avatar:setName("avatar"..self._originalPos)
			self._squadAvatarData[self._originalPos].avatar:setTag(self._squadAvatarData[self._originalPos].heroId)
		end

		self._curSlot =  self._targetPos
		self._curTouchAvatar:setScale(0.65)
		self._curTouchAvatar:setOpacity(255)
		
		-- 除交换位置外其它状态都重置
		for index =1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
			if index ~= self._targetPos and index ~= self._originalPos then
				self._squadAvatarData[index].isExchange = false
			end
		end

		-- 数据交换要同步
		if self._heroCallback then
			self._heroCallback(false, self._squadAvatarData, true)
		end
	end
end

-- @Role Situation 3
function OwnHeroPickNode:_resetCurSlot()
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if tonumber(self._squadAvatarData[index].heroId) <= 0 then
			self._curSlot = index
			break
		end 
	end

	-- 移除数据要同步
	if self._heroCallback then
		self._heroCallback(false, self._squadAvatarData, false)
	end
end

-- @Role 	Update data
function OwnHeroPickNode:_updateAvatar()
	local ownSign = G_UserData:getSeasonSport():getPrior()
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound)

	for index =1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		local data = self._squadAvatarData[index]
		local avatar = self._resourceNode:getChildByName("avatar"..index)
		if data then
			local image = self["_heroPedespal"..index]
            image:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_SILKBACK[1]))
            image:ignoreContentAdaptWithSize(true)
			if avatar ~= nil then
				avatar:setLocalZOrder(index * 10)
				local posX = image:getPositionX()
				local posY = image:getPositionY()
				avatar:setPositionX(posX)
				avatar:setPositionY(posY)
			end
		end
		--self["_imageAdd"..index]:setVisible(data.avatar == nil or false)
		if ownSign == tonumber(stageInfo.first) then
			if data.avatar == nil and self:_curStageSelectedPickCount() < tonumber(stageInfo.number) then
				self["_imageAdd"..index]:setVisible(true)
			else
				self["_imageAdd"..index]:setVisible(false)
			end
		else
			self["_imageAdd"..index]:setVisible(false)
		end
	end
end



return OwnHeroPickNode