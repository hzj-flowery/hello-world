--UI 弹出框帮助类
local UIPopupHelper = {}

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local BoxConfig = require("app.config.box")
local DataConst = require("app.const.DataConst")

--根据box id 物品列表
--[groupId] = { [1] = {type,value,size}, [2] = {type, value,size}}
function UIPopupHelper.getBoxItemList(boxId,itemId)
	
	local function getBoxItemData(key, goodList, boxData)
		for i =1, 4 do 
			local _type = boxData["type_" .. i]
			if _type > 0 then
				local value = boxData["value_" .. i]
				local size = boxData["size_" .. i]
				local good = {type=_type,value=value,size=size, boxId = boxData.id, index = i, itemId = itemId}
				goodList["key"..key] = goodList["key"..key] or {}
				table.insert(goodList["key"..key],good)
			end
		end
	end
	
	local boxLen = BoxConfig.length()
	local boxList = {}
	local goodList = {}
	--遍历Box表格，根据boxId获取BoxList
	for i=1 , boxLen do 
		local boxData = BoxConfig.indexOf(i)
		if boxData.item_id == boxId then
			--boxList已group分组
			boxList["key"..boxData.group] = boxList["key"..boxData.group] or {}
			table.insert(boxList["key"..boxData.group],boxData)
			--获取一行boxData中的item数据
			getBoxItemData(boxData.group, goodList, boxData)
		end
	end
	
	return goodList, boxList
end


--弹出合成碎片界面
function UIPopupHelper.popupMerageFragment(fragmentId)
	local itemNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local itemParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_FRAGMENT, fragmentId)
	local config = itemParam.cfg
	local itemType = config.comp_type

	local mergeSize = math.floor( itemNum / config.fragment_num )

	local LogicCheckHelper = require("app.utils.LogicCheckHelper")

	--背包检测
	local isFull, leftCount = LogicCheckHelper.isPackFull(config.comp_type,config.comp_value)
	if isFull == true then
		return
	end

	local function callBackFunction(itemId,count)
		local merageItem = {
			id = fragmentId, --道具ID
			num = count or 1, --数量
		}
		G_UserData:getFragments():c2sSyntheticFragments(fragmentId,count)
		logWarn("confirm PopupBuyOnce item id is id: "..itemId.."  count: "..count)
		return false
	end

	if mergeSize > 1 then
		local PopupBatchUse = require("app.ui.PopupBatchUse").new(Lang.get("common_title_fragment_merage"),callBackFunction)
		PopupBatchUse:updateUI(config.id)

		PopupBatchUse:setMaxLimit(mergeSize)

		local maxLimit = math.min(mergeSize, leftCount)

		PopupBatchUse:setOwnerCount(maxLimit)
		PopupBatchUse:openWithAction()
	else
		--物品为一个，直接使用
		callBackFunction(fragmentId,1)
	end
end


