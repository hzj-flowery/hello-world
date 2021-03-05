-- Author: hedili
-- Date:2018-04-19 14:10:18
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local RunningManAvatar = class("RunningManAvatar", ViewBase)
local RunningManConst = require("app.const.RunningManConst")
local RunningManHelp = import(".RunningManHelp")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
function RunningManAvatar:ctor()
	--csb bind var name
	self._panelbk = nil --Panel
	self._commonTalk = nil
	self._betFlag = nil
	self._avatarName = nil
	local resource = {
		file = Path.getCSB("RunningManAvatar", "runningMan")
	}
	RunningManAvatar.super.ctor(self, resource)
end

-- Describle：
function RunningManAvatar:onCreate()
	self._commonTalk:setVisible(false)
	self._betFlag:setVisible(false)
end

-- Describle：
function RunningManAvatar:onEnter()
	self._isOpeningChat = false

	--两秒后再显示聊天内容
	local interval = math.random(RunningManConst.BUBBLE_START_TIME_MIN, RunningManConst.BUBBLE_START_TIME_MAX)
	local delay = cc.DelayTime:create(interval)
	local sequence =
		cc.Sequence:create(
		delay,
		cc.CallFunc:create(
			function()
				self._isOpeningChat = true
			end
		)
	)
	self:runAction(sequence)
end

-- Describle：
function RunningManAvatar:onExit()
end

--[[
		temp.heroId = value.hero_id
		temp.heroWinRate = value.hero_win_rate
		temp.heroBetRate = value.hero_bet_rate--英雄投注率
		temp.heroOdds = value.hero_odds / 10 --英雄赔率 赔率需要除10
		temp.roadNum = value.road_num--跑到信息
		temp.isPlayer = value.is_player
		temp.user = value.user
]]
function RunningManAvatar:_procPlayerInfo(betInfo)
	-- body
	local isPlayer = betInfo.isPlayer
	if isPlayer == nil or isPlayer == 0 then
		return
	end

	local simpleUser = betInfo.user
	dump(simpleUser)
	self:updateLabel(
		"_avatarName",
		{
			text = simpleUser.name,
			color = Colors.getOfficialColor(simpleUser.office_level),
			outlineColor = Colors.getOfficialColorOutline(simpleUser.office_level)
		}
	)
	
	self._commonHeroAvatar:updateAvatar(simpleUser.playerInfo)
end

function RunningManAvatar:updateUI(betInfo)
	-- body
	dump(betInfo)
	local isPlayer = betInfo.isPlayer
	if isPlayer == 1 then
		self:_procPlayerInfo(betInfo)
	else
		local typeHeroInfo = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, betInfo.heroId)
		self._commonHeroAvatar:updateUI(betInfo.heroId)
		self:updateLabel(
			"_avatarName",
			{
				text = typeHeroInfo.name,
				color = typeHeroInfo.icon_color,
				outlineColor = typeHeroInfo.icon_color_outline
			}
		)
	end

	self._baseId = betInfo.heroId
	self._betInfo = betInfo
	self._avatarIndex = betInfo.roadNum
	local title = betInfo.user and betInfo.user.title or 0
	self._commonHeroAvatar:showTitle(betInfo.user.title or 0, self.__cname) -- 显示称号
end

function RunningManAvatar:setAvatarScale(scale)
	-- body
	self._commonHeroAvatar:setScale(scale)
	self._commonTalk:setScale(scale)
end

function RunningManAvatar:getHeroId(...)
	-- body
	return self._baseId
end

--跑步状态
function RunningManAvatar:playRunning()
	-- body
	self._commonHeroAvatar:setAniTimeScale(RunningManConst.RUNNING_ANIMATION_SPEED)
	self._commonHeroAvatar:setAction("run", true)
end

function RunningManAvatar:playIdle()
	-- body
	self._commonHeroAvatar:setAniTimeScale(1)
	self._commonHeroAvatar:setAction("idle", true)
end

