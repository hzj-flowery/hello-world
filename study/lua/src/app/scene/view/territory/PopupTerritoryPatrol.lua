--领地巡逻
local PopupBase = require("app.ui.PopupBase")
local PopupTerritoryPatrol = class("PopupTerritoryPatrol", PopupBase)


local scheduler = require("cocos.framework.scheduler")
local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
local TerritoryConst = require("app.const.TerritoryConst")
local TextHelper 	= require("app.utils.TextHelper")
local TerritoryEventInfo = require("app.config.territory_event")
local TerritoryRiotInfo = require("app.config.territory_riot")
local HeroInfo		= require("app.config.hero")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local MAX_BUBBLE_WIDTH = 200

local UIHelper = require("yoka.utils.UIHelper")
function PopupTerritoryPatrol:ctor()
	self._imageAdd 		  = nil
	self._textHeroTopDesc = nil
	self._textCityName	  = nil
	self._nodeHeroBottom  = nil
	self._nodeHeroBottomDesc = nil -- richText
	self._imageBeginPatrolBottom = nil  --开始巡逻背景
	self._commonAvatar	  = nil
	self._nodeNormal	  = nil
	self._nodePatrol	  = nil
	self._imageRightDetail = nil
	self._imageRightLog	   = nil -- 巡逻日志信息
	self._scrollReward	   = nil
	self._btnCommonClick   = nil -- 通用按钮
	self._textPower		   = nil
	self._btnPatrolClick   = nil -- 巡逻按钮
	self._imageLeftHero	   = nil -- 左边ImageClick


	----------------
	self._dropItemList = {} -- 掉落ICON列表
	self._textList = {} -- 文字描述列表
	self._timeList = {} -- 时间描述列表
	self._eventList = {}
    local resource = {
        file = Path.getCSB("PopupTerritoryPatrol", "territory"),
        size = {1136, 640},
        binding = {

		}
    }
	self:setName("PopupTerritoryPatrol")
    PopupTerritoryPatrol.super.ctor(self, resource)
end

function PopupTerritoryPatrol:onCreate()
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._btnCommonClick:addClickEventListenerEx(handler(self, self._onCommonBtnClick))
	self._btnPatrolClick:addClickEventListenerEx(handler(self, self._onClickPatrol))
    -- self._imageLeftHero:addClickEventListenerEx(handler(self, self._onClickLeftImage))
    self._imageLeftHero:setTouchEnabled(true)
    self._imageLeftHero:addTouchEventListener(function(sender,eventType)
        if eventType == ccui.TouchEventType.ended then
            self:_onClickLeftImage(sender)
        end
    end)

	--修改控件背景大小
    self._textReward:setFontSize(24)
    self._textReward:setTitleColor(TerritoryConst.TITLE_COLOR)
    self._textCityDescName:setFontSize(24)
    self._textCityDescName:setTitleColor(TerritoryConst.TITLE_COLOR)
	self._textSelectPatrolTypeTitle:setFontSize(24)
	self._textPartolTitle:setFontSize(24)

	UIHelper.setTextLineSpacing(self._textCityDesc, 10)
	self._scrollReward:setItemSpacing(5)

	for i=1, 3 do
		self["_checkBox"..i]:addEventListener(handler(self, self._onCheckBox))
		self["_checkBox"..i]:setTag(i)
	end


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

function PopupTerritoryPatrol:_onCheckBox(sender)

	local isCheck = sender:isSelected()

	self._checkIndex = sender:getTag()


	self:_updatePatrolInfo(self._checkIndex)
end


function PopupTerritoryPatrol:_getPatrolCheckIndex()
	for i=1, 3 do
		local isCheck = self["_checkBox"..i]:isSelected()
		if isCheck == true then
			return i
		end
	end
	return 0
end

--刷新巡逻消耗道具描述
function PopupTerritoryPatrol:_updatePatrolInfo(checkIndex)

	for i=1, 3 do
		self["_checkBox"..i]:setSelected(false)
        self["_checkBoxText"..i]:setColor(Colors.BRIGHT_BG_TWO)
        self["_costResTxt"..i]:setColor(Colors.BRIGHT_BG_TWO)
        self["_costResNum"..i]:setColor(Colors.BRIGHT_BG_TWO)
	end
    self["_checkBoxText"..checkIndex]:setColor(Colors.SYSTEM_TARGET)
    self["_costResTxt"..checkIndex]:setColor(Colors.SYSTEM_TARGET)
    self["_costResNum"..checkIndex]:setColor(Colors.SYSTEM_TARGET)
	self["_checkBox"..checkIndex]:setSelected(true)

end
--



function PopupTerritoryPatrol:onBtnCancel()
	self:close()
end

--
function PopupTerritoryPatrol:onEnter()

	self._signalPatrolAward 	 = G_SignalManager:add(SignalConst.EVENT_TERRITORY_GETAWARD, handler(self, self._onEventPartolAward))
	self._signalRiotHelper 	 = G_SignalManager:add(SignalConst.EVENT_TERRITORY_FORHELP,  handler(self, self._onEventRiotHelper))
	self._signalPatrol 		 = G_SignalManager:add(SignalConst.EVENT_TERRITORY_PATROL, 	 handler(self, self._onEventPatrol))

	self._signalTerritoryUpdate =  G_SignalManager:add(SignalConst.EVENT_TERRITORY_UPDATEUI, handler(self,self._onEventTerritoryUpdate))

	self._signalTerritoryClickHero = G_SignalManager:add(SignalConst.EVENT_TERRITORY_CLICK_HERO,handler(self,
	self._onEventTerritoryClickHero))
