--弹出界面
--购买一次确认框
--可以更新ICON，以及消耗的物品
local PopupBase = require("app.ui.PopupBase")
local PopupItemGuider = class("PopupItemGuider", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper	= require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
local PopupItemGuiderCell = require("app.ui.PopupItemGuiderCell")
local DataConst = require("app.const.DataConst")
local DropHelper = require("app.utils.DropHelper")

function PopupItemGuider:ctor(title, callback )
	--
	self._title = title or Lang.get("way_type_get") 
	self._callback = callback
	self._buyItemId = nil

	--control init
	self._listItemSource = nil
	self._itemDesc 		 = nil
	self._iconTemplate   = nil
	self._commonNodeBk   = nil
	self._textOwnNum     = nil --拥有数量
	self._textTitleOwn = nil
	self._fileNodeEmpty = nil
	--

	self._itemType = nil
	self._itemValue = nil
	local resource = {
		file = Path.getCSB("PopupItemGuider", "common"),
		binding = {
		
		}
	}
	self:setName("PopupItemGuider")
	PopupItemGuider.super.ctor(self, resource, true)
end

--
function PopupItemGuider:onCreate()
	
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)
	self._nodeOwnNum:setFontSize(20)

	self._scrollViewSize = self._scrollView:getContentSize()
end

--

function PopupItemGuider:_refreshView()
	local itemType = self._itemType 
	local itemValue = self._itemValue 
	assert(itemValue, "PopupItemGuider's itemId can't be empty!!!")
	self._iconTemplate:unInitUI()
	self._iconTemplate:initUI(itemType, itemValue)
	self._iconTemplate:setTouchEnabled(false)

	local itemParams = self._iconTemplate:getItemParams()
	self._itemName:setString(itemParams.name)
	self._itemName:setColor(itemParams.icon_color)
	require("yoka.utils.UIHelper").updateTextOutline(self._itemName, itemParams)
	if itemParams.description then
		self._itemDesc:setString(itemParams.description)
	else
		self._itemDesc:setString(" ")
	end
	local desRender = self._itemDesc:getVirtualRenderer()
	desRender:setWidth(415)
	local desSize = desRender:getContentSize()
	if desSize.height < self._scrollViewSize.height then
		desSize.height = self._scrollViewSize.height
	end
	self._itemDesc:setContentSize(desSize)
	self._scrollView:getInnerContainer():setContentSize(desSize)
	self._scrollView:jumpToTop()

	local guiderList = WayFuncDataHelper.getGuiderList(itemType, itemValue)

	local WayTypeInfo = require("app.config.way_type")
	local info = WayTypeInfo.get(itemType,itemValue)
	assert(info,string.format("way_type can't find type = %d and value = %d",itemType,itemValue))
	if info.num_type == 1 then--显示数量
		local itemNum = UserDataHelper.getNumByTypeAndValue(itemType, itemValue)
		self._textOwnNum:setString(""..itemNum)
		--self._textTitleOwn:setVisible(true)
		self._nodeOwnNum:setVisible(true)
		--判断是否碎片 type=1，2，3，4，8 也显示碎片
		if itemParams.fragment_id then--itemType == TypeConvertHelper.TYPE_FRAGMENT
			local fragmentNum = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_FRAGMENT,  itemParams.fragment_id)
			local fragmentParams = TypeConvertHelper.convert( TypeConvertHelper.TYPE_FRAGMENT, itemParams.fragment_id)
			local maxCount = fragmentParams.cfg.fragment_num
			local isEnough = fragmentNum >= maxCount
			self._nodeOwnNum:updateUI(Lang.get("common_curr_have_fragment"), fragmentNum, maxCount,0)
			self._nodeOwnNum:setValueColor(isEnough and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_RED)
			self._nodeOwnNum:setMaxColor(Colors.BRIGHT_BG_ONE)
			self._nodeOwnNum:setDesColor(Colors.BRIGHT_BG_TWO)
		else
			self._nodeOwnNum:updateUI(Lang.get("common_curr_have"), itemNum,nil,0)
			self._nodeOwnNum:setValueColor(Colors.BRIGHT_BG_GREEN)	
			self._nodeOwnNum:setDesColor(Colors.BRIGHT_BG_TWO)
		end
	else
		--self._textTitleOwn:setVisible(false)
		self._nodeOwnNum:setVisible(false)
	end
	self._guiderList = guiderList

	local listView = self._listItemSource
	listView:setTemplate(PopupItemGuiderCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
	listView:resize(#guiderList)


	self._fileNodeEmpty:setVisible(#guiderList <= 0)

end

--重置副本
function PopupItemGuider:_doResetSweep()
    local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
    local resetCount = self._currStageData:getReset_count()
    local timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE, resetCount, Lang.get("stage_no_reset_count"))
    if not timesOut then
        local vipInfo = G_UserData:getVip():getVipFunctionDataByType(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE)
        local resetLimit = vipInfo.value
        resetLimit = resetLimit - resetCount
        self._resetPrice = UserDataHelper.getPriceAdd(100, resetCount + 1 )
        local PopupSystemAlert = require("app.ui.PopupSystemAlert")
        local popupSystemAlert = PopupSystemAlert.new(Lang.get("stage_tips"), Lang.get("stage_reset_warning",{count = self._resetPrice, leftcount = resetLimit}), handler(self, self._sendResetMsg))
        popupSystemAlert:setCheckBoxVisible(false)
        popupSystemAlert:openWithAction()        
    end

    return true
end

--发送重置消息
function PopupItemGuider:_sendResetMsg()
    local UserCheck = require("app.utils.logic.UserCheck")
    local success, errorFunc = UserCheck.enoughCash(self._resetPrice)
    if success == false then
        errorFunc()
        return
    end

    G_UserData:getStage():c2sResetStage(self._currStageCfgInfo.id)    
end

function PopupItemGuider:updateUI(itemType, itemValue)
	self._itemType = itemType
	self._itemValue = itemValue
end

function PopupItemGuider:_doSweep()
    local isOpen, desc = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SWEEP)
    if not isOpen then
        G_Prompt:showTip(desc)
        return
	end
	
    local bagFull = LogicCheckHelper.checkPackFullByAwards(self._awardsList)
    if bagFull then
        return
	end
	
    local star = self._currStageData:getStar()
    if star ~= 3 then
        G_Prompt:showTip(Lang.get("sweep_enable"))
        return
	end
	
    local needVit = self._currStageCfgInfo.cost * self._sweepCount
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit)
    if success then
        G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_PAUSE)
        G_UserData:getStage():c2sFastExecuteStage(self._currStageCfgInfo.id, self._sweepCount)   
    end

    return true
