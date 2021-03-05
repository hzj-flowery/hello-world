local ViewBase = require("app.ui.ViewBase")
local DrawCardView = class("DrawCardView", ViewBase)

local DrawCardCell = require("app.scene.view.drawCard.DrawCardCell")
local DrawTenEffect = require("app.scene.view.drawCard.DrawTenEffect")
local DrawOneEffect = require("app.scene.view.drawCard.DrawOneEffect")
local DrawNormalEffect = require("app.scene.view.drawCard.DrawNormalEffect")
local DrawBoxCell = require("app.scene.view.drawCard.DrawBoxCell")

local SchedulerHelper = require "app.utils.SchedulerHelper"
local ParameterIDConst = require("app.const.ParameterIDConst")
local Parameter = require("app.config.parameter")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst	 = require("app.const.DataConst")
local FunctionConst = require("app.const.FunctionConst")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")

DrawCardView.ZORDER_EFFECT = 1000

DrawCardView.MONEY_DRAW_FREE = 1
DrawCardView.MONEY_DRAW_TOKEN = 2

DrawCardView.GOLD_DRAW_FREE = 1
DrawCardView.GOLD_DRAW_TOKEN = 2
DrawCardView.GOLD_DRAW_GOLD = 3

function DrawCardView:ctor()
	self._moneyDrawCell = nil	--普通招募
	self._goldDrawCell = nil 	--元宝招募
	self._goldTenDrawCell = nil		--元宝十次招募

	self._topNode = nil 	--顶部节点

	self._signalRecruitNormal = nil		--普通招募
	self._signalRecruitGold = nil		--元宝招募
	self._signalRecruitGoldTen = nil		--元宝十连
	self._signalRecruitPointGet = nil		--元宝十连

	self._moneyDrawType = DrawCardView.MONEY_DRAW_FREE
	self._goldDrawType = DrawCardView.GOLD_DRAW_FREE
	self._goldDrawTenType = DrawCardView.GOLD_DRAW_FREE

	-- self._tenEffect = nil
	-- self._oneEffect = nil
	-- self._normalEffect = nil

	self._myPoint = nil 	--我的积分
	self._pointBox1 = nil 
	self._pointBox2 = nil 
	self._pointBox3 = nil 	

	self._scheduleHandler = nil
	self._selectedBoxIndex = nil
	self._effectNode = nil

	self._btnBook = nil		--图鉴
	self._commonHelp = nil 	--说明
	self._btnInfo = nil		--积分说明

	local isBanshu = tonumber(Parameter.get(ParameterIDConst.DRAW_BANSHU_OPEN).content)
	if isBanshu == 1 then
		self._isBanshu = true
	else
		self._isBanshu = false
	end

    local resource = {
        file = Path.getCSB("DrawCardView", "drawCard"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_btnBook = {
				events = {{event = "touch", method = "_onBookClick"}}
			},
			-- _btnRule = {
			-- 	events = {{event = "touch", method = "_onRuleClick"}}
			-- },
			_btnInfo = {
				events = {{event = "touch", method = "_onInfoClick"}}
			},
		}
    }
	self:setName("DrawCardView")
    DrawCardView.super.ctor(self, resource,G_SceneIdConst.SCENE_ID_DRAW_CARD)
end

