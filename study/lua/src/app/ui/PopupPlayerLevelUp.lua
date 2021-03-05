--弹出界面
--主公等级提升
--
local PopupBase = require("app.ui.PopupBase")
local PopupPlayerLevelUp = class("PopupPlayerLevelUp", PopupBase)
local Path = require("app.utils.Path")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper  = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local DataConst = require("app.const.DataConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local AudioConst = require("app.const.AudioConst")
local LINE_ITEM_COUNT = 5 --一行5个ICON
local LINE_HEIGHT = 130
local LINE_ITEM_BLACK = 3 -- 物品横排间隔


function PopupPlayerLevelUp:ctor(closeCallback)
	self._listView  = nil
	--根据玩家等级开放功能
	self._wayGetCell1 = nil
	self._wayGetCell2 = nil
	self._wayGetCell3 = nil
	self._effectRootNode = nil
	self._callBack = closeCallback
	self._functionGuideList = {}
	self._effectNode = nil
	self._fingerEffectNodeList = {}
	self._panelRoot = nil
	self._isAnimEnd = false
	local resource = {
		file = Path.getCSB("PopupPlayerLevelUp", "common"),
		binding = {
			_panelRoot = {
				events = {{event = "touch", method = "_onClickScreen"}}
			}
		},
	}

	self:setName("PopupPlayerLevelUp")
	PopupPlayerLevelUp.super.ctor(self, resource, false, false)
end


function PopupPlayerLevelUp:_onClickScreen()
	if self._isAnimEnd then
		logWarn("PopupPlayerLevelUp:_onClickScreen")
		self:close()
	end
end

function PopupPlayerLevelUp:defaultUI()
	local baseMgr = G_UserData:getBase()
	local roleCfgData = UserDataHelper.getUpgradeAttrData(baseMgr:getOldPlayerLevel(),baseMgr:getLevel())
	local newVit =  baseMgr:getResValue(DataConst.RES_VIT)
	local newSpirit = baseMgr:getResValue(DataConst.RES_SPIRIT)
	dump(roleCfgData)
	local oldVit = newVit - roleCfgData.lvup_power
	if oldVit < 0 then
		oldVit = 0
	end
	if oldVit == 0 then
		oldVit = newVit
	end
	
	
	local oldSpirit  = newSpirit - roleCfgData.lvup_energy
	if oldSpirit < 0 then
		oldSpirit = 0
	end
	if oldSpirit == 0 then
		oldSpirit = 0
	end
    local attrList = {
        [1] = {desc = Lang.get("player_level_up"), oldValue = baseMgr:getOldPlayerLevel(), newValue = baseMgr:getLevel()},
        [2] = {desc = Lang.get("player_level_vip"), oldValue = oldVit, newValue = newVit},
        [3] = {desc = Lang.get("player_level_spirit"), oldValue = oldSpirit, newValue = newSpirit},
    }
	self:updateUI(attrList)
	self:_initLevelInfo()
	self:_addEffectNode()
end


function PopupPlayerLevelUp:updateUI(params)
	for i, value in ipairs(params) do
		if checktable(value) then
			local widget = self:_createLineAttr()
			self._listView:pushBackCustomItem(widget)
			self:_setAttrLine(widget, value.desc, value.oldValue, value.newValue)
		end
	end
--	self._listView:adaptWithContainerSize()
	self:_addEffectNode()
end

function PopupPlayerLevelUp:_createLineAttr()
	local rootWidget = ccui.Widget:create()
	local listSize = self._listView:getContentSize()
	
	local advanceAttr = CSHelper.loadResourceNode(Path.getCSB("CommonLevelUpAttr", "common"))
	local advanceRoot = ccui.Helper:seekNodeByName(advanceAttr, "Panel_root")
	local advanceSize = advanceRoot:getContentSize()
	rootWidget:setContentSize(advanceSize)
	rootWidget:addChild(advanceAttr)
	UIHelper.setPosByPercent(advanceAttr,cc.p(0.5,0.5))

	rootWidget:setVisible(false)
	return rootWidget
end

function PopupPlayerLevelUp:_setAttrLine(attr, desc, oldValue, newValue)
	attr:updateLabel("Text_desc", desc)

	oldValue = oldValue or 0
	attr:updateLabel("Text_value", oldValue)

	attr:updateLabel("Text_up_value", newValue)

	local arrow = attr:getSubNodeByName("Image_arrow")
	if arrow then
		local UIActionHelper = require("app.utils.UIActionHelper")
		UIActionHelper.playFloatXEffect(arrow)
	end
end

function PopupPlayerLevelUp:addAttr( desc, oldValue, newValue)
	local widget = self:_createLineAttr()

	self._listView:pushBackCustomItem(widget)

	self:_setAttrLine(widget, attrId, oldValue, newValue)

	--self._listView:adaptWithContainerSize()
end



--

function PopupPlayerLevelUp:onCreate()
	-- button
	self._listView = ccui.Helper:seekNodeByName(self, "ListView")
	self._listView:setVisible(true)
	self._commonContinueNode:setVisible(false)
	
end

function PopupPlayerLevelUp:_addEffectNode()
	if not self._effectNode then
		G_AudioManager:playSoundWithId(AudioConst.SOUND_CREATE_ROLE_LEVEL_UP)
		self._effectNode = self:_createEffectNode(self._effectRootNode )
	end
end

function PopupPlayerLevelUp:_onItemSelected(item, index)
end

function PopupPlayerLevelUp:_onItemTouch(index, t)
end

function PopupPlayerLevelUp:_onInit()

end


function PopupPlayerLevelUp:onEnter()
   	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_START, self.__cname)
	--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
