-- @Author panhoa
-- @Date 8.16.2018
-- @Role

local PopupBase = require("app.ui.PopupBase")
local PopupBattleReportView = class("PopupBattleReportView", PopupBase)
local scheduler = require("cocos.framework.scheduler")
local AudioConst = require("app.const.AudioConst")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function PopupBattleReportView:ctor(isWin, isGotSeasonRewards, isInherits)
	self._imageWin	= nil
	self._imageLose	= nil
	self._effectSpine   = nil
	self._panelSpineUI  = nil
	self._imageStarNum	= nil 	-- 星级
	self._imageDanName  = nil 	-- 称号
	self._imageInHerit	= nil 	-- 赛季继承
	self._reportOk		= nil
	self._textInherit   = nil

	self._isWin 	= isWin
	self._isGotSeasonRewards = isGotSeasonRewards
	self._isInherits = isInherits
	self._intervalTime = 0
	self._isPlayRewardsEffect = false

	self._isPlayAnimation = false
	self._waitingtimePlayAni = 0

	self._isUpdateImageStarBackOpacity = false
	self._updateState = 0
	self._curStar = 0

	self._isInitStarOver = false -- 初始化
	self._popupGetRewards = nil

	local resource = {
		file = Path.getCSB("PopupBattleReportView", "seasonSport"),
		binding = {
			_reportOk = {
				events = {{event = "touch", method = "_onReportOk"}}
			},
		}
	}
	self:setName("PopupBattleReportView")
	PopupBattleReportView.super.ctor(self, resource, false, false)
end

function PopupBattleReportView:onCreate()
	if G_UserData:getSeasonSport():isReceivedRewards() then
		self._curStar = G_UserData:getSeasonSport():getLastSeason_Star()	
	else
		self._curStar = G_UserData:getSeasonSport():getCurSeason_Star()	
	end
	if self._curStar < 1 then self._curStar = 1 end

	self._imageStarNum:setVisible(false)
	self._imageDanName:setVisible(false)
	self:_initView(self._isInherits)
	self:_initDanStarView()
	self:_createHuiZhangSpine()
end

function PopupBattleReportView:onEnter()
	self._getSeasonRewards = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_REWARDS, handler(self, self._onGetSeasonRewards))			-- 领取赛季奖励
	
	if tonumber(self._curStar) > SeasonSportConst.POSITION_HEIGHEST_KINGSTAR then
		self:_initDanStarView()
		self:_playHuiZhangSpine(handler(self, self._updateKingStar))
	else
		self._imageHighest:setVisible(false)
		if self._isInherits then
			self:_playHuiZhangSpine(handler(self, self._updateNormalStarUI))
		else
			self:_playHuiZhangSpine(handler(self, self._initStarUI))
		end
	end
	self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 0.5)
end

function PopupBattleReportView:onExit()
	self._getSeasonRewards:remove()
	self._getSeasonRewards = nil
	if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
	end
	self._countDownScheduler = nil
end

function PopupBattleReportView:_initDanStarView()
	for index = 1, 5 do
		self["_imageStar"..index]:setVisible(false)
	end
end

-- @Role 	徽章spine
function PopupBattleReportView:_createHuiZhangSpine()
	self._effectSpineHuiZhnagNode = require("yoka.node.SpineNode").new(1.0)
	self._effectSpineHuiZhnagNode:setAsset(Path.getSpine("huizhang"))
    self._effectSpineHuiZhnagNode:setVisible(false)
	self._effectSpine:addChild(self._effectSpineHuiZhnagNode)
end

-- @Role 	徽章Play spine
function PopupBattleReportView:_playHuiZhangSpine(callback)
	local state = 0
	local dan = tonumber(SeasonSportHelper.getDanInfoByStar(self._curStar).rank_1)
	if self._curStar > 1 then
		local beforeStar = self._isWin and (self._curStar - 1) or (self._curStar + 1)
		local beforeDan = tonumber(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1)
		local bUp = (dan - beforeDan) == 1 or false
		local bDown = (dan - beforeDan) == -1 or false
		if self._isInherits == false then
			if bUp then
				state = 1
			elseif bDown then
				state = 2
			end
		end
	end
	
	local idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][2]
	self._effectSpineHuiZhnagNode:setVisible(true)
	if state == 1 then	-- 1：跨级升级Spine
		local beforeStar = (self._curStar - 1)
		local beforeDan = tonumber(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1)
		idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[beforeDan][2]
	elseif state == 2 then	-- 2：跨级降级Spine
		local beforeStar = (self._curStar + 1)
		local beforeDan = tonumber(SeasonSportHelper.getDanInfoByStar(beforeStar).rank_1)
		idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[beforeDan][2]
	end

	self._effectSpineHuiZhnagNode:setVisible(true)
	self._effectSpineHuiZhnagNode:setAnimation(idle2, true)
	if callback then
		callback()
	end