--固定商店物品购买
function UIPopupHelper.popupFixShopBuyItem(shopItemData, shopFucConst)
    shopFucConst = shopFucConst or shopItemData:getGoodId()
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local surplus = shopItemData:getSurplusTimes() -- 剩余购买次数
	local itemCfg = shopItemData:getConfig()
	if shopItemData:getConfigType() == "fix" then

		local function callBackFunction(itemId,buyCount, calculatedPrice1, calculatedPrice2)
			--是否能购买检测
			if LogicCheckHelper.shopFixBuyCheck(shopItemData, buyCount, true, calculatedPrice1, calculatedPrice2) == false then
				return
			end

			G_UserData:getShops():c2sBuyShopGoods(shopItemData:getGoodId(),
													shopItemData:getShopId(),
													buyCount)

		end
	
		--背包检测
		local isFull, leftCount = LogicCheckHelper.isPackFull(itemCfg.type,itemCfg.value)
		if isFull == true then
			return
		end

      	local itemOwnerNum = UserDataHelper.getNumByTypeAndValue(itemCfg.type,itemCfg.value)
        local maxLimit = UserDataHelper.getFixItemMaxNum(shopItemData)
        leftCount = checknumber(leftCount)
		if leftCount > 0 then -- 剩余数量为0， 则说明是无限购买
            maxLimit = math.min(maxLimit, leftCount)
		end
		if maxLimit == 0 then
			maxLimit = 1
		end
		if surplus == 1 then
			callBackFunction()
			return
        end
        
        
		if surplus > 0 then
			local PopupShopItemBuy = require("app.ui.PopupShopItemBuy").new(Lang.get("shop_pop_title"),callBackFunction)
			PopupShopItemBuy:updateUI( shopItemData:getShopId(),shopItemData:getGoodId())
			PopupShopItemBuy:setMaxLimit(maxLimit)
			PopupShopItemBuy:openWithAction()
        else
            local ShopConst = require("app.const.ShopConst")
            if rawequal(shopItemData:getGoodId(), ShopConst.SHOP_FIX_LIMIT_RICE) 
            or rawequal(shopItemData:getGoodId(), ShopConst.SHOP_FIX_LIMIT_ATKCMD) then
                local limitNum = UserDataHelper.checkResourceLimit(itemCfg.value)
                maxLimit = itemOwnerNum >= limitNum and 0 or (math.ceil((limitNum - itemOwnerNum)/itemCfg.size))
            end
			local PopupShopItemBuy = require("app.ui.PopupItemBuy").new(Lang.get("shop_pop_title"),callBackFunction)
            PopupShopItemBuy:setShopConst(shopFucConst)
            PopupShopItemBuy:updateUI( shopItemData:getShopId(),shopItemData:getGoodId())
            PopupShopItemBuy:setMaxLimit(maxLimit)
			PopupShopItemBuy:openWithAction()	
		end


	end

end

--随即商店购买物品
function UIPopupHelper.popupRandomShopBuyItem(shopItemData)
	local function callBackFunction(itemId,buyCount)

		G_UserData:getShops():c2sBuyShopGoods(shopItemData:getGoodNo(),--随即商店物品位置
										shopItemData:getShopId(),--数量
										buyCount)
	end

	if shopItemData:getConfigType() == "random" then

		if UserDataHelper.getPopModuleShow("randomShopBuy") == true then
			callBackFunction()
			return
		end

		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		
		local randomCfg = shopItemData:getConfig()
		--背包检测
		local isFull, leftCount = LogicCheckHelper.isPackFull(randomCfg.item_type,randomCfg.item_id)
		if isFull == true then
			return
		end

		--只有元宝需要弹框确认
		if randomCfg.value1 == DataConst.RES_DIAMOND then
			local PopupBuyOnce = require("app.ui.PopupBuyOnce").new(Lang.get("shop_pop_title"),callBackFunction)
			PopupBuyOnce:updateUI(randomCfg.item_type,randomCfg.item_id, randomCfg.item_num)
			PopupBuyOnce:openWithAction()
			PopupBuyOnce:setModuleName("randomShopBuy")
			PopupBuyOnce:setCostInfo(randomCfg.type1, randomCfg.value1, randomCfg.size1)
		else
			callBackFunction()
		end
	end
end

--活动商店购买物品
function UIPopupHelper.popupActiveShopBuyItem(goodId, callback)
	local ShopActiveDataHelper = require("app.utils.data.ShopActiveDataHelper")
	local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
	local costInfo = ShopActiveDataHelper.getCostInfo(goodId)
	local isEnough = true
	local lackInfo = nil
	for i, info in ipairs(costInfo) do
		local isOk = LogicCheckHelper.enoughValue(info.type, info.value, info.size, false)
		if not isOk then
			isEnough = false
			lackInfo = info
			break
		end
	end
	if isEnough then
		local popup = require("app.ui.PopupActiveShopItemBuy").new(goodId, callback)
		popup:openWithAction()
	else
		if lackInfo then
			local WayTypeInfo = require("app.config.way_type")
			local info = WayTypeInfo.get(lackInfo.type, lackInfo.value)
			if info then
				local popup = require("app.ui.PopupItemGuider").new()
				popup:updateUI(lackInfo.type, lackInfo.value)
				popup:openWithAction()
			else --没填获取途径，就飘字
				local name = TypeConvertHelper.convert(lackInfo.type, lackInfo.value).name
				G_Prompt:showTip(Lang.get("common_txt_item_no_enough", {name = name}))
			end
		end
	end
end


