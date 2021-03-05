-- @Author panhoa
-- @Date 8.16.2018
-- @Role SquadSelectView

local ViewBase = require("app.ui.ViewBase")
local SquadSelectView = class("SquadSelectView", ViewBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local TopBarStyleConst = require("app.const.TopBarStyleConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local SeasonDanInfoNode = require("app.scene.view.seasonCompetitive.SeasonDanInfoNode")
local OwnHeroPickNode = require("app.scene.view.seasonCompetitive.OwnHeroPickNode")
local OtherHeroPickNode = require("app.scene.view.seasonCompetitive.OtherHeroPickNode")
local SilkSelectView = require("app.scene.view.seasonCompetitive.SilkSelectView")
local scheduler = require("cocos.framework.scheduler")


function SquadSelectView:ctor()
	self._ownInfoContainer		= nil	-- 本方段位信息
	self._otherInfoContainer	= nil	-- 对方段位信息
	self._ownDanNode			= nil	-- 本方段位节点
	self._otherDanNode			= nil	-- 对方段位节点

	self._ownSquadContainer		= nil	-- 本方上阵坑位
	self._otherSquadContainer	= nil	-- 对方上阵坑位
	self._ownSquadNode			= nil	-- 本方上阵节点
	self._otherSquadNode		= nil	-- 对方上阵节点
	self._nodeCountAniOwn1		= nil
	self._nodeCountAniOther1	= nil
	self._nodeCountAniOwn2		= nil
	self._nodeCountAniOther2	= nil

	self._countDownAnimation 	= nil	-- 倒计时（动画
	self._textSquadCountTip		= nil	-- 武将上阵数量提示
	self._imageHeroOutShade		= nil	-- 武将界外shade
	self._popupHeroView			= nil
	self._textSquadDragTip      = nil
	self._textWaitingSecondsOwn= nil
	self._textWaitingSecondsOther= nil
	self._imageMaskOwn			= nil
	self._imageMaskOther		= nil
	self._btnLock				= nil
	self._nodeLockEffect		= nil
	self._imagePetBackGroud		= nil
	self._panelBanPick			= nil	-- 搬选展示面板
    self._panelOtherBan         = nil	-- 对方搬选面板
    self._panelPetTouch         = nil   -- ban神兽遮罩

	self._squadAvatarData		= {}
	self._seasonPets			= {}
	self._bindSilkData			= {}	-- 记录预设的锦囊设置
	self._bindPetData			= {}	-- 绑定神兽
    self._banHeroData			= {}	-- 搬选武将
    self._banPetId			    = 0	    -- 搬选神兽
	self._isFightStage			= false -- 是否决战准备阶段
	self._seasonOffLineWait 	= 0		-- 断线重连等待

	----------------------------------------------------
	self._curHeroViewTabIndex   = 1	-- 记录选择的国家
	self._isPopBanPickView 		= false
	self._popBanPickIntervel    = 0
	self._isSendBaned			= false
	
    local resource = {
        file = Path.getCSB("SquadSelectView", "seasonCompetitive"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
			_btnLock = {
				events = {{event = "touch", method = "_onBtnLock"}}
			},
		}
    }
	self:setName("SquadSelectView")
    SquadSelectView.super.ctor(self, resource)
end

function SquadSelectView:onCreate()	
	self._imageHeroOutShade:setVisible(false)
	self._imageHeroOutShade:setSwallowTouches(true)
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	local isBan = G_UserData:getSeasonSport():isBanPick()
	local show = curRound==0 and isBan
	self._panelPetTouch:setVisible(show)
	self._btnLock:setString(Lang.get("season_squad_lock"))
	G_UserData:getSeasonSport():setInSquadSelectView(true)

    self:_initBanHeroData()
    self:_initBanPetData()
	self:_initBindPetData()
	self:_initOwnSquadHeroData()
	self:_initBindSilkToHeroData()
	self:_initSilkBindingData()	
	-- 
	self:_initDanInfo()
	self:_initSquadInfo()
end

-- @Role Enter
function SquadSelectView:onEnter()
	self._signalFightsBanCheck 	 = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_HEROS_BAN, handler(self, self._onEventFightsBanCheck))		-- 搬选武将
	self._signalFightsBanWaiting = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_WAITING_BAN, handler(self, self._onEventFightsBanWaiting))	-- 搬选等待
	self._signalHerosPitchSuccess= G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_HEROS_PITCH, handler(self, self._onEventHerosPitchSuccess))-- 武将上阵
	self._signalBindingSilkSucess= G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_BINDINGOK, handler(self, self._onEventBindingSuccess))	    -- 绑定回来再发战斗
	self._signalForeground  	 = G_SignalManager:add(SignalConst.EVENT_MAY_ENTER_FOREGROUND, handler(self, self._onEventForeground))		    -- 后台切前台
	self._signalReconnect  		 = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_RECONNECT, handler(self, self._onEventReconnect))			-- 断线重连
	self._signalFightsOver  	 = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_RECONNECT_OVER, handler(self, self._onEventReconnectWhileOver))-- 断线重连
	self._signalFightsFight    	 = G_NetworkManager:add(MessageIDConst.ID_S2C_FightsFight,   handler(self, self._s2cFightsFight))			    -- 战斗

	self._ownSign 		= G_UserData:getSeasonSport():getPrior()
	self._countDownTime = G_UserData:getSeasonSport():getCurrentRound_EndTime()
	self._seasonPets	= G_UserData:getSeasonSport():getSeasonPets()

	self:_initPetAdd()
	self:_initBaseView()
	self:_initBindPetInView()
	self:_initSilkGroupName()
	self:_updateDanInfo()
	self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._update), 0.5)
end

-- @Role Exit
function SquadSelectView:onExit()
	self._signalFightsBanCheck:remove()
	self._signalFightsBanWaiting:remove()
	self._signalHerosPitchSuccess:remove()
	self._signalBindingSilkSucess:remove()
	self._signalForeground:remove()
	self._signalReconnect:remove()
	self._signalFightsOver:remove()
	self._signalFightsFight:remove()

	self._signalFightsBanCheck 	= nil
	self._signalFightsBanWaiting  = nil
	self._signalHerosPitchSuccess = nil
	self._signalBindingSilkSucess = nil
	self._signalForeground  = nil
	self._signalReconnect			= nil
	self._signalFightsOver		= nil
	self._signalFightsFight		= nil
	self._nodeCountAniOwn1:stopAllActions()
	self._nodeCountAniOwn2:stopAllActions()
	self._nodeCountAniOther1:stopAllActions()
	self._nodeCountAniOther2:stopAllActions()

	if self._countDownScheduler then
		scheduler.unscheduleGlobal(self._countDownScheduler)
		self._countDownScheduler = nil
	end

	self:_initOwnSquadHeroData()
	G_UserData:getSeasonSport():setOwn_SquadInfo(nil)
	G_UserData:getSeasonSport():setOther_SquadInfo(nil)
	G_UserData:getSeasonSport():setInSquadSelectView(false)
end

------------------------------------------------------------------------
-- @Role 	先手动画特效
function SquadSelectView:_palyProiorAnimation(rootNode, bOwnIsProir, callback)
	local function effectFunction(effect)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		if effect == "effect_wuchabiebuzhen_xianshouleft" then
			local subEffect = EffectGfxNode.new("effect_wuchabiebuzhen_xianshouleft")
            subEffect:play()
			return subEffect
		elseif effect == "effect_wuchabiebuzhen_xianshouright" then
			local subEffect = EffectGfxNode.new("effect_wuchabiebuzhen_xianshouright")
            subEffect:play()
			return subEffect
		end
    end
    local function eventFunction(event)
        if event == "finish" then
			if callback then
				callback()
			end
        end
	end
	
	local movingFlash = bOwnIsProir and "moving_wuchabiebuzhen_xianshouleft" or "moving_wuchabiebuzhen_xianshouright"
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, movingFlash, effectFunction, eventFunction , false)
end