end

-- @Role 	跨级升降星专用（后加，为不影响原有结构单独处理）
function PopupBattleReportView:_playDemotionHuizhang(bCrossDemotion, finishCallBack)
	local dan = tonumber(SeasonSportHelper.getDanInfoByStar(self._curStar).rank_1)
	local demotionDan = tonumber(SeasonSportHelper.getDanInfoByStar(self._curStar+1).rank_1)
	local idle1 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][1]
	local idle2 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[dan][2]
	local idle3 = SeasonSportConst.SEASON_REPORT_HUIZHNAG[demotionDan][3]
	local crossIdle = bCrossDemotion and idle3 or idle1

	self._effectSpineHuiZhnagNode:setVisible(true)
	self._effectSpineHuiZhnagNode:setAnimation(crossIdle, false)
	self._effectSpineHuiZhnagNode.signalComplet:addOnce(function()
		self._effectSpineHuiZhnagNode:setAnimation(idle2, true)
		if finishCallBack then
			finishCallBack()
		end
	end)
end

-- @Role 	2: 跨级降星（独立因为self._isInitStarOver）
function PopupBattleReportView:_palyDropAnimation(rootNode)
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		if effect == "effect_huizhangxingxiaoshi" then
			local subEffect = EffectGfxNode.new("effect_huizhangxingxiaoshi")
            subEffect:play()
            return subEffect
		end
	end
	
    local function eventFunction(event)
		if event == "finish" then
			-- TODO::
        end
	end

    G_EffectGfxMgr:createPlayMovingGfx(rootNode, "moving_huizhangxingxiaoshi", effectFunction, eventFunction , false)
end

-- @Role 	升降级
function PopupBattleReportView:_palyRelegationAnimation(rootNode, bInit)
	local function effectFunction(effect)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		if effect == "effect_huizhangxiaoxingxing" then
			local subEffect = EffectGfxNode.new("effect_huizhangxiaoxingxing")
            subEffect:play()
            return subEffect
		elseif effect == "effect_huizhangxingxiaoshi" then
			local subEffect = EffectGfxNode.new("effect_huizhangxingxiaoshi")
            subEffect:play()
            return subEffect
		end
	end
	
    local function eventFunction(event)
		if event == "finish" then
			-- TODO::
			self._isInitStarOver = bInit
        end
	end

	local movingFlash = self._isWin and "moving_huizhangxiaoxingxing" or "moving_huizhangxingxiaoshi"
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, movingFlash, effectFunction, eventFunction , false)
end

-- @Role 	领取赛季奖励后回调
function PopupBattleReportView:setGotSeasonRewardsCloseCallBack(callback)
	self._getSeasonRewardsCallBack = callback
end

-- @Role 	新赛季结算/胜负结算
function PopupBattleReportView:_initView(bInHerit)
	if bInHerit == false then
		self._imageWin:setVisible(self._isWin)
		self._imageLose:setVisible(not self._isWin)
		self._imageInHerit:setVisible(false)
		self._reportOk:setString(Lang.get("season_report_ok"))
	else
		self._imageWin:setVisible(false)
		self._imageLose:setVisible(false)
		self._imageInHerit:setVisible(true)
		if self._isGotSeasonRewards then
			self._reportOk:setString(Lang.get("season_report_continue"))
			self._textInherit:setString(Lang.get("season_lastrewards_got"))
		else
			self._reportOk:setString(Lang.get("season_daily_buy"))
			self._textInherit:setString(Lang.get("season_lastrewards_toget"))
		end
	end
end

-- @Role 	设置星级、称号（王者5星之上专用）
function PopupBattleReportView:_updateKingStar()
	local dan = SeasonSportHelper.getDanInfoByStar(self._curStar)
	local curstar  = tonumber(dan.star2)
	self._imageHighest:setVisible(true)
	self._textHighest:setString(curstar)

	self._imageStarNum:setVisible(true)
	self._imageDanName:setVisible(true)
	self._imageStarNum:loadTexture(Path.getSeasonStar(dan.name_pic))
	self._imageDanName:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[tonumber(dan.rank_1)]))
end

-- @Role 	设置星级、称号（赛季领奖、继承专用）
function PopupBattleReportView:_updateNormalStarUI()
	local dan = SeasonSportHelper.getDanInfoByStar(self._curStar)
	local star_max = tonumber(dan.star_max)
	local curstar  = tonumber(dan.star2)
	
	star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX and SeasonSportConst.SEASON_STAR_WANGZHE_MAX or star_max
	for index = 1, star_max do
		local slot = (star_max == SeasonSportConst.SEASON_STAR_MAX and (index + 1) or index)
		self["_imageStar"..slot]:setVisible(true)
		if index <= curstar then
			self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1]))
		else
			self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
		end
	end

	self._imageStarNum:setVisible(true)
	self._imageDanName:setVisible(true)
	self._imageStarNum:loadTexture(Path.getSeasonStar(dan.name_pic))
	self._imageDanName:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[tonumber(dan.rank_1)]))