--副本次数不足弹框
function UIPopupHelper.popupResetTimesNoEnough(funcType,vipLevel)
	local vipCfg = G_UserData:getVip():getVipFunctionDataByType(funcType,vipLevel)
    local function popFunc()
        local function onBtnOk()
			local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)
        end	
        local function onBtnCancel()
            
        end	


		local RichTextHelper = require("app.utils.RichTextHelper")
       -- local content = vipCfg.hint1.."\n"..vipCfg.hint2
		local richList = {}
		table.insert( richList,  json.encode(RichTextHelper.getRichMsgListForHashText(
					vipCfg.hint1,Colors.BRIGHT_BG_GREEN,Colors.COLOR_POPUP_DESC_NORMAL,22)))
		table.insert( richList,  json.encode(RichTextHelper.getRichMsgListForHashText(
					vipCfg.hint2,Colors.BRIGHT_BG_GREEN,Colors.COLOR_POPUP_DESC_NORMAL,22)))
        local PopupAlert = require("app.ui.PopupAlert").new(vipCfg.title,
            "",onBtnOk,onBtnCancel)
		PopupAlert:addRichTextList(richList)

        PopupAlert:setOKBtn(Lang.get("common_vip_func_btn2"))
        PopupAlert:openWithAction()
    end
    return popFunc()
end


--跳转到某个场景
function UIPopupHelper.gotoScene( cellValue,params,needNum )
	-- body
	if(cellValue == nil)then return end
    local data = nil
    local sceneName = nil
    print("--------------UIPopupHelper:_onGoHandler cellValue.type="..cellValue.type)
    -- 1-主线 2-商店 3-系统  
    -- 跳转类型值 type=1时为关卡id,type=2时为商店id,type=3为function_level_id  
	if(cellValue.type == 1)then
        data = {
    		missionId = cellValue.chapter_id,
    		stageId = cellValue.value,
    		needNum = needNum or 0,
    		type = params.type,
    		value = params.value,
   	 	}
	   	G_ModuleDirector:pushModule(nil, function()
        	return require("app.scenes.mission.MissionChoseStageScene").new(data)
    	end)
	elseif(cellValue.type == 2)then
		local shopId = cellValue.value
		local shopInfo = require("app.cfg.shop_info").get(shopId)
		assert(shopInfo,"shop_info can't find shop_id == "..tostring(shopId))

		local functionId = nil   --shopInfo.function_id
		
		--神将商店有独立的功能id
		if shopId == ShopConst.KNIGHT_RANDOM_SHOP or shopId == ShopConst.SOUL_FIXED_SHOP then
			functionId = shopInfo.function_id
		end

		print(functionId,"FFFFFFFFFFFFFFFFFFFFFFFFFF")
		-- assert(nil)
		G_ModuleDirector:pushModule(functionId,function()
			local goodsParams = {type = params.type,value = params.value}
			return require("app.scenes.shopCommon.ShopCommonScene").new(shopId,nil,goodsParams)
		end)
		
	elseif(cellValue.type == 3)then
		local functionId = cellValue.value
		local mod,isLayer,isPop = require("app.common.ModuleEntranceHelper").getEntranceByFuncId(functionId,nil)
	
		if(mod == false)then return end
		-- ModuleEntranceHelper 这个类还是有问题 
		if(isPop == true)then
			G_Popup.newPopup(function()
				return mod()
			end)
		--暂时这样特殊处理 跳转到夺宝 指定宝物ID
		elseif functionId == G_FunctionConst.FUNC_ROB_TREASURE then
			local itemValue = params.value
			if params.type == TypeConverter.TYPE_TREASURE_FRAGMENT then
				itemValue = params.cfg.treasure_id  --取宝物ID
			end
			G_ModuleDirector:pushModule(functionId, function()
				return mod(itemValue)
			end,isLayer)
		else
			G_ModuleDirector:pushModule(functionId, function()
				return mod()
			end,isLayer)
		end
	end
end

--用户确认对话框
function UIPopupHelper.popupConfirm(hintStr,callBackOk)
	local PopupAlert = require("app.ui.PopupAlert").new(nil,hintStr,callBackOk)
	--PopupAlert:setOKBtn("前往充值")
	PopupAlert:openWithAction()
end