-- @Role 	初始布阵时间动画
function SquadSelectView:_initSquadTime()
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	if curRound == SeasonSportHelper.getMaxFightStage() then
		return
	end

	local ownDanInfo = G_UserData:getSeasonSport():getOwn_DanInfo()
	local otherDanInfo = G_UserData:getSeasonSport():getOther_DanInfo()
	local bBanPick      = G_UserData:getSeasonSport():isBanPick()
	if bBanPick then
		self._nodeCountAniOwn1:setVisible(true)
		self._nodeCountAniOther1:setVisible(true)
		self._nodeCountAniOwn2:setVisible(true)
		self._nodeCountAniOther2:setVisible(true)

		self._nodeCountAniOwn2:removeAllChildren()
		self._nodeCountAniOther2:removeAllChildren()
		self:_palyOwnAnimation(self._nodeCountAniOwn2, 2)
		self:_palyOtherAnimation(self._nodeCountAniOther2, 2)
	else
		local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound) 
		self._nodeCountAniOwn1:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._nodeCountAniOther1:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
		if self._ownSign == tonumber(stageInfo.first) then
			self._nodeCountAniOwn1:removeAllChildren()
			self:_palyOwnAnimation(self._nodeCountAniOwn1, 1, handler(self, self._updateSquadTime))
		else
			self._nodeCountAniOther1:removeAllChildren()
			self:_palyOtherAnimation(self._nodeCountAniOther1, 1, handler(self, self._updateSquadTime))
		end
	end
end

-- @Role 	刷新布阵时间动画
function SquadSelectView:_updateSquadTime(dt)
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	if curRound == SeasonSportHelper.getMaxFightStage() then
		return
	end
	
	local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound) 
	self._nodeCountAniOwn2:setVisible(self._ownSign == tonumber(stageInfo.first))
	self._nodeCountAniOther2:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
	if self._ownSign == tonumber(stageInfo.first) then
		self._nodeCountAniOwn2:removeAllChildren()
		self:_palyOwnAnimation(self._nodeCountAniOwn2, 2)
	else
		self._nodeCountAniOther2:removeAllChildren()
		self:_palyOtherAnimation(self._nodeCountAniOther2, 2)
	end
end

-- @Role 	蓝方状态动画特效
function SquadSelectView:_palyOwnAnimation(rootNode, state, callback)
    local function eventFunction(event)
        if event == "finish" then
			if state == 1 and callback then
				callback()
			end
        end
	end
	
	local movingFlash = state == 1 and "moving_wuchabiebuzhen_blue1" or "moving_wuchabiebuzhen_blue2"
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, movingFlash, nil, eventFunction , false)
end

-- @Role 	红方状态动画特效
function SquadSelectView:_palyOtherAnimation(rootNode, state, callback)
    local function eventFunction(event)
        if event == "finish" then
			if state == 1 and callback then
				callback()
			end
        end
	end
	
	local movingFlash = state == 1 and "moving_wuchabiebuzhen_red1" or "moving_wuchabiebuzhen_red2"
    G_EffectGfxMgr:createPlayMovingGfx(rootNode, movingFlash, nil, eventFunction , false)
end

---------------------------------------------------------------------------------------
-- @Role 	弹出ban选武将弹框
function SquadSelectView:_popBanPickView()
	local function onSelectTab(index)
		self._curHeroViewTabIndex = index
	end
	local function onCloseCallback()
        self._popupHeroView = nil
        self._panelPetTouch:setVisible(false)        
	end

	if G_UserData:getSeasonSport():getCurrentRound() == 0 and self._popupHeroView == nil then
		self._popupHeroView = require("app.scene.view.seasonCompetitive.PopupHeroView").new(true, self._curHeroViewTabIndex, 
																						onSelectTab, handler(self, self._onBanPick))
        self._popupHeroView:setSyncBanHeroData(self._banHeroData)
        self._popupHeroView:setSyncBanPetData(self._banPetId)
		self._popupHeroView:setCloseCallBack(onCloseCallback)
		self._popupHeroView:openWithAction()
	end
end

-- @Role 	ban选武将/
function SquadSelectView:_onBanPick(tabIndex, baseId)
    if tabIndex == 5 then                               -- 1.ban神兽
        local function isExistBanPet(baseId)
            if self._banPetId == baseId then
                self["_fileNodeOwnPick4"]:setVisible(true)
                self["_fileNodeOwnPick4"]:unInitUI()
                self["_imageOwnPick4"]:setVisible(true)
                self._banPetId = 0
                return true
            end
            return false
        end
        if isExistBanPet(baseId) then
            self._popupHeroView:setSyncBanPetData(self._banPetId)
            return
        end

        self["_imageOwnPick4"]:setVisible(false)
        self["_fileNodeOwnPick4"]:setVisible(true)
        self["_fileNodeOwnPick4"]:unInitUI()
        self["_fileNodeOwnPick4"]:initUI(TypeConvertHelper.TYPE_PET, baseId)
        self["_fileNodeOwnPick4"]:setIconMask(true)
        self["_fileNodeOwnPick4"]:removeLightEffect()
        self._banPetId = baseId
        self._popupHeroView:setSyncBanPetData(self._banPetId)
    else                                              -- 2.ban武将
        local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
        local function isExistBanHero(baseId)
            for index = 1, maxBanHeroNum do
                if self._banHeroData[index].heroId == baseId then
                    self["_fileNodeOwnPick"..index]:setVisible(true)
                    self["_fileNodeOwnPick"..index]:unInitUI()
                    self["_imageOwnPick"..index]:setVisible(true)
                    self._banHeroData[index].heroId	= 0
                    return true
                end
            end
            return false
        end
        
        local bExistBanHero = isExistBanHero(baseId)
        if bExistBanHero then
            self._popupHeroView:setSyncBanHeroData(self._banHeroData)
            return 
        end

        for index = 1, maxBanHeroNum do
            if self._banHeroData[index] and self._banHeroData[index].heroId == 0 then
                self["_imageOwnPick"..index]:setVisible(false)
                self["_fileNodeOwnPick"..index]:setVisible(true)
                self["_fileNodeOwnPick"..index]:unInitUI()
                self["_fileNodeOwnPick"..index]:initUI(TypeConvertHelper.TYPE_HERO, baseId)
                self["_fileNodeOwnPick"..index]:setIconMask(true)

                self._banHeroData[index].heroId	= baseId
                self._popupHeroView:setSyncBanHeroData(self._banHeroData)
                if SeasonSportHelper.checkSeasonRedHero(baseId) then
                    local iconBg = Path.getUICommon("frame/img_frame_06")
                    self["_fileNodeOwnPick"..index]:loadColorBg(iconBg)
                end
                break
            end
        end
    end
end

-- @Role 	初始化ban选武将信息
function SquadSelectView:_initBanHeroData()
	local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
	for index = 1, maxBanHeroNum do
		if not self._banHeroData[index] then
			self._banHeroData[index] = {}
			self._banHeroData[index].heroId	 = 0
			self["_fileNodeOwnPick"..index]:setVisible(true)
		end
    end
end

-- @Role 	初始化ban选神兽信息
function SquadSelectView:_initBanPetData()
    -- body
    self._banPetId = 0
    self["_fileNodeOwnPick4"]:setVisible(true)
end

-- @Role 	搬选结束移动展示搬选界面
function SquadSelectView:_banFinishMoveAnimation()
	local moveAction = cc.MoveTo:create(0.1, SeasonSportConst.SEASON_BANHERO_PICKED)
	local callAction = cc.CallFunc:create(function()
		self._panelOtherBan:setVisible(true)
	end)
	local action = cc.Sequence:create(cc.DelayTime:create(0.05), moveAction, callAction)
	self._panelOwnBan:runAction(action)
end

-- @Role 	ban选等待
function SquadSelectView:_onEventFightsBanWaiting(id, message)
	self._textSquadCountTip:setString(Lang.get("season_waitingbanpick_forbithero"))
end

-- @Role 	断线重连
function SquadSelectView:_onEventReconnect(id, message)
    if G_UserData:getSeasonSport():getCurrentRound() <= 1 then
        self:_updateReconnectBanPets()
		self:_updateReconnectBanHeros()
	end
	self:_updateReconnectSquad()
end

-- @Role 	重连时战斗结束
function SquadSelectView:_onEventReconnectWhileOver(id, message)
	G_UserData:getSeasonSport():c2sFightsEntrance()
	G_SceneManager:popScene()
	if G_UserData:getSeasonSport():isSquadReconnect() then
		G_SceneManager:showScene("seasonSport")
	end
end

-- @Role 	后台切到前台
function SquadSelectView:_onEventForeground()
	G_UserData:getSeasonSport():c2sFightsReconnection()
end

