--世界boss
local PopupBase = require("app.ui.PopupBase")
local PopupWorldBossRob = class("PopupWorldBossRob", PopupBase)

local WorldBossConst = require("app.const.WorldBossConst")
local TextHelper = require("app.utils.TextHelper")
local PopupWorldBossRobCell = import(".PopupWorldBossRobCell")
local WorldBossHelper = import(".WorldBossHelper")

function PopupWorldBossRob:waitEnterMsg(callBack)
	local function onMsgCallBack(id, grabList)
        dump(grabList)
        self._dataList = grabList or {}
		self._needRequest = false
		callBack()
	end
	G_UserData:getWorldBoss():c2sGetWorldBossGrabList()
    local signal = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_GET_GRAB_LIST, onMsgCallBack)
	return signal
end

function PopupWorldBossRob:ctor()
    --
	self._title = Lang.get("worldboss_rob_title")
	--左边控件

    local resource = {
        file = Path.getCSB("PopupWorldBossRob", "worldBoss"),
        binding = {
            
		}
    }
    PopupWorldBossRob.super.ctor(self, resource)
end


function PopupWorldBossRob:onCreate()
    self._commonNodeBk:setTitle(self._title)
    self._commonNodeBk:addCloseEventListener(handler(self, self.onBtnCancel))
end


function PopupWorldBossRob:onEnter()
	self._signalGrabList = G_SignalManager:add(SignalConst.EVENT_WORLDBOSS_GET_GRAB_LIST, handler(self,self._onEventGrabList))

	if self._needRequest then
		G_UserData:getWorldBoss():c2sGetWorldBossGrabList()
	else
		self:_updateListView()	
	end
    
end

function PopupWorldBossRob:onExit()
	self._signalGrabList:remove()
	self._signalGrabList = nil
end

function PopupWorldBossRob:_onEventGrabList(id, grabList)
	self._dataList = grabList or {}

	self:_updateListView()
end
--
function PopupWorldBossRob:onBtnCancel()
	self:close()
end

function PopupWorldBossRob:_updateListView()
	local lineCount = #self._dataList

	if lineCount > 0 and self._listViewItem then
	    local listView = self._listViewItem
		listView:setTemplate(PopupWorldBossRobCell)
		listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
		listView:setCustomCallback(handler(self, self._onItemTouch))
		listView:clearAll()
		listView:resize(lineCount)
	end
end

function PopupWorldBossRob:_onItemTouch(index, userId)
	
	if WorldBossHelper.checkUserFight() == false then
		return
	end

	local isOpen = G_UserData:getWorldBoss():isBossStart()

	if isOpen == true then
		G_UserData:getWorldBoss():c2sGrabWorldBossPoint(userId)
		self._needRequest = true
		self:close()
	end

	--G_NetworkManager:send(MessageIDConst.ID_C2S_GetBattleReport, {id = reportId})
end



function PopupWorldBossRob:_onItemUpdate(item, index)
	if #self._dataList > 0 then
		if self._dataList[ index + 1 ] ~=nil then
			item:updateUI(index, self._dataList[ index + 1 ] )
		end
	end
end

function PopupWorldBossRob:_onItemSelected(item, index)

end

return PopupWorldBossRob
