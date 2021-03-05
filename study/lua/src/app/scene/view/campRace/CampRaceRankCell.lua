local ListViewCellBase = require("app.ui.ListViewCellBase")
local CampRaceRankCell = class("CampRaceRankCell", ListViewCellBase)

function CampRaceRankCell:ctor()
	local resource = {
		file = Path.getCSB("CampRaceRankCell", "campRace"),
	}
	CampRaceRankCell.super.ctor(self, resource)
end

function CampRaceRankCell:onCreate()
	local size = self._panelBase:getContentSize()
    self:setContentSize(size.width, size.height)
end

function CampRaceRankCell:updateUI(index, data)
    if index % 2 == 1 then 
        self._imageBG:setVisible(false)
    else
        self._imageBG:setVisible(true)
    end

    if index >= 1 and index <= 3 then
        local flag = Path.getArenaUI("img_qizhi0"..index)
        self._imageRank:loadTexture(flag)
        self._imageRank:setVisible(true)
        self._textRank:setVisible(false)
    elseif index >= 4 and index <= 8 then
        local flag = Path.getArenaUI("img_qizhi04")
        self._imageRank:loadTexture(flag)
        self._imageRank:setVisible(true)
        self._textRank:setVisible(true)
        self._textRank:setString(index)
        self._textRank:setColor(Colors.getCampWhite())
        self._textRank:enableOutline(Colors.getCampBrownOutline())
    else
        self._imageRank:setVisible(false)
        self._textRank:setVisible(true)
        self._textRank:setString(index)
        self._textRank:setColor(Colors.getCampBrown())
        self._textRank:disableEffect(cc.LabelEffect.OUTLINE)
    end

    if data then
        self:updateLabel("_textName", 
        {
            text =  data:getName(),
            color = Colors.getOfficialColor(data:getOfficer_level()),
            
        })
        
        self._textPoint:setString(data:getScore())
    end
end

return CampRaceRankCell