-- @Role    ban神兽同步
function SquadSelectView:_banCheckPets(banPets)
    -- body
    for i,v in ipairs(banPets) do
        if i == 1 then
            if banPets[i] > 0 then
                self["_imageOwnPick4"]:setVisible(false)
                self["_fileNodeOwnPick4"]:setVisible(true)
                self["_fileNodeOwnPick4"]:unInitUI()
                self["_fileNodeOwnPick4"]:initUI(TypeConvertHelper.TYPE_PET, banPets[i])
                self["_fileNodeOwnPick4"]:setIconMask(true)
                self["_fileNodeOwnPick4"]:removeLightEffect()
                self._banPetId = banPets[1]
            else
                self._banPetId	= 0
                self["_fileNodeOwnPick4"]:unInitUI()
                self["_imageOwnPick4"]:setVisible(true)
            end
        elseif i == 2 then
            if banPets[i] > 0 then
                self["_imageOtherPick4"]:setVisible(false)
                self["_fileNodeOtherPick4"]:setVisible(true)
                self["_fileNodeOtherPick4"]:unInitUI()
                self["_fileNodeOtherPick4"]:initUI(TypeConvertHelper.TYPE_PET, banPets[i])
                self["_fileNodeOtherPick4"]:setIconMask(true)
                self["_fileNodeOtherPick4"]:removeLightEffect()
            else
                self["_fileNodeOtherPick4"]:unInitUI()
                self["_imageOtherPick4"]:setVisible(true)
            end
        end
    end
end

-- @Role 	搬选武将返回消息
function SquadSelectView:_onEventFightsBanCheck(id, message)
	if message == nil then return end

	self._panelBanPick:setVisible(true)
	self._panelOwnBan:setVisible(true)

    -- 1. 神兽
    local banPets = rawget(message, "pets") or {}
    self:_banCheckPets(banPets)
    self:_updateBindPetInView()

    -- 2. 武将
	local otherBanHero = rawget(message, "units")
	if otherBanHero ~= nil and table.nums(otherBanHero) > 0 then
		local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
		for index = 1, table.nums(otherBanHero) do
			if index <= maxBanHeroNum then
				if rawget(otherBanHero, index) ~= nil and otherBanHero[index] > 0 then
					self["_imageOwnPick"..index]:setVisible(false)
					self["_fileNodeOwnPick"..index]:setVisible(true)
					self["_fileNodeOwnPick"..index]:unInitUI()
					self["_fileNodeOwnPick"..index]:initUI(TypeConvertHelper.TYPE_HERO, otherBanHero[index])
					self["_fileNodeOwnPick"..index]:setIconMask(true)

					if SeasonSportHelper.checkSeasonRedHero(otherBanHero[index]) then
						local iconBg = Path.getUICommon("frame/img_frame_06")
						self["_fileNodeOwnPick"..index]:loadColorBg(iconBg)
					end
				else
					if otherBanHero[index] == 0 then
						self["_fileNodeOwnPick"..index]:unInitUI()
						self["_imageOwnPick"..index]:setVisible(true)
					end
				end
			else
				local idx = (index - maxBanHeroNum)
				if rawget(otherBanHero, index) ~= nil and otherBanHero[index] > 0 then
					self["_imageOtherPick"..idx]:setVisible(false)
					self["_fileNodeOtherPick"..idx]:setVisible(true)
					self["_fileNodeOtherPick"..idx]:unInitUI()
					self["_fileNodeOtherPick"..idx]:initUI(TypeConvertHelper.TYPE_HERO, otherBanHero[index])
					self["_fileNodeOtherPick"..idx]:setIconMask(true)

					if SeasonSportHelper.checkSeasonRedHero(otherBanHero[index]) then
						local iconBg = Path.getUICommon("frame/img_frame_06")
						self["_fileNodeOtherPick"..idx]:loadColorBg(iconBg)
					end
				else
					if otherBanHero[index] == 0 then
						self["_fileNodeOtherPick"..idx]:unInitUI()
						self["_imageOtherPick"..idx]:setVisible(true)
					end
				end
			end
		end
	end

	self:_banFinishMoveAnimation()
	self._countDownTime = message.round_end_time
	local stageInfo = SeasonSportHelper.getSquadStageInfo(1)

	if self._ownSign == tonumber(stageInfo.first) then
		self._textSquadCountTip:setString(Lang.get("season_tip_squadheros", {num = tonumber(stageInfo.number)}))
	else
		self._textSquadCountTip:setString(Lang.get("season_tip_othersquadheros"))
	end
	self:_updateSquadTime()
	self._textSquadDragTip:setString(Lang.get("season_tip_squadnormal"))
	self._textSquadDragTip:setVisible(self._ownSign == tonumber(stageInfo.first))
	self._imageMaskOwn:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
	self._imageMaskOther:setVisible(self._ownSign == tonumber(stageInfo.first))
	self._textWaitingSecondsOwn:setVisible(self._ownSign == tonumber(stageInfo.first))
	self._textWaitingSecondsOther:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
	self:_updateLockVisible(self._ownSign == tonumber(stageInfo.first))
	self._ownSquadNode:switchAddVisible(not (self._ownSign == tonumber(stageInfo.first)))
end

-- @Role 	推送ban选武将
function SquadSelectView:_sendBanedHero()
	local banData = {}
	local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
	for index = 1, maxBanHeroNum do
		if self._banHeroData[index] then
			table.insert(banData, self._banHeroData[index].heroId)
		end
	end
    
    local pets = {}
    table.insert(pets, self._banPetId)
	G_UserData:getSeasonSport():c2sFightsBan(banData, pets)
end

---------------------------------------------------------------------------------------
-- 神兽
-- @Role listener the select
function SquadSelectView:_selectItem(sender)
	local index = sender:getTag()
	if index <= 0 or index > 6 then
		return
	end

	for slot = 1, 6 do
		if slot == index then
			if self["_imageSelected"..index]:isVisible() == false then
				local dstPos = SeasonSportConst.SEASON_SILK_BINDPOS[index]
				local SilkSelectView = require("app.scene.view.seasonCompetitive.SilkSelectView").new(index, dstPos, handler(self, self._onClickSilkSelect))
				SilkSelectView:open()
			end
			self["_imageArrow"..slot]:setFlippedY(not self["_imageSelected"..index]:isVisible())
			self["_imageSelected"..slot]:setVisible(not self["_imageSelected"..index]:isVisible())
		else
			self["_imageArrow"..slot]:setFlippedY(false)
			self["_imageSelected"..slot]:setVisible(false)
		end
	end
end

function SquadSelectView:_onClosePetView()
	self["_imageSelectedPet"..self._curPetSlot]:setVisible(false)
end

-- @Role 	设置神兽
function SquadSelectView:_onPickPet(baseId)
	if self._curPetSlot <= 0 or self._curPetSlot > 3 then
		return
	end

	local function isExistAdded(baseId)
		for index = 1, #self._bindPetData do
			if self._bindPetData[index].petId == baseId then
				if self._curPetSlot == index then
					return true, true 	 -- 存在：1.同位卸下
				else
					return true, false	 -- 存在：2.不同位
				end
			end
		end
		return false, false				 -- 不存在：直接装上
	end

	-- 存在：2.不同位
	local bExistPet, bSameSlot = isExistAdded(baseId)
	if bExistPet and not bSameSlot then
		return
	end

	-- 存在：1.同位卸下
	for index = 1, #self._bindPetData do
		if self._bindPetData[index].petId == baseId then
			if self._curPetSlot == index then
				self["_fileNodePet"..self._curPetSlot]:unInitUI()
				self["_nodeStar"..self._curPetSlot]:setVisible(false)
				self["_imageAddPet"..self._curPetSlot]:setVisible(true)
				self._bindPetData[self._curPetSlot].petId = 0
			end
			return
		end
	end

	-- 不存在：直接装上
	self["_fileNodePet"..self._curPetSlot]:unInitUI()   
	self["_fileNodePet"..self._curPetSlot]:initUI(TypeConvertHelper.TYPE_PET, baseId)
	self["_fileNodePet"..self._curPetSlot]:removeLightEffect()
	self["_fileNodePet"..self._curPetSlot]:setTouchEnabled(false)
	self["_nodeStar"..self._curPetSlot]:setVisible(true)
	self["_imageAddPet"..self._curPetSlot]:setVisible(false)
	self._bindPetData[self._curPetSlot].petId = baseId
end

-- @Role 	拉起神兽列表
function SquadSelectView:_onClickAddPet(sender)
	self._curPetSlot = sender:getTag()
	for index = 1, self:_getPetsMaxCount() do
		self["_imageSelectedPet"..index]:setVisible(self._curPetSlot == index)
	end
	
	local PopupPetView = require("app.scene.view.seasonCompetitive.PopupPetView").new(handler(self, self._onPickPet), handler(self, self._onClosePetView))
	PopupPetView:setCurPetData(self._curPetSlot, self._bindPetData)
	PopupPetView:openWithAction()