function DrawCardView:onCreate()
	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	if self._topNode then
		self._topNode:updateUI(TopBarStyleConst.STYLE_DRAW_CARD)
		self._topNode:setImageTitle("txt_sys_com_jiuguan")
	end

	self._moneyDrawCell = DrawCardCell.new(self._moneyCell)
	self._moneyDrawCell:addTouchFunc(handler(self, self._onMoneyDrawClick))
	self._moneyDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_TOKEN, 1)

	self._goldDrawCell = DrawCardCell.new(self._cashCell)
	self._goldDrawCell:addTouchFunc(handler(self, self._onGoldClick))

	self._goldTenDrawCell = DrawCardCell.new(self._cashTenCell)
	self._goldTenDrawCell:addTouchFunc(handler(self, self._onGoldTenClick))
	self._goldTenDrawCell:setRedPointVisible(false)
	self._goldTenDrawCell:setFreeVisible(false)
	self._goldTenDrawCell:setResourceVisible(true)		
	local value = tonumber(Parameter.get(ParameterIDConst.RECRUIT_GOLD_COST10).content)
	self._goldTenDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, value)

	self._pointBox1 = DrawBoxCell.new(self._box1)
	self._pointBox1:addTouchFunc(handler(self, self._boxTouch))
	local param = 
	{
		point = tonumber(Parameter.get(ParameterIDConst.RECRUIT_BOX1_POINT).content),
		-- Path.getChapterBox("baoxiangtong_kai")
		-- Path.getChapterBox("baoxiangtong_kai")
		-- Path.getChapterBox("baoxiangtong_kai")
		imageClose = Path.getChapterBox("baoxiangtong_guan"),
		imageOpen = Path.getChapterBox("baoxiangtong_kai"),
		imageEmpty = Path.getChapterBox("baoxiangtong_kong"),
	}
	self._pointBox1:setParam(param)

	self._pointBox2 = DrawBoxCell.new(self._box2)
	self._pointBox2:addTouchFunc(handler(self, self._boxTouch))
	param = 
	{
		point = tonumber(Parameter.get(ParameterIDConst.RECRUIT_BOX2_POINT).content),
		imageClose = Path.getChapterBox("baoxiangyin_guan"),
		imageOpen = Path.getChapterBox("baoxiangyin_kai"),
		imageEmpty = Path.getChapterBox("baoxiangyin_kong"),
	}
	self._pointBox2:setParam(param)

	self._pointBox3 = DrawBoxCell.new(self._box3)
	self._pointBox3:addTouchFunc(handler(self, self._boxTouch))
	param = 
	{
		point = tonumber(Parameter.get(ParameterIDConst.RECRUIT_BOX3_POINT).content),
		imageClose = Path.getChapterBox("baoxiangjin_guan"),
		imageOpen = Path.getChapterBox("baoxiangjin_kai"),
		imageEmpty = Path.getChapterBox("baoxiangjin_kong"),
	}
	self._pointBox3:setParam(param)

	self._commonHelp:updateUI(FunctionConst.FUNC_DRAW_HERO)
end

function DrawCardView:onEnter()
	-- --抛出新手事件
  
	--判断是否过期
    if G_UserData:getRecruitData():isExpired() == true then
        G_UserData:getRecruitData():c2sRecruitInfo()
    end
	self._signalRecruitInfo = G_SignalManager:add(SignalConst.EVENT_RECRUIT_INFO, handler(self, self._onEventRecruitInfo))
    self._signalRecruitNormal = G_SignalManager:add(SignalConst.EVENT_RECRUIT_NORMAL, handler(self, self._onEventRecruitNormal))
    self._signalRecruitGold = G_SignalManager:add(SignalConst.EVENT_RECRUIT_GOLD, handler(self, self._onEventRecruitGold))
    self._signalRecruitGoldTen = G_SignalManager:add(SignalConst.EVENT_RECRUIT_GOLD_TEN, handler(self, self._onEventRecruitGoldTen))
	self._signalRecruitPointGet = G_SignalManager:add(SignalConst.EVENT_RECRUIT_POINT_GET, handler(self, self._onEventRecruitPointGet))

	self._effectNode = cc.Node:create()
	self:addChild(self._effectNode, DrawCardView.ZORDER_EFFECT)
	local height = math.min(640, display.height)
	local width = math.min(1136, display.width)
	self._effectNode:setPosition(width*0.5, height*0.5)
	-- self._tenEffect = DrawTenEffect.new(self._effectNode)
	-- self._oneEffect = DrawOneEffect.new(self._effectNode)
	-- self._normalEffect = DrawNormalEffect.new(self._effectNode)
	self:_refreshMoneyCell()
	self:_refreshGoldCell()
	self:_refreshGoldTenCell()
	self:_refreshBoxState()
	self._scheduleHandler = SchedulerHelper.newSchedule(handler(self, self._refreshMoneyCell), 1)

	self._btnBook:updateUI(FunctionConst.FUNC_DRAW_CARD_HAND_BOOK )
	-- self._btnBook:addClickEventListenerEx(handler(self, self._onBookClick))

	-- self._btnRule:setIconAndString("btn_pass_explain_nml", Lang.get("recruit_rule"))
	-- self._btnRule:addClickEventListenerEx(handler(self, self._onRuleClick))

	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function DrawCardView:onExit()

	self._signalRecruitInfo:remove()
	self._signalRecruitInfo =nil
	
	self._signalRecruitNormal:remove()
	self._signalRecruitNormal = nil
	self._signalRecruitGold:remove()
	self._signalRecruitGold = nil
	self._signalRecruitGoldTen:remove()
	self._signalRecruitGoldTen = nil
	self._signalRecruitPointGet:remove()
	self._signalRecruitPointGet = nil
	if self._scheduleHandler then
		SchedulerHelper.cancelSchedule(self._scheduleHandler)
	end
	self._scheduleHandler = nil
