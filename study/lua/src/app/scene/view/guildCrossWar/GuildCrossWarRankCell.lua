-- @Author panhoa
-- @Date 8.16.2018
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildCrossWarRankCell = class("GuildCrossWarRankCell", ListViewCellBase)
--local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")


function GuildCrossWarRankCell:ctor()
    self._resource      = nil
    self._imageBack     = nil
    self._textRank      = nil
    self._fileNodeName  = nil
    self._textKilledNum = nil
    self._textDeathNum  = nil
    self._textScore     = nil
    self._textBoxNum    = nil

    -- body
    local resource = {
        file = Path.getCSB("GuildCrossWarRankCell", "guildCrossWar"),
    }
    GuildCrossWarRankCell.super.ctor(self, resource)
end

-- @Role
function GuildCrossWarRankCell:onCreate()
    local size = self._resource:getContentSize()
    self:setContentSize(size.width, size.height)
end

-- @Role    底图
function GuildCrossWarRankCell:_updateBack(index)
    index = (index % 2 + 1)
    self._imageBack:loadTexture(Path.getComplexRankUI(GuildCrossWarConst.PERSONNAL_LADDER_CELL_BG[index]))
end

-- @Role    名称/官衔
function GuildCrossWarRankCell:_updateNameAndOfficial(index, name, officialLv, gameTitle)
    self._textRank:setString(tonumber(index))
    self._textRank:setColor(Colors.getOfficialColor(officialLv))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textRank, officialLv)
    self._fileNodeName:updateUI(name, officialLv)
    
    local titleInfo = require("app.config.title")
    if gameTitle >= 1 and gameTitle <= titleInfo.length() then
        local titleData = titleInfo.get(gameTitle)
        local targetPosX = (self._fileNodeName:getPositionX() + self._fileNodeName:getWidth() + 5)
        self._imageHonorTitle:setPositionX(targetPosX)
        self._imageHonorTitle:loadTexture(Path.getImgTitle(titleData.resource))
        self._imageHonorTitle:ignoreContentAdaptWithSize(true)
        --self._imageHonorTitle:setVisible(true)
        self._imageHonorTitle:setVisible(false)
    else
        self._imageHonorTitle:setVisible(false)
    end
end

-- @Role    Update Nums
function GuildCrossWarRankCell:_updateNums(killNum, deathNum, score)
    -- body
    self._textKilledNum:setString(tonumber(killNum))
    self._textDeathNum:setString(tonumber(deathNum))
    self._textScore:setString(tonumber(score))
end

-- @Role    Update Awards
function GuildCrossWarRankCell:_updateBoxNums(score)
    local data = GuildCrossWarHelper.getPersonAwards(score)
    if data == nil then
        self._textBoxNum:setString("")
        self["_fileNodeIcon"]:setVisible(false)
        return
    end
    self._textBoxNum:setString("x" ..data.size)
    self["_fileNodeIcon"]:unInitUI()
    self["_fileNodeIcon"]:initUI(data.type, data.value, data.size)
end

-- @Role    UpdateUI
function GuildCrossWarRankCell:updateUI(data)
    if not data then return end

    self:_updateBack(data.index)
    self:_updateBoxNums(data.score)
    self:_updateNums(data.killed_num, data.attack_num, data.score)
    self:_updateNameAndOfficial(data.index, data.name, data.officer_level, data.title)
end


return GuildCrossWarRankCell