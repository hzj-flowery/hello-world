-- @Author panhoa
-- @Date 05.07.2019
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local ObserveView = class("ObserveView", ViewBase)
local TabScrollView = require("app.utils.TabScrollView")
local ObserveCell = import(".ObserveCell")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")


function ObserveView:ctor(touchCallback)
    self._touchCallback = touchCallback
    self._enemyList = {}
    self._isFirstIn = true

    local resource = {
        file = Path.getCSB("ObserveView", "guildCrossWar"),
        size = G_ResolutionManager:getDesignSize(),
    }
    ObserveView.super.ctor(self, resource)
end

function ObserveView:onCreate()
    self._imageBack:setVisible(false)
    self._scrollView:setVisible(false)
    self:_initScrollView()
    self["_panelTouch"]:addClickEventListenerEx(function()
        if self._touchCallback and self._enemyList then
            self._touchCallback(self._enemyList[1].guild_id, true)
        end
    end)
end

function ObserveView:onEnter()
end

function ObserveView:onExit()
end

function ObserveView:updateUI(data)
    self._enemyList = data or {}
    self:_updateObserverGuildName(data[1].guild_name)
    self:_updateScrollView()
end

function ObserveView:updateSelected(bSelect, isTouch)
    if isTouch or self._isFirstIn then
        local interTime = self._isFirstIn and 0 or nil 
        self:_fadeListView(bSelect, interTime)
        self._isFirstIn = false
    end
    local pic = bSelect and GuildCrossWarConst.GUILD_OBSERVER_BG[2]
                         or GuildCrossWarConst.GUILD_OBSERVER_BG[1]
    self["_imageBtn"]:loadTexture(Path.getGuildCrossImage(pic))
    self["_imageBtn"]:ignoreContentAdaptWithSize(true)
    self["_txtGuildName"]:setColor(bSelect and Colors.OBSERVER_GUILD_SELECT
                                            or Colors.OBSERVER_GUILD_UNSELECT)
end

function ObserveView:_updateObserverGuildName(name)
    self["_txtGuildName"]:setString(name)
end

function ObserveView:_initScrollView()
    self._scrollView:setVisible(false)
    local scrollViewParam = {
		template = ObserveCell,
		updateFunc = handler(self, self._onUpdate),
		selectFunc = handler(self, self._onCellSelected),
		touchFunc = handler(self, self._onCellTouch),
	}
    self._tabListView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function ObserveView:_onUpdate(item, index)
    if type(self._enemyList) ~= "table" or table.nums(self._enemyList) <= 0 then
        return
    end
    
    local newIdx = (index + 1)
    local itemData = {
        index = newIdx,
        isObserver = rawequal(G_UserData:getGuildCrossWar():getObserverId(), self._enemyList[newIdx].user_id),
        cfg = self._enemyList[newIdx] or {}
    }
    item:updateUI(itemData)
end

function ObserveView:_onCellSelected(item, index) 
end

function ObserveView:_onCellTouch(index, data)
    if not data or type(data) ~= "number" then
        return
    end
    G_UserData:getGuildCrossWar():c2sBrawlGuildsObserve(data)
end

function ObserveView:_updateScrollView()
    self._tabListView:updateListView(1, table.nums(self._enemyList))
end


function ObserveView:_fadeListView(bSelect, interTime)
    local scrollInterTime = interTime or 0.2
    local imgBkInterTime = interTime or 0.2
    local bVisible = (not self._scrollView:isVisible())
    bVisible = bSelect and bVisible or false
    if bVisible then
        self._imageBack:setVisible(true)
        self._imageBack:runAction(cc.Sequence:create(
        cc.ScaleTo:create(imgBkInterTime, 1, 1.0),
        cc.FadeIn:create(imgBkInterTime)
        ))

        self._scrollView:setVisible(true)
        self._scrollView:runAction(cc.Sequence:create(
        cc.ScaleTo:create(scrollInterTime, 1, 1.0),
        cc.FadeIn:create(scrollInterTime)
        ))
    else
        self._imageBack:runAction(cc.Sequence:create(
        cc.ScaleTo:create(0.2, 1, 0.01),
        cc.FadeOut:create(0.2),
        cc.CallFunc:create(function()
            self._imageBack:setVisible(false)
            self._scrollView:setVisible(false)
        end)
        ))

        self._scrollView:runAction(cc.Sequence:create(
        cc.ScaleTo:create(0.2, 1, 0.01),
        cc.FadeOut:create(0.2),
        cc.CallFunc:create(function()
            self._imageBack:setVisible(false)
            self._scrollView:setVisible(false)
        end)
        ))
    end
end


return ObserveView