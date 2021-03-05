-- @Author panhoa
-- @Date 8.29.2018
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupSeasonSilk = class("PopupSeasonSilk", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local LogicCheckHelper  = require("app.utils.LogicCheckHelper")

local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSilkConst = require("app.const.SeasonSilkConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")
local SeasonSilkGroupIcon = require("app.scene.view.seasonSilk.SeasonSilkGroupIcon")
local SeasonSilkListCell = require("app.scene.view.seasonSilk.SeasonSilkListCell")
local SeasonSilkIcon = require("app.scene.view.seasonSilk.SeasonSilkIcon")
local PopupSilkModifyName = require("app.scene.view.seasonSilk.PopupSilkModifyName")
local PopupSilkRecommand = require("app.scene.view.seasonSilk.PopupSilkRecommand")
local PopupSilkbagDetail = require("app.scene.view.silkbag.PopupSilkbagDetail")
local PopupAlert = require("app.ui.PopupAlert")


-- @Role Get Connected-Info while Entry(Obsolutly in SeasonSportView.lua
function PopupSeasonSilk:waitEnterMsg(callBack)
	local function onMsgCallBack(id, message)
		callBack()
	end

    G_UserData:getSeasonSport():c2sFightsEntrance()
	local signal = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_ENTRY_SUCCESS, onMsgCallBack)
	return signal
end

function PopupSeasonSilk:ctor()
	--
	self._commonNodeBk 	   = nil
	self._ListViewGroup    = nil	-- silkgroup
	self._tabListViewGroup = nil	-- groupTab
	self._buttonDetail     = nil 	-- 详情
	self._nodeTabRoot      = nil	-- tab
	self._listViewSilk     = nil	-- silk
	self._tabListView      = nil	-- silklist
	self._silkbagPanel     = nil	-- silkbase container
	self._panelDetailTouch = nil 	-- 详情点击
	self._panelModifiedName= nil
	self._textGroupBaseName1 = nil	
	self._textGroupBaseName2 = nil	 

	self._selectTabIndex 	= 1	-- 默认橙色锦囊
	self._curSilkBaseIndex	= 1 -- 当前穿戴坑位
	self._silkGroupInfo = {}	-- 锦囊组信息
	self._willPlayAllEffects = false	-- 播放所有穿戴锦囊特效，应用推荐锦囊时使用

	local resource = {
		file = Path.getCSB("PopupSeasonSilk", "seasonSilk"),
		binding = {
			_panelModifiedName = {
				events = {{event = "touch", method = "_onBtnModifyName"}}
			},
			_buttonRecommand = {
				events = {{event = "touch", method = "_onBtnRecommand"}}
			},
			_panelDetailTouch = {
				events = {{event = "touch", method = "_onBtnDetail"}}
			}
		}
	}
	self:setName("PopupSeasonSilk")
	PopupSeasonSilk.super.ctor(self, resource, false, false)
end

function PopupSeasonSilk:onCreate()
    self._goldSilk      = G_UserData:getSeasonSilk():getGoldSilkInfo()
	self._redSilk 	 	= G_UserData:getSeasonSilk():getRedSilkInfo()
	self._orangeSilk 	= G_UserData:getSeasonSilk():getOrangeSilkInfo()
	--
	self._curGroupPos = 1
	self._curGroupName  = ""
	self._commonNodeBk:setTitle(Lang.get("season_silk_equip_title"))
	self._commonNodeBk:setCloseButtonLocalZOrder(100)
	self._commonNodeBk:addCloseEventListener(handler(self, self._onBtnClose))
	--
	self:_initSeasonSlot()
	self:_initSilkGroupView()
	self:_initSilkBaseView()
	self:_initSilkListView()
end

function PopupSeasonSilk:onEnter()
	G_UserData:getSeasonSport():setInSeasonSilkView(true)
	self._signalSilkEquip = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_SILKEQUIP_SUCCESS, handler(self, self._onEventSilkEquipSuccess))
	self._signalShowClose = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_CLOSESILKDETAIL, handler(self, self._onEventShowCloseBtn))
	self._signalHideClose = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_OPENSILKDETAIL, handler(self, self._onEventHideCloseBtn))
	self._signalListnerSeasonEnd = G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_END, handler(self, self._onEventListnerSeasonEnd))		-- 监听赛季结束
	self._signalListnerApplyRmdSilk =
		G_SignalManager:add(SignalConst.EVENT_SEASONSPORT_APPLY_RECOMMAND_SILK, handler(self, self._onEventListnerApplyRmdSilk))			-- 监听应用推荐锦囊

	self._silkGroupInfo = G_UserData:getSeasonSport():getSilkGroupInfo()

	--
	self:_initFirstSilkGroupName()
	self:_updateSilkGroupView()
	self:_updateSilkBaseView()
	self:_updateSilkListView()
	self:_updateSilkBasePanelInfo()
	self:_playRotatePlateInBaseView()