end

-- @Role 	加号特效
function SquadSelectView:_initPetAdd()
	local maxPetCounts = self:_getPetsMaxCount()
	for index = 1, maxPetCounts do
		self["_nodeStar"..index]:setCount(G_UserData:getSeasonSport():getSeasonPetsStar())
		self["_nodeStar"..index]:setVisible(false)
		self["_imageSelectedPet"..index]:setVisible(false)

		-- selected effect
		local selectedFlash = self["_imageSelectedPet"..index]:getChildByName("flash_effect"..index..1)
		if selectedFlash == nil then
			for effectIndex = 1, 2 do
				local lightEffect = require("app.effect.EffectGfxNode").new(SeasonSportConst.SEASON_PET_SELECTEDEFFECT[effectIndex])
				lightEffect:setAnchorPoint(0, 0)
				lightEffect:play()
				lightEffect:setName("flash_effect"..index..effectIndex)
				lightEffect:setScale(effectIndex == 1 and 0.62 or 0.60)
				self["_imageSelectedPet"..index]:addChild(lightEffect)
				lightEffect:setPosition(self["_imageSelectedPet"..index]:getContentSize().width* 0.5 - 2,
										self["_imageSelectedPet"..index]:getContentSize().height * 0.5)
			end
		end

		-- "+" effect
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playBlinkEffect(self["_imageAddPet"..index])
		self["_panelPetTouch"..index]:setVisible(true)
		self["_panelPetTouch"..index]:setTag(index)
		self["_panelPetTouch"..index]:setEnabled(true)
		self["_panelPetTouch"..index]:setSwallowTouches(false)
		self["_panelPetTouch"..index]:setTouchEnabled(true)
		self["_panelPetTouch"..index]:addClickEventListenerEx(handler(self, self._onClickAddPet))
	end

	self["_imagePet3"]:setVisible(maxPetCounts > 2)
	if maxPetCounts == 2 then
		local oriSize = self._imagePetBackGroud:getContentSize()
		local offHeight = (oriSize.height - SeasonSportConst.SEASON_PET_OFFSETHEIGHT)
		self._imagePetBackGroud:setContentSize(cc.size(oriSize.width, offHeight))
	end
end

---------------------------------------------------------------------
-- 初始化Data & View
-- @Role
function SquadSelectView:_initBaseView()
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	if curRound == SeasonSportHelper.getMaxFightStage() then
		G_SceneManager:popScene()
		return
	end
	
	local ownDanInfo = G_UserData:getSeasonSport():getOwn_DanInfo()
	local otherDanInfo = G_UserData:getSeasonSport():getOther_DanInfo()
	local bBanPick      = G_UserData:getSeasonSport():isBanPick()
	self._panelBanPick:setVisible(bBanPick)
	if bBanPick then
		self._panelOtherBan:setVisible(false)
		self._textWaiting:setVisible(false)
		self._textSquadDragTip:setVisible(false)
		self._imageMaskOwn:setVisible(false)
		self._imageMaskOther:setVisible(false)
		self._textWaitingSecondsOwn:setVisible(true)
		self._textWaitingSecondsOther:setVisible(true)
		self._ownSquadNode:switchAddVisible(true)
		self._textSquadCountTip:setString(Lang.get("season_banpick_forbithero"))
		self:_updateLockVisible(false)
	else
		local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound) 
		self:_updateLockVisible(self._ownSign == tonumber(stageInfo.first))
		self._ownSquadNode:switchAddVisible(false)
		if self._ownSign == tonumber(stageInfo.first) then
			self._textSquadCountTip:setString(Lang.get("season_tip_squadheros", {num = tonumber(stageInfo.number)}))
			self._textWaitingSecondsOwn:setString(G_ServerTime:getLeftSeconds(self._countDownTime))
		else
			self._textSquadCountTip:setString(Lang.get("season_tip_othersquadheros"))
			self._textWaitingSecondsOther:setString(G_ServerTime:getLeftSeconds(self._countDownTime))
		end
		self._textSquadDragTip:setString(Lang.get("season_tip_squadnormal"))
		self._textSquadDragTip:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._imageMaskOwn:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
		self._imageMaskOther:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._textWaitingSecondsOwn:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._textWaitingSecondsOther:setVisible(not (self._ownSign == tonumber(stageInfo.first)))

		self._textWaiting:setVisible(false)
		self._textSquadCountTip:setVisible(true)
	end
end

-- @Role 	初始锦囊绑定信息
function SquadSelectView:_initSilkBindingData()
	for index = 1, 6 do
		self["_btnSilk"..index]:setTag(index)
        self["_btnSilk"..index]:setSwallowTouches(false)
		self["_btnSilk"..index]:addClickEventListenerEx(handler(self, self._selectItem))
		self["_imageSelected"..index]:setVisible(false)
    end
end

-- @Role 	根据赛段判断当前可操作的神兽数
function SquadSelectView:_getPetsMaxCount()
    local maxPetCounts = 1
    local curStage = G_UserData:getSeasonSport():getSeason_Stage()
	if curStage == SeasonSportConst.SEASON_STAGE_ROOKIE then
		maxPetCounts = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_ROOKIEPET_COUNTS).content)
	elseif curStage == SeasonSportConst.SEASON_STAGE_ADVANCED then
        maxPetCounts = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_ADVANCEDPET_COUNTS).content)
    elseif curStage == SeasonSportConst.SEASON_STAGE_HIGHT then
        maxPetCounts = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_HIGHTPET_COUNTS).content)
	end
	return maxPetCounts
end

-- @Role 
function SquadSelectView:_updateBindedPetsUI(index, petId)
    -- body
    if petId == nil then
        return
    end
    if petId > 0 then
        self["_fileNodePet"..index]:unInitUI()   
        self["_fileNodePet"..index]:initUI(TypeConvertHelper.TYPE_PET, petId)
        self["_fileNodePet"..index]:removeLightEffect()
        self["_fileNodePet"..index]:setTouchEnabled(false)
        self["_nodeStar"..index]:setVisible(true)
        self["_imageAddPet"..index]:setVisible(false)
    else
        self["_fileNodePet"..index]:unInitUI()
        self["_nodeStar"..index]:setVisible(false)
        self["_imageAddPet"..index]:setVisible(true)
    end
end

-- @Role 	初始化已绑定神兽
function SquadSelectView:_initBindPetInView()
	if self._seasonPets == nil then
		return
	end

	local maxPetCounts = self:_getPetsMaxCount()
	for index = 1, maxPetCounts do
		if self._seasonPets[index] and tonumber(self._seasonPets[index]) > 0 then
			self:_updateBindedPetsUI(index, self._seasonPets[index])
            self._bindPetData[index].petId = self._seasonPets[index]
        else
            self:_updateBindedPetsUI(index, 0)
		end
    end
end

-- @Role    同步ban选神兽数据到绑定容器中
function SquadSelectView:_updateBanedBindedData()
    -- body
    if self._bindPetData == nil then
        return
    end
    local banPets = G_UserData:getSeasonSport():getBanPets()
    if banPets == nil or table.nums(banPets) <= 0 then
        return
    end

    for i,v in ipairs(self._bindPetData) do
        for k, value in pairs(banPets) do
            if self._bindPetData[i].petId == value then
                self._bindPetData[i].petId = 0
            end
        end
    end
end

-- @Role    ban选之后刷新绑定的神兽
function SquadSelectView:_updateBindPetInView()
    -- body
    self:_updateBanedBindedData()
    local maxPetCounts = self:_getPetsMaxCount()
	for index = 1, maxPetCounts do
		if self._bindPetData[index] ~= nil then
            self:_updateBindedPetsUI(index, self._bindPetData[index].petId)
        else
            self:_updateBindedPetsUI(index, 0)
		end
    end
end

-- @Role 	初始化神兽绑定信息
function SquadSelectView:_initBindPetData()
	local maxPetCounts = self:_getPetsMaxCount()
	for index = 1, maxPetCounts do
		if not self._bindPetData[index] then
			self._bindPetData[index] = {}
			self._bindPetData[index].petId	 = 0
		end
    end
end

-- @Role 	初始化锦囊绑定到武将信息
function SquadSelectView:_initBindSilkToHeroData()
	for index = 1, 6 do
		if not self._bindSilkData[index] then
			self._bindSilkData[index] = {}
			self._bindSilkData[index].heroId	 = 0
			self._bindSilkData[index].silkIndex  = 0
		end
    end
end