end

function PopupTerritoryPatrol:onExit()

	self._signalPatrolAward:remove()
	self._signalPatrolAward = nil

	self._signalRiotHelper:remove()
	self._signalRiotHelper = nil

	self._signalPatrol:remove()
	self._signalPatrol = nil

	self._signalTerritoryUpdate:remove()
	self._signalTerritoryUpdate = nil

	self._signalTerritoryClickHero:remove()
	self._signalTerritoryClickHero = nil

	self:_stopCountDown()
end

function PopupTerritoryPatrol:_onEventTerritoryUpdate(id, message)
	logWarn("PopupTerritoryPatrol:_onEventTerritoryUpdate")
	self:updateUI(self._cityId)
end

-- 设置状态
function PopupTerritoryPatrol:setStatus( status )
	self._cityState = status

	self:clear()
	self:updateNode()
end


function PopupTerritoryPatrol:updateUI(index)

   dump(index)
   self._cityId = index


   self:reset()

   if self._stateFunc[self._cityState] ~= nil then
		self._stateFunc[self._cityState]()
   end
   self:_updateEvents()
   self:_updateNextRewardTime()
end

function PopupTerritoryPatrol:_setNodeVisible( visible, ... )
	local nodeList = {...}
	for i,node in pairs(nodeList) do
		if node then
			node:setVisible(visible)
		end
	end
end

function PopupTerritoryPatrol:_updateCountDown( dt )
	local remainTime =  self._cityData.endTime
	local timeString = "00:00:00"
	if remainTime > 0 then
		timeString = G_ServerTime:getLeftSecondsString(remainTime)
	end
	--self._imageStateBk:setVisible(true)
	self._nodeHeroBottomDesc:setVisible(false)
	self._textHeroBottom:setVisible(true)
	self._textHeroBottom:setString(Lang.get("lang_territory_countDown_ex"))
	self._nodeHeroBottom:updateLabel("Text_countDown", {visible = true, text = timeString})
	-- self._imageBeginPatrolBottom:setVisible(true)
	--self:updateLabel("Text_countDown", timeString)

	self:_updateNextRewardTime()

	if self._cityState == TerritoryConst.STATE_RIOT then
		local riotId, riotEvent = G_UserData:getTerritory():getFirstRiotId(self._cityId)
		if riotEvent then
			local riotNeedTime = tonumber(TerritoryHelper.getTerritoryParameter("riot_continue_time"))
			local riotEndTime = riotEvent.time + riotNeedTime
			local riotString = G_ServerTime:getLeftSecondsString(riotEndTime)
			local pendingStr = Lang.get("lang_territory_riot")

			self._nodeRoitTime:setVisible(true)
			self._nodeRoitTime:updateLabel("Text_RoitTime", riotString)
		end
	else
		self._textStateDes:setVisible(false)
		--跳转到暴动状态，刷新
		if TerritoryHelper.isRoitState(self._cityId) == true and self._cityState == TerritoryConst.STATE_COUNTDOWN then
			G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, nil)
			return
		end
		--self._textStateDes:setString(Lang.get("lang_territory_patrol_desc_doing"))
		--self._textStateDes:setColor(Colors.SYSTEM_TIP)
		--self._textStateDes:enableOutline(Colors.SYSTEM_TIP_OUTLINE,2)
	end

	--巡逻时间到了,刷新
	if remainTime < G_ServerTime:getTime() then
		G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_UPDATEUI, nil)
		return
	end
end

function PopupTerritoryPatrol:_startCountDown()
	if self._timeScheduler == nil then
		self._timeScheduler = scheduler.scheduleGlobal(handler(self, self._updateCountDown),0.5)
		self:_updateCountDown()
	end
end

function PopupTerritoryPatrol:_stopCountDown()
	if self._timeScheduler ~= nil then
		scheduler.unscheduleGlobal(self._timeScheduler)
		self._timeScheduler = nil
	end
end

--点击了通用按钮
function PopupTerritoryPatrol:_onCommonBtnClick(sender)
	--攻击状态
	if self._cityState == TerritoryConst.STATE_FIGHT then
		G_UserData:getTerritory():c2sAttackTerritory(self._cityId)
		self:close()
	end

	if self._cityState == TerritoryConst.STATE_FINISH then
		G_UserData:getTerritory():c2sGetPatrolAward(self._cityId)
	end

	--提前结束
	if self._cityState == TerritoryConst.STATE_COUNTDOWN then

		local function onClickConfirm()
			G_UserData:getTerritory():c2sGetPatrolAward(self._cityId)
		end
		if #self._dropItemList == 0 then
			local PopupAlert = require("app.ui.PopupAlert").new(Lang.get("common_title_notice"),
								Lang.get("lang_territory_not_award"),onClickConfirm)
			PopupAlert:openWithAction()
		else
			local PopupBoxReward = require("app.ui.PopupBoxReward").new(Lang.get("lang_territory_pre_get_patrol"),onClickConfirm)
			PopupBoxReward:updateUI(self._dropItemList)
			PopupBoxReward:openWithAction()
			PopupBoxReward:setDetailText(Lang.get("lang_territory_cancel_patrol"))
		end

	end

	if self._cityState == TerritoryConst.STATE_RIOT then
		dump( self._cityId )
		local isInGuild = G_UserData:getGuild():isInGuild()
		if isInGuild == false then
			G_Prompt:showTip(Lang.get("auction_no_guild"))
			return
		end
		local riotId = G_UserData:getTerritory():getFirstRiotId( self._cityId )
		if riotId > 0 then
			G_UserData:getTerritory():c2sTerritoryForHelp(self._cityId, riotId)
		end
	end

