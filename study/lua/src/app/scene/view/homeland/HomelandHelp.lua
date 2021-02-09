
-- Author: hedili
-- Date:2018-05-02 15:59:38
-- Describle：
local HomelandHelp = {}
local HomelandConst = require("app.const.HomelandConst")

function HomelandHelp.getTreeInfoConfig(level)
	local info = require("app.config.tree_info").get(level)
	assert(info, string.format("tree_info config can not find id = %d", level))
	return info
end

function HomelandHelp.getTreeBuffConfig(id)
	local info = require("app.config.tree_buff").get(id)
	assert(info, string.format("tree_buff config can not find id = %d", id))
	return info
end

function HomelandHelp.getSubTreeCfg(treeData)
	local subTreeType, currLevel = treeData.treeId, treeData.treeLevel
	local currData =  G_UserData:getHomeland():getSubTreeCfg(subTreeType,currLevel)
	if G_UserData:getHomeland():isSubTreeLevelMax(subTreeType,currLevel) then
		return currData
	end
	local nextData =  G_UserData:getHomeland():getSubTreeCfg(subTreeType,currLevel + 1 )
	return currData, nextData
end


function HomelandHelp.getMainTreeCfg(treeData)
	local currLevel = treeData.treeLevel
	local currData =  G_UserData:getHomeland():getMainTreeCfg(currLevel)
	if G_UserData:getHomeland():isMainTreeLevelMax(currLevel) then
		return currData
	end
	local nextData =  G_UserData:getHomeland():getMainTreeCfg(currLevel + 1 )
	return currData, nextData
end



function HomelandHelp.getSelfSubTreeCfg(subTreeType)
	local currLevel = G_UserData:getHomeland():getSubTreeLevel(subTreeType)
	--dump(currLevel)
	local currData =  G_UserData:getHomeland():getSubTreeCfg(subTreeType,currLevel)
	if G_UserData:getHomeland():isSubTreeLevelMax(subTreeType) then
		return currData
	end
	local nextData =  G_UserData:getHomeland():getSubTreeCfg(subTreeType,currLevel + 1 )
	return currData, nextData
end


function HomelandHelp.getSelfMainTreeCfg()
	local currLevel = G_UserData:getHomeland():getMainTreeLevel()
	local currData =  G_UserData:getHomeland():getMainTreeCfg(currLevel)
	if G_UserData:getHomeland():isMainTreeLevelMax() then
		return currData
	end
	local nextData =  G_UserData:getHomeland():getMainTreeCfg(currLevel + 1 )
	return currData, nextData
end


function HomelandHelp.getPromptContent(attrId, value)
	local TextHelper = require("app.utils.TextHelper")
	local absValue = math.abs(value)
	local attrName, attrValue = TextHelper.getAttrBasicText(attrId, absValue)
	local color = value >= 0 and Colors.colorToNumber(Colors.getColor(2)) or Colors.colorToNumber(Colors.getColor(6))
	local outlineColor = value >= 0 and Colors.colorToNumber(Colors.getColorOutline(2)) or Colors.colorToNumber(Colors.getColorOutline(6))
	attrValue = value >= 0 and " + "..attrValue or " - "..attrValue
	local attrContent = Lang.get("homeland_all_text")..attrName..attrValue
	dump(attrContent)
	local content = Lang.get("summary_attr_change", {attr = attrContent, color = color, outlineColor = outlineColor})
	return content
end

function HomelandHelp.getPromptPower(allPower)


	local value = math.abs(allPower)
	local attrValue = allPower
	local color = value >= 0 and Colors.colorToNumber(Colors.getColor(2)) or Colors.colorToNumber(Colors.getColor(6))
	local outlineColor = value >= 0 and Colors.colorToNumber(Colors.getColorOutline(2)) or Colors.colorToNumber(Colors.getColorOutline(6))
	attrValue = value >= 0 and " + "..attrValue or " - "..attrValue
	local attrContent = Lang.get("homeland_power")..attrValue

	local content = Lang.get("summary_attr_change", {attr = attrContent, color = color, outlineColor = outlineColor})
	return content
end


