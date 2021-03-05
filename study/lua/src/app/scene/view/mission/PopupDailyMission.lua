--弹出界面
--日常任务系统，将来可能会有成就界面

local PopupBase = require("app.ui.PopupBase")
local PopupDailyMission = class("PopupDailyMission", PopupBase)
local Path = require("app.utils.Path")

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local PopupDailyMissionCell = require("app.scene.view.mission.PopupDailyMissionCell")
local DailyMissionActiviyValue = require("app.scene.view.mission.DailyMissionActiviyValue")

--等服务器回包后，创建对话框并弹出UI
function PopupDailyMission:waitEnterMsg(callBack)

	local function onMsgCallBack(id,message)
		if type(message) ~= "table" then return end
		callBack()
	end

	local msgReg = G_SignalManager:add(SignalConst.EVENT_DAILY_TASK_INFO, onMsgCallBack)
	G_UserData:getDailyMission():c2sGetDailyTaskInfo()
	return msgReg
end


function PopupDailyMission:ctor(title, callback )
	--
	self._title = title or Lang.get("common_title_daily_mission")
	self._callback = callback
	self._nodeActivity = nil
	local resource = {
		file = Path.getCSB("PopupDailyMission", "mission"),
		binding = {

		}
	}
	PopupDailyMission.super.ctor(self, resource, true)
end

--
function PopupDailyMission:onCreate()
	self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
	self._commonNodeBk:setTitle(self._title)

	local listView = self._listView
	listView:setTemplate(PopupDailyMissionCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))


	local tempValue = DailyMissionActiviyValue.new()
	self._nodeActivity:addChild(tempValue)
	self._dailyMissionActiviyValue = tempValue
end

function PopupDailyMission:_getItemList()
	return {}
end


function PopupDailyMission:_onItemTouch(index, missonId)
	local itemIndex = itemPos
	G_UserData:getDailyMission():c2sGetDailyTaskAward(missonId)
end

function PopupDailyMission:_onItemUpdate(item, index)
	local startIndex = index * 2 + 1
	logWarn("PopupDailyMission:_onItemUpdate  "..startIndex)
	local endIndex = startIndex + 2
	local itemLine = {}

	local itemList = self._dataList

	if #itemList > 0 then
		for i = startIndex, endIndex do
			local itemData = itemList[i]
			if itemData then
				table.insert(itemLine, itemData)
			end
		end
		item:updateUI(index,itemLine)
	end

end


function PopupDailyMission:_onItemSelected()

end


function PopupDailyMission:_onInit()

end

function PopupDailyMission:onEnter()
	self._getDailyReward = G_SignalManager:add(SignalConst.EVENT_DAILY_TASK_AWARD, handler(self, self._onEventGetDailyTaskReward))
	self._updateDailyInfo = G_SignalManager:add(SignalConst.EVENT_DAILY_TASK_INFO, handler(self, self._onEventUpdateDailyInfoFunc))
	self._updateDailyMission = G_SignalManager:add(
									SignalConst.EVENT_DAILY_TASK_UPDATE,
									handler(self, self._onEventDailyTaskUpdate))

	logWarn("PopupDailyMission:onEnter")
	self:_onEventUpdateDailyInfoFunc()

	--判断是否过期
    if G_UserData:getDailyMission():isExpired() == true then
        G_UserData:getDailyMission():c2sGetDailyTaskInfo()
    end
end

function PopupDailyMission:_onEventUpdateDailyInfoFunc()
	self._dataList = G_UserData:getDailyMission():getDailyMissionDatas(false)
	self:_updateListView()
	self._dailyMissionActiviyValue:updateUI()
end

function PopupDailyMission:_onEventDailyTaskUpdate()
	logWarn("PopupDailyMission:_onEventDailyTaskUpdate")
	self:_onEventUpdateDailyInfoFunc()
end

function PopupDailyMission:onExit()
	logWarn("PopupDailyMission:onExit")

	self._getDailyReward:remove()
	self._getDailyReward = nil
	self._updateDailyInfo:remove()
	self._updateDailyInfo = nil

	self._updateDailyMission:remove()
	self._updateDailyMission = nil
end

function PopupDailyMission:_onEventGetDailyTaskReward(id, message)

	local awards = rawget(message, "awards") or {}
	-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
	--PopupGetRewards:showRewards(awards)
	 G_Prompt:showAwards(awards)
	self:_onEventUpdateDailyInfoFunc()

end



function PopupDailyMission:_updateListView()
	local listView = self._listView
	local itemList = self._dataList
	local lineCount = math.ceil( #itemList / 2 )

	listView:resize(lineCount)
end

function PopupDailyMission:onBtnOk()
	local isBreak
	if self._callback then
		isBreak = self._callback(self._buyItemId)
	end

	if not isBreak then
		self:close()
	end
end


function PopupDailyMission:onBtnCancel()
	if not isBreak then
		self:close()
	end
end

return PopupDailyMission