end

function PopupSeasonSilk:onExit()
	self._signalSilkEquip:remove()
	self._signalShowClose:remove()
	self._signalHideClose:remove()
	self._signalListnerSeasonEnd:remove()
	self._signalListnerApplyRmdSilk:remove()
	self._signalSilkEquip = nil
	self._signalShowClose = nil
	self._signalHideClose = nil
	self._signalListnerSeasonEnd= nil
	self._signalListnerApplyRmdSilk = nil

	self:_stopRotatePlateInBaseView()
	G_UserData:getSeasonSport():setInSeasonSilkView(false)
end

function PopupSeasonSilk:_onEventListnerSeasonEnd()
	G_UserData:getSeasonSport():c2sFightsEntrance()
	self:close()
end

function PopupSeasonSilk:_onEventListnerApplyRmdSilk()
	self._willPlayAllEffects = true
end

function PopupSeasonSilk:_onBtnClose()
	G_UserData:getSeasonSport():c2sFightsEntrance()
	self:close()
end

function PopupSeasonSilk:_onEventShowCloseBtn()
	self._commonNodeBk:setCloseVisible(true)
end

function PopupSeasonSilk:_onEventHideCloseBtn()
	self._commonNodeBk:setCloseVisible(false)
end

function PopupSeasonSilk:_onBtnDetail()
	local curGroupData = self._silkGroupInfo[self._curGroupPos]
	if rawget(curGroupData, "silkbag") == nil or table.nums(curGroupData.silkbag) == 0 then
		G_Prompt:showTip(Lang.get("silkbag_no_detail_tip"))
		return
	end

	local silkbagIds = {}
	for key, value in pairs(curGroupData.silkbag) do
		if value > 0 then
			table.insert(silkbagIds, value)
		end
	end

	self._commonNodeBk:setCloseVisible(false)
	local popup = PopupSilkbagDetail.new()
	popup:updateUI2(silkbagIds)
	popup:openWithAction()
	popup:setCloseCallBack(handler(self, self._onEventShowCloseBtn))
end

function PopupSeasonSilk:_initSeasonSlot()
	self._slotMax = SeasonSportHelper.getCurSlotNum()
end

-------------------------------Silk Group--------------------------------------------
-- @Role 	Modify GroupName
function PopupSeasonSilk:_onBtnModifyName(sender)
	self._commonNodeBk:setCloseVisible(false)
	local popup = PopupSilkModifyName.new(self._silkGroupInfo[self._curGroupPos], handler(self, self._updateGroupName))
	popup:openWithAction()
	popup:setCurGroupName(self._curGroupName)
	popup:setCloseCallBack(handler(self, self._onEventShowCloseBtn))
end

function PopupSeasonSilk:_onBtnRecommand(sender)
    self._commonNodeBk:setCloseVisible(false)
	local popup = PopupSilkRecommand.new(self._curGroupPos)
    popup:openWithAction()
    popup:setCloseCallBack(handler(self, self._onEventShowCloseBtn))
end

-- @Role 	First name
function PopupSeasonSilk:_initFirstSilkGroupName()
	if self._silkGroupInfo and self._silkGroupInfo[1]  then
		if rawget(self._silkGroupInfo[1], "name") ~= "" then
			self._curGroupName = self._silkGroupInfo[1].name
		else
			self._curGroupName = Lang.get("season_silk_group_initname2")..tostring(1)
		end
	end
