local UniverseRacePlayerNode = class("UniverseRacePlayerNode")
local UniverseRaceConst = require("app.const.UniverseRaceConst")
local UniverseRaceDataHelper = require("app.utils.data.UniverseRaceDataHelper")
local TextHelper = require("app.utils.TextHelper")

function UniverseRacePlayerNode:ctor(target, position, callback)
    self._target = target
	self._position = position
    self._callback = callback
    self._state = 0

    self._imageLargeBg = ccui.Helper:seekNodeByName(self._target, "ImageLargeBg")
    for i = 1, 2 do
        self["_imagePlayerBg"..i] = ccui.Helper:seekNodeByName(self._target, "ImagePlayerBg"..i)
        self["_textServer"..i] = ccui.Helper:seekNodeByName(self._target, "TextServer"..i)
        self["_textName"..i] = ccui.Helper:seekNodeByName(self._target, "TextName"..i)    
		self["_textPower"..i] = ccui.Helper:seekNodeByName(self._target, "TextPower"..i)
		self["_textScore"..i] = ccui.Helper:seekNodeByName(self._target, "TextScore"..i)
    end
	self._imageScore = ccui.Helper:seekNodeByName(self._target, "ImageScore")
	self._textScore = ccui.Helper:seekNodeByName(self._target, "TextScore")
	self._textReady = ccui.Helper:seekNodeByName(self._target, "TextReady")
    self._imageLookBg = ccui.Helper:seekNodeByName(self._target, "ImageLookBg")
    self._imageLookBg:addClickEventListenerEx(handler(self, self._onClick))
    self._imageLookSign = ccui.Helper:seekNodeByName(self._target, "ImageLookSign")
    self._modeMoving = ccui.Helper:seekNodeByName(self._target, "NodeMoving")
end

function UniverseRacePlayerNode:updateUI(userData1, userData2)
    self._state = G_UserData:getUniverseRace():getReportStateWithPosition(self._position)
	
    self._modeMoving:removeAllChildren()
	
    if self._state == UniverseRaceConst.MATCH_STATE_BEFORE then
        self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c3"))
		self._imageLookBg:setTouchEnabled(false)
    elseif self._state == UniverseRaceConst.MATCH_STATE_ING then
        if userData1 or userData2 then
            self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c1"))
            self._imageLookBg:setTouchEnabled(true)
            local raceState = UniverseRaceDataHelper.getRaceStateAndTime()
            if userData1 and userData2 and raceState == UniverseRaceConst.RACE_STATE_ING then
                G_EffectGfxMgr:createPlayMovingGfx(self._modeMoving, "moving_pk_huoyan", nil, nil, false)
            end
        else
            self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c3"))
			self._imageLookBg:setTouchEnabled(false)
        end
    elseif self._state == UniverseRaceConst.MATCH_STATE_AFTER then
        if userData1 or userData2 then
			self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c"))
			self._imageLookBg:setTouchEnabled(true)
		else
			self._imageLookSign:loadTexture(Path.getCampImg("img_camp_player03c2"))
			self._imageLookBg:setTouchEnabled(false)
		end
    end

    self._imageLargeBg:setVisible(false)
    self._imagePlayerBg1:setVisible(false)
    self._imagePlayerBg2:setVisible(false)
	
    if userData1 and userData2 then
        self._imageLargeBg:setVisible(true)
    elseif userData1 then
        self._imagePlayerBg1:setVisible(true)
    elseif userData2 then
        self._imagePlayerBg2:setVisible(true)
    end
    if userData1 or userData2 then
        self._imageLookSign:setVisible(true)
        self._imageLookBg:setVisible(true)
    else
        self._imageLookSign:setVisible(false)
        self._imageLookBg:setVisible(false)
    end

    local updateUser = function(userData, index)
        if userData then
            self["_textServer"..index]:setString(userData:getServer_name())
            self["_textName"..index]:setString(userData:getUser_name())
			local power = TextHelper.getAmountText4(userData:getPower())
			self["_textPower"..index]:setString(power)
			
			local eliminated = userData:isEliminated()
			local officerLevel = userData:getOfficer_level()
			local colorName = Colors.getOfficialColor(officerLevel)
			local colorDes = cc.c3b(0xff, 0xff, 0xff)
			if eliminated then
				colorName = cc.c3b(0xab, 0xab, 0xab)
				colorDes = cc.c3b(0xab, 0xab, 0xab)
			end
			self["_textName"..index]:setColor(colorName)
			self["_textServer"..index]:setColor(colorDes)
			self["_textPower"..index]:setColor(colorDes)
        else
            self["_textServer"..index]:setString("")
            self["_textName"..index]:setString("")
			self["_textPower"..index]:setString("")
        end
    end

    updateUser(userData1, 1)
    updateUser(userData2, 2)
end

function UniverseRacePlayerNode:_onClick()
    if self._callback then
        self._callback(self._position, self._state)
    end
end

function UniverseRacePlayerNode:updateScore(userData1, userData2)
	local groupReport = G_UserData:getUniverseRace():getGroupReportData(self._position)
	local score1 = groupReport and groupReport:getWinNum1() or 0
	local score2 = groupReport and groupReport:getWinNum2() or 0
	if self._state == UniverseRaceConst.MATCH_STATE_AFTER then --比完了
		local color = cc.c3b(0xfe, 0xe1, 0x02) --黄色
		self._imageScore:setVisible(true)
		self._textScore:setVisible(true)
		self._textReady:setVisible(false)
		self._textScore1:setString(score1)
		self._textScore2:setString(score2)
		self._textScore:setColor(color)
		self._textScore1:setColor(color)
		self._textScore2:setColor(color)
	elseif self._state == UniverseRaceConst.MATCH_STATE_ING then --比赛中
		local raceState = UniverseRaceDataHelper.getRaceStateAndTime()
		if raceState == UniverseRaceConst.RACE_STATE_ING then --正在打，显示比分
			local color = cc.c3b(0xa8, 0xff, 0x00) --绿色
			self._imageScore:setVisible(true)
			self._textScore:setVisible(true)
			self._textReady:setVisible(false)
			self._textScore1:setString(score1)
			self._textScore2:setString(score2)
			self._textScore:setColor(color)
			self._textScore1:setColor(color)
			self._textScore2:setColor(color)
		elseif raceState == UniverseRaceConst.RACE_STATE_BREAK then --竞猜阶段，显示准备中
			self._imageScore:setVisible(true)
			self._textScore:setVisible(false)
			self._textReady:setVisible(true)
		end
	else --还没比
		if userData1 and userData2 then
			self._imageScore:setVisible(true)
			self._textScore:setVisible(false)
			self._textReady:setVisible(true)
		else
			self._imageScore:setVisible(false)
		end
	end
end

function UniverseRacePlayerNode:playScoreEffect(side)
	local groupReport = G_UserData:getUniverseRace():getGroupReportData(self._position)
	local score1 = groupReport and groupReport:getWinNum1() or 0
	local score2 = groupReport and groupReport:getWinNum2() or 0
	if side == UniverseRaceConst.SIDE_LEFT then
		self._textScore1:updateTxtValue(score1)
	elseif side == UniverseRaceConst.SIDE_RIGHT then
		self._textScore2:updateTxtValue(score2)
	end
end

return UniverseRacePlayerNode