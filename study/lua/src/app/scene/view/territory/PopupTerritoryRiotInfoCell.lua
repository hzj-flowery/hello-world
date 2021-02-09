
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupTerritoryRiotInfoCell = class("PopupTerritoryRiotInfoCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TerritoryHelper = require("app.scene.view.territory.TerritoryHelper")
local TerritoryConst = require("app.const.TerritoryConst")
function PopupTerritoryRiotInfoCell:ctor()
	self._btnGetAward 		= nil     --领取
	self._imageGetAward 	= nil 	  --已经领取
	self._textCondition 	= nil  	  --条件
	self._listViewItem 		= nil     --奖励列表
	self._commonIcon1		= nil	  --通用ICON1
	self._commonIcon2		= nil	  --通用ICON2
	self._commonIcon3		= nil	  --通用ICON3
	self._awardInfo			= nil
	-----------------------

	self._intervalTime = 1.1
	local resource = {
		file = Path.getCSB("PopupTerritoryRiotInfoCell", "territory"),
	}
	PopupTerritoryRiotInfoCell.super.ctor(self, resource)
end

function PopupTerritoryRiotInfoCell:onCreate()

	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self:scheduleUpdateWithPriorityLua(handler(self, self._updateTime),0)

	self._commonButton:addClickEventListenerEx(handler(self,self._onButtonClick))
end


--
--[[
	message TerritoryRiotInfo {
	 optional uint32 territory_id = 1;
	 optional TerritoryEvent event = 2;
}
message FriendTerritoryRiotInfo {
	optional uint64 user_id = 1;
	optional string uuid = 2;
	optional uint64 sid = 3;
	repeated TerritoryRiotInfo riots = 4;
}
]]

function PopupTerritoryRiotInfoCell:updateUI(index,cellValue)
	--self._imageGetAward:setVisible(false)
	--self._btnGetAward:setVisible(false)
	--self._textCondition:setVisible(false)

	self._riotInfo = cellValue

	self:_updateName()
	self:_updateReward()
	self:_updateTime(0)
end

function PopupTerritoryRiotInfoCell:_updateTime(dt)
	if self:isVisible() == false then
		return
	end

	self._intervalTime = self._intervalTime + dt
	if self._intervalTime >  1.0 and self._riotInfo then
		--logWarn("PopupTerritoryRiotInfoCell:_updateTime   ".. self:getTag())
		local riotEvent = self._riotInfo
		if riotEvent then
			local riotNeedTime = tonumber(TerritoryHelper.getTerritoryParameter("riot_continue_time"))
			local riotEndTime = riotEvent.time + riotNeedTime
			local riotString = G_ServerTime:getLeftSecondsString(riotEndTime)
			--超时，倒计时不显示
			if riotString == "-" then
				self._textCondition:setString(" ")
				return
			end
			local pendingStr = Lang.get("lang_territory_riot_cell_time")
			self._textCondition:setString(pendingStr.." "..riotString)
		end
		self._intervalTime = 0
	end

end

function PopupTerritoryRiotInfoCell:_updateName()
	local territoryId = self._riotInfo.territory_id
	local eventId 	  = self._riotInfo.info_id

	local territroyName = G_UserData:getTerritory():getTerritoryName(territoryId)
	local eventCfg = TerritoryHelper.getRiotInfo(eventId)
	local eventName =  eventCfg.riot_name

	self._textCondition:setVisible(true)
	self._textCityName:setString(territroyName.." : ")
	self._textRiotName:setString(eventName)
	TerritoryHelper.setTextBgByColor(self._textBg, eventCfg.riot_color)
	self._textCityName:setColor(Colors.getColor(eventCfg.riot_color))
	-- self._textCityName:enableOutline(Colors.getColorOutline(eventCfg.riot_color), 2)
	self._textRiotName:setColor(Colors.getColor(eventCfg.riot_color))
	-- self._textRiotName:enableOutline(Colors.getColorOutline(eventCfg.riot_color), 2)
	self._textRiotName:setPositionX(self._textCityName:getContentSize().width + 15)

	local stateIndex = TerritoryHelper.getRiotEventState(self._riotInfo)
	self._commonButton:setVisible(true)
	self:updateImageView("Image_text",  { visible = false })
	if stateIndex == 1 then
		self._commonButton:switchToHightLight()
	else
		self._commonButton:switchToNormal()
	end

	self._commonButton:setString(Lang.get("lang_territory_riot_state"..stateIndex))
	self._commonButton:setEnabled(true)

	if stateIndex == TerritoryConst.RIOT_TAKE or
		stateIndex == TerritoryConst.RIOT_TAKEN or
		stateIndex == TerritoryConst.RIOT_OVERTIME then
		self._textCondition:setVisible(false)
	end

	if stateIndex == TerritoryConst.RIOT_HELPED then
		self._commonButton:setEnabled(false)
	end
	if stateIndex == TerritoryConst.RIOT_TAKEN  then
		self._commonButton:setVisible(false)
		self:updateImageView("Image_text", { visible= true, texture= Path.getTextSignet("txt_yilingqu01") })
	end
	if stateIndex == TerritoryConst.RIOT_OVERTIME then
		self._commonButton:setVisible(false)
		self:updateImageView("Image_text", { visible= true, texture= Path.getTextSignet("txt_yichaoshi01") })
	end
end

function PopupTerritoryRiotInfoCell:_updateReward()
	local eventId 	  = self._riotInfo.info_id
	local eventCfg = TerritoryHelper.getRiotInfo(eventId)

	local awardList = {}
	for i=1, 5 do
		if eventCfg["reward_type"..i] > 0 then
			local award = {}
			award.type = eventCfg["reward_type"..i]
			award.value = eventCfg["reward_value"..i]
			award.size  = eventCfg["reward_size"..i]
			table.insert(awardList,award)
		end
		self["_commonIcon"..i]:setVisible(false)
	end

	self._listViewItem:updateUI(awardList)
	--[[
	for i, value in ipairs(awardList) do
		self["_commonIcon"..i]:setVisible(true)
		self["_commonIcon"..i]:initUI(value.type,value.value,value.size)
	end
	]]
end
function PopupTerritoryRiotInfoCell:_onButtonClick(sender)

	local stateIndex = TerritoryHelper.getRiotEventState(self._riotInfo)

	self:dispatchCustomCallback(stateIndex,self._riotInfo)
end


return PopupTerritoryRiotInfoCell