function SquadSelectView:_initOwnSquadHeroData()
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if not self._squadAvatarData[index] then
			self._squadAvatarData[index] = {}
		end

		self._squadAvatarData[index].isLock = false
		self._squadAvatarData[index].heroId = 0
		self._squadAvatarData[index].state  = 0
		self._squadAvatarData[index].avatar = nil
		self._squadAvatarData[index].isExchange = false
	end
end

--------------------------------------------------------------------
-- @Role 	锦囊绑定成功后请求战斗
function SquadSelectView:_onEventBindingSuccess()
	G_UserData:getSeasonSport():c2sFightsFight()
end

--------------------------------------------------------------------
-- 上阵 & 战斗
-- @Role	武将上阵/战斗
function SquadSelectView:_onEventHerosPitchSuccess(id, message)
	local maxStage = SeasonSportHelper.getMaxFightStage()
	if message.round < maxStage then								-- 1. 武将上阵阶段
		self._countDownTime = message.round_end_time
		local stageInfo = SeasonSportHelper.getSquadStageInfo(message.round)

		if self._ownSign == tonumber(stageInfo.first) then
			self._textSquadCountTip:setString(Lang.get("season_tip_squadheros", {num = tonumber(stageInfo.number)}))
		else
			self._textSquadCountTip:setString(Lang.get("season_tip_othersquadheros"))
		end
		self:_updateSquadTime()
		self._textSquadDragTip:setString(Lang.get("season_tip_squadnormal"))
		self._textSquadDragTip:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._imageMaskOwn:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
		self._imageMaskOther:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._textWaitingSecondsOwn:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._textWaitingSecondsOther:setVisible(not (self._ownSign == tonumber(stageInfo.first)))

		self._ownSquadNode:synchronizeData(nil)
		self._ownSquadNode:synchronizeUI(message.own_side, message.own_side_avater)
		self._otherSquadNode:updateUI(message.other_side)
		self:_updateLockVisible(self._ownSign == tonumber(stageInfo.first))
		self._ownSquadNode:switchAddVisible(not (self._ownSign == tonumber(stageInfo.first)))
	elseif message.round == maxStage then							-- 2. 最后调整阶段
		self._ownSquadNode:synchronizeData(nil)
		self._ownSquadNode:synchronizeUI(message.own_side, message.own_side_avater)
		self._otherSquadNode:updateUI(message.other_side)

		self._textSquadDragTip:setVisible(false)
		self._imageMaskOwn:setVisible(false)
		self._imageMaskOther:setVisible(false)
		self._textWaitingSecondsOwn:setVisible(true)
		self._textWaitingSecondsOther:setVisible(true) 
		self._countDownTime = message.round_end_time

		local textureList = {
			"img_runway_star.png",
			"img_runway_star1.png",
			"img_runway_star2.png",
			"img_runway_star3.png",
		}
		self._countDownAnimation:setTextureList(textureList)
		self._isFightStage = true
		self._textWaiting:setVisible(true)
		self._textSquadCountTip:setVisible(false)
		self:_updateLockVisible(false)

		self._nodeCountAniOwn1:setVisible(false)
		self._nodeCountAniOther1:setVisible(false)
		self._nodeCountAniOwn2:setVisible(false)
		self._nodeCountAniOther2:setVisible(false)
		self._nodeCountAniOwn2:removeAllChildren()
		self._nodeCountAniOther2:removeAllChildren()
	end
end

-- @Role 	Go Fight
function SquadSelectView:_s2cFightsFight(id, message)
	if message.ret ~= MessageErrorConst.RET_OK then
		return
	end
	if message == nil then return end
	-- 超时
	if rawget(message, "exception_res") ~= nil then	
		if message.exception_res == 1 then	-- 1本方CD完/2对方CD完
			G_UserData:getSeasonSport():c2sFightsEntrance()
			G_SceneManager:popScene()
			if G_UserData:getSeasonSport():isSquadReconnect() then
				G_SceneManager:showScene("seasonSport")
			end
			return
		end
		if message.exception_res == 2 then	-- 1本方CD完/2对方CD完
			G_UserData:getSeasonSport():c2sFightsEntrance()
			G_SceneManager:popScene()
			G_UserData:getSeasonSport():setOtherCDOut(true)
			if G_UserData:getSeasonSport():isSquadReconnect() then
				G_SceneManager:showScene("seasonSport")
			end
			return
		end
		if message.exception_res == 3 or message.exception_res == 4 then	-- 3己方CD到并扣1/2星
			G_UserData:getSeasonSport():c2sFightsEntrance()
			G_SceneManager:popScene()
			G_UserData:getSeasonSport():setOwnCDOutAndDropStar((message.exception_res - 2))
			if G_UserData:getSeasonSport():isSquadReconnect() then
				G_SceneManager:showScene("seasonSport")
			end
			return
        end
	end	

	local function enterFightView(message)
		local battleReport = G_UserData:getFightReport():getReport()
		if self._ownSign == 2 and rawget(battleReport, "is_win") ~= nil then
			battleReport.is_win = not rawget(battleReport, "is_win")
			self:_updateSeasonStar(battleReport.is_win)
		elseif self._ownSign == 1 and rawget(battleReport, "is_win") ~= nil then
			battleReport.is_win = rawget(battleReport, "is_win")
			self:_updateSeasonStar(battleReport.is_win)
		end
		
		local ReportParser = require("app.fight.report.ReportParser")
		local reportData = ReportParser.parse(battleReport)
		local battleData = require("app.utils.BattleDataHelper").parseSeasonSportData(message, false)
		local ownDanInfo = G_UserData:getSeasonSport():getOwn_DanInfo()
		local otherDanInfo = G_UserData:getSeasonSport():getOther_DanInfo()
		battleData.ownDanInfo = ownDanInfo
		battleData.otherDanInfo = otherDanInfo
		battleData.is_win = battleReport.is_win
		G_SceneManager:popScene()
		G_SceneManager:showScene("fight", reportData, battleData)
	end

	G_SceneManager:registerGetReport(message.battle_report, function() enterFightView(message) end)
end

---------------------------------------------------------------------
-- 锦囊绑定 & 武将数据操作
-- @Role Init DanInfo
function SquadSelectView:_initDanInfo()
	local ownDanInfoNode = SeasonDanInfoNode.new()
	self._ownInfoContainer:addChild(ownDanInfoNode)
	self._ownDanNode = ownDanInfoNode

	local otherDanInfoNode = SeasonDanInfoNode.new()
	self._otherInfoContainer:addChild(otherDanInfoNode)
	self._otherDanNode = otherDanInfoNode
end

-- @Role 	Init SquadInfo
function SquadSelectView:_initSquadInfo()
	local ownHeroPickNode = OwnHeroPickNode.new(handler(self, self._onSynChroData), handler(self, self._onMoveOut))
	self._ownSquadContainer:addChild(ownHeroPickNode)
	self._ownSquadNode = ownHeroPickNode

	local otherHeroPickNode = OtherHeroPickNode.new()
	self._otherSquadContainer:addChild(otherHeroPickNode)
	self._otherSquadNode = otherHeroPickNode
end

-- @Role 	Select SilkGroup
function SquadSelectView:_onClickSilkSelect(index, data)
	if data ~= nil then
		self["_textSilkName"..index]:setString("   " ..data.name)

		if rawget(data, "pos") then
			self._bindSilkData[index].silkIndex  = tonumber(data.pos)
		end
	end

	for slot = 1, 6 do
		if slot == index then
			self["_imageArrow"..slot]:setFlippedY(not self["_imageSelected"..slot]:isVisible())
			self["_imageSelected"..slot]:setVisible(not self["_imageSelected"..slot]:isVisible())
		else
			self["_imageArrow"..slot]:setFlippedY(false)
			self["_imageSelected"..slot]:setVisible(false)
		end
	end
end

-- @Role 	查找交换数据
function SquadSelectView:_searchExchangeData(ownLockData)
	local searchData = {}
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if ownLockData[index].isExchange == true then
			table.insert(searchData, index)
		end
	end

	if table.nums(searchData) == 2 then
		local temp = self._bindSilkData[searchData[1]].silkIndex
		self._bindSilkData[searchData[1]].silkIndex = self._bindSilkData[searchData[2]].silkIndex
		self._bindSilkData[searchData[2]].silkIndex = temp
	end

	return searchData
end