function RunningManAvatar:_updateBetFlag(...)
	-- body
	self._betFlag:setVisible(false)
	local betNum = G_UserData:getRunningMan():getHeroBetNum(self._baseId)
	if betNum > 0 then
		self._betFlag:setVisible(true)
	end
end

--将角色重置初始位置
function RunningManAvatar:resetAvatar(...)
	-- body
	local avatarInfo = RunningManConst["AVATA_INFO" .. self._avatarIndex]
	self:stopAllActions()
	self:setPosition(avatarInfo.startPos)
	self:setAvatarScale(avatarInfo.scale)
	self._isOpeningChat = true
end

function RunningManAvatar:playRunningAndIdle(...)
	-- body
	if self._avatarIndex == nil then
		return
	end

	self._isOpeningChat = false
	local function callback(...)
		self._commonHeroAvatar:setAction("idle", true)
		self._isOpeningChat = true
	end

	local avatarInfo = RunningManConst["AVATA_INFO" .. self._avatarIndex]
	local callFuncAction = cc.CallFunc:create(callback)
	self:setPosition(cc.p(0, avatarInfo.startPos.y))
	local moveAction = cc.MoveTo:create(RunningManConst.RUNNING_MOVE_ACTION_TIME, avatarInfo.startPos)
	local seq = cc.Sequence:create(moveAction, callFuncAction)
	self._commonHeroAvatar:setAction("run", true)
	self:setAvatarScale(avatarInfo.scale)
	self:runAction(seq)
end

function RunningManAvatar:playWaitChat(...)
	-- body
	self:_updateBetFlag()
	if self._isOpeningChat == false then
		return
	end
	if self._commonTalk:isVisible() == true then
		return
	end

	local talkText = nil
	if self._betInfo.isPlayer == 1 then
		talkText = G_UserData:getRunningMan():getPlayerWaitTalkStr(self._betInfo.powerRank)
	else
		talkText = G_UserData:getRunningMan():getWaitTalkStr(self._baseId)
	end

	if talkText == nil then
		return
	end

	--说过了，就不显示了
	if talkText == self._commonTalk:getTalkString() then
		return
	end

	local avatarInfo = RunningManConst["AVATA_INFO" .. self._avatarIndex]
	self._commonTalk:setPosition(avatarInfo.chatPos)

	self._commonTalk:setVisible(true)
	self._commonTalk:setText(talkText, 200, true)
	local interval = math.random(RunningManConst.BUBBLE_SHOW_TIME_MIN, RunningManConst.BUBBLE_SHOW_TIME_MAX)
	local delay = cc.DelayTime:create(interval)
	local sequence =
		cc.Sequence:create(
		delay,
		cc.CallFunc:create(
			function()
				self._commonTalk:setVisible(false)
			end
		)
	)

	self:runAction(sequence)
end

--播放跑步聊天
function RunningManAvatar:playRuningChat(...)
	-- body
	self:_updateBetFlag()

	if self._isOpeningChat == false then
		return
	end

	if self._commonTalk:isVisible() == true then
		return
	end
	local avatarInfo = RunningManConst["AVATA_INFO" .. self._avatarIndex]
	self._commonTalk:setPosition(avatarInfo.chatPos)
	local runningRank = RunningManHelp.getRunningRank(self._baseId)

	local talkText = G_UserData:getRunningMan():getRunningTalkStr(runningRank)
	if talkText == nil then
		return
	end
	--说过了，就不显示了
	if talkText == self._commonTalk:getTalkString() then
		return
	end

	self._commonTalk:setVisible(true)
	self._commonTalk:setText(talkText, 200, true)

	local interval = math.random(RunningManConst.BUBBLE_SHOW_TIME_MIN, RunningManConst.BUBBLE_SHOW_TIME_MAX)
	local delay = cc.DelayTime:create(interval)
	local sequence =
		cc.Sequence:create(
		delay,
		cc.CallFunc:create(
			function()
				self._commonTalk:setVisible(false)
			end
		)
	)

	self:runAction(sequence)
end

return RunningManAvatar