end

function PopupItemGuider:_getSweepCount()
	local executeCnt = self._currStageData:getExecute_count()   --已经打过的次数
	local sweepCount = self._currStageCfgInfo.challenge_num - executeCnt   --最大次数

	local sweepVit = sweepCount * self._currStageCfgInfo.cost
	local myVit = G_UserData:getBase():getResValue(DataConst.RES_VIT)
	local sweepVitEnough = true   --是否有进行一次扫荡的体力
	while myVit < sweepVit do
		sweepCount = sweepCount - 1
		sweepVit = sweepCount * self._currStageCfgInfo.cost
		if sweepCount <= 0 then
			sweepVitEnough = false
		end
	end

	if sweepCount > 10 then
		sweepCount = 10
	elseif sweepCount <= 0 and not sweepVitEnough then
		sweepCount = self._currStageCfgInfo.challenge_num - executeCnt
		if sweepCount > 10 then
			sweepCount = 10
		end
	elseif sweepCount <= 0 then
		sweepCount = 0
	end

	return sweepCount
end

function PopupItemGuider:_onItemTouch(index, i, cellData)
	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SUPER_SWEEP)

	if cellData.type == 1 and isOpen then
		self._currStageData = cellData.stageData
		self._currStageCfgInfo = cellData.stageCfgInfo
		
		local star = self._currStageData:getStar()

		if star == 3 then
			self._sweepCount = self:_getSweepCount()

			local awards = DropHelper.getStageDrop(self._currStageCfgInfo)
			self._awardsList = awards

			if self._sweepCount > 0 then
				self:_doSweep()
			else
				self:_doResetSweep()
			end
		else
			WayFuncDataHelper.gotoModule(cellData.cfg)
		end
	else
		WayFuncDataHelper.gotoModule(cellData.cfg)
	end