end

DrawCardView.BOX_NUM = 3

function DrawCardView:_refreshBoxState()
	local myPoint = G_UserData:getRecruitData():getRecruit_point()
	local state = G_UserData:getRecruitData():getRecruit_point_get()
	local box3Point = tonumber(Parameter.get(ParameterIDConst.RECRUIT_BOX3_POINT).content)
	self._myPoint:setString(myPoint)
	local boxStates = bit.tobits(state)
	for i = 1, DrawCardView.BOX_NUM do
		local box = self["_pointBox"..i]
		if myPoint >= box:getBoxPoint() then
			if boxStates[i] and boxStates[i] == 1 then
				box:setBoxState(DrawBoxCell.STATE_EMPTY)
			else
				box:setBoxState(DrawBoxCell.STATE_OPEN)
			end
		else
			box:setBoxState(DrawBoxCell.STATE_NORMAL)
		end
	end
end

function DrawCardView:_refreshMoneyCell()
	local recruitData = G_UserData:getRecruitData()
	local freeCount = recruitData:getNormal_cnt()
	local lastRecuritTime = recruitData:getNormal_free_time()
	local freeTime = lastRecuritTime + tonumber(Parameter.get(ParameterIDConst.RECRUIT_TNTERVAL).content)
	local tblFreeCount = tonumber(Parameter.get(ParameterIDConst.RECRUIT_NORMAL_COUNT).content)
	if freeCount >= tblFreeCount then
		self._moneyDrawCell:setRedPointVisible(false)
		self._moneyDrawCell:setFreeVisible(false)
		self._moneyDrawCell:setResourceVisible(true)
		self._moneyDrawCell:setTextCountDown()
		self._moneyDrawType = DrawCardView.MONEY_DRAW_TOKEN 
	elseif G_ServerTime:getTime() > freeTime then
		self._moneyDrawCell:setRedPointVisible(true)
		self._moneyDrawCell:setFreeVisible(true)
		self._moneyDrawCell:setResourceVisible(false)
		self._moneyDrawCell:setTextCountDown()	
		self._moneyDrawType = DrawCardView.MONEY_DRAW_FREE 
		self._moneyDrawCell:setTextCountDown(Lang.get("recruit_free_cnt", {count1 = tblFreeCount - freeCount, count2 = tblFreeCount}))
	else
		self._moneyDrawCell:setRedPointVisible(false)
		self._moneyDrawCell:setFreeVisible(false)
		self._moneyDrawCell:setResourceVisible(true)
		local timeDiff = freeTime - G_ServerTime:getTime()
		local timeString = G_ServerTime:_secondToString(timeDiff)
		self._moneyDrawCell:setTextCountDown(Lang.get("recruit_time_count_down", {count = timeString}))
		self._moneyDrawType = DrawCardView.MONEY_DRAW_TOKEN 
	end
	local token = G_UserData:getItems():getItemNum(DataConst.ITEM_RECRUIT_TOKEN)
	if token > 0 then
		self._moneyDrawCell:setRedPointVisible(true)
	end
	if self._isBanshu then
		local leftCount = tonumber(Parameter.get(ParameterIDConst.DRAW_BANSHU_CNT).content) - recruitData:getDaily_normal_cnt()
		local getMoney = tonumber(Parameter.get(ParameterIDConst.DRAW_NORMAL_GIVE).content)
		self._moneyDrawCell:refreshBanshuInfo(getMoney, leftCount, 1)
	end