end

-- @Role 	设置星级、称号（战斗结算专用）
function PopupBattleReportView:_initStarUI()
	local beforeStar = (self._isWin == true and (self._curStar - 1) or (self._curStar + 1))
	local dan = SeasonSportHelper.getDanInfoByStar(beforeStar)
	local star_max = tonumber(dan.star_max)
	local curstar  = tonumber(dan.star2)

	local beforeState = 0
	self._isInitStarOver = true						  -- 级内初始化：Normal
	if curstar == (star_max - 1) and self._isWin then -- 跨级升星前：Animation_up（one star）
		beforeState = 1
		self._isInitStarOver = false
	elseif curstar == 0 and self._isWin == false then -- 跨级降星前：All Noraml
		beforeState = 2
		self._isInitStarOver = true
	end

	local oriStar = G_UserData:getSeasonSport():getCurSeason_Star()
	star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX and SeasonSportConst.SEASON_STAR_WANGZHE_MAX or star_max
	for index = 1, star_max do
		local slot = (star_max == SeasonSportConst.SEASON_STAR_MAX and (index + 1) or index)
		self["_imageStar"..slot]:setVisible(true)
		self["_imageStar"..slot]:removeAllChildren()

		if beforeState == 2 then
			self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
		else
			if index <= curstar then
				if beforeState == 0 then
					if oriStar == 0 then
						self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))	
					else
						self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1]))	
					end
				end
			else
				if beforeState == 1 then
					if index == star_max then
						self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
						G_AudioManager:playSoundWithId(AudioConst.SOUND_SEASON_STAR_RISE)
						self:_palyRelegationAnimation(self["_imageStar"..slot], true)
					end
				else
					self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
				end
			end
		end
	end

	self._imageStarNum:setVisible(true)
	self._imageDanName:setVisible(true)
	self._imageStarNum:loadTexture(Path.getSeasonStar(dan.name_pic))
	self._imageDanName:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[tonumber(dan.rank_1)]))
end

-- @Role 	设置变化之前星级、称号（战斗结算专用）
function PopupBattleReportView:_updateBeforeStarUI()
	local beforeStar = (self._isWin == true and (self._curStar - 1) or (self._curStar + 1))
	local dan = SeasonSportHelper.getDanInfoByStar(beforeStar)
	local star_max = tonumber(dan.star_max)
	local curstar  = tonumber(dan.star2)
	self:_initDanStarView()

	if curstar == (star_max - 1) and self._isWin then -- 跨级升星：渐隐——>update_Now
		star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX and SeasonSportConst.SEASON_STAR_WANGZHE_MAX or star_max
		for index = 1, star_max do
			local slot = (star_max == SeasonSportConst.SEASON_STAR_MAX and (index + 1) or index)
			self["_imageStar"..slot]:setVisible(false)
		end
		self._isUpdateImageStarBackOpacity = true
		self._updateState = 3
	elseif curstar == 0 and self._isWin == false then -- 跨级降星：渐隐——>update_Now
		self._isUpdateImageStarBackOpacity = true
		self._updateState = 4
	else
		local state = (self._isWin and 1 or 2)		  -- 级内升降星：update_Now
		self:_updateStarUI(state)
	end
end