function HomelandHelp.getSubTreeAttrList( subTreeType )
	-- body
	local currData = HomelandHelp.getSelfSubTreeCfg(subTreeType)
	local power = currData["all_combat"]
	local attrList = {}
	for i = 1, 4 do 
		local attrType = currData["attribute_type"..i]
		local attrValue = currData["attribute_value"..i]
		if attrType > 0 then
			table.insert( attrList, {type = attrType, value = attrValue} )
		end
	end
	return attrList,power
end

function HomelandHelp.checkMainTreeLevel(  nextCfg, showPrompt )
	local limitList = {}
	local function subTreeType( name )
		-- body
		if showPrompt then
			G_Prompt:showTip(Lang.get("homeland_sub_tree_limit",{name = name}))
		end
		return false
	end

	for i = 1 , 2 do
		local subType = nextCfg["adorn_type_"..i]
		local subLevel = nextCfg["adorn_level_"..i]
		if subType and subType > 0 and subLevel and subLevel > 0 then
			local subCfg = G_UserData:getHomeland():getSubTreeCfg(subType, subLevel)
			table.insert(limitList, {type = subType, level = subLevel, name = subCfg.name})
		end
	end
	local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()
	
	for i, value in ipairs(limitList) do
		local subLevel = G_UserData:getHomeland():getSubTreeLevel(value.type)
		if subLevel < value.level then
			return subTreeType(value.name)
		end
	end
	return true
end

function HomelandHelp.checkSubTreeLevel(  nextCfg, showPrompt )
	-- body
	local function subTreeType( name )
		-- body
		if showPrompt then
			G_Prompt:showTip(Lang.get("homeland_sub_tree_limit",{name = name}))
		end
		return false
	end

	local limitList= {}
	if nextCfg.limit_tree_level > 0 then
		table.insert(limitList, {type = 0, level = nextCfg.limit_tree_level, name = Lang.get("homeland_main_tree")})
	end

	for i = 1 , 2 do
		local subType = nextCfg["adorn_type_"..i]
		local subLevel = nextCfg["adorn_level_"..i]
		if subType and subType > 0 and subLevel and subLevel > 0 then
			local subCfg = G_UserData:getHomeland():getSubTreeCfg(subType, subLevel)
			dump(subCfg.name)
			table.insert(limitList, {type = subType, level = subLevel, name = subCfg.name})
		end
	end
	
	for i, value in ipairs(limitList) do
		if value.type == 0 then
			local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()
			if mainTreeLevel < value.level then
				return subTreeType(value.name)
			end
		else
			local subLevel = G_UserData:getHomeland():getSubTreeLevel(value.type)
			if subLevel < value.level then
				return subTreeType(value.name)
			end
		end

	end
	return true
end

--检查神树升级条件
function HomelandHelp.checkMainTreeUp( treeData, showPrompt )
	-- body
	if showPrompt == nil then
		showPrompt = true
	end

	local currLevel = treeData.treeLevel


	if G_UserData:getHomeland():isMainTreeLevelMax(currLevel) then
		return false
	end
	
	local cfg = treeData.treeCfg
	local nextCfg = G_UserData:getHomeland():getMainTreeCfg(currLevel + 1)
	local currCfg = G_UserData:getHomeland():getMainTreeCfg(currLevel)

	if HomelandHelp.checkMainTreeLevel(nextCfg,showPrompt) == false then
		return false
	end

	local LogicCheckHelper = require("app.utils.LogicCheckHelper")
	local enoughCheck = LogicCheckHelper.enoughValue(currCfg.type,currCfg.value,currCfg.size, showPrompt)

	local function prompt(cfg)
		if showPrompt then
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
			PopupItemGuider:updateUI(cfg.type,cfg.value)
			PopupItemGuider:openWithAction()
		end
	end

	if enoughCheck == false then
		--prompt(cfg)
		return false
	end


	return true
end

function HomelandHelp.checkSubTreeUpLevelEnough( subCfg )

	local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()
	if mainTreeLevel  < nextCfg.limit_tree_level then
		return true
	end
	return false
end

function HomelandHelp.checkSubTreeUp( treeData , showPrompt)
	-- body

	if showPrompt == nil then
		showPrompt = true
	end

	local currLevel = treeData.treeLevel


	local nextCfg = G_UserData:getHomeland():getSubTreeCfg(treeData.treeId,currLevel+1)
	if nextCfg == nil then
		return false
	end

	if HomelandHelp.checkSubTreeLevel(nextCfg,showPrompt) == false then
		return false
	end

	local currCfg = G_UserData:getHomeland():getSubTreeCfg(treeData.treeId,currLevel)
	local mainTreeLevel = G_UserData:getHomeland():getMainTreeLevel()