end

function DrawCardView:_refreshGoldCell()
	if self._isBanshu then
		self._goldDrawCell:setRedPointVisible(false)
		self._goldDrawCell:setFreeVisible(false)
		self._goldDrawCell:setResourceVisible(true)		
		self._goldDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 1)		
		local leftCount = tonumber(Parameter.get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData:getRecruitData():getDaily_gold_cnt()
		local getMoney = tonumber(Parameter.get(ParameterIDConst.DRAW_MONEY_GIVE).content)
		self._goldDrawCell:refreshBanshuInfo(getMoney, leftCount, 1)
		local token = G_UserData:getItems():getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN)
		if token > 0 then
			self._goldDrawType = DrawCardView.GOLD_DRAW_TOKEN
		else
			self._goldDrawType = DrawCardView.GOLD_DRAW_GOLD
		end
		if G_UserData:getRecruitData():getGold_baodi_cnt() == 1 then
			self._goldDrawCell:setTextCountDown(Lang.get("recruit_must_baodi"))
		else
			self._goldDrawCell:setTextCountDown(Lang.get("recruit_baodi_1", {count = G_UserData:getRecruitData():getGold_baodi_cnt()}))
		end
		return
	end
	local recruitData = G_UserData:getRecruitData()
	local token = G_UserData:getItems():getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN)
	if recruitData:getGold_cnt() == 0 then
		self._goldDrawCell:setRedPointVisible(true)
		self._goldDrawCell:setFreeVisible(true)
		self._goldDrawCell:setResourceVisible(false)
		self._goldDrawType = DrawCardView.GOLD_DRAW_FREE		
	elseif token > 0 then
		self._goldDrawCell:setRedPointVisible(true)
		self._goldDrawCell:setFreeVisible(false)
		self._goldDrawCell:setResourceVisible(true)		
		self._goldDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 1)
		self._goldDrawType = DrawCardView.GOLD_DRAW_TOKEN
	else
		self._goldDrawCell:setRedPointVisible(false)
		self._goldDrawCell:setFreeVisible(false)
		self._goldDrawCell:setResourceVisible(true)		
		local value = tonumber(Parameter.get(ParameterIDConst.RECRUIT_GOLD_COST1).content)
		self._goldDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, value)
		self._goldDrawType = DrawCardView.GOLD_DRAW_GOLD			
	end
	-- if token > 0 then
	-- 	self._goldDrawCell:setRedPointVisible(true)
	-- end
	if recruitData:getGold_baodi_cnt() == 1 then
		self._goldDrawCell:setTextCountDown(Lang.get("recruit_must_baodi"))
	else
		self._goldDrawCell:setTextCountDown(Lang.get("recruit_baodi_1", {count = recruitData:getGold_baodi_cnt()}))
	end
end

function DrawCardView:_refreshGoldTenCell()
	if self._isBanshu then
		self._goldTenDrawCell:setRedPointVisible(false)
		self._goldTenDrawCell:setFreeVisible(false)
		self._goldTenDrawCell:setResourceVisible(true)		
		self._goldTenDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 10)
		local leftCount = tonumber(Parameter.get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData:getRecruitData():getDaily_gold_cnt()
		local tenCount = math.floor(leftCount/10)
		local getMoney = tonumber(Parameter.get(ParameterIDConst.DRAW_MONEY_GIVE).content) * 10
		self._goldTenDrawCell:refreshBanshuInfo(getMoney, tenCount, 10)		
		local recruitData = G_UserData:getRecruitData()	
		local count = recruitData:getGold_baodi_cnt()
		
		local next = 1
		if count > 10 then
			next = 2
		end
		local goldBaodiCnt = Lang.get("recruit_baodi_count")[next]
		self._goldTenDrawCell:setTextCountDown(Lang.get("recruit_baodi_10", {count = goldBaodiCnt}))
		return
	end
	local recruitData = G_UserData:getRecruitData()	
	if recruitData:getGold_baodi_cnt() == 1 then
		self._goldTenDrawCell:setTextCountDown(Lang.get("recruit_must_baodi"))
	else
		self._goldTenDrawCell:setTextCountDown(Lang.get("recruit_baodi_1", {count = recruitData:getGold_baodi_cnt()}))
	end

	local token = G_UserData:getItems():getItemNum(DataConst.ITEM_RECRUIT_GOLD_TOKEN)
	if token >= 10 then
		self._goldTenDrawCell:setRedPointVisible(true)
		self._goldTenDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_GOLD_TOKEN, 10)
		self._goldDrawTenType = DrawCardView.GOLD_DRAW_TOKEN		
	else
		self._goldTenDrawCell:setRedPointVisible(false)	
		local value = tonumber(Parameter.get(ParameterIDConst.RECRUIT_GOLD_COST10).content)
		self._goldTenDrawCell:updateResourceInfo(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, value)
		self._goldDrawTenType = DrawCardView.GOLD_DRAW_GOLD			
	end
	