function UIPopupHelper.popupNoticeDialog(hintStr,callBackExit)
	local popupAlert = require("app.ui.PopupAlert").new(nil,hintStr,nil,nil,callBackExit)
	--PopupAlert:setOKBtn("前往充值")
	popupAlert:onlyShowOkButton()
	popupAlert:openWithAction()
	return popupAlert
end



--弹出每日签到重签窗口
function UIPopupHelper.popupResigninUI()
	--local UIPopupHelper	 = require("app.utils.UIPopupHelper")
	local TypeConvertHelper	 = require("app.utils.TypeConvertHelper")
	local DataConst	 = require("app.const.DataConst")
	local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
	local dinnerDataList = G_UserData:getActivityDinner():getMissEatDinnerDataList()
	local resigninTotalCost = 0
	local resigninRewardList = {}
	for k,v in ipairs(dinnerDataList) do
		resigninTotalCost = resigninTotalCost + v:getConfig().retrieve
		table.insert(resigninRewardList,
			{type = TypeConvertHelper.TYPE_RESOURCE ,value = DataConst.RES_VIT,size = v:getConfig().vit_reward}
		)
	end 
	local popupResignin = require("app.ui.PopupResignin").new(nil,function()
		local checkParams = {
			[1] = { funcName = "enoughCash", param =  {resigninTotalCost}  },  --检查资源是否满足
		}
		local success, errorMsg,funcName  = LogicCheckHelper.doCheckList(checkParams)
		if success then
			G_UserData:getActivityDinner():c2sActReDinner()
		elseif type(errorMsg) == 'function' then
		    errorMsg()	
		end
		
	end)
	popupResignin:setGold(resigninTotalCost)
	popupResignin:updateUI(resigninRewardList)
	popupResignin:openWithAction()
end

--碎片使用弹框，
--1.检查碎片是否可以合成
--2.不能合成则弹出获取界面
function UIPopupHelper.popupFragmentDlg(itemId)
	local TypeConvertHelper	 = require("app.utils.TypeConvertHelper")
	local itemType = TypeConvertHelper.TYPE_FRAGMENT

	local canMerage = UserDataHelper.isFragmentCanMerage(itemId)
	if canMerage == true then
		UIPopupHelper.popupMerageFragment(itemId)
	else
		local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
   		PopupItemGuider:updateUI(itemType,itemId)
    	PopupItemGuider:openWithAction()
	end
end

--点击Icon弹出详情框
function UIPopupHelper.popupIconDetail(type,value)
	local TypeConvertHelper	 = require("app.utils.TypeConvertHelper")
	local itemParams= TypeConvertHelper.convert(type,value)

	if type == TypeConvertHelper.TYPE_ITEM then
		local PopupItemInfo = require("app.ui.PopupItemInfo").new()
		PopupItemInfo:updateUI(TypeConvertHelper.TYPE_ITEM,itemParams.cfg.id)
	    PopupItemInfo:openWithAction()
	end

	if type == TypeConvertHelper.TYPE_HERO then
		if itemParam.cfg.type == 3 then
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
			PopupItemGuider:updateUI(TypeConvertHelper.TYPE_HERO, itemParam.cfg.id)
			PopupItemGuider:openWithAction()
		else
			local PopupHeroDetail = require("app.scene.view.heroDetail.PopupHeroDetail").new(TypeConvertHelper.TYPE_HERO ,itemParam.cfg.id)
			PopupHeroDetail:openWithAction()
		end
	end

	if type == TypeConvertHelper.TYPE_EQUIPMENT then
		local PopupEquipDetail = require("app.scene.view.equipmentDetail.PopupEquipDetail").new(TypeConvertHelper.TYPE_EQUIPMENT ,itemParams.cfg.id)
	    PopupEquipDetail:openWithAction()
	end

	if type == TypeConvertHelper.TYPE_FRAGMENT then
		local conf = itemParam.cfg
		if conf.comp_type == 1 then
			local PopupHeroDetail = require("app.scene.view.heroDetail.PopupHeroDetail").new(TypeConvertHelper.TYPE_HERO ,conf.comp_value)
			PopupHeroDetail:openWithAction()
		else
			local PopupEquipDetail = require("app.scene.view.equipmentDetail.PopupEquipDetail").new(TypeConvertHelper.TYPE_EQUIPMENT ,conf.comp_value)
			PopupEquipDetail:openWithAction()
		end
	end
end