--	dump(cfg)
--	dump(mainTreeLevel)
	if mainTreeLevel  < nextCfg.limit_tree_level then
		if showPrompt then
			G_Prompt:showTip(Lang.get("homeland_main_tree_limit"))
		end
		return false
	end

	local function prompt(type, value)
		if showPrompt then
			local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
			PopupItemGuider:updateUI(type,value)
			PopupItemGuider:openWithAction()
		end
	end

	local function checkEnoughValue()
		local LogicCheckHelper = require("app.utils.LogicCheckHelper")
		for i = 1 , 2 do
			if currCfg["type_"..i] > 0 then
				local type = currCfg["type_"..i]
				local value = currCfg["value_"..i]
				local size = currCfg["size_"..i]
				local enoughCheck = LogicCheckHelper.enoughValue(type,value,size, showPrompt)
				if enoughCheck == false then
					prompt(type,value)
					return false
				end
			end
		end
		return true
	end

	if checkEnoughValue() == false then
		return false
	end

	return true
end


function HomelandHelp.createSpine( cfgData )

	local spineNode = require("yoka.node.SpineNode").new()
	spineNode:setAsset( Path.getEffectSpine(data.name) )
	--spineNode:setPosition(cc.p(data.x_coordinate, data.y_coordinate))
	spineNode:setAnimation(data.animation,true)
	spineNode:setScaleX(data.orientation)
	return spineNode
	

	-- body
end

function HomelandHelp.getSubTreeFontHeight( treeData )
	-- body
	if treeData.treeId == 1 then
		return cc.size(28,95)
	elseif treeData.treeId == 2 or treeData.treeId == 3 or 
			treeData.treeId == 4 then
		return cc.size(28,118)
	elseif treeData.treeId == 5 or treeData.treeId == 6 then
		return cc.size(28,146)
	end
	return cc.size(28,146)
end
function HomelandHelp.updateNodeTreeTitle( rootNode, treeData )
	-- body
	local Node_treeTitle = rootNode:getSubNodeByName("Node_treeTitle")
	if treeData.treeId == 0 then
		local Image_bk = Node_treeTitle:getSubNodeByName("Image_bk")
		local path =  Path.getTextHomeland("txt_homeland_tree0"..treeData.treeLevel)

		if treeData.treeLevel >= 10 then
			path = Path.getTextHomeland("txt_homeland_tree"..treeData.treeLevel) 
		end
		dump(path)
		Node_treeTitle:updateImageView("Image_title", {
			texture = path
		})

		if treeData.treeLevel > 10 then
			Image_bk:setContentSize(cc.size(34,174))
		else
			Image_bk:setContentSize(cc.size(34,146))
		end
	else
		if treeData.treeLevel == 0 then
			Node_treeTitle:setVisible(false)
			return
		end
		Node_treeTitle:setVisible(true)
		local Image_bk = Node_treeTitle:getSubNodeByName("Image_bk")
		--local Image_level = Node_treeTitle:getSubNodeByName("Image_level")
		Node_treeTitle:updateImageView("Image_title", {
			texture = Path.getTextHomeland("txt_homeland_decorate"..treeData.treeId)
		})
		Image_bk:setContentSize(HomelandHelp.getSubTreeFontHeight(treeData))
		--Image_level:setPosition(cc.p(1,0))
		if treeData.treeLevel>10 then
			Node_treeTitle:updateImageView("Image_level", {
				size = cc.size(26, 75)
			})
			Node_treeTitle:updateLabel("Text_level", {
				position = cc.p(13, 70),
				text = Lang.get("homeland_sub_tree_level"..treeData.treeLevel)
			})
		else
			Node_treeTitle:updateImageView("Image_level", {
				size = cc.size(26, 55)
			})
			Node_treeTitle:updateLabel("Text_level", {
				position = cc.p(13, 51),
				text = Lang.get("homeland_sub_tree_level"..treeData.treeLevel)
			})
		end
	end