end

function DrawCardView:_onMoneyDrawClick()
	if self._moneyDrawType == DrawCardView.MONEY_DRAW_FREE then
		G_UserData:getRecruitData():c2sRecruitNormal(self._moneyDrawType)
	else
		if self._isBanshu then
			local leftCount = tonumber(Parameter.get(ParameterIDConst.DRAW_BANSHU_CNT).content) - G_UserData:getRecruitData():getDaily_normal_cnt()
			if leftCount <= 0 then
				G_Prompt:showTip(Lang.get("recruit_no_count"))
				return
			end
		end
		local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_ITEM, DataConst.ITEM_RECRUIT_TOKEN, 1)
		if success then
			G_UserData:getRecruitData():c2sRecruitNormal(self._moneyDrawType)
		end
	end
end

function DrawCardView:_onGoldClick()
	if self._goldDrawType == DrawCardView.GOLD_DRAW_GOLD then
		local PopupSystemAlert = require("app.ui.PopupSystemAlert")
		local needValue = tonumber(Parameter.get(ParameterIDConst.RECRUIT_GOLD_COST1).content)
		local alertInfo = Lang.get("recruit_confirm_info_1", {count = needValue, tokenCount = 1})
		local popupSystemAlert = PopupSystemAlert.new(Lang.get("recruit_confirm"), alertInfo, handler(self, self._sendGoldDraw))
		popupSystemAlert:setCheckBoxVisible(false)
		popupSystemAlert:openWithAction()
	else
		G_UserData:getRecruitData():c2sRecruitGoldOne(self._goldDrawType)
	end
end

function DrawCardView:_sendGoldDraw()
	--如果是半熟版本，首先判断下次数
	if self._isBanshu then
		local leftCount = tonumber(Parameter.get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData:getRecruitData():getDaily_gold_cnt()
		if leftCount <= 0 then
			G_Prompt:showTip(Lang.get("recruit_no_count"))
			return
		end
	end
	local needValue = tonumber(Parameter.get(ParameterIDConst.RECRUIT_GOLD_COST1).content)
	local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, needValue)
	if success then 
		G_UserData:getRecruitData():c2sRecruitGoldOne(self._goldDrawType)
	end
end

function DrawCardView:_onGoldTenClick()
	if self._goldDrawTenType == DrawCardView.GOLD_DRAW_GOLD then
		local PopupSystemAlert = require("app.ui.PopupSystemAlert")
		local needValue = tonumber(Parameter.get(ParameterIDConst.RECRUIT_GOLD_COST10).content)
		local alertInfo = Lang.get("recruit_confirm_info_10", {count = needValue, tokenCount = 10})
		local popupSystemAlert = PopupSystemAlert.new(Lang.get("recruit_confirm"), alertInfo, handler(self, self._sendGoldTenDraw))
		popupSystemAlert:setCheckBoxVisible(false)
		popupSystemAlert:openWithAction()
	else
		G_UserData:getRecruitData():c2sRecruitGoldTen(self._goldDrawTenType)
	end
end