end

-- @Role 	Update name
function PopupSeasonSilk:_updateGroupName(name)
	if self._curGroupName ~= nil then
		self._textGroupBaseName2:setString(name)
		self:_updateSilkGroupView()
	end
end

-- @Role 	Init SilkGroup
function PopupSeasonSilk:_onGroupItemUpdate(item, index)
	local maxGroup = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_SILK_GROUPCOUNT).content)
	if maxGroup <= 0 then
		return
	end

	local data = {}
	local curIndex = index + 1
	data.pos  = curIndex
	data.isSelected = self._curGroupPos  == curIndex or false
	if self._silkGroupInfo and self._silkGroupInfo[curIndex]  then
		if rawget(self._silkGroupInfo[curIndex], "silkbag") ~= nil and table.nums(self._silkGroupInfo[curIndex].silkbag) > 0 then
			data.state = SeasonSilkConst.SILK_GROUP_SATE_EQUIPPED
		elseif self:_isUnLockState(curIndex) then
			data.state = SeasonSilkConst.SILK_GROUP_SATE_UNLOCK
		else
			data.state = SeasonSilkConst.SILK_GROUP_SATE_UNEQUIP
		end
		if rawget(self._silkGroupInfo[curIndex], "name") ~= "" then
			data.name = self._silkGroupInfo[curIndex].name
		else
			data.name = Lang.get("season_silk_group_initname2")..tostring(curIndex)
		end
	else
		data.state = SeasonSilkConst.SILK_GROUP_SATE_LOCK
		data.name = Lang.get("season_silk_group_initname2")..tostring(curIndex)
	end
	item:updateUI(data)
end

function PopupSeasonSilk:_onGroupItemSelected(item, index)
end

-- @Role 	onTouch Group
function PopupSeasonSilk:_onGroupItemTouch(index, data)
	if data.state == SeasonSilkConst.SILK_GROUP_SATE_LOCK then
		local needGold = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_SILKGROUP_UNLOCK).content)
		local success, popFunc = LogicCheckHelper.enoughCash(needGold)
		if success then
			local proirNum = table.nums(self._silkGroupInfo) + 1
			if data.pos > proirNum then
				G_Prompt:showTip(Lang.get("season_tip_firtsopengroup", {num=proirNum}))
				return
			end

			local function callbackOK()
				self._curSilkBaseIndex = 1
				self._curGroupPos = data.pos
				self._curGroupName = data.name
				G_Prompt:showTip(Lang.get("season_tip_opengroup", {num = data.pos}))
				G_UserData:getSeasonSport():c2sFightsSilkbagSetting((self._curGroupPos - 1), data.name, nil)
			end

            local function callbackCancel()
                -- body
                self:_onEventShowCloseBtn()
            end

            local function callbackExit()
                -- body
                self:_onEventShowCloseBtn()
            end

            -- alert unlock
            self:_onEventHideCloseBtn()
			local freeOpenSilkGroup = G_UserData:getSeasonSport():getFreeOpenSilkGroup()
			local danName = SeasonSportHelper.getDanInfoByStar(freeOpenSilkGroup[data.pos]).name
			local content = Lang.get("season_silk_unlock_content", {money=needGold, dan = danName})
			local title = Lang.get("season_silk_unlock_title")
			local popup = PopupAlert.new(title, content, callbackOK, callbackCancel, callbackExit)
			popup:openWithAction()
		else
			popFunc()
		end
	elseif data.state == SeasonSilkConst.SILK_GROUP_SATE_UNLOCK then
		self._curSilkBaseIndex = 1
		self._curGroupPos = data.pos
		self._curGroupName = data.name
		G_UserData:getSeasonSport():c2sFightsSilkbagSetting((self._curGroupPos - 1), data.name, nil)
	elseif data.state == SeasonSilkConst.SILK_GROUP_SATE_UNEQUIP or data.state == SeasonSilkConst.SILK_GROUP_SATE_EQUIPPED then
		self._curSilkBaseIndex = 1
		self._curGroupPos = data.pos
		self._curGroupName = data.name
		self:_updateSilkGroupView()
		self:_updateSilkBaseView()
		self:_updateSilkBasePanelInfo()
		self:_updateSilkListView()
	end
