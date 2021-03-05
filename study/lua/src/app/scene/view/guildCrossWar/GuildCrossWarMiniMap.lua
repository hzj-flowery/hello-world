--跨服军团战你小地图
local ViewBase = require("app.ui.ViewBase")
local GuildCrossWarMiniMap = class("GuildCrossWarMiniMap", ViewBase)
local PopupGuildCrossWarSmallMap = import(".PopupGuildCrossWarSmallMap")
local Path = require("app.utils.Path")
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local UTF8 = require("app.utils.UTF8")


function GuildCrossWarMiniMap:ctor(callBack)
    self._scrollView = nil --底图
    self._topBar = nil --顶部条 
    self._smallMapDlg = nil
    self._callBack = callBack
    
    local resource = {
        file = Path.getCSB("GuildCrossWarMiniMap", "guildCrossWar"),
    }
    self:setName("GuildCrossWarMiniMap")
    GuildCrossWarMiniMap.super.ctor(self, resource)
end

function GuildCrossWarMiniMap:onCreate()
    self._panelBk:addClickEventListenerEx(handler(self, self._onClickButton))
end

function GuildCrossWarMiniMap:_onClickButton(sender)
    if self._smallMapDlg == nil then
        local dlg = PopupGuildCrossWarSmallMap.new()
        self._smallMapDlg = dlg
        self._smallMapDlgSignal = self._smallMapDlg.signal:add(handler(self, self._onPopupSmallMapDlgClose))     
        dlg:open()
        if self._callBack then
            self._callBack(true)
        end
    end
end

--dlg框关闭事件
function GuildCrossWarMiniMap:_onPopupSmallMapDlgClose(event)
    if event == "close" then
        self._smallMapDlg = nil
        if self._smallMapDlgSignal then
            self._smallMapDlgSignal:remove()
            self._smallMapDlgSignal = nil
        end
        if self._callBack then
            self._callBack(false)
        end
    end
end

function GuildCrossWarMiniMap:onEnter()
end

function GuildCrossWarMiniMap:onExit()
end

--@Role     Update MiniMap
function GuildCrossWarMiniMap:updateCamera(cameraX, cameraY)
    local innerContainer = self._scrollView:getInnerContainer()
    cameraX = (cameraX + 70)
    cameraY = (cameraY + 50)
    if cameraY > 0 then
        cameraY = 0
    elseif cameraY < -360 then
        cameraY = -360
    end

    if cameraX < -445 then
        cameraX = -445
    elseif cameraX > 0 then
        cameraX = 0
    end
    innerContainer:setPosition(cameraX, cameraY)
end

-- @Role    UpdateSelf   
function GuildCrossWarMiniMap:updateSelf(selfPosX, selfPosY)
    GuildCrossWarHelper.updateSelfNode(self._scrollView, selfPosX, selfPosY, false)
    if self._smallMapDlg then
        self._smallMapDlg:updateSelf(selfPosX, selfPosY)
    end
end

-- @Role    Update GuildNumber
function GuildCrossWarMiniMap:updateSelfGuildNumber(users)
    self:_updateOccpied()

    if self._smallMapDlg then
        self._smallMapDlg:updateSelfGuildNumber(users)
    end
end

-- @Role    Update Occpide
function GuildCrossWarMiniMap:_updateOccpied()
    local pointMap = G_UserData:getGuildCrossWar():getCityMap()
    for key, value in pairs(pointMap) do
        local pointData = GuildCrossWarHelper.getWarCfg(key)
        self:_updateGuildFlag(pointData, key, value)
    end
end

-- @Role    Update Occupied-City
function GuildCrossWarMiniMap:_updateGuildFlag(pointData, key, value)
    local pointOccupied = self["_scrollView"]:getChildByName("guildFlag" ..key)
    if pointOccupied == nil then
        pointOccupied = GuildCrossWarHelper.createGuildFlag(key)
        pointOccupied:setName("guildFlag" ..key)
        pointOccupied:setPosition(cc.p(pointData.name_x * GuildCrossWarConst.CAMERA_SCALE_SMALL, 
                                        pointData.name_y * GuildCrossWarConst.CAMERA_SCALE_SMALL))
        self["_scrollView"]:addChild(pointOccupied, 1000)
    end

    if value:getGuild_id() > 0 and value:getGuild_name() ~= "" then 
        pointOccupied:setVisible(true)
    else
        pointOccupied:setVisible(false)
    end

    GuildCrossWarHelper.updateGuildFlag(pointOccupied, key, value)
    GuildCrossWarHelper.updateGuildName(pointOccupied, key, value)
    GuildCrossWarHelper.updateServerName(pointOccupied, key, value)
end


return GuildCrossWarMiniMap
