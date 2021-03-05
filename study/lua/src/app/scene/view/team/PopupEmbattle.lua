-- 布阵界面
-- Author: Liangxu
-- Date: 2017-02-23 11:25:46
--
local PopupBase = require("app.ui.PopupBase")
local PopupEmbattle = class("PopupEmbattle", PopupBase)
local CSHelper  = require("yoka.utils.CSHelper")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

local IMAGE_STATE_NORMAL = 0 --布阵底图显示状态，未选中
local IMAGE_STATE_SELECTED = 1 --布阵底图显示状态，选中

local IMAGE_NORMAL_RES = "img_embattleherbg_nml" --普通的图
local IMAGE_OVER_RES = "img_embattleherbg_over" --高亮的图

function PopupEmbattle:ctor()
	local resource = {
		file = Path.getCSB("PopupEmbattle", "team"),
		binding = {
			_buttonClose = {
				events = {{event = "touch", method = "_onButtonClose"}}
			},
		}
	}
	PopupEmbattle.super.ctor(self, resource)
end

function PopupEmbattle:onCreate()
	self._embattleCopy = {} --布阵数据
	self._embattleMapping = {} --映射表，key-布阵位 value-阵容位
	self._embattlePos2Data = {}
	self._imageState = {} --布阵位底图显示状态
	self._originalPos = nil
	self._targetPos = nil
	self._isTouch = false

	self._panelKnightBg:setSwallowTouches(false)
end

function PopupEmbattle:onEnter()
	self._embattleCopy = clone(G_UserData:getTeam():getEmbattle())
	self:_initKnights()

	self._panelKnightBg:addTouchEventListener(handler(self, self._onTouchEvent))
end

function PopupEmbattle:onClose()
	if self:_checkIsChanged() then
		G_UserData:getTeam():c2sChangeEmbattle(self._embattleCopy)
	end
end

function PopupEmbattle:onExit()

end

--获取布阵位对应阵容位的映射表 {key-布阵位, value-阵容位}
function PopupEmbattle:getEmbattleMappingTable()
	local result = {}
	for i, embattlePos in ipairs(self._embattleCopy) do
		if embattlePos > 0 then
			result[embattlePos] = i
		end
	end
	return result
end

function PopupEmbattle:_initKnights()
	self._embattleMapping = self:getEmbattleMappingTable()

	for i = 1, 6 do
		local imagePos = self["_imageKnightPos"..i]
		imagePos:loadTexture(Path.getEmbattle(IMAGE_NORMAL_RES))
		self._imageState[i] = IMAGE_STATE_NORMAL

		local lineupPos = self._embattleMapping[i]
		if lineupPos then
			local avatar = self:_createHeroAvatar(lineupPos)
			avatar:setPosition(cc.p(imagePos:getPositionX() + 100, imagePos:getPositionY() + 50))
			self._panelKnightBg:addChild(avatar, i * 10)

			if not self._embattlePos2Data[i] then
				self._embattlePos2Data[i] = {}
			end
			self._embattlePos2Data[i].spine = avatar
			self._embattlePos2Data[i].lineupPos = lineupPos
		end
	end
end

function PopupEmbattle:_createHeroAvatar(lineupPos)
	local heroId = G_UserData:getTeam():getHeroIdWithPos(lineupPos)
	local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
	local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(heroUnitData)
	local avatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
	local limitLevel = avatarLimitLevel or heroUnitData:getLimit_level()
	local limitRedLevel = arLimitLevel or heroUnitData:getLimit_rtg()
	avatar:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
	avatar:showAvatarEffect(isEquipAvatar)

	return avatar
end

function PopupEmbattle:_updateKnights()
	for i = 1, 6 do
		local data = self._embattlePos2Data[i]
		if data then
			local imagePos = self["_imageKnightPos"..i]
			self._imageState[i] = IMAGE_STATE_NORMAL
			imagePos:loadTexture(Path.getEmbattle(IMAGE_NORMAL_RES))
			data.spine:setPosition(cc.p(imagePos:getPositionX() + 100, imagePos:getPositionY() + 50))
			data.spine:setLocalZOrder(i * 10)
		end
	end
end

function PopupEmbattle:_onButtonClose()
	self:close()
end