end



function PopupItemGuider:_onItemUpdate(item, index)
	local itemGuider = self._guiderList[ index + 1 ] 
	if itemGuider then
		item:updateUI(index, itemGuider )
	end
end

function PopupItemGuider:_onItemSelected(item, index)

end


function PopupItemGuider:_onInit()

end


function PopupItemGuider:onEnter()
    if self._itemType and self._itemValue then
		self:_refreshView()
	end

	self._signalFastExecute = G_SignalManager:add(SignalConst.EVENT_FAST_EXECUTE_STAGE, handler(self, self._onEventFastExecuteStage))
	self._signalSweepFinish = G_SignalManager:add(SignalConst.EVENT_SWEEP_FINISH, handler(self, self._onEventSweepFinish))
	self._signalReset = G_SignalManager:add(SignalConst.EVENT_RESET_STAGE, handler(self, self._onEventReset))
end

function PopupItemGuider:onExit()
	self._signalFastExecute:remove()
	self._signalFastExecute = nil
	self._signalReset:remove()
	self._signalReset = nil
	self._signalSweepFinish:remove()
    self._signalSweepFinish = nil
end


--重置副本
function PopupItemGuider:_onEventReset()
    --self:_refreshStageDetail()
	self:_refreshPopupSweep(true)
	
	self._listItemSource:resize(#self._guiderList)
end

--更新扫荡界面
function PopupItemGuider:_refreshPopupSweep(isReset)
    local callback = nil
	local btnString = ""

	self._sweepCount = self:_getSweepCount()   --最大次数

    if self._sweepCount == 0 then
        callback = handler(self, self._doResetSweep)
        btnString = Lang.get("stage_reset_word")
    else
        callback = handler(self, self._doSweep)
        btnString = Lang.get("stage_fight_ten", {count = self._sweepCount})
    end

    if not isReset and not self._popupSweep then
        self._popupSweep = require("app.scene.view.stage.PopupSweep").new(callback)
        self._popupSweepSignal = self._popupSweep.signal:add(handler(self, self._onSweepClose))
        self._popupSweep:openWithAction()
    elseif self._popupSweep then
        self._popupSweep:setCallback(callback)
    end
    if self._popupSweep then
        self._popupSweep:setBtnResetString(btnString)
    end
end

--sweep关闭信号处理
function PopupItemGuider:_onSweepClose(event)
    if event == "close" then
        self._popupSweep = nil
        self:_clearSignal()
    end
end

function PopupItemGuider:_clearSignal()
    if self._popupSweepSignal then
        self._popupSweepSignal:remove()
        self._popupSweepSignal = nil
    end
end

--扫荡信息
function PopupItemGuider:_onEventFastExecuteStage(eventName, results)
	--self:_refreshStageDetail()
    self:_refreshPopupSweep()
    self._popupSweep:updateReward(results, self._awardsList) 
	self._popupSweep:start()
	
	self._listItemSource:resize(#self._guiderList)
end

--扫荡结束
function PopupItemGuider:_onEventSweepFinish(eventName)
    self:checkRebelArmy()
end

function PopupItemGuider:checkRebelArmy()
    local rebel = G_UserData:getStage():getNewRebel()
    if rebel then
        local popupSiegeCome = require("app.scene.view.stage.PopupSiegeCome").new(rebel)
        popupSiegeCome:open()   
        G_UserData:getStage():resetRebel()
    end

end

--
function PopupItemGuider:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._buyItemId)
	end
	if not isBreak then
		self:close()
	end
end


function PopupItemGuider:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

return PopupItemGuider