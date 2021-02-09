-- @Author panhoa
-- @Date 5.7.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PointRankCell = class("PointRankCell", ListViewCellBase)
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")
local GachaGoldenHeroHelper = import(".GachaGoldenHeroHelper")


function PointRankCell:ctor()
    -- body
    self._resource = nil
    self._imageBack= nil

    local resource = {
        file = Path.getCSB("PointRankCell", "gachaGoldHero"),
    }
    PointRankCell.super.ctor(self, resource)
end

function PointRankCell:onCreate()
    self._size = self._resource:getContentSize()
    self:setContentSize(self._size)
    self._resource:setVisible(false)
end

function PointRankCell:updateUI(data)
    local cellData = data.cfg
    local index = (data.index <= 3 and data.index or (data.index % 2 + 4))
    self._resource:setVisible(true)
    self:_updateBackImage(data.index)

    self._imageRankBK:loadTexture(Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_RANKINDEX_BG[index]))
    self._textRank:setString(tostring(data.index))

    local serverName = cellData.svr_name
    if string.match(serverName, "(%a+[%d+%-%,]+)") ~= nil then
        serverName = string.match(serverName, "(%a+[%d+%-%,]+)")
    elseif string.match(serverName, "([%d+%-%,]+)") ~= nil then
        serverName = string.match(serverName, "([%d+%-%,]+)")
    end
    self._textServerName:setString(GachaGoldenHeroHelper.getFormatServerName(serverName, 5))

    if cellData then
        self._textName:setString(cellData.user_name)
        self._textPoint:setString(tostring(cellData.point))
    end

    local colorIdx = data.index <= 3 and data.index or 4
    self._textServerName:setColor(Colors.GOLDENHERO_RANK_TOP[colorIdx])
    self._textName:setColor(Colors.GOLDENHERO_RANK_TOP[colorIdx])
    self._textPoint:setColor(Colors.GOLDENHERO_RANK_TOP[colorIdx])
end

function PointRankCell:_updateBackImage(i)
    local index = (i % 2 + 1)
    self._imageBack:loadTexture(Path.getUICommon(GachaGoldenHeroConst.RANK_CELL_BACKBG[index]))
    self._imageBack:setScale9Enabled(true)
    self._imageBack:setContentSize(self._size)
    if index == 0 then
        self._imageBack:setCapInsets(cc.rect(1, 1, 1, 1))
    else
        self._imageBack:setCapInsets(cc.rect(4, 4, 2, 2))
    end
end



return PointRankCell