end

function PopupPlayerLevelUp:onClose( ... )
	-- body
	--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)
	--G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
	if self._callBack then
		self._callBack(true)
	end
end

function PopupPlayerLevelUp:onExit()

end

--开区功能
function PopupPlayerLevelUp:_initLevelInfo()
	local infoList = {}
	local FunctionLevel = require("app.config.function_level")
	for i=1, FunctionLevel.length() do 
		local info = FunctionLevel.indexOf(i)
		if info.is_show_lvup ~= 0 then
			table.insert(infoList, info)
		end
	end
	-- 按照等级从小到大排序
	table.sort(infoList, function(a, b)
		return a.level < b.level
	end)
	
	local maxShowNum = 2
	local functionGuideList = self:_getFunctionGuideList(infoList,maxShowNum)
	for index, value  in ipairs(functionGuideList) do
		self:_updateWayInfo(index, value)
	end
	self._functionGuideList  = functionGuideList
end

function PopupPlayerLevelUp:_updateWayInfo(index, wayInfo)
	local wayItem = self["_wayGetCell"..index]
	if wayItem == nil then
		assert(false, "PopupPlayerLevelUp:_updateWayInfo can't find wayItem by index : "..index)
		return
	end
	local playerLevel =  G_UserData:getBase():getLevel() 
	wayItem:updateImageView("Image_Icon", {texture = Path.getCommonIcon("main",wayInfo.icon)})
	wayItem:updateLabel("Text_way_name", {text = wayInfo.name})--color = Colors.COLOR_SCENE_DESC_NORMAL
	wayItem:updateLabel("Text_way_desc", {text = wayInfo.description})--color = Colors.COLOR_SCENE_TIP

	if playerLevel  >= wayInfo.level and wayInfo.is_show_lvup == 1  then
		wayItem:updateButton("Button_OK", {visible = true })
	else
		wayItem:updateButton("Button_OK", {visible = false })
	end

	local textDesc = Lang.get("way_type_no_open_desc", {level = wayInfo.level} )

	wayItem:updateLabel("Text_way_unlock_desc", 
	{
		visible = playerLevel < wayInfo.level, 
		text = textDesc, 
		color = Colors.getColor(6), 
	})

    local textDesc = Lang.get("way_type_open")
	wayItem:updateLabel("Text_way_unlock_desc", 
	{
		visible = playerLevel >= wayInfo.level and wayInfo.is_show_lvup == 2, 
		text = textDesc, 
		color = Colors.getColor(2), 
    })
    
	wayItem:updateImageView("Image_way_unlock", 
	{
		visible = false,--playerLevel >= wayInfo.level and wayInfo.is_show_lvup == 2, 
	})


	local panelTouch = wayItem:getSubNodeByName("Panel_Touch")
	local canSkip = playerLevel >= wayInfo.level and wayInfo.is_show_lvup == 1
	if panelTouch and canSkip then
		local function onGoHandler()
			logWarn("click panelTouch"..wayInfo.level.."_________"..wayInfo.is_show_lvup)
			if canSkip then
				-- 获取入口，然后切换，未来考虑把入口直接进入进ModuleDirector里
				WayFuncDataHelper.gotoModuleByFuncId(wayInfo.function_id)
				self:close()
			else
				self:close()	
			end
		end
		
		panelTouch:setTouchEnabled(true)
		panelTouch:addClickEventListenerEx(onGoHandler)
	else
		panelTouch:setTouchEnabled(false)	
	end
	wayItem:setVisible(false)

	if wayInfo.is_show_lvup == 1 and  wayInfo.is_guide == 1 then
		local buttonOk = ccui.Helper:seekNodeByName(wayItem, "Button_OK")
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		local effectNode = EffectGfxNode.new("effect_finger")
		buttonOk:addChild(effectNode)
		effectNode:play()
		UIHelper.setPosByPercent(effectNode, cc.p(0.5,0.5))
		table.insert( self._fingerEffectNodeList, effectNode)
		 effectNode:setVisible(false)--整个动画播放完才显示
	end