-- @Role 	处理未锁定已交换（增删改）
function SquadSelectView:_exchangeBindedSilkAndHero(lockData)
	local searchIndex = 0
	local exchangeData = self:_searchExchangeData(lockData)
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if tonumber(lockData[index].heroId) > 0 and lockData[index].isExchange == true then
			local heroId = lockData[index].heroId
			if SeasonSportHelper.isHero(heroId) == false then
				heroId = SeasonSportHelper.getTransformCardsHeroId(heroId)
			end

			local bExist, paramConfig = SeasonSportHelper.isExistHeroById(heroId)
			if bExist then
				searchIndex = (searchIndex + 1)
				local silkIndex = exchangeData[searchIndex]
	
				-- Hero Name
                local addStrngth = ""
                local curStage = G_UserData:getSeasonSport():getSeason_Stage()
				if curStage == SeasonSportConst.SEASON_STAGE_ROOKIE then
					addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content
				elseif curStage == SeasonSportConst.SEASON_STAGE_ADVANCED then
                    addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content
                elseif curStage == SeasonSportConst.SEASON_STAGE_HIGHT then
					if SeasonSportHelper._isGoldenHero(heroId) then
						addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content
					else
						addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content
					end
				end

				local nameStr = (paramConfig.name.."+"..addStrngth) 
				local nameColor = Colors.COLOR_QUALITY[5]
				if SeasonSportHelper.checkSeasonRedHero(heroId) then
					nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT)
				elseif SeasonSportHelper._isGoldenHero(heroId) then
                    nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_GOLDENLIMIT)
                    nameStr = (paramConfig.name ..Lang.get("season_goldenhero_desc") ..addStrngth)
				end
				self["_textHeroName"..index]:setString(nameStr)
				self["_textHeroName"..index]:setColor(nameColor)
				self._bindSilkData[index].heroId  = lockData[index].heroId
				
				-- SilkGroup Name
				local silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()
				local silkId = self._bindSilkData[silkIndex].silkIndex
				silkId = silkId > 0 and silkId or 1
				if silkGroupInfo[silkId] and silkGroupInfo[silkId].name ~= "" then
					self["_textSilkName"..index]:setString("   " ..silkGroupInfo[silkId].name)
				else
					local nameStr = Lang.get("season_silk_group_initname2")..tostring(silkId)
					self["_textSilkName"..index]:setString("   " ..nameStr)
				end
			end
		else
			if tonumber(lockData[index].heroId) == 0 then
				if lockData[index].isExchange then
					searchIndex = (searchIndex + 1)
					local silkIndex = exchangeData[searchIndex]
					self["_textHeroName"..index]:setString(Lang.get("season_squad_solot", {num = index}))
					self["_textHeroName"..index]:setColor(Colors.SEASON_SILKBINDING_TEXT)
					self._bindSilkData[index].heroId  = 0

					local silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()
					local silkId = self._bindSilkData[silkIndex].silkIndex
					silkId = silkId > 0 and silkId or 1

					if silkGroupInfo[silkId] and silkGroupInfo[silkId].name ~= "" then
						self["_textSilkName"..index]:setString("   " ..silkGroupInfo[silkId].name)
					else
						local nameStr = Lang.get("season_silk_group_initname2")..tostring(silkId)
						self["_textSilkName"..index]:setString("   " ..nameStr)
					end
				else
					self["_textHeroName"..index]:setString(Lang.get("season_squad_solot", {num = index}))
					self["_textHeroName"..index]:setColor(Colors.SEASON_SILKBINDING_TEXT)
					self._bindSilkData[index].heroId  = 0

					local silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()
					if silkGroupInfo[1] and silkGroupInfo[1].name ~= "" then
						self["_textSilkName"..index]:setString("   " ..silkGroupInfo[1].name)
					else
						local nameStr = Lang.get("season_silk_group_initname2")..tostring(1)
						self["_textSilkName"..index]:setString("   " ..nameStr)
					end
					self._bindSilkData[index].silkIndex = 0
				end
			end
		end
	end
end

-- @Role	数据操作时（增删改）
function SquadSelectView:_onSynChroData(bLock, curOwnLockData, bExchange)
	self._squadAvatarData = curOwnLockData
	if bLock == true then									-- 锁定：处理锁定数据
		for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
			if tonumber(curOwnLockData[index].heroId) > 0 and curOwnLockData[index].isLock == true then
				local heroId = curOwnLockData[index].heroId
				if SeasonSportHelper.isHero(heroId) == false then
					heroId = SeasonSportHelper.getTransformCardsHeroId(heroId)
				end

				local bExist, paramConfig = SeasonSportHelper.isExistHeroById(heroId)
				if bExist then
                    local addStrngth = ""
                    local curStage = G_UserData:getSeasonSport():getSeason_Stage()
					if curStage == SeasonSportConst.SEASON_STAGE_ROOKIE then
						addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content
					elseif curStage == SeasonSportConst.SEASON_STAGE_ADVANCED then
                        addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content
                    elseif curStage == SeasonSportConst.SEASON_STAGE_HIGHT then
						if SeasonSportHelper._isGoldenHero(heroId) then
							addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content
						else
							addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content
						end
					end
					local nameStr = (paramConfig.name.."+"..addStrngth) 
					local nameColor = Colors.COLOR_QUALITY[5]
					if SeasonSportHelper.checkSeasonRedHero(heroId) then
						nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT)
					elseif SeasonSportHelper._isGoldenHero(heroId) then
                        nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_GOLDENLIMIT)
                        nameStr = (paramConfig.name ..Lang.get("season_goldenhero_desc") ..addStrngth)
					end
					self["_textHeroName"..index]:setString(nameStr)
					self["_textHeroName"..index]:setColor(nameColor)
					self._bindSilkData[index].heroId  = curOwnLockData[index].heroId
				end
			else
				self["_textHeroName"..index]:setString(Lang.get("season_squad_solot", {num = index}))
				self["_textHeroName"..index]:setColor(Colors.SEASON_SILKBINDING_TEXT)
				self._bindSilkData[index].heroId  = 0
			end
		end
	else
		if bExchange then
			self:_exchangeBindedSilkAndHero(curOwnLockData)		-- 未锁定：1.拖动交换武将
		else
			self:_unExchangeBindedSilkAndHero(curOwnLockData)	-- 未锁定：2.上、下、换武将 
		end

		-- lock state
		local curRound = G_UserData:getSeasonSport():getCurrentRound()
		local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound)
		local stageNumber = tonumber(stageInfo.number)
		local selectCount = self:_curStageSelectedPickCount()
		self._btnLock:setEnabled(selectCount >= stageNumber or false)
		if selectCount >= stageNumber then
			self._nodeLockEffect:setVisible(true)
			self._nodeLockEffect:removeAllChildren()
			G_EffectGfxMgr:createPlayGfx(self._nodeLockEffect, "effect_anniufaguang_big2")
		else
			self._nodeLockEffect:setVisible(false)
		end
	end
end

-- @Role	处理未锁定未交换（增删改）
function SquadSelectView:_unExchangeBindedSilkAndHero(lockData)
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		if tonumber(lockData[index].heroId) > 0 and lockData[index].isLock == false then
			local heroId = lockData[index].heroId
			if SeasonSportHelper.isHero(heroId) == false then
				heroId = SeasonSportHelper.getTransformCardsHeroId(heroId)
			end

			local bExist, paramConfig = SeasonSportHelper.isExistHeroById(heroId)
			if bExist then
                local addStrngth = ""
                local curStage = G_UserData:getSeasonSport():getSeason_Stage()
				if curStage == SeasonSportConst.SEASON_STAGE_ROOKIE then
					addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ROOKIE).content
				elseif curStage == SeasonSportConst.SEASON_STAGE_ADVANCED then
                    addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_ADVANCE).content
                elseif curStage == SeasonSportConst.SEASON_STAGE_HIGHT then
                    if SeasonSportHelper._isGoldenHero(heroId) then
						addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_GOLDEN_RANK).content
					else
						addStrngth = SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_STRENGTH_HIGHT).content
					end
				end
				local nameStr = (paramConfig.name.."+"..addStrngth) 

				if self._bindSilkData[index].silkIndex == 0 then
					self:_updateBindedInfo(index, lockData[index].heroId)
				end

				local nameColor = Colors.COLOR_QUALITY[5]
				if SeasonSportHelper.checkSeasonRedHero(heroId) then
					nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_REDIMIT)
				elseif SeasonSportHelper._isGoldenHero(heroId) then
                    nameColor = Colors.getColor(SeasonSportConst.HERO_SCOP_GOLDENLIMIT)
                    nameStr = (paramConfig.name ..Lang.get("season_goldenhero_desc") ..addStrngth)
				end
				self["_textHeroName"..index]:setString(nameStr)
				self["_textHeroName"..index]:setColor(nameColor)
				self._bindSilkData[index].heroId  = lockData[index].heroId
			end
		else
			if tonumber(lockData[index].heroId) == 0 then
				self["_textHeroName"..index]:setString(Lang.get("season_squad_solot", {num = index}))
				self["_textHeroName"..index]:setColor(Colors.SEASON_SILKBINDING_TEXT)
				self._bindSilkData[index].heroId  = 0

				local silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()
				if silkGroupInfo[1] and silkGroupInfo[1].name ~= "" then
					self["_textSilkName"..index]:setString("   " ..silkGroupInfo[1].name)
				else
					local nameStr = Lang.get("season_silk_group_initname2")..tostring(1)
					self["_textSilkName"..index]:setString("   " ..nameStr)
				end
				self._bindSilkData[index].silkIndex = 0
			end
		end
	end