end

-- @Role	初始化锦囊组
function PopupSeasonSilk:_initSilkGroupView()
	local scrollViewParam = {}
	scrollViewParam.template = SeasonSilkGroupIcon
	scrollViewParam.updateFunc = handler(self, self._onGroupItemUpdate)
	scrollViewParam.selectFunc = handler(self, self._onGroupItemSelected)
	scrollViewParam.touchFunc = handler(self, self._onGroupItemTouch)
	self._tabListViewGroup = TabScrollView.new(self._ListViewGroup, scrollViewParam, 1)
end

-- @Role 	Update SilkGroup
function PopupSeasonSilk:_updateSilkGroupView()
	local maxGroup = tonumber(SeasonSportHelper.getParameterConfigById(SeasonSportConst.SEASON_SILK_GROUPCOUNT).content)
	if maxGroup <= 0 then
		return
	end
	
	self._tabListViewGroup:updateListView(1, maxGroup)
end

-- @Role 	Check is UnLock state
function PopupSeasonSilk:_isUnLockState(curIndex)
	local curStar = G_UserData:getSeasonSport():getCurSeason_Star()
	local freeOpenSilkGroup = G_UserData:getSeasonSport():getFreeOpenSilkGroup()
	if freeOpenSilkGroup[curIndex] and curStar >= freeOpenSilkGroup[curIndex] then
		return true
	end
	return false
end