end
function HomelandHelp.isTreeProduceMax( ... )
	-- body
	local treeMgr = G_UserData:getHomeland():getTreeManager()
    local serverMoney = treeMgr.total
	local serverMoneyTime = treeMgr.lastStartTime
	local serverGetMoneyTime = treeMgr.lastHarvestTime
	local ParameterIDConst = require("app.const.ParameterIDConst")
    local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.HOMELAND_TIME_LIMIT).content)
	local nowTime = G_ServerTime:getTime()
	local timeDiff = nowTime - serverMoneyTime      --服务器结算金币得时间
    local getTimeDiff = nowTime - serverGetMoneyTime        --玩家点击获得金币得时间

	if getTimeDiff >= timeLimit then 
		return true
	end

	return false
end
--神树产出计算
function HomelandHelp.getTreeProduce()

    local output = HomelandHelp.getSelfMainTreeCfg().output_efficiency / 100000
	--dump(output)
	local treeMgr = G_UserData:getHomeland():getTreeManager()
    local serverMoney = treeMgr.total
	local serverMoneyTime = treeMgr.lastStartTime
	local serverGetMoneyTime = treeMgr.lastHarvestTime
	local nowTime = G_ServerTime:getTime()

	local timeDiff = nowTime - serverMoneyTime      --服务器结算金币得时间
    local getTimeDiff = nowTime - serverGetMoneyTime        --玩家点击获得金币得时间
    
	local ParameterIDConst = require("app.const.ParameterIDConst")
    local timeLimit = tonumber(require("app.config.parameter").get(ParameterIDConst.HOMELAND_TIME_LIMIT).content)
	
	if getTimeDiff > timeLimit then 
		getTimeDiff = timeLimit
		local overTime = nowTime - serverGetMoneyTime - timeLimit
		timeDiff = timeDiff - overTime
		if timeDiff < 0 then 
			timeDiff = 0
		end
	end

	--dump(timeDiff * output)

    local moneyCount = math.floor( serverMoney + timeDiff * output)
    local nowMoneyDetail = serverMoney + timeDiff * output - moneyCount        --钱币的小数部分
	--dump(nowMoneyDetail)
    local percent = nowMoneyDetail*100 

    if getTimeDiff == timeLimit then 
        percent = 100
    end
	--dump(percent)
    return moneyCount, percent
end




--获取升当前等级所需经验
function HomelandHelp.getMainTreeExp(currLevel)
	local config =  G_UserData:getHomeland():getMainTreeCfg(currLevel)
	return config.experience
end


function HomelandHelp.getSubTreePower(subType,subLevel)
	local allPower = 0
	local subCfg = require("app.config.tree_decorate_add")
	for level= 1, subLevel do
		local data = subCfg.get(subType,level)
		if data then
			allPower = data.all_combat + allPower
		end
	end
	return allPower
end

function HomelandHelp.getMainTreePower(mainLevel)
		-- body
	local allPower = 0
	local subCfg = require("app.config.tree_info")
	for level= 1, mainLevel do
		local data = subCfg.get(level)
		if data then
			allPower = data.all_combat + allPower
		end
	end
	return allPower
	-- body
end
--获取神树战力
function HomelandHelp.getAllPower( ... )
	-- body
	local allPower = 0
	for i =1 , HomelandConst.MAX_SUB_TREE do
		local subTree = G_UserData:getHomeland():getSubTree(i)
		allPower = allPower + HomelandHelp.getSubTreePower(i, subTree.treeLevel)
	end
	local mainTree = G_UserData:getHomeland():getMainTree()
	local retPower = allPower + HomelandHelp.getMainTreePower(mainTree.treeLevel)
	return retPower
end


--获取神树战力
function HomelandHelp.getFriendAllPower( friendId )
	-- body

	local subPower = 0
	for i =1 , HomelandConst.MAX_SUB_TREE do
		local subTree = G_UserData:getHomeland():getInviteFriendSubTree(friendId, i)
		if subTree then
			subPower = subPower + HomelandHelp.getSubTreePower(i, subTree.treeLevel)
		end
	end

	local mainTree = G_UserData:getHomeland():getInviteFriendMainTree(friendId)

	local mainPower = HomelandHelp.getMainTreePower(mainTree.treeLevel)
	local retPower = subPower + mainPower


	return retPower
end