end

--点击了巡逻按钮
function PopupTerritoryPatrol:_onClickPatrol(sender)
	--攻击状态
	if self._chooseHeroId == nil or self._chooseHeroId == 0 then
		G_Prompt:showTip(Lang.get("lang_territory_choose_hero_error"))
		return
	end

	--检测巡逻消耗是否够
	local checkIndex = self:_getPatrolCheckIndex()
	local typeItem, needTime = TerritoryHelper.getTerritoryPatrolCost( "patrol_choice_time"..checkIndex)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	if LogicCheckHelper.enoughValue(typeItem.type,typeItem.value,typeItem.size) == false then
		return
	end

	local function callBackFunction()
		local message =  {id = self._cityId,
							patrol_type = self._checkIndex,
							hero_id = self._chooseHeroId}

		G_UserData:getTerritory():c2sPatrolTerritory( self._cityId , self._checkIndex, self._chooseHeroId )

	end
	if self._cityState == TerritoryConst.STATE_ADD then
		if self._chooseHeroId and self._chooseHeroId > 0 then
			local itemCost = typeItem.name.."X"..typeItem.size
			local hour = needTime / 3600
			local buyTimesAlert = Lang.get("lang_territory_partol_alert",
				{itemCost = itemCost, color1 = Colors.colorToNumber(typeItem.icon_color), time = hour})
			local PopupSystemAlert = require("app.ui.PopupSystemAlert").new(Lang.get("arena_buytimes_notice"),buyTimesAlert,callBackFunction)
			PopupSystemAlert:openWithAction()
			PopupSystemAlert:setCheckBoxVisible(false)

		end
	end
end


--在添加英雄状态下， 点击弹出选择英雄弹窗
function PopupTerritoryPatrol:_onClickLeftImage(sender)

	if self._cityState == TerritoryConst.STATE_ADD then
        if self._btnPatrolClick:isEnabled() == false then
			return
        end
		local PopupChooseHeroHelper = require("app.ui.PopupChooseHeroHelper")
		local PopupChooseHero = require("app.ui.PopupChooseHero").new()
		PopupChooseHero:setTitle(Lang.get("lang_territory_choose_hero_title"))

		--有可能领地巡逻的界面被关闭了，因此选择武将界面抛出事件
		local function onClickChooseHero( heroId )
			-- body
			G_SignalManager:dispatch(SignalConst.EVENT_TERRITORY_CLICK_HERO, heroId)
		end
		PopupChooseHero:updateUI(PopupChooseHeroHelper.FROM_TYPE5, onClickChooseHero)
		PopupChooseHero:openWithAction()
	end
end

-- 在巡逻，暴动状态下，npc的对话内容
function PopupTerritoryPatrol:_updateNpcAvatar()
	self._commonNpcAvatar1:setVisible(false)
	self._commonNpcAvatar2:setVisible(false)

	local config = self._cityData.cfg
	local npc1, npc2 = unpack(string.split(config.npc_value,"|"))
	self._commonNpcAvatar1:updateUI(tonumber(npc1))
	self._commonNpcAvatar2:updateUI(tonumber(npc2))

	if self._cityState == TerritoryConst.STATE_COUNTDOWN then

		self._commonNpcAvatar1:showLoopBubble(config.npc1_emote_value )
		local function delayFunc()
			self._commonNpcAvatar2:showLoopBubble( config.npc2_emote_value )
		end
		local delay = cc.DelayTime:create(2)
    	local sequence = cc.Sequence:create(delay,cc.CallFunc:create(delayFunc))
		self._commonNpcAvatar2:runAction(sequence)

	end
	if self._cityState == TerritoryConst.STATE_RIOT then

		self._commonNpcAvatar1:showLoopBubble(config.npc1_riot_bubble )
		local function delayFunc()
			self._commonNpcAvatar2:showLoopBubble( config.npc2_riot_bubble )
		end
		local delay = cc.DelayTime:create(2)
    	local sequence = cc.Sequence:create(delay,cc.CallFunc:create(delayFunc))
		self._commonNpcAvatar2:runAction(sequence)

	end
end