-- @Role 	设置星级、称号（战斗结算专用）
function PopupBattleReportView:_updateStarUI(state)
	local dan = SeasonSportHelper.getDanInfoByStar(self._curStar)
	local star_max = tonumber(dan.star_max)
	local curstar  = tonumber(dan.star2)

	local function updateBaseInfo(dan)
		self._imageStarNum:setVisible(true)
		self._imageDanName:setVisible(true)
		self._imageStarNum:loadTexture(Path.getSeasonStar(dan.name_pic))
		self._imageDanName:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[tonumber(dan.rank_1)]))
	end

	star_max = star_max > SeasonSportConst.SEASON_STAR_WANGZHE_MAX and SeasonSportConst.SEASON_STAR_WANGZHE_MAX or star_max
	if state == 4 then					   -- 4: 跨级降星：Normal_No_Ani
		local function crossDemotion()
			for index = 1, star_max do
				local slot = (star_max == SeasonSportConst.SEASON_STAR_MAX and (index + 1) or index) 	-- 级内最大3星需要调整位置
				self["_imageStar"..slot]:setVisible(true)
				self["_imageStar"..slot]:removeAllChildren()
				if index == star_max then
					self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
					G_AudioManager:playSoundWithId(AudioConst.SOUND_SEASON_STAR_DROP)
					self:_palyDropAnimation(self["_imageStar"..slot])
				else
					self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1]))
				end
			end
			updateBaseInfo(dan)
		end
		G_AudioManager:playSoundWithId(AudioConst.SOUND_SEASON_DOWNGRADE)
		self:_playDemotionHuizhang(true, crossDemotion)
	elseif state == 3 then				   -- 3: 跨级升星：Normal_No_Ani
		local function crossUpgrade()
			for index = 1, star_max do
				local slot = (star_max == SeasonSportConst.SEASON_STAR_MAX and (index + 1) or index) 	-- 级内最大3星需要调整位置
				self["_imageStar"..slot]:setVisible(true)
				self["_imageStar"..slot]:removeAllChildren()
				if index <= curstar then
					self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1]))	
				else
					self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
				end
			end
			updateBaseInfo(dan)
		end
		G_AudioManager:playSoundWithId(AudioConst.SOUND_SEASON_UPGRADE)
		self:_playDemotionHuizhang(false, crossUpgrade)
	else									-- 1/2：级内升降星
		for index = 1, star_max do
			local slot = (star_max == SeasonSportConst.SEASON_STAR_MAX and (index + 1) or index) 	-- 级内最大3星需要调整位置
			self["_imageStar"..slot]:setVisible(true)
			self["_imageStar"..slot]:removeAllChildren()
			if index <= curstar then
				if index == curstar then
					if state == 1 then     						-- 1: 级内升星：Animation_up
						self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
						G_AudioManager:playSoundWithId(AudioConst.SOUND_SEASON_STAR_RISE)
						self:_palyRelegationAnimation(self["_imageStar"..slot], false)
					elseif state == 2 then 						-- 2：级内降星：Light_Star
						self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[1]))
					end
				end
			else
				if state == 2 and index == (curstar + 1) then 	-- 2: 级内降星：Animation_drop
					local oriStar = G_UserData:getSeasonSport():getCurSeason_Star()
					self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
					if oriStar ~= 0 then
						G_AudioManager:playSoundWithId(AudioConst.SOUND_SEASON_STAR_DROP)
						self:_palyRelegationAnimation(self["_imageStar"..slot], false)
					end
				else
					self["_imageStar"..slot]:loadTexture(Path.getSeasonDan(SeasonSportConst.SEASON_STARPNG[2]))
				end
			end
		end
		updateBaseInfo(dan)
	end
end

-- @Role 
function PopupBattleReportView:_onReportOk()
	if not self._isGotSeasonRewards then
		G_UserData:getSeasonSport():c2sFightsBonus(3, 0)
		return
	end 

	G_UserData:getSeasonSport():c2sFightsEntrance()
	self:close()
end

function PopupBattleReportView:_onGetSeasonRewards(id, message)
	if message.bonus_type ~= 3 then
        return
	end

	local function finishCallBack()
		self._intervalTime = 0
		self._popupGetRewards = nil
		self._isPlayRewardsEffect = true
	end
	if self._popupGetRewards ~= nil then
		-- TODO：防止事件分发两次
		return
	end

	self._reportOk:setVisible(false)
	self._popupGetRewards = require("app.ui.PopupGetRewards").new()
	self._popupGetRewards:showRewards(message.awards, finishCallBack)
end

-- @Role 	渐隐
function PopupBattleReportView:_updateFadeIn()
	local callAction = cc.CallFunc:create(function()
		self:_updateStarUI(self._updateState)
	end)
	local action = cc.FadeIn:create(0.5)
	local runningAction = cc.Sequence:create(cc.DelayTime:create(0.05), action, callAction)
	self._panelSpineUI:setOpacity(0)
	self._panelSpineUI:runAction(runningAction)
end

-- @Role 	Update
function PopupBattleReportView:_update(dt)
	if self._isPlayAnimation == false and self._isInitStarOver then	-- 先初始化
		if self._waitingtimePlayAni > 0.2 then
			self._isPlayAnimation = true
			self._isInitStarOver = false
			self._waitingtimePlayAni = 0
			self:_updateBeforeStarUI()
		end
		self._waitingtimePlayAni = (self._waitingtimePlayAni + dt)
	end

	if self._isUpdateImageStarBackOpacity == true then
		self._isUpdateImageStarBackOpacity = false
		self:_updateFadeIn()
	end

	if self._isPlayRewardsEffect then
		if self._intervalTime > 0.1 then
			self._isPlayRewardsEffect = false
			self:close()
			G_SignalManager:dispatch(SignalConst.EVENT_SEASONSPORT_AWARDS)
			return
		end
		self._intervalTime = self._intervalTime + dt
	end
end


return PopupBattleReportView