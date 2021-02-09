local PopupBase = require("app.ui.PopupBase")
local PopupServerList = class("PopupServerList", PopupBase)
local Path = require("app.utils.Path")
local PopupServerListCell = require("app.scene.view.login.PopupServerListCell")
local ServerListDataHelper = require("app.scene.view.login.ServerListDataHelper")

local ExploreConst = require("app.const.ExploreConst")

local CUSTOM_COLOR = {
	[1] = {cc.c3b(0xd7, 0xef, 0xff)},
	[2] = {cc.c3b(0xff, 0xf9, 0xeb)},
	[3] = {cc.c3b(0xff, 0xf9, 0xeb)}
}

--等服务器回包后，创建对话框并弹出UI
function PopupServerList:waitEnterMsg(callBack)
	local function onMsgCallBack()
		G_WaitingMask:showWaiting(false)
		callBack()
	end

	local msgReg = nil
	if G_RoleListManager:isCheckUpdate() then
		--G_WaitingMask:showWaiting(true)
		msgReg = G_RoleListManager.signal:add(onMsgCallBack) --要去拉列表，才注册事件
		G_RoleListManager:checkUpdateList()
		G_WaitingMask:showWaiting(true)
	else
		onMsgCallBack()
	end

	return msgReg
end

function PopupServerList:ctor(callback)
	self._callback = callback
	self._currSelectIndex = nil
	self._pageDataList = {}
	local resource = {
		file = Path.getCSB("PopupServerList", "login"),
		binding = {}
	}
	PopupServerList.super.ctor(self, resource)
end

function PopupServerList:onCreate()
	if cc.isRegister("CommonTabGroupScrollVertical") then
		cc.bind(self._tabGroup, "CommonTabGroupScrollVertical")
	end

	self._listView:setTemplate(PopupServerListCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))

	self._popupBG:setTitle(Lang.get("server_list_title"))
	self._popupBG:addCloseEventListener(
		function()
			self:closeWithAction()
		end
	)

	local pageDataList = {}
	local titles = {}

	if not G_ConfigManager:isServerListReIndex() then
		pageDataList, titles = ServerListDataHelper.getServerDataList()
	else
		pageDataList, titles = ServerListDataHelper.getServerDataListForGroup()
	end
	self._pageDataList = pageDataList

	self._tabGroup:setCustomColor(CUSTOM_COLOR)
	local param = {
		callback = handler(self, self._onTabSelect),
		brightTabItemCallback = handler(self,self._brightTabItem),
		textList = titles
	}
	self._tabGroup:recreateTabs(param)
	self._tabGroup:setTabIndex(1)
end

function PopupServerList:onEnter()
end

function PopupServerList:onExit()
end

function PopupServerList:_brightTabItem(tabItem,bright)
    local textWidget = tabItem.textWidget
    local normalImage = tabItem.normalImage
    local downImage =  tabItem.downImage
    normalImage:setVisible(not bright)
    downImage:setVisible(bright)
    textWidget:setColor(bright and  ExploreConst.TAB_LIGHT_COLOR or ExploreConst.TAB_NORMAL_COLOR)
end

function PopupServerList:_onTabSelect(index, sender)
	if self._currSelectIndex == index then
		return
	end
	self._currSelectIndex = index

	self._list = self._pageDataList[index]
	self._count = math.ceil(#self._list / 2)
	self._listView:resize(self._count)
end

function PopupServerList:_onItemUpdate(item, index)
	local index = index * 2
	item:update(self._list[index + 1], self._list[index + 2])
end

function PopupServerList:_onItemSelected(item, index)
end

function PopupServerList:_onItemTouch(index, t)
	local index = index * 2 + t
	local data = self._list[index]
	if data.server:isUnopen() then --未开启
		G_Prompt:showTip(Lang.get("login_select_server_unopen_tip", {time = data.server:getOpentimeStr2()}))
		return
	end
	
	if data.server:isBackserver() and (G_UserData:getBase():isCanEnterReturnServer(data.server) == false) then
		G_Prompt:showTip(Lang.get("login_select_server_return_wrong"))
		return
	end
	
	if self._callback then
		self._callback(data.server)
	end
	self:closeWithAction()
end

return PopupServerList
