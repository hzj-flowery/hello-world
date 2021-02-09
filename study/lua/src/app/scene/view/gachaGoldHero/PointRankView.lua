-- @Author panhoa
-- @Date 05.07.2019
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local PointRankView = class("PointRankView", ViewBase)
local TabScrollView = require("app.utils.TabScrollView")
local PointRankCell = import(".PointRankCell")
local GachaGoldenHeroHelper = import(".GachaGoldenHeroHelper")
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")


function PointRankView:ctor()
    self._tabNode = nil
    self._rankRcrollView = nil
    self._tabListView = nil
    self._ladders = {}
    self._selectedTabIdx = 1
    
    local resource = {
        file = Path.getCSB("PointRankView", "gachaGoldHero"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
			_panelTouch = {
                events = {{event = "touch", method = "_onButtonArrow"}}
            }
        }
    }
    PointRankView.super.ctor(self, resource)
end

function PointRankView:onCreate()
    self:_initPosition()
    self:_initCommonTab()
    self:_initScrollView()
end

function PointRankView:onEnter()
    self._signalGachaLadder  = G_SignalManager:add(SignalConst.EVENT_GACHA_GOLDENHERO_JOYRANK, handler(self, self._onEventGachaLadder))   -- Rank
    self:_updateTab()
    self:_updateScrollView()
    self:_updateOwnInfo(0, "0")
end

function PointRankView:onExit()
    self._signalGachaLadder:remove()
    self._signalGachaLadder = nil
end

function PointRankView:_initPosition( ... )
    self._oriPosition = cc.p(self._resource:getPosition())
    self._oriBtnRankPosition = cc.p(self._btnRank:getPosition())
    self._oriSize = self._resource:getContentSize() 
    self._newTargetPos = cc.p(self._oriPosition.x - self._oriSize.width, self._oriPosition.y)
    self._newBtnRankPos = cc.p(94, self._oriBtnRankPosition.y)
end

function PointRankView:_onButtonArrow()
    local bVisible = (not self._resource:isVisible())
    self._btnRank:setFlippedX(not bVisible)
    
    if bVisible then
        self._resource:setVisible(true)
        self._resource:runAction(cc.Sequence:create(
        cc.CallFunc:create(function()
            self._imageRank:setVisible(false)
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
            self._imageRank:setVisible(true)
        end)
        ))

        self._btnRank:runAction(cc.Sequence:create(
        cc.MoveBy:create(0.2, cc.pSub(self._newBtnRankPos, self._oriBtnRankPosition))
        ))
    end
end

function PointRankView:_onEventGachaLadder(id, message)
    if self._selectedTabIdx == 2 then
        if message.ladder_type == 0 then
            self._ladders = rawget(message, "ladders") or {}
            self:_updateScrollView()
            self:_updateOwnRank()
        end
    elseif self._selectedTabIdx == 1 then
        self._ladders = rawget(message, "ladders") or {}
        self:_updateScrollView()
        self:_updateOwnRank()
    end
end

function PointRankView:_updateOwnRank( ... )
    local ownRankData = G_UserData:getGachaGoldenHero():getOwnRankData()
    local curRank = ownRankData[GachaGoldenHeroConst.FLAG_OWNRANK ..self._selectedTabIdx]
    if curRank then
        self:_updateOwnInfo(curRank.rank, curRank.point)
    end
end

function PointRankView:_initCommonTab()
    local listTitle = {
	  Lang.get("gacha_goldenhero_curpoint"),
	  Lang.get("gacha_goldenhero_totalpoint"),
	}

    self._tabNode:setCustomColor({
        {Colors.GOLDENHERO_RANK_COLOR_NML, nil},
        {Colors.GOLDENHERO_RANK_COLOR_IMP, nil},
    })
	local param = {
		isVertical = 2,
		callback = handler(self, self._onTabSelect),
		textList = listTitle
	}
    self._tabNode:recreateTabs(param)
end

function PointRankView:_onTabSelect(index, sender)
    self._ladders = {}
    self._selectedTabIdx = index
    self:_updateScrollView()
    if index == 2 then
        G_UserData:getGachaGoldenHero():c2sGachaLadder(0)
    elseif index == 1 then
        G_UserData:getGachaGoldenHero():c2sGachaLadder(1)
    end
end

function PointRankView:_updateTab( ... )
    local index  = 1
    self._poolData = GachaGoldenHeroHelper.getGachaState()
    if G_ServerTime:getLeftSeconds(self._poolData.countDowm) <= 0 or self._poolData.isCrossDay then
        index = 2
    end
    self._tabNode:setTabIndex(index)
    self:_onTabSelect(index)
end

function PointRankView:_initScrollView()
    self._imageRank:setVisible(false)
    local scrollViewParam = {
		template = PointRankCell,
		updateFunc = handler(self, self._onUpdate),
		selectFunc = handler(self, self._onCellSelected),
		touchFunc = handler(self, self._onCellTouch),
	}
	self._tabListView = TabScrollView.new(self._rankRcrollView, scrollViewParam, 1)
end

function PointRankView:_onUpdate(cell, cellIndex)
    if type(self._ladders) ~= "table" or table.nums(self._ladders) <= 0 then
        return
    end

    local newIdx = (cellIndex + 1)
    local cellData = {
        index = newIdx,
        cfg = self._ladders[newIdx]
    }
    cell:updateUI(cellData)
end

function PointRankView:_onCellSelected(cell, cellIndex) 
end

function PointRankView:_onCellTouch(cellIndex, data)
end

function PointRankView:_updateScrollView()
    self._tabListView:updateListView(1, table.nums(self._ladders))
end

function PointRankView:_updateOwnInfo(index, point)
    local rank = (index == 0 and Lang.get("common_text_none") or index)
    if tonumber(index) == 0 and tonumber(point) > 0 then
        rank = Lang.get("common_text_join")
    end
    local fontSize = (type(rank) == "number" and 20 or 18)
    self._textOwnRank:setString(rank)
    self._textOwnRank:setFontSize(fontSize)
    if type(index) ~= "number" or index == 0 then
        index = 4
    end

    local serverName = G_UserData:getBase():getReal_server_name()
    if string.match(serverName, "(%a+[%d+%-%,]+)") ~= nil then
        serverName = string.match(serverName, "(%a+[%d+%-%,]+)")
    elseif string.match(serverName, "([%d+%-%,]+)") ~= nil then
        serverName = string.match(serverName, "([%d+%-%,]+)")
    end
    local newIdx = (index <= 3 and index or 4)
    self._imageRankBack:loadTexture(Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_RANKINDEX_BG[newIdx]))
    self._textOwnServerName:setString(GachaGoldenHeroHelper.getFormatServerName(serverName, 5))--G_UserData:getBase():getReal_server_name(), 5))
    self._textOwnName:setString(G_UserData:getBase():getName())
    self._textOwnPoint:setString(point)
end



return PointRankView