function UIPopupHelper.popupIndulgeDialog(callBackExit)
	--local UIPopupHelper = require("app.utils.UIPopupHelper")
	local TimeConst = require("app.const.TimeConst")
	local isIndulgeStage01 = G_UserData:getPopModuleShow("indulge1") 
	local isIndulgeStage02 = G_UserData:getPopModuleShow("indulge2") 


	if isIndulgeStage02 ~= true and G_UserData:getBase():getOnlineTime() >= TimeConst.INDULGE_TIME_02 then
		local hintStr = Lang.get("publish_require_indulge_hint02")
		local popupAlert = UIPopupHelper.popupNoticeDialog(hintStr,callBackExit)
		G_UserData:setPopModuleShow("indulge2",true)

		return popupAlert
	end

	if isIndulgeStage01 ~= true and G_UserData:getBase():getOnlineTime() >= TimeConst.INDULGE_TIME_01 and 
		G_UserData:getBase():getOnlineTime() < TimeConst.INDULGE_TIME_02 then
		local hintStr = Lang.get("publish_require_indulge_hint01")
		local popupAlert = UIPopupHelper.popupNoticeDialog(hintStr,callBackExit)
		G_UserData:setPopModuleShow("indulge1" ,true)
		return popupAlert
	end
	return nil
end

function UIPopupHelper.popupInputAccountActivationCode(okCallBack,cancelCallback)
	local callback = function(code) 
		G_UserData:getCreateRole():saveActivationCode(code)
		if okCallBack then
			return okCallBack(code)
		end
		return false
	end
	local PopupAccountActivation = require("app.ui.PopupAccountActivation")
	local popup = PopupAccountActivation.new(callback,cancelCallback)
	popup:openWithAction()
	return popup
end


function UIPopupHelper.popupQuestionDialog(callBack)
	local popupAlert = require("app.ui.PopupAlert").new(Lang.get("questionnaire_title"),
		Lang.get("questionnaire_dialog_content"),callBack)
	popupAlert:setOKBtn(Lang.get("questionnaire_btn_name"))
	popupAlert:onlyShowOkButton()
	popupAlert:openWithAction()
	return popupAlert
end


function UIPopupHelper.popupShopBuyRes(itemType,itemValue)
	local ShopConst = require("app.const.ShopConst")
	local shopData = G_UserData:getShops()
	local shopItemData = shopData:getFixShopGoodsByResId(ShopConst.NORMAL_SHOP,itemType,itemValue)
	if shopItemData == nil then--商店功能未开放
		G_Prompt:showTip(Lang.get("common_popup_shop_buy_not_open"))	
		return true
	elseif shopItemData == false then--没有此类商品
		G_Prompt:showTip(Lang.get("common_popup_shop_buy_not_item"))	
		return true
	end

	local UIPopupHelper	 = require("app.utils.UIPopupHelper")
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	
	local success01, errorMsg, funcName = LogicCheckHelper.shopFixBtnCheck(shopItemData)
	if success01 == false then--不符合购买条件(等级、限制、购买次数)
		--去提示升级VIP对话框
		local cfg = shopItemData:getConfig()
		if funcName == "shopNumBanType" and shopItemData:isCanAddTimesByVip() then--3表明能通过VIP提升次数
			local timesOut = LogicCheckHelper.vipTimesOutCheck(cfg.num_ban_value, 
				shopItemData:getBuyCount(),Lang.get("shop_condition_buymax"))
		elseif errorMsg then
			G_Prompt:showTip(errorMsg)
		end
		return true
	end
	UIPopupHelper.popupFixShopBuyItem(shopItemData)
	return true	
end

--弹出元宝不足弹框
function UIPopupHelper.popupVIPNoEnough()
	local function callBackOk()
		local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
		WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)
	end	
	local PopupAlert = require("app.ui.PopupAlert").new(
		Lang.get("common_vip_not_enough_title"),
		Lang.get("common_vip_not_enough"),callBackOk)
	PopupAlert:setOKBtn(Lang.get("common_goto_recharge"))
	PopupAlert:openWithAction()
end

function UIPopupHelper.popupHelpInfo(funtionId, param)
	local popupHelpInfo = require("app.ui.PopupHelpInfo").new()
	popupHelpInfo:updateByFunctionId(funtionId, param)
	popupHelpInfo:openWithAction()
