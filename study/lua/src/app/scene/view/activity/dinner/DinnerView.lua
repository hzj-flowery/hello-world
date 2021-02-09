--@Author:Conley
local ActivitySubView = require("app.scene.view.activity.ActivitySubView")
local SchedulerHelper = require("app.utils.SchedulerHelper")
local DinnerView = class("DinnerView", ActivitySubView)


-- DinnerView.IN_DINNER_RES  = {bg = "img_yanhui_zhuozi"}--饮宴时资源
-- DinnerView.NOT_DINNER_RES  = {bg = "img_meals1"}--非饮宴时资源


function DinnerView:ctor(mainView,activityId)
	self._mainView = mainView
	self._activityId = activityId
	self._textTitle = nil--标题
	self._commonBubble = nil--NPC对话
    self._imageDesk = nil--桌子背景
	self._textDinnerTime01 = nil--用餐时间
    self._textDinnerTime02 = nil
    self._textDinnerTime03 = nil
	self._textDinnerName01 = nil--用餐标题
	self._textDinnerName02 = nil
	self._textDinnerName03 = nil
    self._textCD = nil--cd内容
	self._textCDHint = nil--cd之外的提示
	self._textCDTitle = nil--cd标题
	self._imageClick = nil--点击吃体力的背景
	self._dinnerNameTimeTexts = nil--用餐标题时间控件列表
	self._currNpcText = nil--NPC显示文字
	self._listDatas = nil
	self._refreshHandler = nil
	self._clickEffectShow = nil--吃包子的提示是否显示了
    local resource = {
        file = Path.getCSB("DinnerView", "activity/dinner"),
        binding = {
			_imageClick = {
				events = {{event = "touch", method = "_onClickEat"}}
			}
		},
    }
    DinnerView.super.ctor(self, resource)
end

function DinnerView:_pullData()
	local hasActivityServerData = G_UserData:getActivity():hasActivityData(self._activityId)
	if not hasActivityServerData  then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end
	return hasActivityServerData
end

function DinnerView:onCreate()

	self._dinnerNameTimeTexts = {
		{self._textDinnerName01,self._textDinnerTime01},
		{self._textDinnerName02,self._textDinnerTime02},
		{self._textDinnerName03,self._textDinnerTime03},
	}

	-- local imgPath = Path.getChatRoleRes("216")
	-- self._imageJc:loadTexture(imgPath)

	self:_initDinnerTimeText()
	self._hero:updateUI(216)
    self._hero:setScaleX(-1.5)
	self._hero:setScaleY(1.5)
end

function DinnerView:onEnter()
	self._signalWelfareDinnerGetInfo = G_SignalManager:add(SignalConst.EVENT_WELFARE_DINNER_GET_INFO, handler(self, self._onEventWelfareDinnerGetInfo))
	self._signalWelfareDinnerEat = G_SignalManager:add(SignalConst.EVENT_WELFARE_DINNER_EAT, handler(self, self._onEventWelfareDinnerEat))
	self._signalWelfareDinnerReEat = G_SignalManager:add(SignalConst.EVENT_WELFARE_DINNER_REEAT, handler(self, self._onEventWelfareDinnerReEat))

	local hasServerData = self:_pullData()
	if hasServerData and G_UserData:getActivityDinner():isExpired() then
		G_UserData:getActivity():pullActivityData(self._activityId)
	end

	self:_refreshData()

	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function DinnerView:onExit()
	self._signalWelfareDinnerGetInfo:remove()
	self._signalWelfareDinnerGetInfo = nil

	self._signalWelfareDinnerEat:remove()
	self._signalWelfareDinnerEat = nil

	self._signalWelfareDinnerReEat:remove()
	self._signalWelfareDinnerReEat = nil

	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end

function DinnerView:enterModule()
	self._currNpcText = nil
	self:_refreshNpcText()
end

function DinnerView:_onRefreshTick(dt)
	self:_refreshData()
end

function DinnerView:_refreshData()
	self:_refreshDinnerTimeText()
	self:_refreshNpcText()
	self:_refreshCdText()
    self:_refreshClickEffect()
end

function DinnerView:_onEventWelfareDinnerGetInfo(event,id,message)
	self:_refreshData()
end

function DinnerView:_onEventWelfareDinnerEat(event,id,message)
	self:_refreshData()

	self:_onShowRewardItems(message)
end

--补吃宴席
function DinnerView:_onEventWelfareDinnerReEat(event,id,message)
	self:_refreshData()

	self:_onShowRewardItems(message)
end

function DinnerView:_onShowRewardItems(message)
	local awards = rawget(message,"awards") or {}
	if awards then
		G_Prompt:showAwards(awards)
	end
	self._hero:playAnimationOnce("style")
end

function DinnerView:_onClickEat(sender)
	G_UserData:getActivityDinner():c2sActDinner()
end


function DinnerView:_initDinnerTimeText()
	local dinnerUnitDatas = G_UserData:getActivityDinner():getTodayAllDinnerUnitDatas()
	for k,nameTimeText in ipairs(self._dinnerNameTimeTexts ) do
		local dinnerUnitData = dinnerUnitDatas[k]
		if not dinnerUnitData then
			nameTimeText[1]:setVisible(false)
			nameTimeText[2]:setVisible(false)
		else
			nameTimeText[1]:setVisible(true)
			nameTimeText[2]:setVisible(true)
			nameTimeText[1]:setString(dinnerUnitData:getConfig().name..Lang.get("lang_activity_dinner_colon"))
			nameTimeText[2]:setString(dinnerUnitData:getConfig().time_txt)
		end
	end