function DrawCardView:_sendGoldTenDraw()
	if self._isBanshu then
		local leftCount = tonumber(Parameter.get(ParameterIDConst.DRAW_BANSHU_MONEY_CNT).content) - G_UserData:getRecruitData():getDaily_gold_cnt()
		local leftTenCount = math.floor(leftCount/10)
		if leftTenCount <= 0 then
			G_Prompt:showTip(Lang.get("recruit_no_count"))
			return
		end
	end
	local needValue = tonumber(Parameter.get(ParameterIDConst.RECRUIT_GOLD_COST10).content)
	local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_DIAMOND, needValue)
	if success then 
		G_UserData:getRecruitData():c2sRecruitGoldTen(self._goldDrawTenType)
	end
end

function DrawCardView:_onEventRecruitInfo(eventName, message)
	self:_refreshGoldCell()
	self:_refreshGoldTenCell()
	self:_refreshMoneyCell()
	self:_refreshBoxState()
end

function DrawCardView:_onEventRecruitNormal(eventName, awards)
	local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_DRAW_CARD1)
	local effect = DrawNormalEffect.new(awards)
	effect:open()
	self:_refreshMoneyCell()
	self:_refreshBoxState()
end

function DrawCardView:_onEventRecruitGold(eventName, awards)
	local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_DRAW_CARD1)
	local effect = DrawOneEffect.new(awards)
	effect:open()
	self:_refreshGoldCell()
	self:_refreshGoldTenCell()
	self:_refreshBoxState()
end

function DrawCardView:_onEventRecruitGoldTen(eventName, awards)
	local AudioConst = require("app.const.AudioConst")
    G_AudioManager:playSoundWithId(AudioConst.SOUND_DRAW_CARD10)
	local effect = DrawTenEffect.new(awards)
	effect:open()
	self:_refreshGoldCell()
	self:_refreshGoldTenCell()
	self:_refreshBoxState()
end

function DrawCardView:_boxTouch(sender)
	for i = 1, 3 do 
		local box = self["_pointBox"..i]
		if box == sender then
			local boxIndex = i
			local state = sender:getState()
			self:_openBox(boxIndex, state)
			break
		end
	end
end

function DrawCardView:_openBox(index, state)
	if state == DrawBoxCell.STATE_EMPTY then
		G_Prompt:showTip(Lang.get("recruit_already_get_hero"))
		return
	end
	local boxId = tonumber(Parameter.get(ParameterIDConst["RECRUIT_POINT_BOX_"..index]).content)
	self._selectedBoxIndex = index
	local UIPopupHelper	 = require("app.utils.UIPopupHelper")
	local itemList = UIPopupHelper.getBoxItemList(boxId)
	local popupSelectRewardTab = require("app.ui.PopupSelectRewardTab").new(Lang.get("recruit_point_box_title"),handler(self, self._getBoxReward))
	popupSelectRewardTab:updateUI(itemList)
	popupSelectRewardTab:openWithAction()
	if state == DrawBoxCell.STATE_NORMAL then
		popupSelectRewardTab:setBtnEnabled(false)
	end
end

function DrawCardView:_getBoxReward(data)
	--检查背包
    local bagFull = LogicCheckHelper.isPackFull(TypeConvertHelper.TYPE_HERO)
    if bagFull then
        return
    end
	G_UserData:getRecruitData():c2sRecruitPointGet(self._selectedBoxIndex, data.boxId, data.index)
end

function DrawCardView:_onEventRecruitPointGet(eventName, awards)
	if awards and #awards > 0 then
		local PopupGetRewards = require("app.ui.PopupGetRewards").new()
		PopupGetRewards:showRewards(awards)
	end
	self:_refreshBoxState()
end

function DrawCardView:_onBookClick()
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_HAND_BOOK)
end

-- function DrawCardView:_onRuleClick()
-- 	local PopupSystemAlert = require("app.ui.PopupSystemAlert")
-- 	local popupSystemAlert = PopupSystemAlert.new(Lang.get("recruit_rule"), Lang.get("recruit_rule_detal"))
-- 	popupSystemAlert:setCheckBoxVisible(false)
-- 	popupSystemAlert:openWithAction()	
-- end

function DrawCardView:_onInfoClick()
	local popupInfo = require("app.scene.view.drawCard.PopupInfo").new()
	popupInfo:openWithAction()
end

return DrawCardView