--刷新HeroAvatar
function PopupTerritoryPatrol:_updateHeroAvatar(heroBaseId, limitLevel, limitRedLevel)
	self._commonNpcAvatar3:setVisible(false)
	self._imageAdd:setVisible(false)

	local territoryCfg= self._cityData.cfg

	local function updateCommonHeroAvatar(heroBaseId, talkMsg)
		self._commonAvatar:setVisible(true)
		local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
		self._commonAvatar:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)
		self._commonAvatar:updateHeroName(heroParam.name, heroParam.color, true)
		self._commonAvatar:setBubble(talkMsg,nil,2,true,MAX_BUBBLE_WIDTH)
	end



	if self._cityState == TerritoryConst.STATE_COUNTDOWN or self._cityState == TerritoryConst.STATE_RIOT then

		self._commonAvatar:setVisible(false)
		self._commonNpcAvatar3:setVisible(true)
		self._commonNpcAvatar3:updateUI(heroBaseId, nil, nil, limitLevel, nil, nil, limitRedLevel)

		local moveHeroPosX,moveHeroPosY = self._commonNpcAvatar3:getPosition()
		local action3= cc.MoveTo:create(2.5, cc.p(moveHeroPosX-150,moveHeroPosY))
		local action2 = cc.CallFunc:create(function() self._commonNpcAvatar3:turnBack(true) end)
		local action4 = cc.CallFunc:create(function() self._commonNpcAvatar3:turnBack(false) end)
		local action1= cc.MoveTo:create(2.5, cc.p(moveHeroPosX+150, moveHeroPosY))
		local seq = cc.Sequence:create(action1, action2,action3,action4)
		local re=cc.RepeatForever:create(seq)
		self._commonNpcAvatar3:runAction(re)
		self._commonNpcAvatar3:setAction("run",true)
	end

	if self._cityState == TerritoryConst.STATE_FINISH then
		local talkMsg = TerritoryHelper.getBubbleContentById(territoryCfg.patrol_over_bubble)
		updateCommonHeroAvatar(heroBaseId, talkMsg)
	end

	if self._cityState == TerritoryConst.STATE_ADD then
		local talkMsg = TerritoryHelper.getBubbleContentById(territoryCfg.patrol_hero_bubble)
		updateCommonHeroAvatar(heroBaseId, talkMsg)
	end
end

function PopupTerritoryPatrol:_onEventTerritoryClickHero(eventName, heroId)

	if heroId and heroId > 0 then
		self._nodeHeroBottomDesc:removeAllChildren()
		local heroUnit = G_UserData:getHero():getUnitDataWithId(heroId)
		local heroBaseId = heroUnit:getBase_id()
		local limitLevel = heroUnit:getLimit_level()
		local limitRedLevel = heroUnit:getLimit_rtg()
		local config = heroUnit:getConfig()
		self:_updateHeroAvatar(heroBaseId, limitLevel, limitRedLevel)
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId, nil, nil, limitLevel, limitRedLevel)
        self._chooseHeroId = heroId

		local richText = Lang.get("lang_territory_patrol_hero_desc", {
            heroName = param.name,
			heroColor = Colors.colorToNumber(Colors.getColor(param.color)),
			heroFragColor = Colors.colorToNumber(Colors.getColor(config.color)),
		})

		local widget = ccui.RichText:createWithContent(richText)
		self._nodeHeroBottomDesc:addChild(widget)
		self._textHeroBottom:setVisible(false)

		self._imageRightDetail:setVisible(false)
		self._nodePatrol:setVisible(true)
		self:_updatePatrolChoose()
		--插入武将时，显示掉落武将碎片
		--以下代码仅用于显示
		do
			self:_updateEvents()
			local newDrop = self._dropItemList
			table.insert(newDrop, 1,{type= TypeConvertHelper.TYPE_FRAGMENT, value = config.fragment_id, size = 1})
			self._scrollReward:updateUI(newDrop)
		end

	end
end


--更新巡逻选择条件
function PopupTerritoryPatrol:_updatePatrolChoose()

	for i=1, 3 do
		local typeItem = TerritoryHelper.getTerritoryPatrolCost( "patrol_choice_time"..i)
		--self["_checkBox"..i]:setSelected(false)
        self["_checkBoxText"..i]:setColor(Colors.BRIGHT_BG_ONE)
        self["_costResTxt"..i]:setColor(Colors.BRIGHT_BG_ONE)
        self["_costResNum"..i]:setColor(Colors.BRIGHT_BG_ONE)
        self["_checkBoxText"..i]:setString( Lang.get( "lang_territory_patrol_"..i ) )
        self["_costResNum"..i]:setString(typeItem.size)
        
        local itemParams = TypeConvertHelper.convert(typeItem.type,typeItem.value)
        self._itemParams = itemParams
        if itemParams.res_mini then
            self["_imgRes"..i]:loadTexture(itemParams.res_mini)
        end

	end
	self._checkIndex = 1

	self._textSelectPatrolTypeTitle:setTitleAndAdjustBgSize(Lang.get("lang_territory_select_patrol_time_title"))
    self._textSelectPatrolTypeTitle:setTitleColor(TerritoryConst.TITLE_COLOR)

	self:_updatePatrolInfo(self._checkIndex)
end
-------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------

function PopupTerritoryPatrol:reset()
	self:_stopCountDown()

	if self._cityId and self._cityId > 0 then
		self._cityData = TerritoryHelper.getTerritoryData(self._cityId)
	end

	self._cityState = self._cityData.state

	self:_stateNone()
end

--领地城池状态更新
function PopupTerritoryPatrol:_stateNone()
    logWarn("PopupTerritoryPatrol:_stateNone")
	self._commonNodeBk:setTitle(Lang.get("lang_territory_patrol_title"))
	self._textCityName:setString(TextHelper.expandTextByLen( self._cityData.cfg.name, 3))
	self._textCityDesc:setString(self._cityData.cfg.directions)
	self._textStateDes:setVisible(false)

	self._nodeHeroBottom:updateLabel("Text_countDown", {visible = false})
	-- self._imageBeginPatrolBottom:setVisible(false)
	self._nextRewardTime = nil
	self._commonAvatar:stopAllActions()
	self._commonNpcAvatar3:setPosition(cc.p(340,200))
	self._commonNpcAvatar3:stopAllActions()
