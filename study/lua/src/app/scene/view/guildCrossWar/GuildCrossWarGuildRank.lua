-- @Author  panhoa
-- @Date  3.20.2019
-- @Role 
local ViewBase = require("app.ui.ViewBase")
local GuildCrossWarGuildRank = class("GuildCrossWarGuildRank", ViewBase)
local TabScrollView = require("app.utils.TabScrollView")
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local GuildCrossWarGuildRankCell = import(".GuildCrossWarGuildRankCell")
local TextHelper = require("app.utils.TextHelper")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")


function GuildCrossWarGuildRank:ctor()
    -- body
    self._scrollView  = nil
    self._tabListView = nil
    self._imageOwn    = nil
    self._imageOwnback= nil
    self._rankData    = {}
    self._isAutoArrow = true
    self._selectedTabIdx = 1
    
    local resource = {
        file = Path.getCSB("GuildCrossWarGuildRank", "guildCrossWar"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_panelTouch = {
                events = {{event = "touch", method = "_onButtonArrow"}}
            }
        }
    }
    GuildCrossWarGuildRank.super.ctor(self, resource)
end

function GuildCrossWarGuildRank:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)

    self:_initPosition()
    self:_initListView()
end

function GuildCrossWarGuildRank:onEnter()
    self._msgGuildCrossLadder         = G_NetworkManager:add(MessageIDConst.ID_S2C_BrawlGuildsLadder, handler(self, self._s2cBrawlGuildsLadder))               -- 军团排行
    self:_updateListView()
    self:_initShowState()
end

function GuildCrossWarGuildRank:onExit()
    self._msgGuildCrossLadder:remove()
    self._msgGuildCrossLadder = nil
end

function GuildCrossWarGuildRank:_initShowState( ... )
    local region = GuildCrossWarHelper.getCurActStage()
    if self._isAutoArrow and region.stage ~= 3 then
        if region.stage ~= 4 then
            self:_onButtonArrow()
        end
    end
end

function GuildCrossWarGuildRank:_onTabSelect(index, sender)
    self._ladders = {}
    self._selectedTabIdx = index
    local type = index == 2 and index or (index - 1) 
    G_UserData:getGuildCrossWar():c2sBrawlGuildsLadder(type)    
end

function GuildCrossWarGuildRank:_initListView()
	local scrollViewParam = {
	    template = GuildCrossWarGuildRankCell,
	    updateFunc = handler(self, self._onCellUpdate),
	    selectFunc = handler(self, self._onCellSelected),
        touchFunc = handler(self, self._onCellTouch),
    }
	self._tabListView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function GuildCrossWarGuildRank:_updateListView()
    self._tabListView:updateListViewEx(1, table.nums(self._rankData))
end

function GuildCrossWarGuildRank:_onCellUpdate(cell, index)
    -- body
	if table.nums(self._rankData) <= 0 then
		return
    end
    
    local cellIndex = (index + 1)
    local cellData = self._rankData[cellIndex]
    if type(cellData) ~= "table" then
        return
    end

    cellData.index = cellIndex
    cellData.tabIndex = self._selectedTabIdx
    cell:updateUI(cellData)
end

function GuildCrossWarGuildRank:_onCellSelected(cell, index)
    -- body
end

function GuildCrossWarGuildRank:_onCellTouch(index, data)
    -- body
end

function GuildCrossWarGuildRank:_s2cBrawlGuildsLadder(id, message)
    if self._selectedTabIdx == 1 and rawget(message, "guild_ladders") == nil then
        return
    elseif self._selectedTabIdx == 2 and rawget(message, "server_ladders") == nil then 
        return
    end

    if self._isAutoArrow and not self._resource:isVisible() then
        self:_onButtonArrow()
    end

    self._rankData = {}
    self._rankData = self._selectedTabIdx == 1 and message.guild_ladders
                                               or message.server_ladders
    if self._selectedTabIdx == 1 then
        table.sort(self._rankData, function(item1, item2)
            if item1.score == item2.score then
                return item1.guild_id < item2.guild_id
            else
                return item1.score > item2.score
            end
        end)
    else
        table.sort(self._rankData, function(item1, item2)
            return item1.score > item2.score
        end)
    end
    self:_updateListView()
end

function GuildCrossWarGuildRank:_initPosition( ... )
    self._oriPosition = cc.p(self._resource:getPosition())
    self._oriBtnRankPosition = cc.p(self._btnRank:getPosition())
    self._oriSize = self._resource:getContentSize() 
    self._newTargetPos = cc.p(self._oriPosition.x - self._oriSize.width, self._oriPosition.y)
    self._newBtnRankPos = cc.p(87, self._oriBtnRankPosition.y)
end

function GuildCrossWarGuildRank:_onButtonArrow(sender)
    if sender then
        self._isAutoArrow = (not self._isAutoArrow)
    end
    local bVisible = (not self._resource:isVisible())
    self._btnRank:setFlippedX(not bVisible)
    
    if bVisible then
        self._resource:setVisible(true)
        self._resource:runAction(cc.Sequence:create(
        cc.CallFunc:create(function()
        end),
        cc.MoveBy:create(0.2, cc.pSub(self._oriPosition, self._newTargetPos))
        ))

        self._btnRank:runAction(cc.Sequence:create(
        cc.MoveBy:create(0.2, cc.pSub(self._oriBtnRankPosition, self._newBtnRankPos))
        ))
    else
        self._resource:runAction(cc.Sequence:create(
        cc.MoveBy:create(0.2, cc.pSub(self._newTargetPos, self._oriPosition)),
        cc.CallFunc:create(function()
            self._resource:setVisible(false)
        end)
        ))

        self._btnRank:runAction(cc.Sequence:create(
        cc.MoveBy:create(0.2, cc.pSub(self._newBtnRankPos, self._oriBtnRankPosition))
        ))
    end
end



return GuildCrossWarGuildRank