end

-- @Role 	武将上阵移动界外
function SquadSelectView:_onMoveOut(bOut)
	if bOut then
		self._btnLock:setVisible(bVisible)
		self._textSquadDragTip:setString(Lang.get("season_tip_squadout"))
		self._imageHeroOutShade:setVisible(bOut)
	else
		self._textSquadDragTip:setString(Lang.get("season_tip_squadnormal"))
		local curRound = G_UserData:getSeasonSport():getCurrentRound()
		local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound) 
		self._btnLock:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._textSquadCountTip:setString(Lang.get("season_tip_squadheros", {num = tonumber(stageInfo.number)}))
		self._imageHeroOutShade:setVisible(bOut)
	end
end

-- @Role 	断线重连ban选武将
function SquadSelectView:_updateReconnectBanHeros()
	local banHeros = G_UserData:getSeasonSport():getBanHeros()
	if banHeros == nil or not banHeros then
		return
	end

	if G_UserData:getSeasonSport():isBanPick() == false then
		return
	end

	G_UserData:getSeasonSport():setBanPick(false) 
	self._panelBanPick:setVisible(true)
	self._panelOwnBan:setVisible(true)
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	if curRound>0 then
		self:_banFinishMoveAnimation()
	end
	local maxBanHeroNum = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_BANHERO_NUM).content)
	for index, value in ipairs(banHeros) do
		if index <= maxBanHeroNum then
			if value > 0 then
				self["_imageOwnPick"..index]:setVisible(false)
				self["_fileNodeOwnPick"..index]:setVisible(true)
				self["_fileNodeOwnPick"..index]:unInitUI()
				self["_fileNodeOwnPick"..index]:initUI(TypeConvertHelper.TYPE_HERO, value)
				self["_fileNodeOwnPick"..index]:setIconMask(true)

				self._banHeroData[index].heroId	= value
				if SeasonSportHelper.checkSeasonRedHero(value) then
					local iconBg = Path.getUICommon("frame/img_frame_06")
					self["_fileNodeOwnPick"..index]:loadColorBg(iconBg)
				end
			else
				self._banHeroData[index].heroId	= 0
				self["_fileNodeOwnPick"..index]:unInitUI()
				self["_imageOwnPick"..index]:setVisible(true)
			end
		else
			local idx = (index - maxBanHeroNum)
			if value > 0 then
				self["_imageOtherPick"..idx]:setVisible(false)
				self["_fileNodeOtherPick"..idx]:setVisible(true)
				self["_fileNodeOtherPick"..idx]:unInitUI()
				self["_fileNodeOtherPick"..idx]:initUI(TypeConvertHelper.TYPE_HERO, value)
				self["_fileNodeOtherPick"..idx]:setIconMask(true)

				if SeasonSportHelper.checkSeasonRedHero(value) then
					local iconBg = Path.getUICommon("frame/img_frame_06")
					self["_fileNodeOtherPick"..idx]:loadColorBg(iconBg)
				end
			else
				self["_fileNodeOtherPick"..idx]:unInitUI()
				self["_imageOtherPick"..idx]:setVisible(true)
			end
		end
	end
end

-- @Role    断线重连神兽ban选
function SquadSelectView:_updateReconnectBanPets()
    -- body
    local banPets = G_UserData:getSeasonSport():getBanPets()
	if banPets == nil or not banPets then
		return
    end
    self:_banCheckPets(banPets)
    self:_updateBindPetInView()
end

-- @Role 	断线重连武将上阵
function SquadSelectView:_updateReconnectSquad()
	local function synchroData(data)
		self._squadAvatarData = data
		self:_updateReconnectSilk(data)
		self:_onSynChroData(true, data)
	end

	local maxStage = SeasonSportHelper.getMaxFightStage()
	if G_UserData:getSeasonSport():getCurrentRound() < maxStage then
		self._countDownTime = G_UserData:getSeasonSport():getCurrentRound_EndTime()
		local stageInfo = SeasonSportHelper.getSquadStageInfo(G_UserData:getSeasonSport():getCurrentRound())

		if self._ownSign == tonumber(stageInfo.first) then
			self._textSquadCountTip:setString(Lang.get("season_tip_squadheros", {num = tonumber(stageInfo.number)}))
		else
			self._textSquadCountTip:setString(Lang.get("season_tip_othersquadheros"))
		end
		self:_updateSquadTime()
		self._textSquadDragTip:setString(Lang.get("season_tip_squadnormal"))
		self._textSquadDragTip:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._imageMaskOwn:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
		self._imageMaskOther:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._textWaitingSecondsOwn:setVisible(self._ownSign == tonumber(stageInfo.first))
		self._textWaitingSecondsOther:setVisible(not (self._ownSign == tonumber(stageInfo.first)))
		self._ownSquadNode:synchronizeData(synchroData)
		self._ownSquadNode:synchronizeUI(G_UserData:getSeasonSport():getOwn_SquadInfo(),
										G_UserData:getSeasonSport():getOwn_SquadType())
		self._otherSquadNode:updateUI(G_UserData:getSeasonSport():getOther_SquadInfo())
		self:_updateLockVisible(self._ownSign == tonumber(stageInfo.first))
		self._ownSquadNode:switchAddVisible(not (self._ownSign == tonumber(stageInfo.first)))
	elseif G_UserData:getSeasonSport():getCurrentRound() == maxStage then
		self._ownSquadNode:synchronizeData(synchroData)
		self._ownSquadNode:synchronizeUI(G_UserData:getSeasonSport():getOwn_SquadInfo(), 
										G_UserData:getSeasonSport():getOwn_SquadType())
		self._otherSquadNode:updateUI(G_UserData:getSeasonSport():getOther_SquadInfo())

		self._textSquadDragTip:setVisible(false)
		self._imageMaskOwn:setVisible(false)
		self._imageMaskOther:setVisible(false)
		self._textWaitingSecondsOwn:setVisible(true)
		self._textWaitingSecondsOther:setVisible(true) 
		self._countDownTime = G_UserData:getSeasonSport():getCurrentRound()

		local textureList = {
			"img_runway_star.png",
			"img_runway_star1.png",
			"img_runway_star2.png",
			"img_runway_star3.png",
		}
		self._countDownAnimation:setTextureList(textureList)
		self._isFightStage = true
		self._textWaiting:setVisible(true)
		self._textSquadCountTip:setVisible(false)
		self:_updateLockVisible(false)

		self._nodeCountAniOwn1:setVisible(false)
		self._nodeCountAniOther1:setVisible(false)
		self._nodeCountAniOwn2:setVisible(false)
		self._nodeCountAniOther2:setVisible(false)
		self._nodeCountAniOwn2:removeAllChildren()
		self._nodeCountAniOther2:removeAllChildren()
	end
end

-- @Role 	断线重连锦囊
function SquadSelectView:_updateReconnectSilk(data)
	if data == nil then
		return
	end

	for key, value in pairs(data) do
		if rawget(data, key) ~= nil then
			self:_updateBindedInfo(key, data[key].heroId)	
		end
	end
end

-- @Role	更新段位信息
function SquadSelectView:_updateDanInfo()
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	local ownDanInfo = G_UserData:getSeasonSport():getOwn_DanInfo()
	local otherDanInfo = G_UserData:getSeasonSport():getOther_DanInfo()

	self._ownDanNode:updateUI(ownDanInfo)
	self._otherDanNode:updateUI(otherDanInfo)
	if curRound==0 then
		self._isPopBanPickView = G_UserData:getSeasonSport():isBanPick()
	end
	if G_UserData:getSeasonSport():isOnGoing() then
		G_UserData:getSeasonSport():setOnGoing(false)
		self._ownDanNode:updateOwnProir(self._ownSign == 1)
        self._otherDanNode:updateOtherProir(self._ownSign == 2)
        self:_updateReconnectBanPets()
		self:_updateReconnectBanHeros()
		self:_updateReconnectSquad()
	else
		self._priorAnimation:removeAllChildren()
		self:_palyProiorAnimation(self._priorAnimation, ownDanInfo.isProir, handler(self, self._initSquadTime))
	end
