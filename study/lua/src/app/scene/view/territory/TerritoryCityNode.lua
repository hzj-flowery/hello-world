--竞技场
--英雄avatar 展示
local ViewBase = require("app.ui.ViewBase")
local TerritoryCityNode = class("TerritoryCityNode", ViewBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIPopupHelper	 = require("app.utils.UIPopupHelper")
local TerritoryHelper    = require("app.scene.view.territory.TerritoryHelper")
local TerritoryConst = require("app.const.TerritoryConst")
local scheduler = require("cocos.framework.scheduler")
local ShaderHalper = require("app.utils.ShaderHelper")

function TerritoryCityNode:ctor()

	self._panelContainer = nil 
	
	self._imageCityHover = nil --hover
	self._imageCity		 = nil --城市图片
	self._effectNode = nil--特效节点
	self._nodeFightEffect	 	 = nil --Fight Image
	self._commonHeroIcon = nil -- hero Icon
	self._panelStateGetAward	 = nil -- 可收获状态
	self._imageStateBk	= nil	--当前状态背景框
	self._textStateName = nil --状态名称， 倒计时， 可收获，暴乱等
	self._imageLock		= nil --锁图片
	self._btnAdd		= nil --addBtn
	self._textCityName	= nil --城市名称 
	self._imageHeroState	= nil --求助状态,或者巡逻状态

	self._popupPatrolSignal = nil
	self._popupPatrol = nil

    local resource = {
        file = Path.getCSB("TerritoryCityNode", "territory"),
    }
	
    TerritoryCityNode.super.ctor(self, resource)
end

function TerritoryCityNode:onCreate()

    self._enterTime =  G_ServerTime:getTime()
    self._remainTime = self._enterTime + 20

	self._imageCityHover:setOpacity(0)

    self._panelContainer:addTouchEventListenerEx(handler(self,self._onPanelTouched))
	--关闭建筑点击音效
	self._panelContainer.setClickSoundCallback(function() end)
	
    self._btnAdd:addClickEventListenerEx(handler(self,self._onPanelClick))

	--self._commonHeroIcon:setTouchEnabled(true)
	--self._commonHeroIcon:setCallBack(handler(self,self._onPanelClick))

	--self._panelStateGetAward:setTouchEnabled(true)
	self._commonBox:addClickEventListenerEx(handler(self,self._onPanelClick))
	self._btnAdd:setTouchEnabled(true)
	-- node更新函数列表
	self._stateFunc = {
		[TerritoryConst.STATE_NONE] = handler(self,self._stateNone),
		[TerritoryConst.STATE_LOCK] = handler(self,self._stateLock),
		[TerritoryConst.STATE_FIGHT] = handler(self,self._stateFight),
		[TerritoryConst.STATE_ADD] = handler(self,self._stateAdd),
		[TerritoryConst.STATE_COUNTDOWN] = handler(self,self._stateCountDown),
		[TerritoryConst.STATE_RIOT] = handler(self,self._stateRiot),
		[TerritoryConst.STATE_FINISH] = handler(self,self._stateFinish),
	}
end


function TerritoryCityNode:onEnter()
	
end

function TerritoryCityNode:onExit()
    self:clear()
end

function TerritoryCityNode:reset()
	self:clear()
	self:_stateNone()
	
    self._cityData  = TerritoryHelper.getTerritoryData(self._cityId)
	self._cityState = G_UserData:getTerritory():getTerritoryState(self._cityId) or 0 -- 状态

	self._commonBox:setParams({})
end

function TerritoryCityNode:showUI(needShow)
	if needShow == false then
		self:setVisible(false)
		return
	end

	self:setScale(0.76)
	local scaleTo = cc.ScaleTo:create(0.2,1)
	local seq = cc.Sequence:create(scaleTo)
	self:runAction(seq)
	self:setVisible(true)
end

function TerritoryCityNode:updateUI(index)
   self._cityId = index


   self:setName("TerritoryCityNode"..self._cityId)
   self:reset()

   self:updateImageView("_imageCity", Path.getChapterIcon( self._cityData.cfg.pic ))

   self._effectNode:removeAllChildren()
   G_EffectGfxMgr:createPlayMovingGfx(self._effectNode, self._cityData.cfg.island_eff, nil, nil, false)


   dump(self._cityData.name)
   if self._stateFunc[self._cityState] ~= nil then
		self._stateFunc[self._cityState]()
   end


   self._textCityName:setString(self._cityData.name)
end

function TerritoryCityNode:_updateCommonHero()
	self._commonHeroIcon:setVisible(true)
	self._panelStateGetAward:setVisible(false)

	local baseId = self._cityData.heroId
	if baseId and baseId > 0 then
		local limitLevel = self._cityData.limitLevel
		local limitRedLevel = self._cityData.limitRedLevel
		self._commonHeroIcon:updateUI(baseId, nil, limitLevel, limitRedLevel)
	end

end

function TerritoryCityNode:_setNodeVisible( visible, ... )
	local nodeList = {...}
	for i,node in pairs(nodeList) do
		if node then
			node:setVisible(visible)
		end
	end
end


-- 点击
function TerritoryCityNode:_onPanelClick()
    dump(self._cityState)
    if self._cityState == TerritoryConst.STATE_ADD then

    end

    if self._cityState == TerritoryConst.STATE_LOCK then
		G_Prompt:showTip(self._cityData.lockMsg)
		return
    end	

	if self._popupPatrol then
		return
	end
	
	local PopupTerritoryPatrol = require("app.scene.view.territory.PopupTerritoryPatrol").new()
	PopupTerritoryPatrol:updateUI(self._cityId)
	PopupTerritoryPatrol:openWithAction()
	self._popupPatrol = PopupTerritoryPatrol
	self._popupPatrolSignal = self._popupPatrol.signal:add(handler(self, self._onPopupPatrolClose))
end

--一键领取框关闭事件
function TerritoryCityNode:_onPopupPatrolClose(event)
    if event == "close" then
        self._popupPatrol = nil
		if self._popupPatrolSignal then
			self._popupPatrolSignal:remove()
			self._popupPatrolSignal = nil
		end
    end
end


-- click事件
function TerritoryCityNode:_onPanelTouched( sender,event )
	if(event == ccui.TouchEventType.began)then
		self._nodeCity:stopAllActions()
		-- self._imageCityHover:runAction(cc.FadeIn:create(0.1))
		self._nodeCity:setScale(0.9)
		if self._callback then
			self._callback()
		end
		self._clock = os.clock()
		return true
	elseif(event == ccui.TouchEventType.ended)then
		local action = self:getActionByTag(100)
		if action then
			return
		end
		self._nodeCity:stopAllActions()
		self._nodeCity:runAction(cc.ScaleTo:create(0.1,0.7))

		local passClock = os.clock() - self._clock
		local waitTime = 0.2 - passClock
		if waitTime < 0 then
			waitTime  = 0.5
		end
		local delay = cc.DelayTime:create(waitTime)
    	local sequence = cc.Sequence:create(delay, cc.CallFunc:create(handler(self,self._onPanelClick)))
		sequence:setTag(100)
    	self:runAction(sequence)
		
	elseif(event == ccui.TouchEventType.canceled)then
		self._nodeCity:stopAllActions()
		self._nodeCity:runAction(cc.ScaleTo:create(0.1,0.7))
	end
end


-- 销毁界面前取消计时器
function TerritoryCityNode:clear( )
	self:_stopCountDown()
end


function TerritoryCityNode:_updateCountDown( dt )
	local remainTime = self._cityData.endTime
	local cityId = self._cityId
	local timeString = "00:00:00"
	if remainTime > 0 then
		timeString = G_ServerTime:getLeftSecondsString(remainTime)
	end
	if remainTime < G_ServerTime:getTime() then
		logWarn("TerritoryCityNode:_updateCountDown enter finish")
		G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, nil)
		return
	end

	local pendingStr = ""
	if self._cityState == TerritoryConst.STATE_COUNTDOWN or self._cityState == TerritoryConst.STATE_RIOT then
		self._textStateName:setColor(cc.c3b(0xff, 0xb8, 0x0c)) 
		-- self._textStateName:enableOutline(Colors.SYSTEM_TIP_OUTLINE, 2)
		pendingStr = Lang.get("lang_territory_countDown")

		--在巡逻状态下，突然进行暴动了，则刷新
		if self._cityState == TerritoryConst.STATE_COUNTDOWN then
			--跳转到暴动状态，刷新
			if TerritoryHelper.isRoitState(self._cityId) == true then
				G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, nil)
				return
			end
		end

	end
	self._imageStateBk:setVisible(true)
	self._textStateName:setString(pendingStr.." "..timeString)


