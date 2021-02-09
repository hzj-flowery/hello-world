local CarnivalActivityUIHelper = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")

function CarnivalActivityUIHelper._isSingleGoodExchange(actTaskUnitData)
    local fixRewards = actTaskUnitData:getRewardItems()
    local hasSelectRewards = actTaskUnitData:isSelectReward()
    return actTaskUnitData:isExchageType() and (not hasSelectRewards)
end

function CarnivalActivityUIHelper._checkRes(actTaskUnitData)
    local items = actTaskUnitData:getConsumeItems()
    dump(items)
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local canBuy = true
	for k,v in ipairs(items) do
		if v.type == TypeConvertHelper.TYPE_RESOURCE and v.value == DataConst.RES_JADE2 then
			canBuy = canBuy and LogicCheckHelper.enoughValue(v.type,v.value,v.size,true)
			if not canBuy then
				return canBuy
			end 
		else
			canBuy = canBuy and LogicCheckHelper.enoughValue(v.type,v.value,v.size,false)
			if not canBuy then
				G_Prompt:showTip(Lang.get("common_res_not_enough"))	
				return canBuy
			end  
		end  
    end
    return canBuy
end

function CarnivalActivityUIHelper._checkPkgFull(actTaskUnitData,index)
    local rewards = actTaskUnitData:getRewardItems()
    local selectRewards = actTaskUnitData:getSelectRewardItems()
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

function CarnivalActivityUIHelper._hasGold(actTaskUnitData)
    local items = actTaskUnitData:getConsumeItems()
    for k,v in ipairs(items) do
        if v.type == TypeConvertHelper.TYPE_RESOURCE or v.value == DataConst.RES_DIAMOND  then
            return v
        end
    end
    return nil
end

function CarnivalActivityUIHelper._showSelectRewarsPopup(actTaskUnitData,sendFunc)
	local function callBackFunction(awardItem, index, total)
		local function confirmFunction()
			if awardItem == nil then
				G_Prompt:showTip(Lang.get("recruit_choose_first"))
				return true
			end
			if not CarnivalActivityUIHelper._checkPkgFull(actTaskUnitData,index) then
				return
			end
			local rewardIndex = index

			if  actTaskUnitData:isActivityExpired() then
				G_Prompt:showTip(Lang.get("customactivity_tips_already_finish"))	
				return 
			end
			sendFunc(actTaskUnitData:getAct_id(),actTaskUnitData:getId(),rewardIndex,nil)
		end
		local goldItem = CarnivalActivityUIHelper._hasGold(actTaskUnitData) 
		if goldItem then
			local hintStr = Lang.get("customactivity_buy_confirm",{count = goldItem.size})
			UIPopupHelper.popupConfirm(hintStr,confirmFunction)
		else
			confirmFunction()
		end
	end

    local awardItems = actTaskUnitData:getSelectRewardItems()
    local PopupSelectReward = require("app.ui.PopupSelectReward").new(Lang.get("days7activity_receive_popup"),callBackFunction)
    PopupSelectReward:setTip(Lang.get("days7activity_receive_popup_tip"))
    PopupSelectReward:updateUI(awardItems)
    PopupSelectReward:openWithAction()
end

function CarnivalActivityUIHelper._getMaxBuyNum (consumeItems)
	local maxNum = 9999

	for k,v in ipairs(consumeItems) do 
		local ownNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value)
		local newMaxNum = math.floor(ownNum / v.size)

		maxNum = maxNum > newMaxNum and newMaxNum or maxNum
	end

	return maxNum
end	

--活动批量兑换
function CarnivalActivityUIHelper.popupExchangeItems(actTaskUnitData,sendFunc)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local value01,value02,onlyShowMax = actTaskUnitData:getProgressValue()
	local consumeItems = actTaskUnitData:getConsumeItems()
    local fixRewards = actTaskUnitData:getRewardItems()
    local selectRewards = actTaskUnitData:getSelectRewardItems()

	local surplus = value01-- 剩余购买次数
	local item = fixRewards[1]
	assert(item,"can not find exchange gain item")

	if surplus < 0 then
		return 
	end

	local function callBackFunction(exchangeItem,consumeItems,buyCount)
		local newConsumeItems = {}
		for k,v in ipairs(consumeItems) do 
			table.insert( newConsumeItems,{type = v.type,value = v.value,size = v.size*buyCount})
		end
		--是否能购买检测
		if LogicCheckHelper.enoughValueList(newConsumeItems, false) == false then
			G_Prompt:showTip(Lang.get("common_res_not_enough"))	
			return
		end
		
		if actTaskUnitData:isActivityExpired() then
			G_Prompt:showTip(Lang.get("customactivity_tips_already_finish"))	
			return 
		end

		sendFunc(actTaskUnitData:getAct_id(),actTaskUnitData:getId(),nil,buyCount)
	end

	--背包检测
	local isFull, leftCount = LogicCheckHelper.isPackFull(item.type,item.value)
	if isFull == true then
		return
	end

	local maxCanBuyNum = CarnivalActivityUIHelper._getMaxBuyNum(consumeItems)

	surplus = surplus > maxCanBuyNum and maxCanBuyNum or surplus

	-- 临时应对方案   一对多且剩余次数为多
	if surplus == 1 or ( surplus > 1 and #fixRewards > 1 ) then
		local function callbackOK()
			callBackFunction(item,consumeItems,1)
		end
		local function hasYuanBaoCost()
			-- body
			for i,value in ipairs(consumeItems) do
				if value.type == TypeConvertHelper.TYPE_RESOURCE and value.value == DataConst.RES_DIAMOND then
					return true
				end
			end
			return false
		end

		--只有元宝才弹提示
		if hasYuanBaoCost() then
			local title = Lang.get("custom_spentyuanbao_title")
			local content = Lang.get("custom_spentyuanbao_content", {num = consumeItems[1].size})
			local popupAlert = require("app.ui.PopupAlert").new(title, content, callbackOK)
			popupAlert:openWithAction()
		else
			callBackFunction(item,consumeItems,1)
		end

		return
	end

	local popup = require("app.ui.PopupItemExchange").new(Lang.get("common_title_exchange_item"),callBackFunction)
	popup:updateUI(item,consumeItems,surplus)
	popup:setMaxLimit(math.min(surplus,leftCount))
	popup:openWithAction()	
end

function CarnivalActivityUIHelper.receiveReward(actTaskUnitData,sendFunc)
	if not CarnivalActivityUIHelper._checkRes(actTaskUnitData) then
		return
	end

	if CarnivalActivityUIHelper._isSingleGoodExchange(actTaskUnitData) then
		CarnivalActivityUIHelper.popupExchangeItems(actTaskUnitData,sendFunc)
		return
	end

	if actTaskUnitData:isSelectReward() then--要弹窗，玩家选奖励　
		CarnivalActivityUIHelper._showSelectRewarsPopup(actTaskUnitData, sendFunc)
		return
	end

	-- 不是以物易物类型  但是条件达成可以兑换了   例如每日充值领取
	if CarnivalActivityUIHelper._checkPkgFull(actTaskUnitData) then 
		sendFunc(
				actTaskUnitData:getAct_id(),actTaskUnitData:getId(),nil,nil)
	end
end

return CarnivalActivityUIHelper