end

-- @Role	锁定按钮是否可见
function SquadSelectView:_updateLockVisible(bVisible)
	self._btnLock:setVisible(bVisible)
	self._btnLock:setEnabled(false)
	self._nodeLockEffect:setVisible(false)
end

-- @Role 	更新当前星级
function SquadSelectView:_updateSeasonStar(bWin)
	local curStar = G_UserData:getSeasonSport():getCurSeason_Star()
	if bWin then
		G_UserData:getSeasonSport():setTimeOutCD(2)
		G_UserData:getSeasonSport():setCurSeason_Star(curStar + 1)
	else
		if curStar <= 1 then curStar = 1 end
		G_UserData:getSeasonSport():setTimeOutCD(1)
		G_UserData:getSeasonSport():setCurSeason_Star(curStar - 1)
	end
end

-- @Role 	绑定到锦囊
function SquadSelectView:_sendBindSilkInfo()
	local data = {}
	for key, value in pairs(self._bindSilkData) do
		if rawget(self._bindSilkData[key], "heroId") > 0 then
			local skb = {}
			if self._bindSilkData[key].silkIndex > 0 then
				skb.idx = (self._bindSilkData[key].silkIndex - 1)
			else
				skb.idx = 0
			end
			
			skb.unit = self._bindSilkData[key].heroId
			table.insert(data, skb)
		end
	end

	-- pets
	local petsData = {}
	for index = 1, table.nums(self._bindPetData) do
		table.insert(petsData, self._bindPetData[index].petId)
	end

	if table.nums(data) > 0 then
		G_UserData:getSeasonSport():c2sFightsSilkbagBinding(data, petsData)
	end
end

-- @Role 	按策划要求未选武将时也要默认锦囊
function SquadSelectView:_initSilkGroupName()
	local silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do
		local nameStr = nil
		if silkGroupInfo[1].name ~= "" and silkGroupInfo[1].name ~= nil then
			nameStr = silkGroupInfo[1].name
		else
			nameStr = Lang.get("season_silk_group_initname2")..tostring(1)
		end
		self["_textSilkName"..index]:setString("   " ..nameStr)
	end
end

-- @Role 	设置默认的绑定信息
function SquadSelectView:_updateBindedInfo(index, heroId)
	local bindedSilkGroups = G_UserData:getSeasonSport():getBindedSilkGroups()
	local silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()
	local silkGroupIdx = nil
	for key, value in pairs(bindedSilkGroups) do
		if value and value.unit == heroId then
			silkGroupIdx = value.idx
			self._bindSilkData[index].silkIndex = (value.idx + 1)
			break						
		end
	end

	-- default "锦囊组1"
	if silkGroupIdx == nil then
		self._bindSilkData[index].silkIndex  = 0
		if silkGroupInfo[1] and silkGroupInfo[1].name ~= "" then
			self["_textSilkName"..index]:setString("   " ..silkGroupInfo[1].name)
		else
			local nameStr = Lang.get("season_silk_group_initname2")..tostring(1)
			self["_textSilkName"..index]:setString("   " ..nameStr)
		end
		return
	end

	-- setName
	for key, value in pairs(silkGroupInfo) do
		if value and value.idx == silkGroupIdx then
			local nameStr = nil
			if value.name ~= "" and value.name ~= nil then
				nameStr = value.name
			else
				nameStr = Lang.get("season_silk_group_initname2")..tostring(silkGroupIdx + 1)
			end
			self["_textSilkName"..index]:setString("   " ..nameStr)
			break
		end
	end
end

-- @Role 	锁定
function SquadSelectView:_onBtnLock(sender)
	local ownSign = G_UserData:getSeasonSport():getPrior()
	local curRound = G_UserData:getSeasonSport():getCurrentRound()
	local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound)
	if ownSign ~= tonumber(stageInfo.first) then
		G_Prompt:showTip(Lang.get("season_squad_otherround"))
		return
	end
	
	local stageNumber = tonumber(stageInfo.number)
	local selectCount = self:_curStageSelectedPickCount()
	if selectCount <= 0 then
		return
    end
    
	local data = {}
	if stageNumber == selectCount then
		for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do	
			if tonumber(self._squadAvatarData[index].heroId) > 0 and self._squadAvatarData[index].isLock == false then
				local heroId = self._squadAvatarData[index].heroId
                local iAvatar = 0 -- 0武将/1变身卡
				if SeasonSportHelper.isHero(heroId) == false then
					iAvatar = 1
					heroId = SeasonSportHelper.getTransformCardsHeroId(heroId)
				end

				local bp = {
					unit = heroId,
					pos	= index - 1,
					is_avatar = iAvatar,
				}
				table.insert(data, bp)
				self._squadAvatarData[index].isLock = true
				self._squadAvatarData[index].isExchange = false
			end
		end
	else
		if stageNumber > selectCount then
			G_Prompt:showTip(Lang.get("season_squad_hero_less", {num = (stageNumber - selectCount)}))
			return
		end
	end

	self:_updateLockVisible(false)
	self:_onSynChroData(true, self._squadAvatarData)
	G_UserData:getSeasonSport():c2sFightsBanPick(data) -- send Lock
end

-- @Role 	当前阶段已选武将数量
function SquadSelectView:_curStageSelectedPickCount()
	local selectCount = 0
	for index = 1, SeasonSportConst.HERO_SQUAD_USEABLECOUNT do	
		if tonumber(self._squadAvatarData[index].heroId) > 0 and self._squadAvatarData[index].isLock == false then
			selectCount = selectCount + 1
		end
	end
	return selectCount
end

-------------------------------------------------------------------
-- 实时渲染
function SquadSelectView:_update(dt)
	-- ban人弹窗
	if self._isPopBanPickView then
		if self._popBanPickIntervel >= 0.5 then
			self._isPopBanPickView = false
			self:_popBanPickView()
		end
		self._popBanPickIntervel = (self._popBanPickIntervel + dt)
	end
	
	-- ban人&锁定
	if 0 >= G_ServerTime:getLeftSeconds(self._countDownTime) and G_UserData:getSeasonSport():getCurrentRound() > 0 then
		self._textWaitingSecondsOwn:setString("0")
		self._textWaitingSecondsOther:setString("0")
		local curRound = G_UserData:getSeasonSport():getCurrentRound()
		local stageInfo = SeasonSportHelper.getSquadStageInfo(curRound)
		local stageNumber = tonumber(stageInfo.number)
		local selectCount = self:_curStageSelectedPickCount()
		if selectCount > 0 and selectCount == stageNumber then
			self:_onBtnLock()
		else
			self._seasonOffLineWait = (self._seasonOffLineWait + dt)			
			if SeasonSportConst.SEASON_OFFLINE_WAITING <= self._seasonOffLineWait then
				G_UserData:getSeasonSport():setSquadOffline(true)
				G_UserData:getSeasonSport():c2sFightsEntrance()
				G_SceneManager:popScene()
				return
			end
		end
	elseif 0.5 >= G_ServerTime:getLeftSeconds(self._countDownTime) and G_UserData:getSeasonSport():getCurrentRound() == 0 then
		if not self._isSendBaned then
			self._isSendBaned = true
			self:_sendBanedHero()
		end
	else
		self._seasonOffLineWait = 0
		self._textWaitingSecondsOwn:setString(G_ServerTime:getLeftSeconds(self._countDownTime))
		self._textWaitingSecondsOther:setString(G_ServerTime:getLeftSeconds(self._countDownTime))
	end
	
	-- 战斗
	if self._isFightStage then
		if 3 >= G_ServerTime:getLeftSeconds(self._countDownTime) then
			self._isFightStage = false
			self._textWaiting:setVisible(false)
			self._imageMaskOwn:setVisible(false)
			self._imageMaskOther:setVisible(false)
			self._textWaitingSecondsOwn:setVisible(false)
			self._textWaitingSecondsOther:setVisible(false)
			self._countDownAnimation:playAnimation(4, 1, function()
				self:_sendBindSilkInfo()
			end)
		end
	end
end


return SquadSelectView