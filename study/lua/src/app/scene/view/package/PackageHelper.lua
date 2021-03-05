local PackageHelper = {}

local PackageViewConst = require("app.const.PackageViewConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

-- 获取顶部标签文本
function PackageHelper.getTabGroup2TextList(index)
	if index == PackageViewConst.TAB_ITEM then
		return {Lang.get("package_tab_btn1")}
	elseif index == PackageViewConst.TAB_SILKBAG then
		return {Lang.get("package_tab_btn5")}
	else
		return {Lang.get("package_tab_btn2")}
	end
end

-- 获取历代名将子页签
function PackageHelper.getHistoryHeroSubTab(isWeapon)
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local PackageViewConst = require("app.const.PackageViewConst")
	local FunctionConst	= require("app.const.FunctionConst")
	local isHistoryHeroOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	local isHistoryHeroWeaponOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	local isHistoryHeroFragmentOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HEROPIECE_LIST)

	local tabList = {}
	local tabIndex = {}

	if not isWeapon then
		if isHistoryHeroOpen then
			local tabName = Lang.get("package_tab_btn10_1")
			table.insert(tabList, tabName)
			table.insert(tabIndex, {name=tabName, subId=#tabList, index=#tabList})
		end

		if isHistoryHeroFragmentOpen then
			local tabName = Lang.get("package_tab_btn10_2")
			table.insert(tabList, tabName)
			table.insert(tabIndex, {name=tabName, subId=#tabList, index=#tabList})
		end
	else
		if isHistoryHeroWeaponOpen then
			local tabName = Lang.get("package_tab_btn11_1")
			table.insert(tabList, tabName)
			table.insert(tabIndex, {name=tabName, subId=#tabList, index=#tabList})
		end

		if isHistoryHeroFragmentOpen then
			local tabName = Lang.get("package_tab_btn11_2")
			table.insert(tabList, tabName)
			table.insert(tabIndex, {name=tabName, subId=#tabList, index=#tabList})
		end
	end

	return tabList, tabIndex
end

function PackageHelper.getPackageTabList(...)
	-- body
	local FunctionCheck = require("app.utils.logic.FunctionCheck")
	local isSilkbagOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_SILKBAG)
	local isHaveSilkbag = G_UserData:getSilkbag():isHaveSilkbag()
	local isWakenOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HERO_TRAIN_TYPE3)
	local isJadeOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)
	local isHistoryHeroOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	local isHistoryHeroWeaponOpen = FunctionCheck.funcIsOpened(FunctionConst.FUNC_HISTORY_HERO)
	-- local isBagMerge = require("app.utils.UserDataHelper").isEnoughBagMergeLevel()

	local PackageViewConst = require("app.const.PackageViewConst")

	local textList = {Lang.get("package_tab_btn1")}
	local tabFuncList = {PackageViewConst.TAB_ITEM}

	if isSilkbagOpen or isHaveSilkbag then --功能已开启，或者有锦囊
		table.insert(textList, Lang.get("package_tab_btn5"))
		table.insert(tabFuncList, PackageViewConst.TAB_SILKBAG)
	end
	if isJadeOpen then
		table.insert(textList, Lang.get("package_tab_btn9"))
		table.insert(tabFuncList, PackageViewConst.TAB_JADESTONE)
	end

	-- if isBagMerge then --合并界面
	-- 	table.insert(textList, Lang.get("package_tab_btn6"))
	-- 	table.insert(tabFuncList, PackageViewConst.TAB_EQUIPMENT)
	-- 	table.insert(textList, Lang.get("package_tab_btn7"))
	-- 	table.insert(tabFuncList, PackageViewConst.TAB_TREASURE)
	-- 	table.insert(textList, Lang.get("package_tab_btn8"))
	-- 	table.insert(tabFuncList, PackageViewConst.TAB_INSTRUMENT)
	-- end

	if isWakenOpen then
		table.insert(textList, Lang.get("package_tab_btn2"))
		table.insert(tabFuncList, PackageViewConst.TAB_GEMSTONE)
	end

	if isHistoryHeroOpen then
		table.insert(textList, Lang.get("package_tab_btn10"))
		table.insert(tabFuncList, PackageViewConst.TAB_HISTORYHERO)
	end

	if isHistoryHeroWeaponOpen then
		table.insert(textList, Lang.get("package_tab_btn11"))
		table.insert(tabFuncList, PackageViewConst.TAB_HISTORYHERO_WEAPON)
	end

	return textList, tabFuncList
end

function PackageHelper.getPackageAwarkTabIndx(...)
	local tabList = PackageHelper.getPackageTabList()
	for i, value in ipairs(tabList) do
		if value == Lang.get("package_tab_btn2") then
			return i
		end
	end
	return 1
end

-- 获取背包tab的索引index
function PackageHelper.getPackTabIndex(tabId)
	local _, funcList = PackageHelper.getPackageTabList()
	for i, value in ipairs(funcList) do
		if value == tabId then
			return i
		end
	end
	return nil
end

-- 弹出使用物品弹窗
function PackageHelper.popupUseItem(itemId, oneItemAlsoShow)
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
	local itemConfig = itemParam.cfg
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	--使用宝箱
	local isFull, leftCount = LogicCheckHelper.isPackFull(TypeConvertHelper.TYPE_ITEM, itemId)
	if isFull == true then
		return
	end
	--使用物品加入等级限制
	if G_UserData:getBase():getLevel() < itemConfig.level_limit then
		G_Prompt:showTip(
			Lang.get("package_item_use_level_limit", {level = itemConfig.level_limit, itemName = itemConfig.name})
		)
		return
	end

	local tableFunc = PackageHelper.getItemFuncTable(itemConfig.item_type)
	if tableFunc then
		tableFunc.useFunc(
			{["itemConfig"] = itemConfig, ["itemId"] = itemId, ["leftCount"] = leftCount, ["oneItemAlsoShow"] = oneItemAlsoShow}
		)
	end
end

function PackageHelper.usePreCheck(itemConfig)
	local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemConfig.id)
	--获取资源最大使用上限,体力丹，精力丹等
	local maxValue = UserDataHelper.getResItemMaxUseNum(itemConfig.id)
	if maxValue == -1 then
		maxValue = itemNum
	end
	maxValue = math.min(maxValue, itemNum)
	if maxValue <= 0 then
		if itemConfig.item_type == 8 then
			--黄金宝箱or钥匙不足
			local function showBuyDlg()
				--弹出购买宝箱or钥匙界面
				local ShopConst = require("app.const.ShopConst")
				local shopItemData =
					G_UserData:getShops():getFixShopGoodsByResId(
					ShopConst.NORMAL_SHOP,
					TypeConvertHelper.TYPE_ITEM,
					tonumber(itemConfig.key_value)
				)
				local UIPopupHelper = require("app.utils.UIPopupHelper")
				UIPopupHelper.popupFixShopBuyItem(shopItemData)
			end
			G_Prompt:showTipDelay(itemConfig.tips, showBuyDlg, 0.4)
		elseif itemConfig.item_type == 9 then
			--卷轴不够提示
			G_Prompt:showTip(itemConfig.tips)
		elseif itemConfig.item_type == 14 then
			G_Prompt:showTip(itemConfig.tips)
		else
			G_Prompt:showTip(Lang.get("common_use_res_max"))
		end
		return false
	end
	return true, maxValue
end

function PackageHelper._useItemType(itemId, leftCount, oneItemAlsoShow)
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_ITEM, itemId)
	local itemConfig = itemParam.cfg
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")

	local function callBackFunction(itemId, count)
		G_UserData:getItems():c2sUseItem(itemId, count, 0, 0)
		logWarn("confirm PopupBuyOnce item id is id: " .. itemId .. "  count: " .. count)
		return false
	end
	local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, itemConfig.id)
	if (itemNum > 1 or oneItemAlsoShow == true) and itemConfig.use_type ~= 1 then
		local result, maxValue = PackageHelper.usePreCheck(itemConfig)
		if result == false then
			return
		end
		local PopupItemUse = require("app.ui.PopupItemUse").new(Lang.get("popup_item_use"), callBackFunction)
		PopupItemUse:updateUI(TypeConvertHelper.TYPE_ITEM, itemConfig.id)
		PopupItemUse:setMaxLimit(maxValue)
		local DataConst = require("app.const.DataConst")
		if DataConst.JADE_STONE_BOX[itemConfig.id] then
			PopupItemUse:setTextTips(Lang.get("max_open_jade_stone_nums"))
		else
			PopupItemUse:setTextTips(itemConfig.description)
		end
		PopupItemUse:setOwnerCount(itemNum)
		PopupItemUse:openWithAction()
		return PopupItemUse
	else
		if PackageHelper.usePreCheck(itemConfig) == false then
			return
		end
		callBackFunction(itemConfig.id, 1)
	end
end

local funcBoostItem = function(params) -- 增益类物品
	PackageHelper._useItemType(params.itemId, params.leftCount, params.oneItemAlsoShow)
end

local funcBoxItem = function(params) --宝箱类物品
	local boxId = params.itemConfig.item_value
	local showNumSelect = (params.itemConfig.backup_value ~= "1") and true or false 	-- 是否显示选择数量的节点，变身卡任选箱不显示
	local UIPopupHelper = require("app.utils.UIPopupHelper")
	local itemList = UIPopupHelper.getBoxItemList(boxId, params.itemId)

	local function callBackFunction(awardItem, index, total)
		dump(awardItem)
		dump(total)
		if awardItem == nil then
			G_Prompt:showTip(Lang.get("common_choose_item"))
			return true
		end
		G_UserData:getItems():c2sUseItem(awardItem.itemId, total or 1, 0, awardItem.index, awardItem.boxId)
		--logWarn("confirm PopupBuyOnce item id is id: "..itemId.."  count: "..count)
		return false
	end
	local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, params.itemConfig.id)
	local itemListSize = table.nums(itemList)
	if itemListSize == 1 then
		local awardItem = nil
		for i, awards in pairs(itemList) do
			awardItem = awards
		end

		local maxValue = math.min(itemNum, params.leftCount)

		if itemNum == 1 then
			local PopupSelectReward =
				require("app.ui.PopupSelectReward").new(Lang.get("popup_title_select_reward"), callBackFunction)
			PopupSelectReward:updateUI(awardItem)
			PopupSelectReward:openWithAction()
		else
			local PopupSelectRewardNum =
				require("app.ui.PopupSelectRewardNum").new(Lang.get("popup_title_select_reward"), callBackFunction)
			PopupSelectRewardNum:updateUI(awardItem)
			PopupSelectRewardNum:setMaxLimit(maxValue)
			PopupSelectRewardNum:openWithAction()
		end
	elseif itemListSize > 1 then
		local maxValue = math.min(itemNum, params.leftCount)

		if itemNum == 1 then
			local PopupSelectRewardTab =
				require("app.ui.PopupSelectRewardTab").new(Lang.get("popup_title_select_reward"), callBackFunction)
			PopupSelectRewardTab:updateUI(itemList)
			PopupSelectRewardTab:openWithAction()
		else
			local PopupSelectRewardTabNum =
				require("app.ui.PopupSelectRewardTabNum").new(Lang.get("popup_title_select_reward"), callBackFunction)
			PopupSelectRewardTabNum:updateUI(itemList)
			PopupSelectRewardTabNum:setMaxLimit(maxValue)
			if not showNumSelect then
				PopupSelectRewardTabNum:hideNumSelect()
			end
			PopupSelectRewardTabNum:openWithAction()
		end
	end
end

local funcGoToItem = function(params) --跳转物品
	local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
	WayFuncDataHelper.gotoModuleByFuncId(params.itemConfig.function_id)
end

local funcTokenItem = function(params) -- 令牌/材料物品
	local function callBackFunction(itemId, count)
		G_UserData:getItems():c2sUseItem(itemId, count, 0, 0)
		return false
	end
	local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_ITEM, params.itemConfig.id)
	if itemNum > 1 or oneItemAlsoShow == true then
		--获取资源最大使用上限,体力丹，精力丹等
		local maxValue = UserDataHelper.getResItemMaxUseNum(params.itemConfig.id)
		if maxValue == -1 then
			maxValue = itemNum
		end
		maxValue = math.min(maxValue, itemNum)
		--maxValue = maxValue - G_UserData:getBase():getResValue(DataConst.RES_TOKEN)
		if maxValue <= 0 then
			G_Prompt:showTip(Lang.get("common_use_res_max"))
			return
		end
		local PopupItemUse = require("app.ui.PopupItemUse").new(Lang.get("popup_item_use"), callBackFunction)
		PopupItemUse:updateUI(TypeConvertHelper.TYPE_ITEM, params.itemConfig.id)
		PopupItemUse:setMaxLimit(maxValue)
		PopupItemUse:setTextTips(params.itemConfig.description)
		PopupItemUse:setOwnerCount(itemNum)
		PopupItemUse:openWithAction()
	else
		--物品为一个，直接使用
		callBackFunction(params.itemConfig.id, 1)
	end
