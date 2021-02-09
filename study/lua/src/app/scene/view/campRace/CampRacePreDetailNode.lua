local ViewBase = require("app.ui.ViewBase")
local CampRacePreDetailNode = class("CampRacePreDetailNode", ViewBase)
local CampRaceHeroIcon = require("app.scene.view.campRace.CampRaceHeroIcon")
local TextHelper = require("app.utils.TextHelper")

CampRaceHeroIcon.ZORDER_TOUCH = 100
CampRaceHeroIcon.ZORDER_UNTOUCH = 0

function CampRacePreDetailNode:ctor(pos)
	self._pos = pos
	
	local resource = {
		file = Path.getCSB("CampRacePreDetailNode", "campRace"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
    CampRacePreDetailNode.super.ctor(self, resource)
end

function CampRacePreDetailNode:onCreate()
	self._heroIcons = {}
	self._touchIndex = 0
	self._canEmbattle = true --能否布阵

	if self._pos == 1 then
		self._panelBase:addTouchEventListener(handler(self, self._onTouchEvent))		--只有左边能够换
		for i = 1, 6 do 
			local icon = CampRaceHeroIcon.new(self["_hero"..i])
			self._heroIcons[i] = icon
		end
	else 
		for i = 1, 6 do 
			local icon = CampRaceHeroIcon.new(self["_hero"..i])
			if i < 4 then 
				self._heroIcons[i+3] = icon
			else 
				self._heroIcons[i-3] = icon
			end
		end
	end
end

function CampRacePreDetailNode:onEnter()
end

function CampRacePreDetailNode:onExit()
end

function CampRacePreDetailNode:_checkMoveHit(location)
    self._targetPos = nil
	for i = 1, 6 do
		local rectImage = self._heroIcons[i]:getBoundingBox()
		if cc.rectContainsPoint(rectImage, location) then
            self._targetPos = i
		end
	end
end

function CampRacePreDetailNode:_checkIsSelectedKnight(touchPos)
    for i, v in pairs(self._heroIcons) do 
		local rect = v:getBoundingBox()
		if cc.rectContainsPoint(rect, touchPos) then
			return i 
        end
    end
    return nil
end

function CampRacePreDetailNode:_checkFormation(touchPos)
	if touchPos and self._canEmbattle then 
		for i, v in pairs(self._heroIcons) do 
			local rect = v:getBoundingBox()
			if cc.rectContainsPoint(rect, touchPos) and i ~= self._touchIndex then
				local embattle = G_UserData:getTeam():getEmbattle()
				for index = 1, 6 do 
					if embattle[index] == i then 
						embattle[index] = self._touchIndex
					elseif embattle[index] == self._touchIndex then 
						embattle[index] = i
					end
				end
				G_UserData:getTeam():c2sChangeEmbattle(embattle)
				break
			end
		end
	end
	for i, v in pairs(self._heroIcons) do 
		v:refreshIconPos()
	end
end

function CampRacePreDetailNode:updatePlayer(player)
	if not player then 
		self:_initPlayer(false)
		return
	end
	self:_initPlayer(true)
	self:updateLabel("_textPlayerName", 
	{
		text =  player:getName(),
		color = Colors.getOfficialColor(player:getOfficer_level()),
	})

	local textPower = TextHelper.getAmountText2(player:getPower())
	self._textPower:setString(textPower)
	local formation = player:getFormation()
	for i, id in pairs(formation) do 
		local hero = player:getHeroDataById(id)
		local baseId = hero and hero:getCoverId() or 0
		local rank = hero and hero:getRank_level() or 0
		local limitLevel = hero and hero:getLimitLevel() or 0
		local limitRedLevel = hero and hero:getLimitRedLevel() or 0
		self._heroIcons[i]:updateIcon(baseId, rank, limitLevel, limitRedLevel)
	end

	self._textRank:setString(Lang.get("camp_per_rank", {count = player:getPer_rank()}))

	self._imageFirst:setVisible(player:isFirst_hand())
end

function CampRacePreDetailNode:_initPlayer(isPlayer)
	self._imageFirst:setVisible(isPlayer)
	self._textRank:setVisible(isPlayer)
	if isPlayer then 
		self._textPlayerName:setColor(Colors.getCampWhite())
	else
		self._textPlayerName:setString(Lang.get("camp_no_enemy"))
		self._textPlayerName:setColor(Colors.getCampGray())
		self._textPower:setString("? ? ?")
		for i = 1, 6 do
			self._heroIcons[i]:updateIcon(0)
		end
	end
end

function CampRacePreDetailNode:_onTouchEvent(sender, state)
    if state == ccui.TouchEventType.began then
        local touchPos = self._panelBase:convertToNodeSpace(sender:getTouchBeganPosition())
		local index = self:_checkIsSelectedKnight(touchPos)
		if index and self._canEmbattle then
			self._heroIcons[index]:setIconPosition(touchPos)
			self._heroIcons[index]:setLocalZOrder(CampRaceHeroIcon.ZORDER_TOUCH)
			self._touchIndex = index
			return true
		end
		return false
	elseif state == ccui.TouchEventType.moved then
		if self._touchIndex ~= 0 then 
			local movePos = self._panelBase:convertToNodeSpace(sender:getTouchMovePosition())
			self._heroIcons[self._touchIndex]:setIconPosition(movePos)
		end
	elseif state == ccui.TouchEventType.ended then
		if self._touchIndex ~= 0 then 
			self._heroIcons[self._touchIndex]:setLocalZOrder(CampRaceHeroIcon.ZORDER_UNTOUCH)
			local endPos = self._panelBase:convertToNodeSpace(sender:getTouchEndPosition())
			self:_checkFormation(endPos)
			self._touchIndex = 0
		end
	elseif state == ccui.TouchEventType.canceled then
		if self._touchIndex ~= 0 then 
			self._heroIcons[self._touchIndex]:setLocalZOrder(CampRaceHeroIcon.ZORDER_UNTOUCH)
			self:_checkFormation()
			self._touchIndex = 0
		end
	end
end

function CampRacePreDetailNode:setEmbattleEnable(enable)
	self._canEmbattle = enable
end

return CampRacePreDetailNode