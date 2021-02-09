
local ListViewCellBase = require("app.ui.ListViewCellBase")
local GuildWarHurtRankNode = class("GuildWarHurtRankNode", ListViewCellBase)

function GuildWarHurtRankNode:ctor()
    self._imageBg = nil
    self._imageRank = nil
    self._textGuildName = nil
    self._textPoint = nil
    self._textRank = nil

    local resource = {
        file = Path.getCSB("GuildWarHurtRankNode", "guildwarbattle"),
        binding = {
		}
    }
    GuildWarHurtRankNode.super.ctor(self, resource)
end

function GuildWarHurtRankNode:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function GuildWarHurtRankNode:updateUI(data,index,totalHp, isTaskNode)
    self._data = data
    self._imageRankBg1:setVisible(false)
    self._imageRankBg2:setVisible(false)
    local rank = index
    if rank <= 3 and rank > 0 then
        self._imageRank:setVisible(true)
        self._imageRank:loadTexture( Path.getArenaUI("img_qizhi0"..rank))
        self._textRank:setVisible(false)
    elseif rank == 0 then
        self._imageRank:setVisible(false)
        self._textRank:setVisible(false)
	else
        self._imageRank:setVisible(true)
        self._textRank:setVisible(true)
        self._textRank:setString(tostring(rank))
		self._imageRank:loadTexture( Path.getArenaUI("img_qizhi04"))
	end
    local function getRankColor(rank)
        if rank <=3 and rank > 0  then
            return Colors["GUILD_DUNGEON_RANK_COLOR"..rank]
        end
        return Colors["DARK_BG_ONE"]
    end
    
    if isTaskNode then
        if index % 2 == 0 then
            self._imageRankBg1:setVisible(true)
        else
            self._imageRankBg2:setVisible(true)
        end
    end

    self._imageBg:setVisible(false)--index % 2 == 0
    self._textGuildName:setString(data.unit:getGuild_name())
    self._textPoint:setString(Lang.get("guildwar_rank_list_hurt_percent",{value = math.floor(data.hurt * 100 /totalHp) } ))

    self._textGuildName:setColor(getRankColor(rank))
    self._textPoint:setColor(getRankColor(rank))
end

return GuildWarHurtRankNode