end

function UIPopupHelper.popupHelpInfoByLangName(langName)
	local popupHelpInfo = require("app.ui.PopupHelpInfo").new()
	popupHelpInfo:updateByLangName(langName)
	popupHelpInfo:openWithAction()
end

function UIPopupHelper.popupItemBuyAndUse(itemType,itemValue)
	local function popDialogCallback()
		--游历状态下，可能会弹出经历不足情况，因此在引导状态下，不做任何弹出
		if G_TutorialManager:isDoingStep() == true then
			return
		end
		
		local popup = require("app.ui.PopupItemBuyUse").new()
		popup:updateUI(itemType,itemValue)
		popup:openWithAction()
	end
	local LogicCheckHelper = require("app.utils.logic.ShopCheck")
	local itemNum = UserDataHelper.getNumByTypeAndValue(itemType, itemValue)
	if itemNum > 0 then
		popDialogCallback()
		return 
	end
	local success = LogicCheckHelper.shopCheckShopBuyRes(itemType,itemValue)
	if not success then
		return
	end
	popDialogCallback()
end

--单个确定按钮对话框
function UIPopupHelper.popupOkDialog(title,content,callback,okStr)
--  TODO改使通用按钮
	okStr = okStr or Lang.get("common_retry")
	title = title or Lang.get("common_system")
	--local popupConfirm = require("app.ui.PopupConfirm").new(content, callback, okStr)
	--popupConfirm:openWithAction()

	local popup = require("app.ui.PopupAlert").new(title, content, callback, nil,nil)
	popup:onlyShowOkButton()
	popup:setCloseVisible(false)
	popup:setClickOtherClose(false)
	popup:setOKBtn(okStr)
	popup:openWithAction()
end

--灰度测试提示弹框
function UIPopupHelper.showGrayTestDialog(dlgType, clientV, serverV, callback)
	local Version = require("yoka.utils.Version")
	
	local content = Lang.get( "common_gray_test_dlg2",{
		local_version = Version.toString(clientV),
		server_version = Version.toString(serverV)})
	if dlgType == 11 then
		content	= Lang.get("common_gray_test_dlg1", {
			server_version = Version.toString(serverV),
		})
	end

	local okStr = Lang.get("common_btn_sure")
	local cancelStr = Lang.get("common_btn_cancel")
	local function okCallback()

		if callback then--1. save gray test to local  2. cancel gray test to local
			callback(dlgType)
		end
	
	end

	local function cancelCallback()
		
	end

	local popup = require("app.ui.PopupAlert").new(Lang.get("common_system"), content, okCallback, cancelCallback,nil)

	popup:setName("grayTestDialog")
	popup:setCloseVisible(false)
	popup:setClickOtherClose(false)
	popup:setBtnStr(okStr,cancelStr)
	popup:openToOfflineLevel()
end

--断线对话框
function UIPopupHelper.showOfflineDialog(content, isHideReconnect, btnOkStr, btnCancelStr)
	isHideReconnect = isHideReconnect or true
	local okStr = btnOkStr or Lang.get("common_relogin")
	local cancelStr = btnCancelStr or Lang.get("common_reconnect")
	local function okCallback()
		G_GameAgent:returnToLogin()
		--如果在登陆界面，则返回false
		local runningSceneName = display.getRunningScene():getName()
		if runningSceneName == "login" then
			return false
		end

		return false --这里返回到登陆界面时，对话框不需要删除，删除的话，机器卡了会出现bug
	end
	
	local function cancelCallback()
		G_GameAgent:checkAndLoginGame()
	end

	--local PopupOffline = require("app.ui.PopupOffline")
    --PopupOffline:create(Lang.get("sdk_platform_mantain"), true)

	local popup = require("app.ui.PopupAlert").new(Lang.get("common_system"), content, okCallback, cancelCallback,nil)
	if isHideReconnect then
		popup:onlyShowOkButton()
	end

	popup:setName("offlineDialog")

	popup:setCloseVisible(false)
	popup:setClickOtherClose(false)
	popup:setBtnStr(okStr,cancelStr)
	popup:openToOfflineLevel()

	
end


