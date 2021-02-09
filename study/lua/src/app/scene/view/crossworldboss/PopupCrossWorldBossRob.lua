--跨服军团boss掠夺
local PopupBase = require("app.ui.PopupBase")
local PopupCrossWorldBossRob = class("PopupCrossWorldBossRob", PopupBase)

local CrossWorldBossConst = require("app.const.CrossWorldBossConst")
local TextHelper = require("app.utils.TextHelper")
local PopupCrossWorldBossRobCell = import(".PopupCrossWorldBossRobCell")
local CrossWorldBossHelper = import(".CrossWorldBossHelper")

function PopupCrossWorldBossRob:waitEnterMsg(callBack)
	local function onMsgCallBack(id, grabList)
        dump(grabList)
        self._dataList = grabList or {}
		self._needRequest = false
		callBack()
	end
	G_UserData:getCrossWorldBoss():c2sGetCrossWorldBossGrabList()
    local signal = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_LIST, onMsgCallBack)
	return signal
end

function PopupCrossWorldBossRob:ctor()
    --
	self._title = Lang.get("worldboss_rob_title")
	--左边控件

    local resource = {
        file = Path.getCSB("PopupCrossWorldBossRob", "crossworldboss"),
        binding = {
            
		}
    }
    PopupCrossWorldBossRob.super.ctor(self, resource)
end


function PopupCrossWorldBossRob:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
end


function PopupCrossWorldBossRob:onEnter()
	self._signalGrabList = G_SignalManager:add(SignalConst.EVENT_CROSS_WORLDBOSS_GET_GRAB_LIST, handler(self,self._onEventGrabList))

	if self._needRequest then
		G_UserData:getCrossWorldBoss():c2sGetCrossWorldBossGrabList()
	else
		self:_updateListView()	
	end
    
end

function PopupCrossWorldBossRob:onExit()
	self._signalGrabList:remove()
	self._signalGrabList = nil
end

function PopupCrossWorldBossRob:_onEventGrabList(id, grabList)
	self._dataList = grabList or {}

	self:_updateListView()
end
--
function PopupCrossWorldBossRob:onBtnCancel()
	self:close()
end

function PopupCrossWorldBossRob:_updateListView()
	local lineCount = #self._dataList

	if lineCount > 0 and self._listViewItem then
	    local listView = self._listViewItem
		listView:setTemplate(PopupCrossWorldBossRobCell)
		listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:clearAll()
		listView:resize(lineCount)
	end
end

function PopupCrossWorldBossRob:_onItemTouch(index, userId, usersid)
	
	if CrossWorldBossHelper.checkUserFight() == false then
		return
	end

	local isOpen = G_UserData:getCrossWorldBoss():isBossStart()

	if isOpen == true then
		G_UserData:getCrossWorldBoss():c2sGrabCrossWorldBossPoint(userId, usersid)
		self._needRequest = true
		self:close()
	end

	--G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {id = reportId})
end



function PopupCrossWorldBossRob:_onItemUpdate(item, index)
	if #self._dataList > 0 then
		if self._dataList[ index + 1 ] ~=nil then
			item:updateUI(index, self._dataList[ index + 1 ] )
		end
	end
end

function PopupCrossWorldBossRob:_onItemSelected(item, index)

end

return PopupCrossWorldBossRob