-- @Role	(Keep...
function PopupSeasonSilk:_getCurGroupData()
	local pos = self._curGroupPos - 1 
	for key, value in pairs(self._silkGroupInfo) do
		if rawget(value, "idx") == pos then
			return value
		end 
	end
	return nil
end

-- @Role 	Set curgroup's Basepanel info
function PopupSeasonSilk:_updateSilkBasePanelInfo()
	if self._silkGroupInfo and self._silkGroupInfo[self._curGroupPos] then
		if rawget(self._silkGroupInfo[self._curGroupPos], "silkbag") ~= nil then
			self._silkLock:setVisible(false)
			self._silkUnEquip:setVisible(false)
			self._silkEquipped:setVisible(true)
		else
			self._silkLock:setVisible(false)
			self._silkUnEquip:setVisible(true)
			self._silkEquipped:setVisible(false)
		end
		if rawget(self._silkGroupInfo[self._curGroupPos], "name") ~= "" then
			self._textGroupBaseName1:setString(self._silkGroupInfo[self._curGroupPos].name)
			self._textGroupBaseName2:setString(self._silkGroupInfo[self._curGroupPos].name)
		else
			self._textGroupBaseName1:setString(Lang.get("season_silk_group_initname2")..tostring(self._curGroupPos))
			self._textGroupBaseName2:setString(Lang.get("season_silk_group_initname2")..tostring(self._curGroupPos))
		end
	else
		self._textGroupBaseName1:setString(Lang.get("season_silk_group_initname2")..self._curGroupPos)
		self._textGroupBaseName2:setString(Lang.get("season_silk_group_initname2")..self._curGroupPos)
		self._silkLock:setVisible(true)
		self._silkUnEquip:setVisible(false)
		self._silkEquipped:setVisible(false)
	end
	self._textGroupBaseName1:setVisible(false)
end

-------------------------SilkBase Panel------------------------------------------------------------------
-- @Role	Silk Base
function PopupSeasonSilk:_initSilkBaseView()
	local paramId = G_UserData:getSeasonSport():getSeason_Stage()
	for i = 1, self._slotMax do
		self["_seasonSilkIcon"..i] = SeasonSilkIcon.new(i, handler(self, self._onClickSilkBaseIcon))
		self["_seasonSilkIcon"..i]:setVisible(true)
		self["_seasonSilkIcon"..i]:setPosition(SeasonSilkConst.SEASON_SILKBASE_POS[paramId][i])	-- paramId
		self._silkbagPanel:addChild(self["_seasonSilkIcon"..i])
	end
end

-- @Role	Silk pos
function PopupSeasonSilk:_updateSilkBaseView()
	if self._silkGroupInfo and self._silkGroupInfo[self._curGroupPos] then
		local groupData = self._silkGroupInfo[self._curGroupPos]

		if groupData.silkbag and table.nums(groupData.silkbag) > 0 then
			for index = 1, table.nums(groupData.silkbag) do
				if groupData.silkbag[index] == 0 or groupData.silkbag[index] == nil then
					self._curSilkBaseIndex = index
					break
				end
			end
		end
		
		for index = 1, self._slotMax do
			local data = {}
			data.groupPos	= groupData.idx
			if rawget(groupData, "name") ~= nil and rawget(groupData, "name") ~= "" then
				data.groupName  = groupData.name
			else
				data.groupName	= Lang.get("season_silk_group_initname2")..tostring((groupData.idx+1))
			end

			if rawget(groupData, "silkbag") ~= nil and groupData.silkbag[index] then
				data.silkId = groupData.silkbag[index]
			else
				data.silkId = 0		
			end
			data.silkPos = index
			data.silkbag = groupData.silkbag
			self["_seasonSilkIcon"..index]:updateUI(data)
			self["_seasonSilkIcon"..index]:setSelected(index == self._curSilkBaseIndex and true or false)
		end
	end
end

-- @Role	Click SilkBase callback
-- @Param	index
function PopupSeasonSilk:_onClickSilkBaseIcon(index, data)
	if index == self._curSilkBaseIndex then
		return
	end

	self._curSilkBaseIndex = index
	for index = 1, self._slotMax do
		self["_seasonSilkIcon"..index]:setSelected(index == self._curSilkBaseIndex and true or false)
	end
end

-- @Role	SilkEquip success
function PopupSeasonSilk:_onEventSilkEquipSuccess(id, message)
	if rawget(message, "silkbag_config") == nil then
		return
	end

	local curGroupData = message.silkbag_config
	self._silkGroupInfo[self._curGroupPos] = curGroupData

	-- 改名要特殊特殊处理
	if G_UserData:getSeasonSport():getModifySilkGroupName() then
		self._curGroupName = self._silkGroupInfo[self._curGroupPos].name
		G_UserData:getSeasonSport():setModifySilkGroupName(false)
		if self._willPlayAllEffects then
			self._willPlayAllEffects = false
			self:_playAllEffects(curGroupData.silkbag)
		end
	else
		if rawget(curGroupData, "silkbag") ~= nil then
			if curGroupData.silkbag[self._curSilkBaseIndex] ~= nil and tonumber(curGroupData.silkbag[self._curSilkBaseIndex]) > 0 then
				self:_playEffect(self._curSilkBaseIndex, curGroupData.silkbag[self._curSilkBaseIndex])	
			end
		end
	end

	self:_updateSilkGroupView()
	self:_updateSilkBaseView()
	self:_updateSilkBasePanelInfo()
	self:_updateSilkListView()
end

-- @Role	playEffect
-- @Param 	index	
-- @Param 	silkId 
function PopupSeasonSilk:_playEffect(index, silkId)
	if silkId == nil or silkId == 0 then
		return
	end

	local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, silkId)
	local effectName = SeasonSilkConst.SILK_EQUIP_EFFECTNAME[param.color]
	self["_seasonSilkIcon"..index]:playEffect(effectName)
end

-- @Role 	playAllEffects
function PopupSeasonSilk:_playAllEffects(silkBag)
	for index,silkId in pairs(silkBag or {}) do
		local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_SILKBAG, silkId)
		local effectName = SeasonSilkConst.SILK_EQUIP_EFFECTNAME[param.color]
		self["_seasonSilkIcon"..index]:playEffect(effectName)
	end
end

-- @Role 	Rotate
function PopupSeasonSilk:_playRotatePlateInBaseView()
	self._imagePlateButtom:runAction(cc.RepeatForever:create(cc.RotateBy:create(60, 360)))
	self._imagePlateFront:runAction(cc.RepeatForever:create(cc.RotateBy:create(60, -360)))
end

-- @Role	Stop
function PopupSeasonSilk:_stopRotatePlateInBaseView()
	self._imagePlateButtom:stopAllActions()
	self._imagePlateFront:stopAllActions()
end