--活动批量兑换
function UIPopupHelper.popupExchangeItems(actTaskUnitData)
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
		
		if  G_UserData:getCustomActivity():isActivityExpiredById(actTaskUnitData:getAct_id()) then
			G_Prompt:showTip(Lang.get("customactivity_tips_already_finish"))	
			return 
		end

		G_UserData:getCustomActivity():c2sGetCustomActivityAward(
						actTaskUnitData:getAct_id(),actTaskUnitData:getId(),nil,buyCount)

	end

	--背包检测
	local isFull, _ = LogicCheckHelper.isPackFull(item.type,item.value)
	if isFull == true then
		return
	end

	-- 临时应对方案   一对多且剩余次数为多 
	if surplus == 1 or ( surplus > 1 and #fixRewards > 1 ) then
		--callBackFunction(item,consumeItems,1)
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

		--只有元宝才弹提示，hedili修改
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
    
    local maxValue = surplus
    if maxValue ~= 0 then
        for i, v in ipairs(consumeItems) do
            local itemNum = UserDataHelper.getNumByTypeAndValue(v.type, v.value)
            maxValue = math.min(maxValue, itemNum)
        end
    end

    if maxValue == 0 then
        G_Prompt:showTip(Lang.get("common_res_not_enough"))	
        return
    end
	local popup = require("app.ui.PopupItemExchange").new(Lang.get("common_title_exchange_item"),callBackFunction)
	popup:updateUI(item,consumeItems,surplus)
	popup:setMaxLimit(maxValue)
	popup:openWithAction()	


end

--活动批量兑换
function UIPopupHelper.popupExchangeItemsExt(actTaskUnitData)
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
		
		if  G_UserData:getCustomActivity():isActivityExpiredById(actTaskUnitData:getAct_id()) then
			G_Prompt:showTip(Lang.get("customactivity_tips_already_finish"))	
			return 
		end

		G_UserData:getCustomActivity():c2sGetCustomActivityAward(
						actTaskUnitData:getAct_id(),actTaskUnitData:getId(),nil,buyCount)
	end

	--背包检测
	local isFull, _ = LogicCheckHelper.isPackFull(item.type,item.value)
	if isFull == true then
		return
	end

	-- 临时应对方案   一对多且剩余次数为多 
	if surplus == 1 or ( surplus > 1 and #fixRewards > 1 ) then
		--callBackFunction(item,consumeItems,1)
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

		--只有元宝才弹提示，hedili修改
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
    
    local maxValue = surplus
    if maxValue ~= 0 then
        for i, v in ipairs(consumeItems) do
            local canBuyNum = math.floor(UserDataHelper.getNumByTypeAndValue(v.type, v.value) / v.size)
            maxValue = math.min(maxValue, canBuyNum)
        end
    end

    if maxValue == 0 then
        G_Prompt:showTip(Lang.get("common_res_not_enough"))	
        return
    end
	local popup = require("app.ui.PopupItemExchange").new(Lang.get("common_title_exchange_item"),callBackFunction)
	popup:updateUI(item,consumeItems,surplus)
	popup:setMaxLimit(maxValue)
	popup:openWithAction()	
end

function UIPopupHelper.popupCommentGuide()
	if not G_ConfigManager:isReview() then
		return 
	end
	
	if G_NativeAgent:getNativeType() ~= "ios"  then
		return
	end

	local showDialog = true
	local comment = G_StorageManager:loadUser("comment") or {}
	if comment.dialogShowTime  then
		local currTime =  G_ServerTime:getTime()
		showDialog = (currTime - comment.dialogShowTime) > 30*24*3600
	end
	if not showDialog then
		return
	end

	G_StorageManager:saveWithUser("comment", {
		dialogShowTime = G_ServerTime:getTime(),
	})

	local function okCallBackFunction()
		--跳转到苹果应用评论处
		G_NativeAgent:reviewApp("1356464028")
	end

	local function cancelCallBackFunction()

	end

	local popup = require("app.ui.PopupCommentGuide").new(okCallBackFunction,cancelCallBackFunction)
	popup:openWithAction()	
	
end

function UIPopupHelper.popupSecretKeyInput(successCallBack,cancelCallback)	
	local PopupInputSecretKey = require("app.ui.PopupInputSecretKey")
	local popup = PopupInputSecretKey.new(successCallBack,cancelCallback)
	popup:openWithAction()
end

--弹出确认回归框
function UIPopupHelper.popupReturnConfirm()
	local popup = require("app.scene.view.returnServer.PopupReturnConfirm").new()
	popup:openWithAction()
end

--弹出花费玉璧弹框
function UIPopupHelper.popupCostYubiTip(params, callback, ...)
	local MODULE_INFO = {
		["COST_YUBI_MODULE_NAME_1"] = {itemName = {Lang.get("cost_yubi_item_name_1")}, todo = Lang.get("cost_yubi_todo_1")}, --见龙在田
		["COST_YUBI_MODULE_NAME_2"] = {itemName = {Lang.get("cost_yubi_item_name_2")}, todo = Lang.get("cost_yubi_todo_2")}, --割须弃袍
		["COST_YUBI_MODULE_NAME_3"] = {itemName = {Lang.get("cost_yubi_item_name_3")}, todo = Lang.get("cost_yubi_todo_3")}, --卧龙观星
		["COST_YUBI_MODULE_NAME_4"] = {itemName = {Lang.get("cost_yubi_item_name_4")}, todo = Lang.get("cost_yubi_todo_4")}, --身外化身
		["COST_YUBI_MODULE_NAME_5"] = {itemName = {Lang.get("cost_yubi_item_name_5")}, todo = Lang.get("cost_yubi_todo_5")}, --关公驯马
		["COST_YUBI_MODULE_NAME_6"] = {itemName = {Lang.get("cost_yubi_item_name_6"),Lang.get("cost_yubi_item_name_6_2")},
			todo = Lang.get("cost_yubi_todo_6")}, --祈灵
        ["COST_YUBI_MODULE_NAME_7"] = {itemName = {Lang.get("cost_yubi_item_name_7")}, todo = Lang.get("cost_yubi_todo_7")}, --镜花水月，金色变身卡抽卡\
        ["COST_YUBI_MODULE_NAME_8"] = {itemName = {Lang.get("cost_yubi_item_name_8")}, todo = Lang.get("cost_yubi_todo_8")}, --晋将招募
        ["COST_YUBI_MODULE_NAME_9"] = {itemName = {Lang.get("cost_yubi_item_name_9")}, todo = Lang.get("cost_yubi_todo_9")}, --装备洗练
        ["COST_YUBI_MODULE_NAME_10"] = {itemName = {Lang.get("cost_yubi_item_name_10")}, todo = Lang.get("cost_yubi_todo_10")}, --装备洗练2
        ["COST_YUBI_MODULE_NAME_11"] = {itemName = {Lang.get("cost_yubi_item_name_11")}, todo = Lang.get("cost_yubi_todo_11")}, --兑换元宝
	}
	local moduleName = params.moduleName
	local yubiCount = params.yubiCount
	local itemCount = params.itemCount
    local itemNameIndex = params.itemNameIndex or 1
    local noyubiTip = params.noyubitip or nil
    local tipType = params.tipType or nil
	local callbackParams = {...}

	local callbackOk = function()
		callback(unpack(callbackParams))
    end

	local noTip = UserDataHelper.getPopModuleShow(moduleName)
	if noTip or yubiCount == nil then --本次登录不再提示 或者 没有消耗玉璧
		callbackOk()
		return
	end

	local PopupSystemAlert = require("app.ui.PopupSystemAlert")
	local info = MODULE_INFO[moduleName]
	assert(info, string.format("COST_YUBI_MODULE_INFO's moduleName is wrong = %s", moduleName))
    local content = ""
    if noyubiTip then
        content = Lang.get("common_cost_noyubi_tip"..noyubiTip)
    elseif tipType then
        content = Lang.get("common_cost_yubi_tip"..tipType, {yubiCount = yubiCount, 
                                                            itemCount = itemCount, 
                                                            itemName = info.itemName[itemNameIndex],
                                                            todo = info.todo})
    else
        content = Lang.get("common_cost_yubi_tip", {yubiCount = yubiCount, 
                                                            itemCount = itemCount, 
                                                            itemName = info.itemName[itemNameIndex],
                                                            todo = info.todo})
    end
	local popup = PopupSystemAlert.new(nil, content, callbackOk)
	popup:setModuleName(moduleName)
    popup:openWithAction()
end

return UIPopupHelper