end

function PopupTerritoryPatrol:_stateLock()
    logWarn("PopupTerritoryPatrol:_stateLock")
	self._commonNodeBk:setTitle(Lang.get("lang_territory_patrol_title"))
end

function PopupTerritoryPatrol:_stateFight()
    logWarn("PopupTerritoryPatrol:_stateFight")
	self._commonNodeBk:setTitle(Lang.get("lang_territory_title"))
	self:_setNodeVisible(true, self._textPower,self._textPowerDesc,self._nodeNormal, self._commonAvatar,self._textCityName, self._imageRightDetail)
	self:_setNodeVisible(false,self._nodeRoitTime,self._commonNpcAvatar1,self._commonNpcAvatar2, self._textHeroTopDesc,  self._imageLock, self._imageAdd,self._imageRightLog, self._nodeHeroBottom,self._nodePatrol)

	local fightStr = Lang.get("lang_territory_tower_recommand_bp", {count = TextHelper.getAmountText(self._cityData.cfg.fight_value ) })
	self._textPower:setString(fightStr)
	local power = G_UserData:getBase():getPower()
	if power >= self._cityData.cfg.fight_value then
		self._textPower:setColor(Colors.BRIGHT_BG_GREEN)
	else
		self._textPower:setColor(Colors.BRIGHT_BG_RED)
	end
	self._btnCommonClick:setString(Lang.get("lang_territory_fight"))

	local fightCfg = self._cityData.cfg

	self._commonAvatar:setVisible(true)
	self._commonAvatar:updateUI(fightCfg.hero_id)
	self._commonAvatar:showVName(true)
	self._commonAvatar:updateHeroName(fightCfg.hero_name,fightCfg.hero_quality, true)

	local talkMsg = TerritoryHelper.getBubbleContentById(fightCfg.hero_bubble_id)
	self._commonAvatar:setBubble(talkMsg,nil,2, true, MAX_BUBBLE_WIDTH)

	self._textCityDescName:setTitleAndAdjustBgSize(Lang.get("lang_territory_city_title"))
	self._textCityDesc:setString(self._cityData.cfg.directions)

	self._textReward:setTitleAndAdjustBgSize(Lang.get("lang_territory_battle_reward"))

end


function PopupTerritoryPatrol:_stateAdd()
    logWarn("PopupTerritoryPatrol:_stateAdd")
	self._commonNodeBk:setTitle(Lang.get("lang_territory_patrol_title"))
	self._btnPatrolClick:setEnabled(true)
	self:_setNodeVisible(true, self._imageAdd, self._nodeHeroBottom, self._imageRightDetail )
	self:_setNodeVisible(false,self._nodeRoitTime,self._nodePatrol,self._commonNpcAvatar1,self._commonNpcAvatar2, self._textHeroTopDesc,
	self._textPower,self._textPowerDesc, self._commonAvatar, self._nodeNormal, self._imageLock, self._imageRightLog)

    self._textHeroBottom:setString(Lang.get("lang_territory_patrol_desc"))
	self._textReward:setTitleAndAdjustBgSize(Lang.get("lang_territory_patrol_reward"))
	self._btnPatrolClick:setString(Lang.get("lang_territory_patrol"))

	self._textCityDescName:setTitleAndAdjustBgSize(Lang.get("lang_territory_city_title"))
	self._textCityDesc:setString(self._cityData.cfg.directions)


end

function PopupTerritoryPatrol:_stateCountDown()
    logWarn("PopupTerritoryPatrol:_stateCountDown")
	self._commonNodeBk:setTitle(Lang.get("lang_territory_patrol_title"))
    self:_startCountDown()

	local baseId = self._cityData.heroId
	if baseId and baseId > 0 then
		local limitLevel = self._cityData.limitLevel
		local limitRedLevel = self._cityData.limitRedLevel
		self:_updateHeroAvatar(baseId, limitLevel, limitRedLevel)
		self:_updateNpcAvatar()
	end

	self._textReward:setTitleAndAdjustBgSize(Lang.get("lang_territory_curr_patrol_get_reward"))
    self._textPartolTitle:setTitle(Lang.get("lang_territory_partol_detail"))
    self._textPartolTitle:setTitleColor(TerritoryConst.TITLE_COLOR)

	self._btnCommonClick:setString(Lang.get("lang_territory_btn_pre_finish"))
	self._textReward:setTitleAndAdjustBgSize(Lang.get("lang_territory_curr_patrol_get_reward"))
	self:_setNodeVisible(true,self._nodeNormal, self._commonNpcAvatar3,self._textCityName,self._nodeHeroBottom, self._imageRightLog)
	self:_setNodeVisible(false,self._nodeRoitTime,self._commonAvatar,self._textHeroTopDesc,self._textPower, self._textPowerDesc,self._imageLock, self._imageAdd,self._imageRightDetail, self._nodePatrol)


end

