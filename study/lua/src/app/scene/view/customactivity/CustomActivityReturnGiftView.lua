local ViewBase = require("app.ui.ViewBase")

local TabButtonGroup = require("app.utils.TabButtonGroup")
local Day7ActivityConst = require("app.const.Day7ActivityConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
local UIHelper = require("yoka.utils.UIHelper")
local CustomActivityReturnGiftView = class("CustomActivityReturnGiftView", ViewBase)
local CustomActivityConst = require("app.const.CustomActivityConst")
local UIPopupHelper = require("app.utils.UIPopupHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local return_charge_active = require("app.config.return_charge_active")

--回归服礼包活动
function CustomActivityReturnGiftView:ctor(actView,actType)
	self._actView = actView
	self._actType = actType
	self._customActUnitData = nil 
    --数据
	self._listDatas = nil
	self._resetListData = nil
    --节点
	self._listItemSource = nil
	self._textActTitle = nil
	self._textActDes = nil
	self._textNode = nil
	local resource = {
		file = Path.getCSB("CustomActivityTaskView", "customactivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
	CustomActivityReturnGiftView.super.ctor(self, resource)
end

function CustomActivityReturnGiftView:onCreate()
	self:_initListView(self._listItemSource)
end

function CustomActivityReturnGiftView:onEnter()
	self:_startRefreshHandler()
end

function CustomActivityReturnGiftView:onExit()
	self:_endRefreshHandler()
end

function CustomActivityReturnGiftView:_startRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
        return
	end
	self._refreshHandler = SchedulerHelper.newSchedule(handler(self,self._onRefreshTick),1)
end

function CustomActivityReturnGiftView:_endRefreshHandler()
	local SchedulerHelper = require("app.utils.SchedulerHelper")
	if self._refreshHandler ~= nil then
		SchedulerHelper.cancelSchedule(self._refreshHandler)
		self._refreshHandler = nil
	end
end


function CustomActivityReturnGiftView:_onRefreshTick( dt )
	local actUnitdata = self._customActUnitData
	if actUnitdata then
		self:_refreshActTime(actUnitdata)
	end
end

function CustomActivityReturnGiftView:_refreshActTime(actUnitData)
	local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")

	local timeStr = ""
	if actUnitData:isActInRunTime() then
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_downtime_title"))
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getEnd_time())
		-- text = Lang.get("days7activity_act_end_time",{time = timeStr})
	elseif actUnitData:isActInPreviewTime() then
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_uptime_title"))
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getStart_time())
	else
		self._textTimeTitle:setString(Lang.get("activity_guild_sprint_downtime_title"))
		timeStr = CustomActivityUIHelper.getLeftDHMSFormat(actUnitData:getAward_time())
		-- text = Lang.get("days7activity_act_reward_time",{time = timeStr})
	end
	self._textTime:setString(timeStr)
end

function CustomActivityReturnGiftView:_isExchangeAct()
	return self._actType == CustomActivityConst.CUSTOM_ACTIVITY_TYPE_SELL
end

function CustomActivityReturnGiftView:_getTemplate(data)
	local CustomActivityTaskItemCell = require("app.scene.view.customactivity.CustomActivityTaskItemCell")

	return CustomActivityTaskItemCell
end

function CustomActivityReturnGiftView:_getListViewData()
	if not self._listDatas then
		self._listDatas = G_UserData:getCustomActivity():getReturnGiftList()
    end
    
	return self._listDatas
end

function CustomActivityReturnGiftView:_getCurrListViewData()
	return self:_getListViewData() or {}
end

function CustomActivityReturnGiftView:_initListView(listView)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end

function CustomActivityReturnGiftView:_refreshListView(listView, listData)
    local cell = require("app.scene.view.customactivity.CustomActivityReturnGiftCell")
	listView:setTemplate(cell)

	local lineCount = #listData
	listView:clearAll()
	listView:resize(lineCount)
	if self._resetListData then
		listView:jumpToTop()
	end
end

--列表道具更新
function CustomActivityReturnGiftView:_onItemUpdate(item, index)
	local itemList = self:_getCurrListViewData()--所有的ListView数据
    local itemData = itemList[index +1]
    if itemData then
        item:updateInfo(itemData)
    end
end

--列表道具被选中
function CustomActivityReturnGiftView:_onItemSelected(item, index)
end

--列表道具被触摸
function CustomActivityReturnGiftView:_onItemTouch(index, itemPos)
	local returnSvr = G_UserData:getBase():getReturnSvr()
	if returnSvr == nil then
		G_Prompt:showTip(Lang.get("return_server_can_not_recharge"))
		return
	end

	logWarn("CustomActivityReturnGiftView:_onItemTouch "..tostring(index).." "..tostring(itemPos))
    local itemList = self:_getCurrListViewData()--所有的ListView数据
	local itemData = itemList[itemPos+1]
	if not itemData then
		return
    end

    local giftId = itemData.giftId

    G_UserData:getCustomActivity():c2sCheckBuyReturnGift(giftId)

    -- local giftInfo = return_charge_active.get(giftId)
    
    -- local payId = giftInfo.vip_pay_id
    -- local VipPay = require("app.config.vip_pay")
    -- local payCfg = VipPay.get(payId)
    -- assert(payCfg,"vip_pay not find id "..tostring(payId))

    -- G_GameAgent:pay(payCfg.id, 
    --     payCfg.rmb, 
    --     payCfg.product_id, 
    --     payCfg.name, 
    --     payCfg.name)
end

function CustomActivityReturnGiftView:_checkRes(actTaskUnitData)
	local items = actTaskUnitData:getConsumeItems()
	dump(items)
	-- local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local canBuy = true
	for k,v in ipairs(items) do
		canBuy = G_UserData:getCustomActivity():isEnoughValue(v.type,v.value,v.size)
		if not canBuy then
			G_Prompt:showTip(Lang.get("common_res_not_enough"))	
			return canBuy
		end
	end
	return canBuy
end


function CustomActivityReturnGiftView:_refreshListData()
    self._listDatas = G_UserData:getCustomActivity():getReturnGiftList()
    dump(self._listDatas)
	self:_refreshListView(self._listItemSource ,self._listDatas)
end

function CustomActivityReturnGiftView:_refreshDes()
	if not self._customActUnitData then
		return 
	end
	self._textActTitle:setString(self._customActUnitData:getSub_title())
	--self._textActDes:setString(self._customActUnitData:getDesc())

	self:_createProgressRichText(self._customActUnitData:getDesc())
end

function CustomActivityReturnGiftView:_createProgressRichText(msg)
	local CustomActivityUIHelper = require("app.scene.view.customactivity.CustomActivityUIHelper")
	local RichTextHelper = require("app.utils.RichTextHelper")
	local richMsg =  json.encode(CustomActivityUIHelper.getRichMsgListForHashText(
				msg,Colors.CUSTOM_ACT_DES_HILIGHT,nil,Colors.CUSTOM_ACT_DES,nil, 18))
	self._textNode:removeAllChildren()
    local widget = ccui.RichText:createWithContent(richMsg)
    widget:setAnchorPoint(cc.p(0,1))
	widget:ignoreContentAdaptWithSize(false)
	widget:setContentSize(cc.size(450,0))--高度0则高度自适应
    self._textNode:addChild(widget)
end


function CustomActivityReturnGiftView:_refreshData()
	self:_refreshDes()
	self:_refreshListData()
	if self._customActUnitData then
		self:_refreshActTime(self._customActUnitData)
	end

end

function CustomActivityReturnGiftView:refreshView(customActUnitData,resetListData)
	local oldCustomActUnitData = self._customActUnitData
	self._customActUnitData = customActUnitData 

	if not oldCustomActUnitData then
		self._resetListData = true
	elseif  customActUnitData and oldCustomActUnitData:getAct_id() ~= customActUnitData:getAct_id()  then
		self._resetListData = true
	else
		if  resetListData == nil then
			self._resetListData = true
		else
			self._resetListData = resetListData
		end
	end
	self:_refreshData()
end

return CustomActivityReturnGiftView
