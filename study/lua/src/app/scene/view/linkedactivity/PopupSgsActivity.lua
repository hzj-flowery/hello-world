
-- Author: �û�����
-- Date:2018-11-05 15:39:18
-- Describle：

local PopupBase = require("app.ui.PopupBase")
local PopupSgsActivity = class("PopupSgsActivity", PopupBase)
local SgsActivityItemNode = require("app.scene.view.linkedactivity.SgsActivityItemNode")

function PopupSgsActivity:ctor()

	--csb bind var name
	self._btnClose = nil  --Button
	self._lable0 = nil  --Text
	self._lable1 = nil  --Text
	self._lable2 = nil  --Text
	self._listItemSource = nil  --ScrollView
	self._listData = {}
	local resource = {
		file = Path.getCSB("PopupSgsActivity", "linkedactivity"),
		binding = {
			_btnClose = {
				events = {{event = "touch", method = "_onBtnClose"}}
			},
		},
	}
	PopupSgsActivity.super.ctor(self, resource)
end

-- Describle：
function PopupSgsActivity:onCreate()
	self:_initListItemSource()
end

-- Describle：
function PopupSgsActivity:onEnter()
	
	 G_UserData:getLinkageActivity():c2sGetCombineTaskStatus()

	self:_updateList()
	self._signalLinkageActivityTaskSyn = G_SignalManager:add(SignalConst.EVENT_LINKAGE_ACTIVITY_TASK_SYN, handler(self, self._onEventLinkageActivityTaskSyn))
end

-- Describle：
function PopupSgsActivity:onExit()
	self._signalLinkageActivityTaskSyn:remove()
	self._signalLinkageActivityTaskSyn = nil
end
-- Describle：
function PopupSgsActivity:_onBtnClose()
	self:close()
	-- body
end
function PopupSgsActivity:_initListItemSource()
	-- body
	self._listItemSource:setTemplate(SgsActivityItemNode)
	self._listItemSource:setCallback(handler(self, self._onListItemSourceItemUpdate), handler(self, self._onListItemSourceItemSelected))
	self._listItemSource:setCustomCallback(handler(self, self._onListItemSourceItemTouch))

	-- self._listItemSource:resize()
end

function PopupSgsActivity:_onEventLinkageActivityTaskSyn(event)
	self:_updateList()
end

-- Describle：
function PopupSgsActivity:_onListItemSourceItemUpdate(item, index)
	logWarn("PopupSgsActivity "..tostring(index))
	local itemData = self._listData[ index + 1 ]
	if itemData then
		item:updateUI(itemData)
	end
end

-- Describle：
function PopupSgsActivity:_onListItemSourceItemSelected(item, index)

end

-- Describle：
function PopupSgsActivity:_onListItemSourceItemTouch(index, params)

end

function PopupSgsActivity:_getList()
	local list = {}
	local SgsLinkage = require("app.config.sgs_linkage")
	for i = 1,SgsLinkage.length(),1 do
		local config = SgsLinkage.indexOf(i)
		table.insert(list,config)
	end
	return list
end

function PopupSgsActivity:_updateList()
	local listData = self:_getList() 
	self._listData = listData
	self._listItemSource:resize(#listData)

end


return PopupSgsActivity