end

function DinnerView:_refreshDinnerTimeText()
	local dinnerUnitDatas = G_UserData:getActivityDinner():getTodayAllDinnerUnitDatas()
	self._selectImage:setVisible(false)
	for k,nameTimeText in ipairs(self._dinnerNameTimeTexts ) do
		local dinnerUnitData = dinnerUnitDatas[k]
		if dinnerUnitData  then
			 if dinnerUnitData:isInDinnerTime() then
			 	 nameTimeText[1]:setColor(Colors.BRIGHT_BG_RED)
		         nameTimeText[2]:setColor(Colors.BRIGHT_BG_RED)
				 self._selectImage:setPositionY(nameTimeText[1]:getPositionY())
				 self._selectImage:setVisible(true)
			 else
			 	 nameTimeText[1]:setColor(Colors.BRIGHT_BG_TWO)
		         nameTimeText[2]:setColor(Colors.BRIGHT_BG_TWO)

			 end
		end
	end
end

function DinnerView:_runClickZoomAction(node)
	node:stopAllActions()
	local action1 = cc.ScaleTo:create(0.6, 1.3)
	local action2 = cc.ScaleTo:create(0.6, 1)
	local seq = cc.Sequence:create(action1, action2)
	local rep = cc.RepeatForever:create(seq)
	node:runAction(rep)
end

function DinnerView:_refreshCdText()
	local hasData = G_UserData:getActivityDinner():getBaseActivityData():isHasData()
	if not hasData then
		self._textCD:setVisible(false)
		self._textCDTitle:setVisible(false)
		self._textCDHint:setVisible(false)
		return
	end
	local text,cdText = self:_getCDHintText()

	if cdText then
		self._textCD:setVisible(true)
		self._textCDTitle:setVisible(true)
		self._textCDHint:setVisible(false)

		self._textCD:setString(cdText)
		self._textCDTitle:setString(text)
	else
		self._textCD:setVisible(false)
		self._textCDTitle:setVisible(false)
		self._textCDHint:setVisible(true)
		self._textCDHint:setString(text)
	end

end

function DinnerView:_getCDHintText()
	local actDinner = G_UserData:getActivityDinner()
	local currDinnerUnitData = actDinner:getCurrDinnerUnitData()
	if currDinnerUnitData then--在宴会时间点内
		if not currDinnerUnitData:hasEatDinner() then
			return Lang.get("lang_activity_dinner_cd_hint_01",{dinnerName = currDinnerUnitData:getConfig().name})
		end
	end

	local nextDinnerUnitData = actDinner:getNextDinnerUnitData()
	if nextDinnerUnitData then
		local curTime = G_ServerTime:getTime()
		local hasSeconds = G_ServerTime:secondsFromToday(curTime)
		local cdSeconds = nextDinnerUnitData:getStartTime()-hasSeconds
		local cdText = G_ServerTime:_secondToString(cdSeconds)
		return Lang.get("lang_activity_dinner_cd_hint_02"),cdText
	else
		return Lang.get("lang_activity_dinner_cd_hint_03")--今天的宴会已经结束
	end

end

--返回NPC文字
function DinnerView:_getNpcText()
	-- local currtDinnerUnitData = G_UserData:getActivityDinner():getCurrDinnerUnitData()
	-- if not currtDinnerUnitData then
	-- 	return Lang.get("lang_activity_dinner_npc_hint_1")
	-- else
	-- 	if not currtDinnerUnitData:hasEatDinner() then
	-- 		return currtDinnerUnitData:getConfig().chat_before
	-- 	else
	-- 		return currtDinnerUnitData:getConfig().chat_after
	-- 	end
	-- end
end

function DinnerView:_refreshNpcText()
	-- local hasData = G_UserData:getActivityDinner():getBaseActivityData():isHasData()
	-- if not hasData then
	-- 	-- self._commonBubble:setVisible(false)
	-- 	self._currNpcText = nil
	-- else
	-- 	local npcText = self:_getNpcText()
	-- 	-- self._commonBubble:setVisible(true)
	-- 	self:_setNpcText(npcText)
	-- end
end

function DinnerView:_setNpcText(text)
	-- if self._currNpcText == text then
	-- 	return
	-- end
	-- self._currNpcText = text
	-- self._commonBubble:setString(text,325,true,325,76)
end

function DinnerView:_refreshClickEffect()
	local hasData = G_UserData:getActivityDinner():getBaseActivityData():isHasData()
	local currDinnerUnitData = G_UserData:getActivityDinner():getCurrDinnerUnitData()
	if currDinnerUnitData and not currDinnerUnitData:hasEatDinner() then
		self:_showClickEffect(true)
	else
	    self:_showClickEffect(false)
	end
end

function DinnerView:_showClickEffect(isShow)
	if self._clickEffectShow == isShow then
		return
	end
	self._clickEffectShow = isShow
	if isShow then
		-- self._imageDesk:loadTexture(Path.getActDinnerRes(DinnerView.IN_DINNER_RES.bg))
		self._chicken:setVisible(true)
		self._imageWine:loadTexture(Path.getActivityRes("img_yanhui_jiu"))
		self._imageClick:setVisible(true)

		self:_runClickZoomAction(self._imageClick)
	else
		self._imageWine:loadTexture(Path.getActivityRes("img_yanhui_jiukai"))
		self._chicken:setVisible(false)
		-- self._imageDesk:loadTexture(Path.getActDinnerRes(DinnerView.NOT_DINNER_RES.bg))
		self._imageClick:setVisible(false)
	end
end


return DinnerView