function PopupTerritoryPatrol:_stateRiot()
    logWarn("PopupTerritoryPatrol:_stateRiot")
	self._commonNodeBk:setTitle(Lang.get("lang_territory_patrol_title"))
 	self:_startCountDown()

	self:_setNodeVisible(true, self._textHeroTopDesc, self._nodeNormal,self._commonNpcAvatar3, self._textCityName,self._nodeHeroBottom, self._imageRightLog)
	self:_setNodeVisible(false, self._textPower,self._textPowerDesc,self._nodeRoitTime, self._commonAvatar,self._imageLock, self._imageAdd,self._imageRightDetail, self._nodePatrol)

	self._btnCommonClick:setString(Lang.get("lang_territory_riot_help"))
	self._textReward:setTitleAndAdjustBgSize(Lang.get("lang_territory_curr_patrol_get_reward"))
    self._textPartolTitle:setTitle(Lang.get("lang_territory_partol_detail"))
    self._textPartolTitle:setTitleColor(TerritoryConst.TITLE_COLOR)
	local baseId = self._cityData.heroId
	if baseId and baseId > 0 then
		local limitLevel = self._cityData.limitLevel
		local limitRedLevel = self._cityData.limitRedLevel
		self:_updateHeroAvatar(baseId, limitLevel, limitRedLevel)
		self:_updateNpcAvatar()
	end


	local riotId, riotEvent = G_UserData:getTerritory():getFirstRiotId( self._cityId )
	if riotId > 0  then
		if riotEvent and riotEvent.for_help == true then
			self._btnCommonClick:setString(Lang.get("lang_territory_riot_help"))
			self._btnCommonClick:setEnabled(false)
		else
			self._btnCommonClick:setEnabled(true)
		end
		local riotInfo = G_UserData:getTerritory():getTerritoryRiotInfo(self._cityId)
		if riotInfo then
			self._textHeroTopDesc:setString( Lang.get("lang_territory_riot_title_top", {riotName = riotInfo.riot_name}))
			self._textHeroTopDesc:setColor(Colors.getColor(riotInfo.riot_color))
			-- self._textHeroTopDesc:enableOutline(Colors.getColorOutline(riotInfo.riot_color),2)
		end
	end

end

function PopupTerritoryPatrol:_stateFinish()
    logWarn("PopupTerritoryPatrol:_stateFinish")
	self._commonNodeBk:setTitle(Lang.get("lang_territory_patrol_title"))
	self:_setNodeVisible(true,self._nodeNormal, self._commonAvatar,self._textCityName, self._imageRightLog)
	self:_setNodeVisible(false,self._nodeRoitTime,self._commonNpcAvatar1,self._commonNpcAvatar3,self._commonNpcAvatar2,self._textPower,self._textPowerDesc,self._textHeroTopDesc,  self._imageLock, self._imageAdd,self._imageRightDetail, self._nodeHeroBottom,self._nodePatrol)

	self._btnCommonClick:setString(Lang.get("lang_territory_btn_finish"))

	local baseId = self._cityData.heroId
	if baseId and baseId > 0 then
		local limitLevel = self._cityData.limitLevel
		local limitRedLevel = self._cityData.limitRedLevel
		self:_updateHeroAvatar(baseId, limitLevel, limitRedLevel)
	end
	self._textReward:setTitleAndAdjustBgSize(Lang.get("lang_territory_curr_patrol_get_reward"))

	self._textPartolTitle:setTitle(Lang.get("lang_territory_partol_detail"))
    self._textPartolTitle:setTitleColor(TerritoryConst.TITLE_COLOR)

	self._textStateDes:setVisible(true)
	self._textStateDes:setString(Lang.get("lang_territory_patrol_desc_finish"))
	self._textStateDes:setColor(Colors.getColor(2))
	-- self._textStateDes:enableOutline(Colors.getColorOutline(2),2)
end

---------------------------------------------------------------------------------


