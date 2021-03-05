
local ListViewCellBase = require("app.ui.ListViewCellBase")
local SingleRaceRankCell = class("SingleRaceRankCell", ListViewCellBase)
local SingleRaceConst = require("app.const.SingleRaceConst")

local RANK2COLOR = {
    [4] = {color = cc.c3b(0xff, 0xcf, 0xab), outline = cc.c4b(0xb7, 0x76, 0x41, 0xff)},
    [5] = {color = cc.c3b(0xff, 0xcf, 0xab), outline = cc.c4b(0xb7, 0x76, 0x41, 0xff)},
    [6] = {color = cc.c3b(0xff, 0xcf, 0xab), outline = cc.c4b(0xb7, 0x76, 0x41, 0xff)},
    [7] = {color = cc.c3b(0xd8, 0xb0, 0xa3), outline = cc.c4b(0x75, 0x49, 0x38, 0xff)},
    [8] = {color = cc.c3b(0xd8, 0xb0, 0xa3), outline = cc.c4b(0x75, 0x49, 0x38, 0xff)},
}

function SingleRaceRankCell:ctor()
	local resource = {
		file = Path.getCSB("SingleRaceRankCell", "singleRace"),
		binding = {
			
		}
	}
	SingleRaceRankCell.super.ctor(self, resource)
end

function SingleRaceRankCell:onCreate()
	local size = self._panelBase:getContentSize()
	self:setContentSize(size.width, size.height)
end

--
function SingleRaceRankCell:update(index, data)
	if index % 2 == 1 then 
        self._imageBG:setVisible(true)
    else
        self._imageBG:setVisible(false)
    end

    local rank = index
    if data.type == SingleRaceConst.RANK_DATA_TYPE_1 then --服务器排行数据，要处理排名相等的情况
        rank = data:getRank()
    end
    if rank >= 1 and rank <= 3 then
        local flag = Path.getArenaUI("img_qizhi0"..rank)
        self._imageRank:loadTexture(flag)
        self._imageRank:setVisible(true)
        self._textRank:setVisible(false)
    else
        local flag = Path.getArenaUI("img_qizhi04")
        self._imageRank:loadTexture(flag)
        self._imageRank:setVisible(true)
        self._textRank:setVisible(true)
        self._textRank:setString(rank)
        local color, outline = self:_getRankColorInfo(rank, data.type)
        self._textRank:setColor(color)
        self._textRank:enableOutline(outline)
    end

    local color = self:_getFontColor(rank, data.type)
    local strDes, fontSize = self:_getStrAndFontSize(data)
    self._textName:setFontSize(fontSize)
    self._textPoint:setFontSize(fontSize)
    self._textName:setString(strDes)
    self._textPoint:setString(data:getSorce())
    self._textName:setColor(color)
    self._textPoint:setColor(color)
end

function SingleRaceRankCell:_getStrAndFontSize(data)
    local strDes = ""
    local fontSize = 20
    if data.type == SingleRaceConst.RANK_DATA_TYPE_1 then
        strDes = data:getServer_name()
    elseif data.type == SingleRaceConst.RANK_DATA_TYPE_2 then
        strDes = data:getServer_name().." "..data:getUser_name()
        fontSize = 16
    else
        strDes = data:getUser_name()
    end
    return strDes, fontSize
end

function SingleRaceRankCell:_getFontColor(rank, type)
    if rank == 1 then
        return cc.c3b(0xff, 0x19, 0x19)
    elseif rank == 2 then
        return cc.c3b(0xff, 0xc6, 0x19)
    elseif rank == 3 then
        return cc.c3b(0xff, 0x00, 0xff)
    elseif rank >= 4 and rank <= 6 then
        return cc.c3b(0xff, 0xff, 0xff)
    else
        if type == SingleRaceConst.RANK_DATA_TYPE_1 then
            return cc.c3b(0x97, 0x64, 0x53)
        else
            return cc.c3b(0xff, 0xff, 0xff)
        end
    end
end

function SingleRaceRankCell:_getRankColorInfo(rank, type)
    if rank >= 1 and rank <= 6 then
        return cc.c3b(0xff, 0xcf, 0xab), cc.c4b(0xb7, 0x76, 0x41, 0xff)
    else
        if type == SingleRaceConst.RANK_DATA_TYPE_1 then
            return cc.c3b(0xd8, 0xb0, 0xa3), cc.c4b(0x75, 0x49, 0x38, 0xff)
        else
            return cc.c3b(0xff, 0xcf, 0xab), cc.c4b(0xb7, 0x76, 0x41, 0xff)
        end
    end
end

return SingleRaceRankCell