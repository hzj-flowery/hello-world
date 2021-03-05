local ViewBase = require("app.ui.ViewBase")
local CarnivalActivityTaskLayer = class("CarnivalActivityTaskLayer", ViewBase)
local CustomActivityConst = require("app.const.CustomActivityConst")

function CarnivalActivityTaskLayer:ctor(actType, questType)

	self._actType = actType	
	self._listView = nil
    self._curQuests = nil
    self._questType = questType

	CarnivalActivityTaskLayer.super.ctor(self)
end

function CarnivalActivityTaskLayer:onInitCsb(resource)
	local CSHelper = require("yoka.utils.CSHelper")
	local resource = {
		file = Path.getCSB("CarnivalActivityTaskLayer", "carnivalActivity"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		},
	}
    CSHelper.createResourceNode(self, resource)
end

function CarnivalActivityTaskLayer:onCreate()
	self:_initListView(self._actType, self._questType)
end

function CarnivalActivityTaskLayer:_initListView()
	local ItemCell = require("app.scene.view.carnivalActivity.CarnivalActivityTaskCell")
	self._listView:setTemplate(ItemCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))
end

-- Describle：
function CarnivalActivityTaskLayer:_onListViewItemUpdate(item, index)
	if item then
		item:updateInfo(self._curQuests[index + 1])
	end
	
end

-- Describle：
function CarnivalActivityTaskLayer:_onListViewItemSelected(item, index)
end

-- Describle：
function CarnivalActivityTaskLayer:_onListViewItemTouch(index, params)
	local clickIndex = index + 1
	local data = self._curQuests[clickIndex]
	if  not data then
		return
	end
	--[[
	if not (self._curTermData:getState() == CustomActivityConst.STATE_ING or
		self._curTermData:getState() == CustomActivityConst.STATE_AWARD_ING) then
		G_Prompt:showTip(Lang.get("lang_carnival_activity_award_end"))
		return
	end
]]
	local actData = data.actUnitData
	if not actData:isActValid() then
		G_Prompt:showTip(Lang.get("lang_carnival_activity_award_end"))
		return
	end

	local questData = data.actTaskUnitData
	local canReceive = questData:isQuestCanReceive()
	local hasReceive = questData:isQuestHasReceive()
	local reachReceiveCondition = questData:isQuestReachReceiveCondition()
	local hasLimit = questData:checkQuestReceiveLimit()
	local timeLimit = not actData:checkActIsInReceiveTime()
	local functionId = questData:getQuestNotFinishJumpFunctionID()


	if canReceive then --可领取 
	--[[
        if not questData:checkCanExchange(true) then
			-- G_Prompt:showTip(Lang.get("common_res_not_enough"))
			return
		end
		if questData:isSelectReward() then--要弹窗，玩家选奖励　
			self:_showSelectRewarsPopup(questData)
		elseif self:_checkPkgFull(questData) then
			G_UserData:getCarnivalActivity():c2sGetCarnivalActivityAward(
				questData:getAct_id(),questData:getQuest_id(),nil,nil)
		end
		]]
		local sendFunc = function(actId, questId, awardId, awardNum)
			G_UserData:getCarnivalActivity():c2sGetCarnivalActivityAward(
				actId, questId, awardId, awardNum)
		end
		local CarnivalActivityUIHelper = require("app.scene.view.carnivalActivity.CarnivalActivityUIHelper")
		CarnivalActivityUIHelper.receiveReward(questData,sendFunc)

    elseif hasReceive then--已经领取了
    elseif hasLimit or timeLimit then--次数限制，活动当前只是预览     
    else--条件不满足
		
       if functionId ~= 0 then
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
			WayFuncDataHelper.gotoModuleByFuncId(functionId)
		elseif questData:getQuest_type() == CustomActivityConst.CUSTOM_QUEST_TYPE_PAY_SELL_ITEM then
			local payId = questData:getParam2()
			local VipPay = require("app.config.vip_pay")
			local payCfg = VipPay.get(payId)
			assert(payCfg,"vip_pay not find id "..tostring(payId))

			G_GameAgent:pay(payCfg.id, 
				payCfg.rmb, 
				payCfg.product_id, 
				payCfg.name, 
				payCfg.name)
		end
    end


end

function CarnivalActivityTaskLayer:_checkPkgFull(questData,index)
	local rewards = questData:getRewardItems()
	local selectRewards = questData:getSelectRewardItems()
	if selectRewards and selectRewards[index] then
		local newRewards = {}
		for k,v in ipairs(rewards) do
			table.insert( newRewards, v)
		end
		table.insert( newRewards, selectRewards[index])
		rewards = newRewards
	end
	local UserCheck = require("app.utils.logic.UserCheck")
	local full = UserCheck.checkPackFullByAwards(rewards)
	return  not full
end

function CarnivalActivityTaskLayer:_showSelectRewarsPopup(questData)
	local function callBackFunction(awardItem, index)
		if awardItem == nil then
			G_Prompt:showTip(Lang.get("common_choose_item"))
			return true
		end
		if not self:_checkPkgFull(questData,index) then
			return
		end
		local rewardIndex = index

		G_UserData:getCarnivalActivity():c2sGetCarnivalActivityAward(
						questData:getAct_id(),questData:getQuest_id(),rewardIndex,nil)
		return false
	end
	local awardItems = questData:getSelectRewardItems()
	local PopupSelectReward = require("app.ui.PopupSelectReward").new(Lang.get("days7activity_receive_popup"),callBackFunction)
	PopupSelectReward:setTip(Lang.get("days7activity_receive_popup_tip"))
	PopupSelectReward:updateUI(awardItems)
	PopupSelectReward:openWithAction()
end

function CarnivalActivityTaskLayer:refreshView(activityData,resetListData)
	self._curQuests = activityData:getShowQuests()
	logWarn("----------------------- II")
	logWarn(self._curQuests)
	logWarn("----------------------- II2")
	self._listView:stopAutoScroll()
	self._listView:resize(#self._curQuests)
	--self._listView:jumpToTop()
end


return CarnivalActivityTaskLayer