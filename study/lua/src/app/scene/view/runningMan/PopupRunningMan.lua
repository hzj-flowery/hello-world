
-- Author: hedili
-- Date:2018-04-19 14:10:08
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupRunningMan = class("PopupRunningMan", PopupBase)
local PopupRunningManCell = import(".PopupRunningManCell")
local RunningManConst = require("app.const.RunningManConst")
local RunningManHelp = require("app.scene.view.runningMan.RunningManHelp")
function PopupRunningMan:ctor()

	--csb bind var name
	self._commonBk = nil  --CommonNormalSmallPop
	self._listItemSource = nil  --ScrollView
	self._nodeEmpty = nil  --CommonEmptyTipNode
	self._panelBase = nil  --Panel
	self._titleBG = nil  --ImageView

	local resource = {
		file = Path.getCSB("PopupRunningMan", "runningMan"),

	}
	PopupRunningMan.super.ctor(self, resource)
end

-- Describle：
function PopupRunningMan:onCreate()
	self._commonBk:setTitle(Lang.get("runningman_popup_dlg_title"))
	self:_initListItemSource()
	self._commonBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._listItemSource:setTouchEnabled(false)
end

-- Describle：
function PopupRunningMan:onEnter()
	self._signalPlayHorseBetSuccess = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_BET_SUCCESS, handler(self, self._onEventPlayHorseBetSuccess))

	self._signalPlayHorseBetNotice = G_SignalManager:add(SignalConst.EVENT_PLAY_HORSE_BET_NOTICE, handler(self, self._onEventPlayHorseBetSuccess))
end

-- Describle：
function PopupRunningMan:onExit()
	self._signalPlayHorseBetSuccess:remove()
	self._signalPlayHorseBetSuccess = nil
	self._signalPlayHorseBetNotice:remove()
	self._signalPlayHorseBetNotice = nil
end

function PopupRunningMan:onBtnCancel()
	self:close()
end

function PopupRunningMan:_onEventPlayHorseBetSuccess( id, message )
	-- body
	self._dataList = G_UserData:getRunningMan():getBet_info()
	self._listItemSource:resize(#self._dataList)
	self._listItemSource:setTouchEnabled(false)
end


function PopupRunningMan:_initListItemSource()
	-- body
	self._listItemSource:setTemplate(PopupRunningManCell)
	self._listItemSource:setCallback(handler(self, self._onListItemSourceItemUpdate), handler(self, self._onListItemSourceItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onListItemSourceItemTouch))

	
	
	self._dataList = G_UserData:getRunningMan():getBet_info()
	if self._dataList then
		self._listItemSource:resize(#self._dataList)
		self._nodeEmpty:setVisible(false)
	end
	self._listItemSource:setTouchEnabled(false)
end

-- Describle：
function PopupRunningMan:_onListItemSourceItemUpdate(item, index)
	 local data = self._dataList[index+1]

	 if data then
		item:updateUI(data, index+1)
	 end
	 
end

-- Describle：
function PopupRunningMan:_onListItemSourceItemSelected(item, index)

end


-- Describle：
function PopupRunningMan:_onListItemSourceItemTouch(index, params)
	dump(params)
	local UserDataHelper = require("app.utils.UserDataHelper")
	local currState = RunningManHelp.getRunningState()
	local costValue = G_UserData:getRunningMan():getRunningCostValue()
	local heroId = params.heroId

	local betNum = G_UserData:getRunningMan():getHeroBetNum(heroId)
	local function callBackFunction( itemId, selectNum )
		local itemNum = UserDataHelper.getNumByTypeAndValue(costValue.type, costValue.value)
		if selectNum > 0 and selectNum <= itemNum then
			G_UserData:getRunningMan():c2sPlayHorseBet(params.heroId, selectNum)
		end
	end

	if currState == RunningManConst.RUNNING_STATE_BET then
		if params and params.heroId then
			--local UserCheck = require("app.utils.logic.UserCheck")
			local itemNum = UserDataHelper.getNumByTypeAndValue(costValue.type, costValue.value)
			if itemNum == 0 then
				local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
				PopupItemGuider:updateUI(costValue.type,costValue.value)
				PopupItemGuider:openWithAction()
				return
			end

			local limitTotal = costValue.limitMax
			--检测神树buff
			local isHomelandBuff = false --神树buff是否生效
			local HomelandHelp = require("app.scene.view.homeland.HomelandHelp")
			local HomelandConst = require("app.const.HomelandConst")
			local buffBaseId = HomelandConst.getBuffBaseId(costValue.type, costValue.value)
			if buffBaseId then
				local isCanUse, buffData = HomelandHelp.checkBuffIsCanUse(buffBaseId)
				if isCanUse then
					local info = buffData:getConfig()
					local value = HomelandHelp.getValueOfBuff(info.value, info.equation)
					limitTotal = value
					isHomelandBuff = true
				end
			end
			local limitMax = limitTotal - betNum
			local maxNum = itemNum
			if itemNum > limitMax then
				maxNum = limitMax
			end
			
			if maxNum == 0 then
				G_Prompt:showTip(Lang.get("runningman_running_man_no2"))
				return
			end
			
			local tipString = ""
			if isHomelandBuff == false then
				tipString = Lang.get("runningman_dlg_tips", {num = maxNum})
				if betNum == 0 then--没压过时， 显示文字特殊处理
					tipString = Lang.get("runningman_dlg_tips_one", {num= maxNum})
				end
			else
				tipString = Lang.get("homeland_buff_tips_des_3", {num = maxNum})
				if betNum == 0 then--没压过时， 显示文字特殊处理
					tipString = Lang.get("homeland_buff_tips_des_2", {num= maxNum})
				end
			end
			

			local PopupItemUse = require("app.ui.PopupItemUse").new(Lang.get("runningman_dlg_title"),callBackFunction)
			PopupItemUse:updateUI(costValue.type, costValue.value)
			PopupItemUse:setMaxLimit(maxNum)
			PopupItemUse:setTextTips(tipString)
			PopupItemUse:setOwnerCount(itemNum)
			PopupItemUse:openWithAction()
		end
	else--非投注阶段，刷新页面
		self._dataList = G_UserData:getRunningMan():getBet_info()
		self._listItemSource:resize(#self._dataList)
		self._listItemSource:setTouchEnabled(false)
		G_Prompt:showTip(Lang.get("runningman_tip2"))
	end
end




return PopupRunningMan