end

function PopupPlayerLevelUp:_getFunctionGuideList(infoList,maxShowNum)

	-- 先找到当前大于等于当前等级条目数据的索引
	local lastIndex = nil
	for i=1, #infoList do
		local info = infoList[i]
		if info.level >= G_UserData:getBase():getLevel() then
			lastIndex = i
			break
		end
	end
	-- 有可能没有匹配的，这时候说明是已经满级了
	lastIndex = lastIndex or #infoList

	-- 往下找三个
	local start = lastIndex
	local dstInfos = {}
	repeat
		dstInfos[#dstInfos + 1] = infoList[start]
		start = start + 1
	until #dstInfos >= maxShowNum or not infoList[start]

	-- 如果还不满足，则往上找三个
	if #dstInfos < maxShowNum then
		local start = lastIndex - 1	-- 这里-1是因为lastIndex已经在上面被加过了
		repeat
			dstInfos[#dstInfos + 1] = infoList[start]
			start = start - 1
		until #dstInfos >= maxShowNum or not infoList[start]
	end

	-- 理论上还有可能不满足的，这时候就说明配置有问题了
	assert(#dstInfos >= maxShowNum, "There is not enough info with open level: "..tostring(G_UserData:getBase():getLevel()))

	-- 按照等级从小到大排序
	table.sort(dstInfos, function(a, b)
		return a.level < b.level
	end)

	return dstInfos
end

function PopupPlayerLevelUp:isAnimEnd()
	return self._isAnimEnd
end
function PopupPlayerLevelUp:_createEffectNode(effectRootNode)
	local TextHelper = require("app.utils.TextHelper")
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
        if TextHelper.stringStartsWith(effect,"effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
		else
			return display.newNode()  
		end
    end
    local function eventFunction(event,frameIndex,movingNode)
        if TextHelper.stringStartsWith(event,"play_shuzhi") then
			local index = TextHelper.stringGetSuffixIndex(event,"play_shuzhi")
			local items = self._listView:getItems()
			if items[index] then
				items[index]:setVisible(true)
				G_EffectGfxMgr:applySingleGfx(items[index], "smoving_herolevelup_shuzhi", nil, nil, nil)
			end
		elseif TextHelper.stringStartsWith(event,"play_zhaomu") then	
            local index = TextHelper.stringGetSuffixIndex(event,"play_zhaomu")
            if index == nil then
                return
            end
			if #self._functionGuideList < index then
				return 
			end
			local wayGetCell = self["_wayGetCell"..index]
			if wayGetCell then
				wayGetCell:setVisible(true)
				G_EffectGfxMgr:applySingleGfx(wayGetCell, "smoving_herolevelup_zhaomu", nil, nil, nil)
			end
		elseif event == "play_dianji"  then	 	
			self._commonContinueNode:setVisible(true)
		elseif event == "finish" then	 	 	
			for k,v in ipairs(self._fingerEffectNodeList) do
				 v:setVisible(true)
			end
			self._isAnimEnd  = true
        end
    end
   local node =  G_EffectGfxMgr:createPlayMovingGfx( effectRootNode, "moving_herolevelup", effectFunction, eventFunction , false )
   return node
end


return PopupPlayerLevelUp