end

function TerritoryCityNode:_startCountDown()
	if self._timeScheduler == nil then
		self._timeScheduler = scheduler.scheduleGlobal(handler(self, self._updateCountDown),0.5)
		self:_updateCountDown()
	end
end

function TerritoryCityNode:_stopCountDown()
	if self._timeScheduler ~= nil then
		scheduler.unscheduleGlobal(self._timeScheduler)
		self._timeScheduler = nil
	end
end

--动画效果
function TerritoryCityNode:_showStateAnimation()
	if self._cityState == TerritoryConst.STATE_RIOT then
		local bg = self:getSubNodeByName("_commonHeroIcon")
		local delay = cc.DelayTime:create(0.2)
		local scaleB = cc.EaseBackIn:create(cc.ScaleTo:create(0.3, 1.2))
		local scaleS = cc.EaseBackOut:create(cc.ScaleTo:create(0.3, 1))
		local call = cc.CallFunc:create(function ( ... )
			local scalebB = cc.ScaleTo:create(0.7, 1.1)
			local scalebS = cc.ScaleTo:create(0.7, 1)
			local forever = cc.RepeatForever:create(cc.Sequence:create(scalebB,scalebS))
			bg:runAction(forever)
		end)
		local seq = cc.Sequence:create(delay,scaleB,scaleS,call)
		bg:stopAllActions()
		bg:setScale(0)
		bg:runAction(seq)
	end