function HomelandHelp.getHomelandAttr()
	local attrAllList = {}
	local AttrDataHelper = require("app.utils.data.AttrDataHelper")

	for i = 1, HomelandConst.MAX_SUB_TREE do
		local currLevel = G_UserData:getHomeland():getSubTreeLevel(i)
		for level= 1, currLevel do
			local currData = G_UserData:getHomeland():getSubTreeCfg(i,level)
			if currData then
				local attrList = {}
				for i = 1, 4 do 
					local attrType = currData["attribute_type"..i]
					local attrValue = currData["attribute_value"..i]
					if attrType > 0 then
						table.insert( attrList, {type = attrType, value = attrValue} )
					end
				end
				for k, attrValue in ipairs(attrList) do
					AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value)
				end
			end
		end
	end

	local currLevel = G_UserData:getHomeland():getMainTreeLevel()
	for level= 1, currLevel do
		local currData = G_UserData:getHomeland():getMainTreeCfg(level)
		if currData then
			local attrList = {}
			for i = 1, 4 do 
				local attrType = currData["attribute_type"..i]
				local attrValue = currData["attribute_value"..i]
				if attrType > 0 then
					table.insert( attrList, {type = attrType, value = attrValue} )
				end
			end
			for k, attrValue in ipairs(attrList) do
				AttrDataHelper.formatAttr(attrAllList, attrValue.type, attrValue.value)
			end
		end
	end
	--[[
	for attrType , attrValue in pairs(attrAllList) do
		

		local totalValue = attrValue
		if currCfg then
			totalValue = attrValue * currCfg.attribute_percentage*0.01 + attrValue
		end
		attrAllList[attrType] = totalValue
	end 
	]]
	return attrAllList
end


function HomelandHelp.getMainLevelAttrList( level )
	-- body
	local tempCfg = G_UserData:getHomeland():getMainTreeCfg(level)
	local valueList = {}
	local attrConfig = require("app.config.attribute")	
	valueList[1] = { name = Lang.get("official_all_all_combat") , value = tempCfg.all_combat}
	for i = 1,4,1 do
		if tempCfg["attribute_type"..i] > 0 then
			local nameStr = attrConfig.get(tempCfg["attribute_type"..i]).cn_name 
			nameStr = Lang.get("official_all")..nameStr --TextHelper.expandTextByLen(nameStr,3)+
			table.insert(valueList, {name= nameStr, value = tempCfg["attribute_value"..i]})
		end
	end
	table.insert(valueList, {name= attrConfig.get(tempCfg["output_type"]).cn_name, value = tempCfg.output_efficiency})
	return valueList
end

function HomelandHelp.getSubLevelAttrList( type, level )
	-- body
	local tempCfg = G_UserData:getHomeland():getSubTreeCfg(type, level)
	local valueList = {}
	local attrConfig = require("app.config.attribute")	
	valueList[1] = { name = Lang.get("official_all_all_combat") , value = tempCfg.all_combat}
	for i = 1,4,1 do
		if tempCfg["attribute_type"..i] > 0 then
			local nameStr = attrConfig.get(tempCfg["attribute_type"..i]).cn_name 
			nameStr = Lang.get("official_all")..nameStr --TextHelper.expandTextByLen(nameStr,3)
			valueList[i+1] = { name = nameStr, value = tempCfg["attribute_value"..i]}
		end
	end
	return valueList
end


--根据tree_preview的data数据展开结构
function HomelandHelp.getTreeItemList( data )
	-- body
	local UserCheck = require("app.utils.logic.UserCheck")
	if UserCheck.enoughOpenDay(data.day_min) == false then
		return nil
	end

	local function convertStringToNumber(convetStr)
		if convetStr ~= "" then
			local condition = string.split(convetStr,"|")
			local treeType, minLevel, maxLevel = unpack(condition)
			return tonumber(treeType),tonumber(minLevel),tonumber(maxLevel)
		end
		return 0
	end
	--材料结构
	-- name = xxx
	-- type = xxx
	-- matrial = {
	-- [1] = {type,value,size}
	-- [2] = {type,value,size}
	--}
	local function makeMaterialTable(treeType, minLevel, maxLevel)
		local matrialTable = {}
		matrialTable.list = {}
		for i = minLevel+1, maxLevel do
			local cfgData = G_UserData:getHomeland():getSubTreeCfg(treeType, i-1)	
			local item = {}
			item.lv = Lang.get("homeland_level_desc",{num1 =i-1, num2=i})
			item.list = {}
			for i=1, 2 do
				local type = cfgData["type_"..i]
				local value = cfgData["value_"..i]
				local size = cfgData["size_"..i]
				if type > 0 then
					table.insert( item.list, {type= type, value = value, size = size} )
				end
			end

			table.insert( matrialTable.list, item)
		end

		local cfgData = G_UserData:getHomeland():getSubTreeCfg(treeType, maxLevel)
		matrialTable.cfg = cfgData
		return matrialTable
	end

	local matrialList = {}
	for i= 1, 6 do 
		local condition = data["condition_"..i]
		local treeType, minLevel, maxLevel = convertStringToNumber(condition)
		if treeType > 0 then
			local retTable = makeMaterialTable(treeType,minLevel, maxLevel)
			table.insert( matrialList, retTable)
		end
	end

	return matrialList
	