function PopupTerritoryPatrol:_updateEvents()
	local events = G_UserData:getTerritory():getTerritoryEventsTillNow(self._cityId)
	self._nextRewardTime = nil
	self._listViewLog:removeAllChildren()
	self:_createNextReawrdTime()

	local itemList = {}
	local function getEventList()
		local totalCount = #events
		local eventList = {}
		local eventInfoList = {}
		local isRoit = false --是否暴乱
		local function procPartol(event)

			local eventInfo = TerritoryEventInfo.get(event.info_id)
			assert(eventInfo,"eventInfo is nil with Id " .. event.info_id)
			local awards = event.awards or {}
			if #awards > 0 then
				for i,value in ipairs(awards) do
					local key = value.type.."_"..value.value
					if itemList[key] == nil then
						itemList[key] = 0
					end
					itemList[key] = itemList[key] + value.size
				end
			end

			table.insert(eventList, event)
			table.insert(eventInfoList, eventInfo)
		end

		local function procRiot(event)
			--暴动事件已解决类型，假设暴动没解决，则不加入显示。
			--与server约定
			if event.event_type == TerritoryConst.RIOT_TYPE_OVER then
				if event.is_repress == false then
					return
				end
			end

			local riotInfo = TerritoryRiotInfo.get(event.info_id)
			assert(riotInfo,"eventInfo is nil with Id" .. event.info_id)
			table.insert(eventList, event)
			table.insert(eventInfoList, riotInfo)
		end

		local function procNextTime()

		end

		for i=totalCount,1,-1 do
			local event = events[i]
			if event ~= nil then
				local update = true
				local isRoit = false
				if  event.event_type == TerritoryConst.RIOT_TYPE_OPEN or
					event.event_type == TerritoryConst.RIOT_TYPE_OVER then
					isRoit = true
				end

				if isRoit then
					procRiot(event)
				else
					procPartol(event)
				end
			end
		end
		return eventList, eventInfoList
	end

	local function getDropItemList()
		local itemTrans = {}

		if self._cityState == TerritoryConst.STATE_FIGHT then
			for i = 1 , 3 do
				local type = self._cityData.cfg["clearance_reward_type"..i]
				if type > 0 then
					local value = self._cityData.cfg["clearance_reward_value"..i]
					local size = self._cityData.cfg["clearance_reward_size"..i]
					local itemStr = type .. "_" .. value .. "_" .. size
					table.insert(itemTrans,itemStr)
				end
			end
		end

		if self._cityState == TerritoryConst.STATE_ADD then
			for i = 1 , 5 do
				local type = self._cityData.cfg["drop_type"..i]
				if type > 0 then
					local value = self._cityData.cfg["drop_value"..i]
					local size = 0
					local itemStr = type .. "_" .. value .. "_" .. size
					table.insert(itemTrans,itemStr)
				end
			end
		end

		for k,v in pairs(itemList) do
			table.insert(itemTrans,k .. "_" .. v)
		end
		return itemTrans
	end

	local eventList, eventInfoList = getEventList()
	local itemTrans = getDropItemList()


	self._itemTrans = itemTrans
	self:_updateItems(itemTrans)
	self:_updateEventLable(eventList or {}, eventInfoList or {})
	self._listViewLog:doLayout()
	self._listViewLog:jumpToPercentVertical(100)
end


-- 更新物品Icon
function PopupTerritoryPatrol:_updateItems( itemList )


	self._dropItemList = {}
	self._scrollReward:setListViewSize(360,90)
	self._scrollReward:setMaxItemSize(4)

	for i,item in ipairs(itemList) do
		local itemInfo = string.split(item,"_")
		local type = tonumber(itemInfo[1])
		local value = tonumber(itemInfo[2])
		local size = tonumber(itemInfo[3])

		local award = {
			type = type,
			value = value,
			size = size,
		}

		table.insert(self._dropItemList, award)
	end

	self._scrollReward:updateUI(self._dropItemList)
end

--构建下一次收获时间
--下次收获时间是预选构建好的，因为时间需要倒计时
function PopupTerritoryPatrol:_createNextReawrdTime()
	if self._nextRewardTime == nil then
		local params1 ={
			name = "label1",
			text = Lang.get("lang_territory_next_time_reward_desc"),
			fontSize = 20,
			color = Colors.NORMAL_BG_ONE,
		}
		local params2 ={
			name = "label2",
			text = "[0:0:0]",
			fontSize = 20,
			color = Colors.BRIGHT_BG_ONE,
		}

		local widget = UIHelper.createTwoLabel(params1,params2)
		local size = widget:getContentSize()
		widget:setContentSize(cc.size(size.width, size.height + 6))
        widget:setVisible(false)

		self._listViewLog:pushBackCustomItem(widget)

		self._nextRewardTime = widget
	end

	if self._cityState == TerritoryConst.STATE_FINISH then
		local params1 ={
			name = "label1",
			text = Lang.get("lang_territory_patrol_finish_desc"),
			fontSize = 20,
			color = Colors.BRIGHT_BG_ONE,
		}
		local widget = UIHelper.createLabel(params1)
		local size = widget:getContentSize()
        widget:setContentSize(cc.size(size.width, size.height + 6))
    
		self._listViewLog:pushBackCustomItem(widget)
	end
end