end

-------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------
--领地城池状态更新
function TerritoryCityNode:_stateNone()
    logWarn("TerritoryCityNode:_stateNone")
	self._nodeFightEffect:removeAllChildren()
	
	self:_setNodeVisible(true, self._textStateName, self._levelBg, self._level)
	self:_setNodeVisible(false, self._imageHeroState,  self._imageLock,  self._commonHeroIcon, self._nodeFightEffect, self._panelStateGetAward, self._imageStateBk, self._btnAdd)

	self._commonHeroIcon:setVisible(false)
	self._commonHeroIcon:stopAllActions()

	self._imageCity:setVisible(false)
	self._effectNode:setVisible(true)
	ShaderHalper.filterNode(self._imageCity, "", true)

	--更新城池
	
    self._textCityName:setColor(Colors.TERRITRY_CITY_NAME)
    -- self._textCityName:enableOutline(Colors.TERRITRY_CITY_NAME_OUTLINE,2)
end

function TerritoryCityNode:_stateLock()
    logWarn("TerritoryCityNode:_stateLock")
	self:_setNodeVisible(true, self._imageStateBk,self._textStateName, self._levelBg, self._level)
	self:_setNodeVisible(false, self._imageHeroState,   self._imageLock,  self._nodeFightEffect, self._panelStateGetAward, self._btnAdd)

	self._textStateName:setColor(Colors.DRAK_TEXT)
	-- self._textStateName:enableOutline(Colors.DRAK_TEXT_OUTLINE, 2)
	self._textStateName:setString(Lang.get("lang_territory_state_none"))


	ShaderHalper.filterNode(self._imageCity, "gray")
	self._imageCity:setVisible(true)
	self._effectNode:setVisible(false)

    self._textCityName:setColor(Colors.TERRITRY_CITY_NAME_DRAK)
    -- self._textCityName:enableOutline(Colors.TERRITRY_CITY_NAME_DRAK_OUTLINE,2)
end

function TerritoryCityNode:_createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end
	--self._nodeFightEffect:removeAllChildren()
    G_EffectGfxMgr:createPlayMovingGfx( self._nodeFightEffect, "moving_shuangjian", effectFunction, nil, false )