end


--神树材料预览数据结构
function HomelandHelp.getTreePreviewList( ... )
	-- body
	local tree_preview = require("app.config.tree_preview")
	local treePreviewList = {}

	for i = 1, tree_preview.length() do
		local data = tree_preview.indexOf(i)
		local treeItemList = HomelandHelp.getTreeItemList(data)
		if treeItemList then
			table.insert( treePreviewList, {
				id = data.id,
				list = treeItemList 
			})
		end
	end
	
	dump(treePreviewList)
	return treePreviewList
end

--计算tree_buff里的value值(显示用)
function HomelandHelp.getValueOfBuff(value, equation)
	if equation and equation ~= "" then
		equation = string.gsub(equation, "parameter", value)
		local func = loadstring("return "..equation)
		value = func()
	end
	return value
end

--计算tree_buff里的value值(实际用)
function HomelandHelp.getRealValueOfBuff(info)
	local value = info.value
	local equation = info.equation
	local description = info.description
	value = HomelandHelp.getValueOfBuff(value, equation)
	if string.find(description, "#value#%%") then --找到value后跟着%，说明实际使用要换算成百分比
		value = value / 100
	end
	return value
end

--计算tree_buff里的times值
function HomelandHelp.getTimesOfBuff(times, type)
	if type == HomelandConst.TREE_BUFF_TYPE_3 then
		times = times / 3600 --转换成小时
	end
	return times
end

--获取神树祈福的描述
function HomelandHelp.getBuffDes(baseId)
	local info = HomelandHelp.getTreeBuffConfig(baseId)
	local description = info.description

	-- 这个id的buff文本特殊处理
	local bossId = G_UserData:getCrossWorldBoss():getBoss_id()
	if bossId and bossId > 0 and baseId == HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24 then
		local CrossWorldBossHelper = require("app.scene.view.crossworldboss.CrossWorldBossHelper")
		local pozhaoCamp = CrossWorldBossHelper.getSelfIsPoZhaoCamp()
		
		if pozhaoCamp == true then
			description = Lang.get("homeland_tree_buff24_tip2")
		else
			description = Lang.get("homeland_tree_buff24_tip1")
		end
	end

	local value = HomelandHelp.getValueOfBuff(info.value, info.equation)
	local times = HomelandHelp.getTimesOfBuff(info.times, info.type)
	local des = Lang.getTxt(description, {value = value, times = times})
	return des
end

--获取神树祈福的生效提示
function HomelandHelp.getBuffEffectTip(baseId)
	local info = HomelandHelp.getTreeBuffConfig(baseId)
	local comment = info.screen_comment
	local value = HomelandHelp.getValueOfBuff(info.value, info.equation)
	local tip = Lang.getTxt(comment, {name = info.name, value = value})
	return tip
end

--神树祈福buff延迟飘字
function HomelandHelp.delayShowBuffNoticeTip(buffBaseId)
	local tips = G_UserData:getHomeland():getBuffNoticeTip(buffBaseId)
	if tips then
		if tips ~= "" then
			G_Prompt:showTip(tips) --飘字
		end
		G_UserData:getHomeland():removeBuffNoticeTip(buffBaseId)
	end
end

--检查祈福buff是否为可用
function HomelandHelp.checkBuffIsCanUse(buffBaseId)
	local buffDatas = G_UserData:getHomeland():getBuffDatasWithBaseId(buffBaseId)
	for i, buffData in ipairs(buffDatas) do
		if buffData:isEffected() == false then --有buff，还没生效过，表示能用
			return true, buffData
		end
	end
	
	return false
end

return HomelandHelp