--更新收获时间
function PopupTerritoryPatrol:_updateNextRewardTime()
	local event = self._eventList[#self._eventList]

	if self._cityState == TerritoryConst.STATE_COUNTDOWN
			or self._cityState == TerritoryConst.STATE_RIOT then

		local nextTimeStr = TerritoryHelper.getNextEventTime(self._cityData,event)

		if nextTimeStr == "-" then
			self:_updateEvents()
			return
		end
		if self._nextRewardTime then
			local label2 = self._nextRewardTime:getSubNodeByName("label2")
			self._nextRewardTime:setVisible(true)
			label2:setString("[" .. nextTimeStr .. "]")
		end
	end
end

-- 更新文字显示内容
function PopupTerritoryPatrol:_updateEventLable( eventList, eventInfoList )
	if #eventList ~= #eventInfoList then
		return
	end

	local index = 1
	local totalCount = #eventList


	--测试下创建时间
	local start = index
	local timeStart = os.clock()
	for i=totalCount,1,-1 do
		local eventInfo = eventInfoList[i]
		local event = eventList[i]
		local label = ccui.RichText:create()
		self:_updateEventLabel(label, eventInfo, event)
	end

	local curTime = os.clock()
	self._eventList = eventList

	logWarn("_updateEventLable func cost time is ::: "..curTime - timeStart)

end

------
-- 1. 在巡逻状态下，会检测是否满足下一个事件时间
-- 2. 满足条件下，则会更新新事件到listView里
-- 3. 并且将时间轴下移。

-- 更新事件文本
function PopupTerritoryPatrol:_updateEventLabel( label, eventCfg, serverData )

	local TextHelper = require("app.utils.TextHelper")
	local contents = nil
	local fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_ONE)


	if serverData.event_type == TerritoryConst.RIOT_TYPE_OPEN then 	--暴动启动
		contents = TextHelper.parseConfigText(eventCfg.riot_description)
		fontColor = Colors.colorToNumber(Colors.getColor(6))
	elseif serverData.event_type == TerritoryConst.RIOT_TYPE_OVER then --暴动解决
		contents = TextHelper.parseConfigText(eventCfg.solve_description)
		fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)
	elseif serverData.event_type == TerritoryConst.PARTOL_TYPE_FINISH then--巡逻完后曾
		contents = TextHelper.parseConfigText(eventCfg.description)
		fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_GREEN)
	else
		contents = TextHelper.parseConfigText(eventCfg.description)
		fontColor = Colors.colorToNumber(Colors.BRIGHT_BG_TWO)
	end

	-- 赋值特殊字
	local richContents = {}

	local fontSize = 22
	local baseId = G_UserData:getTerritory():getTerritoryHeroId(self._cityId)
	if baseId == nil or baseId == 0 then
		return
	end
	local heroData = HeroInfo.get(baseId)
	if heroData == nil then
		return 0
	end
	local limitLevel = G_UserData:getTerritory():getTerritoryLimitLevel(self._cityId)
	local limitRedLevel = G_UserData:getTerritory():getTerritoryLimitRedLevel(self._cityId)
	local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, baseId, nil, nil, limitLevel, limitRedLevel)

	local timeStr = {
		type = "text",
		msg = "[" .. os.date("%H:%M:%S",serverData.time) .. "]",
		color = Colors.colorToNumber(Colors.BRIGHT_BG_TWO),
		fontSize = fontSize,
		opacity = 255
	}
	table.insert(richContents , timeStr)

	--根据奖励信息，生成奖励描述
	local function genAwardRichDesc(awards)
		if #awards <= 0 then
			return
		end

		for i,value in ipairs(awards) do
			if value.type > 0 then
				local param = TypeConvertHelper.convert(value.type, value.value)
				local color = Colors.colorToNumber(Colors.getColor(param.cfg.color))
				local itemDesc = param.cfg.name .. "x" .. value.size.." "
				table.insert(richContents,
				{
					type = "text",
					msg = itemDesc,
					color = color,
					fontSize = fontSize,
					opacity = 255
				})
			end
		end
	end


	for i,content in ipairs(contents) do
		local text = content.content
		local color = fontColor --Colors.colorToNumber(Colors.getColor(eventCfg.color))
		local outlineColor = nil
		local outlineSize = nil
		if text == "hero" then
			color = Colors.colorToNumber(Colors.getColor(heroParam.color))
			text = heroParam.name
			if heroParam.color==7 then
				outlineColor = Colors.colorToNumber(Colors.getColorOutline(heroParam.color))
				outlineSize = 2
			end
		elseif text == "reward" then
			local awards = serverData.awards or {}
			genAwardRichDesc(awards)
			text = ""
		elseif text == "name" then
			text = serverData.fname
			color = Colors.colorToNumber(Colors.getOfficialColor(serverData.office_level))
		elseif text == "riot_name" then
			color = Colors.colorToNumber(Colors.getColor(eventCfg.riot_color))
			text = eventCfg.riot_name
		end
		table.insert(richContents,
		{
			type = "text",
			msg = text,
			color = color,
			fontSize = fontSize,
			opacity = 255,
			outlineColor = outlineColor,
			outlineSize = outlineSize
		})
	end

	label:setContentSize(cc.size(360, 0))
	label:setRichText(richContents)
	label:setVerticalSpace(7)
	label:setAnchorPoint(cc.p(0,0))
	label:setCascadeOpacityEnabled(true)
	label:ignoreContentAdaptWithSize(false)
	label:formatText()
	--label自动换行支持
	local virtualContentSize = label:getVirtualRendererSize()

	label:setContentSize(cc.size(virtualContentSize.width, virtualContentSize.height + 7 ))

	self._listViewLog:insertCustomItem(label,0)

	return label
end


--收到巡逻奖励获得事件，则关闭界面
function PopupTerritoryPatrol:_onEventPartolAward(id, message)

	self:close()
end


function PopupTerritoryPatrol:_onEventRiotHelper(id, message)
	if message.ret ~= 1 then
		return
	end
	--重新拉去军团驻地信息

	G_Prompt:showTip("军团求助成功")

	self:updateUI(self._cityId)
	--self:close()
end


-- 发动巡逻时，回调动画
function PopupTerritoryPatrol:_onEventPatrol(id, message)
	local function callback()
		self:updateUI(self._cityId)
	end

	self._btnPatrolClick:setEnabled(false)
	self._commonAvatar:stopAllActions()
	local territoryCfg= self._cityData.cfg
	local talkMsg = TerritoryHelper.getBubbleContentById(territoryCfg.start_hero_bubble)
	self._commonAvatar:setBubble(talkMsg, 0.1, 2, true,MAX_BUBBLE_WIDTH)

	local delay = cc.DelayTime:create(1.5)
    local sequence = cc.Sequence:create(delay, cc.CallFunc:create(callback))
    self._commonAvatar:runAction(sequence)
end



return PopupTerritoryPatrol
