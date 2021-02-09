
-- Author: nieming
-- Date:2017-12-26 17:07:52
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local FriendEnergyList = class("FriendEnergyList", ViewBase)
local FriendConst = require("app.const.FriendConst")
local DataConst = require("app.const.DataConst")
local UserCheck = require("app.utils.logic.UserCheck")
function FriendEnergyList:ctor()

	--csb bind var name
	self._btnGetAll = nil  --CommonButtonHighLight
	self._listView = nil  --ScrollView

	local resource = {
		file = Path.getCSB("FriendEnergyList", "friend"),
		binding = {
			_btnGetAll = {
				events = {{event = "touch", method = "_onBtnGetAll"}}
			},
		},
	}
	FriendEnergyList.super.ctor(self, resource)
end

-- Describle：
function FriendEnergyList:onCreate()
	self:_initListView()
	self._btnGetAll:setString(Lang.get("lang_friend_btn_one_key_get"))
	local Parameter = require("app.config.parameter")
	self._maxNum = tonumber(Parameter.get(128).content) or 0
end

-- Describle：
function FriendEnergyList:onEnter()

end

-- Describle：
function FriendEnergyList:onExit()

end
-- Describle：
function FriendEnergyList:_onBtnGetAll()
	-- body

	if self._data and #self._data > 0 then
		if self._curNum >= self._maxNum then
			G_Prompt:showTip(Lang.get("lang_friend_today_get_energy_full"))
			return
		end
		if UserCheck.isResReachMaxLimit(DataConst.RES_SPIRIT) then
			G_Prompt:showTip(Lang.get("lang_friend_energy_full_tip"))
			return
		end
		G_UserData:getFriend():c2sGetFriendPresent(0)
	else
		G_Prompt:showTip(Lang.get("lang_friend_empty_energy_tip"))
	end
end
function FriendEnergyList:_initListView()
	-- body
	local FriendListViewCell = require("app.scene.view.friend.FriendListViewCell")
	self._listView:setTemplate(FriendListViewCell)
	self._listView:setCallback(handler(self, self._onListViewItemUpdate), handler(self, self._onListViewItemSelected))
	self._listView:setCustomCallback(handler(self, self._onListViewItemTouch))

	-- self._listView:resize()
end

-- Describle：
function FriendEnergyList:_onListViewItemUpdate(item, index)
	if self._data then
		local itemData = self._data[index +1]
		item:updateUI(itemData, FriendConst.FRIEND_ENERGY, index + 1)
	end
	-- item:updateUI()
end

-- Describle：
function FriendEnergyList:_onListViewItemSelected(item, index)

end

-- Describle：
function FriendEnergyList:_onListViewItemTouch(index, data)
	if UserCheck.isResReachMaxLimit(DataConst.RES_SPIRIT) then
		G_Prompt:showTip(Lang.get("lang_friend_energy_full_tip"))
		return
	end
	if self._curNum >= self._maxNum then
		G_Prompt:showTip(Lang.get("lang_friend_today_get_energy_full"))
		return
	end
	if data then
		G_UserData:getFriend():c2sGetFriendPresent(data:getId())
	end
end

function FriendEnergyList:updateView(data, num)
	if not data then
		data = {}
	end
	self._data = data
	self._curNum = num
	self._listView:resize(#data)
	self._num:setString(string.format("%s/%s", num or 0, self._maxNum))
end


return FriendEnergyList