------------------------------------SilkList Tab-----------------------------------------
-- @Role Init SilkList
function PopupSeasonSilk:_initSilkListView()
	local scrollViewParam = {}
	scrollViewParam.template = SeasonSilkListCell
	scrollViewParam.updateFunc = handler(self, self._onSilkItemUpdate)
	scrollViewParam.selectFunc = handler(self, self._onSilkItemSelected)
	scrollViewParam.touchFunc = handler(self, self._onSilkItemTouch)
	self._tabListView = TabScrollView.new(self._listViewSilk, scrollViewParam, self._selectTabIndex)

    local tabNameList = {}
    if self._orangeSilk ~= nil and table.nums(self._orangeSilk) > 0 then
        table.insert(tabNameList, Lang.get("season_silk_type_orange"))
    end
    if self._redSilk ~= nil and table.nums(self._redSilk) > 0 then
        table.insert(tabNameList, Lang.get("season_silk_type_red"))
    end
    if self._goldSilk ~= nil and table.nums(self._goldSilk) > 0 then
        table.insert(tabNameList, Lang.get("season_silk_type_gold"))
    end
    
    local param = {
		callback = handler(self, self._onTabSelect),
		isVertical = 2,
		textList = tabNameList,
    }
    
    local maxNum = table.nums(tabNameList)
    if maxNum > 0 then
        self._nodeTabRoot:setPositionX(SeasonSilkConst.SEASON_ROOTTAB_POS[maxNum])
    end
	self._nodeTabRoot:recreateTabs(param)
end

-- @Role 	Update SilkList
function PopupSeasonSilk:_updateSilkListView()
	local count = 0
	if self._selectTabIndex == 1 then
		count = table.nums(self._orangeSilk)
	elseif self._selectTabIndex == 2 then
        count = table.nums(self._redSilk)
    elseif self._selectTabIndex == 3 then
        count = table.nums(self._goldSilk)
	end
	self._tabListView:updateListView(self._selectTabIndex, count)
end

function PopupSeasonSilk:_onSilkItemUpdate(item, index)
	local pos = index + 1
	local data = {}
	if self._selectTabIndex == 1 then
		data = self._orangeSilk[pos].cfg
	elseif self._selectTabIndex == 2 then
        data = self._redSilk[pos].cfg
    elseif self._selectTabIndex == 3 then
        data = self._goldSilk[pos].cfg
	end

	data.isWeared = false
	if rawget(self._silkGroupInfo[self._curGroupPos], "silkbag") ~= nil then
		local silkbag = self._silkGroupInfo[self._curGroupPos].silkbag
		for index, silkId in pairs(silkbag) do
			if data.id == silkId then
				data.isWeared = true
				break
			end
		end
	end 
	item:updateUI(data)
end

function PopupSeasonSilk:_onSilkItemSelected(item, index)
end

-- @Role	Wear/Change Silk
-- @Param	item
-- @Param	data Cur's touch item info 
function PopupSeasonSilk:_onSilkItemTouch(item, data)
	-- Name
	local curGroupData = self._silkGroupInfo[self._curGroupPos]
	if rawget(curGroupData, "name") == nil or rawget(curGroupData, "name") == "" then
		curGroupData.name = Lang.get("season_silk_group_initname2")..tostring(curGroupData.idx+1)
	end

	-- Silkbag
	if rawget(curGroupData, "silkbag") == nil then
		curGroupData.silkbag = {}
		for index = 1, self._slotMax do
			curGroupData.silkbag[index] = 0
		end
	end

	for index = 1, self._slotMax do
		if self._curSilkBaseIndex == index then
			curGroupData.silkbag[index] = data.id
		else
			if rawget(curGroupData.silkbag, index) == nil then
				curGroupData.silkbag[index] = 0
			end
		end
	end

	G_UserData:getSeasonSport():c2sFightsSilkbagSetting(curGroupData.idx, curGroupData.name, curGroupData.silkbag)
end

-- @Role tab Select
function PopupSeasonSilk:_onTabSelect(index, sender)
	if index == self._selectTabIndex then
		return
	end

	self._selectTabIndex = index
	self:_updateSilkListView()
end


return PopupSeasonSilk