function PopupEmbattle:_onTouchEvent(sender, state)
	if state == ccui.TouchEventType.began then
		local index = self:_checkIsSelectedKnight(sender)
		if index then
			self._isTouch = true
			self._originalPos = index

			local spine = self._embattlePos2Data[index].spine
			local touchBeginPos = self._panelKnightBg:convertToNodeSpace(sender:getTouchBeganPosition())
			spine:setPosition(touchBeginPos)
			local selectedKnightPos = cc.p(spine:getPosition())
			self._distanceX = selectedKnightPos.x - touchBeginPos.x
			self._distanceY = selectedKnightPos.y - touchBeginPos.y
			self:_onKnightSelected(spine)

			self:_checkMoveHit(touchBeginPos)
			return true
		end
		self._isTouch = false
		return false
	elseif state == ccui.TouchEventType.moved then
		if self._isTouch then
			local movePos = sender:getTouchMovePosition()
			local localMovePos = self._panelKnightBg:convertToNodeSpace(movePos)
			local spinePosX = localMovePos.x + self._distanceX
			local spinePosY = localMovePos.y + self._distanceY
			self._curSelectedKnightSpine:setPosition(cc.p(spinePosX, spinePosY))

			self:_checkMoveHit(localMovePos)
		end
	elseif state == ccui.TouchEventType.ended then
		if self._isTouch then
			self:_onKnightUnselected()
		end

	elseif state == ccui.TouchEventType.canceled then
		if self._isTouch then
			self:_onKnightUnselected()
		end
	end
end

function PopupEmbattle:_onKnightSelected(target)
	self._curSelectedKnightSpine = target
	self._curSelectedKnightSpine:setScale(1.12)
	self._curSelectedKnightSpine:setOpacity(180)
	self._curSelectedKnightSpine:setLocalZOrder(100)
end

function PopupEmbattle:_onKnightUnselected()
	if self._targetPos then
		local targetData = self._embattlePos2Data[self._targetPos]
		local originalData = self._embattlePos2Data[self._originalPos]
		self._embattlePos2Data[self._targetPos] = originalData
		self._embattlePos2Data[self._originalPos] = targetData

		local embattleMapping = {}
		for i = 1, 6 do
			local data = self._embattlePos2Data[i]
			if data then
				embattleMapping[i] = data.lineupPos
			end
		end

		local result = {}
		for k, lineupPos in pairs(embattleMapping) do
			result[lineupPos] = k
		end
		for i = 1, 6 do
			if not result[i] then
				result[i] = 0
			end
		end
		self._embattleCopy = result
	end

	self._curSelectedKnightSpine:setScale(1.0)
	self._curSelectedKnightSpine:setOpacity(255)

	self:_updateKnights()
end

function PopupEmbattle:_getEmbattlePosWithSpine(knight)
	for k, data in pairs(self._embattlePos2Data) do
		if data.spine == knight then
			return k
		end
	end
	return nil
end

function PopupEmbattle:_checkIsSelectedKnight(sender)
	local pos = sender:getTouchBeganPosition()
	for k, data in pairs(self._embattlePos2Data) do
		local location = data.spine:getClickPanel():convertToNodeSpaceAR(pos)
		local rect = data.spine:getClickPanel():getBoundingBox()
		if cc.rectContainsPoint(rect, location) then
			return k
		end
	end
	return nil
end

function PopupEmbattle:_checkMoveHit(location)
	self._targetPos = nil

	for i = 1, 6 do
		local image = self["_imageKnightPos"..i]
		local rectImage = image:getBoundingBox()
		if cc.rectContainsPoint(rectImage, location) then
			if self._imageState[i] == IMAGE_STATE_NORMAL then
				self._imageState[i] = IMAGE_STATE_SELECTED
				image:loadTexture(Path.getEmbattle(IMAGE_OVER_RES))
			end
			self._targetPos = i
		else
			if self._imageState[i] == IMAGE_STATE_SELECTED then
				self._imageState[i] = IMAGE_STATE_NORMAL
				image:loadTexture(Path.getEmbattle(IMAGE_NORMAL_RES))
			end
		end
	end
end

function PopupEmbattle:_checkIsChanged()
	local embattle = G_UserData:getTeam():getEmbattle()
	for i = 1, 6 do
		if embattle[i] ~= self._embattleCopy[i] then
			return true
		end
	end
	return false
end

return PopupEmbattle
