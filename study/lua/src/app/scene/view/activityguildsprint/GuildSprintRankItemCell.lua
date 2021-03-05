
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildSprintRankItemCell = class("GuildSprintRankItemCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")

function GuildSprintRankItemCell:ctor()
    self._imageBg = nil
    self._imageRank = nil
	self._textRank = nil
    self._textGuildName = nil
	self._textGuildLeader = nil
	
    local resource = {
        file = Path.getCSB("GuildSprintRankItemCell", "activityguildsprint"),
        binding = {
		}
    }
    GuildSprintRankItemCell.super.ctor(self, resource)
end

function GuildSprintRankItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function GuildSprintRankItemCell:updateUI(guildSprintRankUnitData,index)
    self._data = guildSprintRankUnitData
    local rank = guildSprintRankUnitData:getRank()
    self:_setNodeBG(rank)


    self._textRank:setString(tostring(rank))
    self._textGuildName:setString(guildSprintRankUnitData:getGuild_name())
	self._textGuildLeader:setString(guildSprintRankUnitData:getGuild_leader_name())
    self._textGuildLeader:setColor(Colors.getOfficialColor(
         guildSprintRankUnitData:getGuild_leader_office_level()
    ))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textGuildLeader, guildSprintRankUnitData:getGuild_leader_office_level())
end


function GuildSprintRankItemCell:_setNodeBG(rank)
    if rank < 4 then
        local pic = Path.getComplexRankUI("img_com_ranking0"..rank)
        self._imageBG:loadTexture(pic)
        self._textRank:setVisible(false)
        self._imageBGLight:setVisible(true) 
        local icon = Path.getRankIcon(rank)
        self._rank:setRank(rank)
        self._rank:setVisible(true)
    else
        self._textRank:setVisible(true)
        self._rank:setVisible(false)
        self._imageBGLight:setVisible(false) 
    end

    if rank >= 4 and rank % 2 == 1 then
        local pic = Path.getComplexRankUI("img_com_ranking04")
        self._imageBG:loadTexture(pic)
    elseif rank >= 4 and rank % 2 == 0 then
        local pic = Path.getComplexRankUI("img_com_ranking05")
        self._imageBG:loadTexture(pic)
    end
end


return GuildSprintRankItemCell