end

PackageHelper._ITEM_TYPE_DROP = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_BOX = {
	useFunc = function(params)
		funcBoxItem(params)
	end
}

PackageHelper._ITEM_TYPE_TOKEN = {
	useFunc = function(params)
		--if G_UserData:getCustomActivity():isActTaskSellTypeRunning() then
		funcGoToItem(params)
		--[[else
			G_Prompt:showTip(Lang.get("customactivity_equip_act_not_open"))
		end]]
	end
}

PackageHelper._ITEM_TYPE_REFINED_STONE = {
	useFunc = function(params)
		funcGoToItem(params)
	end
}

PackageHelper._ITEM_TYPE_DEMON = {
	useFunc = function(params)
		funcTokenItem(params)
	end
}

PackageHelper._ITEM_TYPE_WUJIANG_UPGRADE = {
	useFunc = function(params)
		funcGoToItem(params)
	end
}

PackageHelper._ITEM_TYPE_BAOWU_UPGARDE = {
	useFunc = function(params)
		funcGoToItem(params)
	end
}

PackageHelper._ITEM_TYPE_GOLD_BOX = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_QINTMOB = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_GOD_BEAST_UPGRADE = {
	useFunc = function(params)
		funcGoToItem(params)
	end
}

PackageHelper._ITEM_TYPE_RECHARGE = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_ACTIVE_VIP_ICON = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_QINTOMB_ADDTIME = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_SHISHEN_BOX = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_HOMELAND_BUFF = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

PackageHelper._ITEM_TYPE_GRAIN_BOX = {
	useFunc = function(params)
		funcBoostItem(params)
	end
}

function PackageHelper.getItemFuncTable(itemtype)
	local funcName = PackageViewConst.getItemTypeName(itemtype)
	local retFunc = PackageHelper["_" .. funcName]

	if retFunc ~= nil and type(retFunc) == "table" then
		return retFunc
	end
	return nil
end

return PackageHelper
