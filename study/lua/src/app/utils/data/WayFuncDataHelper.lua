--WayFuncDataHelper
--根据 way_type 的 type value 获得 可获取列表

local FunctionConst = require("app.const.FunctionConst")


local WayFuncDataHelper = {}

local MAX_WAY_ID_SIZE = 15 --

-----------排序
-- 获取途径way_function排序规则
-- 1.type排序，商店>系统>主线，2>3>1
-- 2.商店和系统中，已开启的功能>未开启功能
-- 3.主线中，已开启主线>未开启主线，
--    3.1 已开启主线中，关卡id高>关卡高低
--    3.2 未开启主线中，关卡id低>关卡id高
function WayFuncDataHelper.sortGuiderList(list)
	-- dump(list)
	table.sort(list,function(a,b)
	logWarn(tostring(a.type).." "..tostring(b.type))
	
		if a.type ~= b.type then
			return a.type > b.type
		end
		if a.open ~= b.open then
			return a.open > b.open
		end

		if a.open == 1 then
		--[[
			if a.count == 0 or b.count == 0 and a.count ~= b.count then
				return a.count > b.count
			end
]]
			if a.value ~= b.value then
				return a.value > b.value
			end
		else
			if a.value ~= b.value then
				return a.value < b.value
			end
		end

		return a.cfg.id < b.cfg.id
	end)
	
	
	-- local t = {}

	-- for i=1, #list do
	-- 	t[#t + 1] = list[i].cfg
	-- end

	return list
end



function WayFuncDataHelper.getGuiderList( itemType, itemValue )
	-- body
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local WayTypeInfo = require("app.config.way_type")
	local info = WayTypeInfo.get(itemType, itemValue)
	assert(info,string.format("way_type can't find type = %d and value = %d",itemType,itemValue))

	local function makeChapterData(list,itemInfo)
		local stageData = G_UserData:getStage():getStageById(itemInfo.value)
		--local excCount, totoalCount =  G_UserData:getStage():getStageById(itemInfo.value)
		local stageInfo = stageData:getConfigData()
		local isOpen = G_UserData:getStage():isStageOpen(itemInfo.value) and 1 or 0
		table.insert(list, {
			cfg = itemInfo,
			itemType = itemType,
			itemValue = itemValue,						
			open =  isOpen,
			count =5,
			value = itemInfo.value,
			type = 1,
			stageData = stageData,
			stageCfgInfo = stageInfo
		})
	end

	local function makeShopData(list,itemInfo)
		local shopInfo = require("app.config.shop").get(itemInfo.value)
		assert(shopInfo,"shop_info can't find id = "..tostring(itemInfo.value))
		table.insert(list, {
			cfg = itemInfo,
			itemType = itemType,
			itemValue = itemValue,
			open = LogicCheckHelper.funcIsOpened(shopInfo.function_id) and 1 or 0,
			value = 0,
			count = 0,
			type = 3,
		})
	end

	local function makeItemData(list, itemInfo)
		table.insert(list, {
			cfg = itemInfo,
			itemType = itemType,
			itemValue = itemValue,
			open = LogicCheckHelper.funcIsOpened(itemInfo.value) and 1 or 0,
			open = 1,
			value = 0,
			count = 0,
			type = 2
		})
	end

	local list = {}
	for i=1, MAX_WAY_ID_SIZE do
		local id = info["way_id"..tostring(i)]
		if id and id > 0 then
			local itemInfo = require("app.config.way_function").get(id)
			assert(itemInfo,"way_function_info can't find id = "..tostring(id))
			-- 组装一下数据，避免每次都组装
			if itemInfo.type == 1 then --章节
				makeChapterData(list, itemInfo)
			elseif itemInfo.type == 2 then --商店
				logWarn("IIOOOPP{{{{{{")
				makeShopData(list,itemInfo)
			elseif itemInfo.type == 3 then --跳转
				makeItemData(list,itemInfo)
			end
		end
	end

	local t = WayFuncDataHelper.sortGuiderList(list)
	return t
end

function WayFuncDataHelper.gotoModule( cellValue  )
	-- body
	if cellValue == nil then 
		return 
	end
	
    local data = nil
    local sceneName = nil
    print("--------------PopupItemGuilder:_onGoHandler cellValue.type="..cellValue.type)
    -- 1-主线 2-商店 3-系统  
    -- 跳转类型值 type=1时为关卡id,type=2时为商店id,type=3为function_level_id  

	--跳转到章节
	local function gotoChapter(cellValue)
		local chapterId = cellValue.chapter_id
		local stageId = cellValue.value
		local isOpen = G_UserData:getStage():isStageOpen(cellValue.value)
		if isOpen == true then
			G_SceneManager:showScene("stage",chapterId,stageId)
		else
			G_Prompt:showTip(Lang.get("stage_no_open"))
		end
	   
	end

	--跳转到商店
	local function gotoShop(cellValue)
		local shopId = cellValue.value or 1--商店ID
		local shopInfo = require("app.config.shop").get(shopId)
		assert(shopInfo,"shop_info can't find shop_id == "..tostring(shopId))
	
		local functionId = shopInfo.function_id
		local tabIndex = 2
		if cellValue.chapter_id and cellValue.chapter_id > 0 then--商店标签页
			tabIndex = cellValue.chapter_id
		end
	
		print(functionId,"FFFFFFFFFFFFFFFFFFFFFFFFFF")

		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		local isOpened, errMsg = LogicCheckHelper.funcIsOpened(functionId)
		if isOpened == false then
			if errMsg then
				G_Prompt:showTip(errMsg)
			end
			return
		end

		--公会商店特殊处理
		local ShopConst = require("app.const.ShopConst")
		if shopId == ShopConst.GUILD_SHOP then
			local isInGuild = G_UserData:getGuild():isInGuild()
			if isInGuild == false then
				G_Prompt:showTip(Lang.get("lang_guild_shop_no_open"))
				return
			end
		end
		
		G_SceneManager:showScene("shop",shopId,tabIndex)
	end

	--根据functionId 做跳转
	local function gotoFunctionId(cellValue)
		local functionId = cellValue.value
		local goToFunc,isLayer,isPop =  WayFuncDataHelper.getGotoFuncByFuncId(functionId,nil)		
		if(goToFunc == false)then return end
		if isLayer == false and type(goToFunc) == "function" then
			goToFunc()
		end
	end

	if(cellValue.type == 1)then
		gotoChapter(cellValue)
	elseif(cellValue.type == 2)then
		gotoShop(cellValue)
	elseif(cellValue.type == 3)then
		gotoFunctionId(cellValue)
	end
end


------------------------------------------------------------------------------
--根据功能Id直接跳转
function WayFuncDataHelper.gotoModuleByFuncId(funcId, params)
	local goToFunc,isLayer,isPop =  WayFuncDataHelper.getGotoFuncByFuncId(funcId)
	
	if(goToFunc == false)then return end

	if isLayer == false and type(goToFunc) == "function" then
		logDebug("WayFuncDataHelper.gotoModuleByFuncId "..funcId)
		if type(params) == "table" then
			goToFunc(unpack(params))
		else
			goToFunc(params)
		end
	end
	
end

function WayFuncDataHelper.getGotoFuncByFuncId(funcId,params)
	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local isOpened, errMsg = LogicCheckHelper.funcIsOpened(funcId)
	local isLayer = false --该模块是否是一个Layer弹窗而不是scene
	local isPop = false -- 弹框
	local returnFunc = nil --返回的打开模块调用函数，传递初始化场景或者弹窗的参数。
	if isOpened == false then
		if errMsg then
			G_Prompt:showTip(errMsg)
		end
		return false
	end
	
	local WayFuncConvert = require("app.utils.data.WayFuncConvert")
	local func = WayFuncConvert.getReturnFunc(funcId)
	if func then
		if type(params) == "table" then
			returnFunc = func(unpack(params))
		else
			returnFunc = func(params)
		end
	end
	return returnFunc, isLayer, isPop
end

---------
--跳转模块获得函数
function WayFuncDataHelper._inTheTeam()

end

function WayFuncDataHelper._retGoScene()

end

return WayFuncDataHelper