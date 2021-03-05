--
-- Author: Liangxu
-- Date: 2017-06-22 16:36:39
-- 军团大厅日志
local ViewBase = require("app.ui.ViewBase")
local GuildLogNode = class("GuildLogNode", ViewBase)
local UserDataHelper = require("app.utils.UserDataHelper")

local LINE_WIDTH = 860 --行宽
local RICH_TEXT_MAX_WIDTH = 775--富文本的最大宽度
local LAST_ITEM_DOWN_BLANK_HEIGHT,ITEM_DOWN_BLANK_HEIGHT = 25 , 15--最后一条记录下方空白25，其他15
local HOUR_TEXT_X,RICH_TEXT_X = 43, 150--时间文本X坐标，富文本的X坐标
local FIRST_ITEM_UP_BLANK_HEIGHT = 9--每天第一行记录，上方留白9像素

function GuildLogNode:ctor()
	local resource = {
		file = Path.getCSB("GuildLogNode", "guild"),
		binding = {
		}
	}
	GuildLogNode.super.ctor(self, resource)
end

function GuildLogNode:onCreate()
end

function GuildLogNode:onEnter()
	self._signalGuildGetSystemNotify = G_SignalManager:add(SignalConst.EVENT_GUILD_GET_SYSTEM_NOTIFY, handler(self, self._onEventGuildGetSystemNotify))
end

function GuildLogNode:onExit()
	self._signalGuildGetSystemNotify:remove()
	self._signalGuildGetSystemNotify = nil
end

function GuildLogNode:updateView()
	G_UserData:getGuild():c2sGetGuildSystemNotify()
end

function GuildLogNode:_onEventGuildGetSystemNotify(event)
	if not G_UserData:getGuild():isInGuild() then
		return
	end
	self:_updateInfo()
end

function GuildLogNode:_updateInfo()
	self._listView:removeAllChildren()
	local notifyDatas = G_UserData:getGuild():getSystemNotifyData()
	local datas = UserDataHelper.formatNotify(notifyDatas)
	for k, info in ipairs(datas) do
		local msgNumCurrDay = #info
		if msgNumCurrDay >= 1 then
			local timeWidget = self:_createDateWidget(info[1].date)
			self._listView:pushBackCustomItem(timeWidget)
		end
		for i, unit in ipairs(info) do
			local contentWidget = self:_createContentWidget(i,msgNumCurrDay,unit.time, unit.text)
			self._listView:pushBackCustomItem(contentWidget)
		end
	end
end

function GuildLogNode:_createDateWidget(time)
	local widget = ccui.Widget:create()
	local CSHelper = require("yoka.utils.CSHelper")
	local resourceNode = CSHelper.loadResourceNode(Path.getCSB("GuildLogTimeTitle", "guild"))
	resourceNode:updateLabel("Text",{text = time})
	local size = resourceNode:getContentSize()
	widget:addChild(resourceNode)
	widget:setContentSize(size)
	return widget
end

function GuildLogNode:_createContentWidget(index,msgNum,time,richElementList)
	local widget = ccui.Widget:create()
	local labelTime = cc.Label:createWithTTF(
		Lang.get("guild_log_hour_minute_second_time",{value = time}), Path.getCommonFont(), 20)
	labelTime:setColor(Colors.BRIGHT_BG_TWO)		
	labelTime:setAnchorPoint(cc.p(0, 1.0))

	local labelText = ccui.RichText:createWithContent(json.encode(richElementList))
    labelText:setWrapMode(1)
    labelText:setAnchorPoint(cc.p(0,1))
    labelText:setCascadeOpacityEnabled(true)
    labelText:ignoreContentAdaptWithSize(false)
    labelText:setContentSize(cc.size(RICH_TEXT_MAX_WIDTH,0))--高度设置成0则高度自适应
    labelText:formatText()
    local size = labelText:getVirtualRendererSize()

	local height = size.height + ( index >= msgNum and LAST_ITEM_DOWN_BLANK_HEIGHT or ITEM_DOWN_BLANK_HEIGHT)--最后一条记录下方空白25，其他15
	labelTime:setPosition(cc.p(HOUR_TEXT_X, height))
	labelText:setPosition(cc.p(RICH_TEXT_X, height))
	
	widget:addChild(labelTime)
	widget:addChild(labelText)

	if index == 1 then
		height = height + FIRST_ITEM_UP_BLANK_HEIGHT--每天第一行记录，上方留白9像素
	end

	widget:setContentSize(cc.size(LINE_WIDTH, height))


	return widget
end



return GuildLogNode