end

function TerritoryCityNode:_stateFight()
    logWarn("TerritoryCityNode:_stateFight")
	self:_setNodeVisible(true, self._nodeFightEffect)
	self:_setNodeVisible(true, self._imageStateBk, self._textStateName, self._levelBg, self._level)
	self:_setNodeVisible(false, self._imageHeroState,  self._imageLock, self._panelStateGetAward, self._btnAdd)

	self:_createSwordEft()
	self._textStateName:setColor(Colors.SYSTEM_TIP)
	-- self._textStateName:enableOutline(Colors.SYSTEM_TIP_OUTLINE, 2)
	self._textStateName:setString(Lang.get("lang_territory_state_fight"))
end

function TerritoryCityNode:_stateAdd()
    logWarn("TerritoryCityNode:_stateAdd")
	self:_setNodeVisible(true, self._imageStateBk, self._textStateName, self._levelBg, self._level, self._btnAdd)
	self:_setNodeVisible(false, self._imageHeroState,  self._imageLock, self._panelStateGetAward,  self._nodeFightEffect)

	self._textStateName:setColor(Colors.SYSTEM_TIP)
	-- self._textStateName:enableOutline(Colors.SYSTEM_TIP_OUTLINE, 2)
	self._textStateName:setString(Lang.get("lang_territory_state_add"))
end

function TerritoryCityNode:_stateCountDown()
    logWarn("TerritoryCityNode:_stateCountDown")
    
	self:_setNodeVisible(true,  self._imageStateBk,self._imageHeroState, self._textStateName, self._levelBg, self._level, self._countDown)
	self:_setNodeVisible(false,  self._imageLock, self._panelStateGetAward, self._nodeFightEffect, self._btnAdd)
	self:_updateCommonHero()

    self:_startCountDown()
	--巡逻中
	self:updateImageView("_imageHeroState", Path.getTextSignet("txt_xunluozhong01"))
end

function TerritoryCityNode:_stateRiot()
    logWarn("TerritoryCityNode:_stateRiot")
	self:_setNodeVisible(true, self._textStateName, self._levelBg, self._level,  self._imageStateBk, self._panelStateGetAward)
	self:_setNodeVisible(false, self._imageHeroState,  self._imageLock, self._nodeFightEffect, self._btnAdd)

	
	local eventId, riotEvent = G_UserData:getTerritory():getFirstRiotId(self._cityId)

	
	if riotEvent then
		local eventState = TerritoryHelper.getRiotEventState(riotEvent)
	
		if eventState ~= TerritoryConst.RIOT_HELP then
			self:updateImageView("_imageHeroState",  Path.getTextSignet("txt_yiqiuzhu01") )
			self._imageHeroState:setVisible(true)
		end
	end
	
    self:_startCountDown()
	self:_updateCommonHero()
	self:_showStateAnimation()
	
	--self:updateImageView("Image_status_text", G_Url:getText_system("txt_sys_occupy_01"))
	--self:updateImageView("Image_status", G_Url:getUI_icon("img_icon_occupy02"))
end

function TerritoryCityNode:_stateFinish()
    logWarn("TerritoryCityNode:_stateFinish")
	self:_setNodeVisible(true, self._textStateName, self._levelBg, self._level, self._imageStateBk, self._panelStateGetAward)
	self:_setNodeVisible(false,  self._commonHeroIcon, self._imageLock, self._nodeFightEffect, self._btnAdd, self._countDown)
	
	self._commonHeroIcon:setVisible(false)
	if self._cityState == TerritoryConst.STATE_FINISH then
	    self._commonBox:playBoxJump()
		self._textStateName:setColor( cc.c3b(0xa8, 0xff, 0x00))
		-- self._textStateName:enableOutline(Colors.CLASS_GREEN_OUTLINE, 2)
		self._textStateName:setString(Lang.get("lang_territory_finish"))
	end

	--self:updateImageView("Image_status_text", G_Url:getText_system("txt_sys_occupy_02"))
	--self:updateImageView("Image_status", G_Url:getUI_icon("img_icon_occupy01"))
end
-------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------

return TerritoryCityNode
