-- @Author  panhoa
-- @Date  8.15.2019
-- @Role 

local PopupBase = require("app.ui.PopupBase")
local PopupSupportView = class("PopupSupportView", PopupBase)
local TabScrollView = require("app.utils.TabScrollView")
local SupportItem = import(".SupportItem")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


function PopupSupportView:waitEnterMsg(callBack, closeCallback)
	local function onMsgCallBack(id, message)
        self._supportData = rawget(message, "insps") or {}
        self._supportedId = rawget(message, "guild_id") or 0
		callBack()
    end
    
    self._supportedId   = 0
    self._supportData 	= {}
    self._closeCallback = closeCallback
	G_UserData:getGuildCrossWar():c2sBrawlGuildInspInfo()
	local signal = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsGuildInspInfo, onMsgCallBack)
	return signal
end

function PopupSupportView:ctor()
    self._scrollView    = nil
    self._rankView      = nil

	local resource = {
		file = Path.getCSB("PopupSupportView", "guildCrossWarGuess"),
	}
	PopupSupportView.super.ctor(self, resource, false, false)
end

function PopupSupportView:onCreate()
    self._dropListView = ccui.Helper:seekNodeByName(self._imgDrop, "DropAwardsListview")
    cc.bind(self._dropListView, "CommonListViewLineItem")

	self._commonBk:setTitle(Lang.get("guild_cross_war_support2"))
	self._commonBk:addCloseEventListener(handler(self, self._onBtnClose))
    self:_initScrollView()
end

function PopupSupportView:onEnter()
    self._msgBrawlGuildInsp = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsGuildInsp, handler(self, self._s2cBrawlGuildInsp))              -- 个人鼓舞
    self._msgBrawlGuildInspInfo = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsGuildInspInfo, handler(self, self._s2cBrawlGuildInspInfo))  -- 个人鼓舞

    self:_updateDesc()
    self:_updateDropItems()
    self:_updateScrollView()
end

function PopupSupportView:onExit()
    self._msgBrawlGuildInsp:remove()
    self._msgBrawlGuildInsp = nil
    self._msgBrawlGuildInspInfo:remove()
    self._msgBrawlGuildInspInfo = nil
end

function PopupSupportView:_onBtnClose()
    if self._closeCallback then
        self._closeCallback()
    end
	self:close()
end

function PopupSupportView:_s2cBrawlGuildInsp(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    if rawget(message, "guild_id") == nil or rawget(message, "sp_num") == nil  then
        return
    end

    G_UserData:getGuildCrossWar():c2sBrawlGuildInspInfo() 
end

function PopupSupportView:_s2cBrawlGuildInspInfo(id, message)
    if message.ret ~= MessageErrorConst.RET_OK then
		return
    end

    self._supportedId = rawget(message, "guild_id") or 0
    self._supportData = rawget(message, "insps") or {}
    self:_updateScrollView()
end

function PopupSupportView:_initScrollView()
	local scrollViewParam = {}
	scrollViewParam.template = SupportItem
	scrollViewParam.updateFunc = handler(self, self._onCellUpdate)
	scrollViewParam.selectFunc = handler(self, self._onCellSelected)
	scrollViewParam.touchFunc = handler(self, self._onCellTouch)
	self._rankView = TabScrollView.new(self._listView, scrollViewParam, 1)
end

function PopupSupportView:_updateScrollView()
	if not self._supportData or table.nums(self._supportData) <= 0 then
		return
    end
    
    table.sort(self._supportData, function(data1, data2)
        if data1.power > data2.power then
            return data1
        end
    end)

    self._listView:clearAll()
	self._listView:resize(table.nums(self._supportData))
end

function PopupSupportView:_onCellUpdate(item, itemIdex)
    if not self._supportData then
		return
    end
    
    if self._supportData[itemIdex + 1] then
        item:updateUI(self._supportData[itemIdex + 1], self._supportedId > 0, self._supportedId)
    end
end

function PopupSupportView:_onCellSelected(item, index)
end

function PopupSupportView:_onCellTouch(index, data)
	if data == nil then return end
end

function PopupSupportView:_updateDropItems( ... )
    local items = GuildCrossWarHelper.getSupportDropItems()
    if table.nums(items) <= 0 then
        return
    end

    self._dropListView:setMaxItemSize(4)
    self._dropListView:setListViewSize(500,120)
    self._dropListView:setItemsMargin(1)
    self._dropListView:updateUI(items, 1)
end

function PopupSupportView:_updateDesc( ... )
    local _, bJonin = GuildCrossWarHelper.isGuildCrossWarEntry()
    self._dropListView:setVisible(not bJonin)
    if bJonin then
        self._txtDesc:setString(Lang.get("guild_cross_war_unsupport_desc"))
        self._txtDesc:setPositionX(472)
    else
        self._txtDesc:setString(Lang.get("guild_cross_war_support_desc"))
        self._txtDesc:setPositionX(305)
    end
end


return PopupSupportView