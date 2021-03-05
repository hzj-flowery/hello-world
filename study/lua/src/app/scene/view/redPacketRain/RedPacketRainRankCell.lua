
local ListViewCellBase = require("app.ui.ListViewCellBase")
local RedPacketRainRankCell = class("RedPacketRainRankCell", ListViewCellBase)

function RedPacketRainRankCell:ctor()
	local resource = {
		file = Path.getCSB("RedPacketRainRankCell", "redPacketRain"),
		binding = {
            
		}
	}
	RedPacketRainRankCell.super.ctor(self, resource)
end

function RedPacketRainRankCell:onCreate()
    self._size = self._panelBase:getContentSize()
    self:setContentSize(self._size)
    self._rank:setVisible(false)
    self._imageBG:setScale9Enabled(false)
end

function RedPacketRainRankCell:update(data, rank, hideBg)
    self._imageBG:setVisible(not hideBg)
    
    if rank == 0 then
        self._textRank:setVisible(true)
        self._rank:setVisible(false)
        self._textRank:setString(Lang.get("common_text_no_rank"))
    elseif rank >= 1 and rank <= 3 then
        self._imageBG:setScale9Enabled(false)
        local pic = Path.getComplexRankUI("img_com_ranking0"..rank)
        self._imageBG:loadTexture(pic)
        self._imageBG:ignoreContentAdaptWithSize(true)
        local icon = Path.getRankIcon(rank)
        self._rank:setRank(rank)
        self._rank:setVisible(true)
        self._textRank:setVisible(false)
    else
        self._textRank:setVisible(true)
        self._rank:setVisible(false)
        self._textRank:setString(rank)
        local bgResName = rank % 2 == 1 and "img_com_board_list01b" or "img_com_board_list01a"
        self._imageBG:loadTexture(Path.getCommonRankUI(bgResName))
        self._imageBG:ignoreContentAdaptWithSize(true)
        self._imageBG:setCapInsets(cc.rect(2, 2, 1, 1))
        self._imageBG:setScale9Enabled(true)
        self._imageBG:setContentSize(self._size)
    end

    self._textName:setString(data:getName())
    self._textSmallCount:setString(data:getSmall_red_packet())
    self._textBigCount:setString(data:getBig_red_packet())
    self._textMoney:setString(data:getMoney())
    local officerLevel = data:getOffice_level()
    self._textName:setColor(Colors.getOfficialColor(officerLevel))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, officerLevel)
end

return RedPacketRainRankCell