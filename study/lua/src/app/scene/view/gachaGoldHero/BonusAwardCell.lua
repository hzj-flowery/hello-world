-- @Author panhoa
-- @Date 5.7.2019
-- @Role 

local ListViewCellBase = require("app.ui.ListViewCellBase")
local BonusAwardCell = class("BonusAwardCell", ListViewCellBase)
local GachaGoldenHeroConst = require("app.const.GachaGoldenHeroConst")


function BonusAwardCell:ctor()
    -- body
    self._resource = nil
    self._imageBack= nil

    local resource = {
        file = Path.getCSB("BonusAwardCell", "gachaGoldHero"),
    }
    BonusAwardCell.super.ctor(self, resource)
end

function BonusAwardCell:onCreate()
    self._size = self._resource:getContentSize()
    self:setContentSize(self._size)
    self._resource:setVisible(false)
    self._imageBack:setScale9Enabled(false)
    cc.bind(self._awardsListview, "CommonListViewLineItem")
end

function BonusAwardCell:updateUI(data)
    -- body
    if not data or table.nums(data) <= 0 then
        return
    end 
    self._resource:setVisible(true)
    local index = data.index <= 3 and data.index or (data.index % 2 + 4)
    self:_updateBackImage(index, data.index <= 3)
    self:_updateRankBackImage(data.index)
    self:_updateAwardsList(data.cfg)
end

-- @Role    BackImage
function BonusAwardCell:_updateBackImage(i, isTop3)
    local imgPath = isTop3 and Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_RANK_BG[i])
                           or  Path.getCommonRankUI(GachaGoldenHeroConst.JOYBONUS_RANK_BG[i])
    self._imageBack:loadTexture(imgPath)
    self._imageBack:setScale9Enabled(i > 3)
    if i > 3 then
        self._imageBack:setCapInsets(cc.rect(1, 1, 1, 1))
    end
    self._imageBack:setContentSize(self._size)
end

-- @Role    RankBackImage
function BonusAwardCell:_updateRankBackImage(rankIdx)
    local rankIndex = (rankIdx <= 3 and rankIdx or 4)
    self._imageRankBK:setVisible(rankIdx <= 3)
    self._imageRankBK:loadTexture(Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_AWARDINDEX_BG[rankIndex]))
    self._imageRank:setVisible(rankIdx <= 3)
    self._imageRank:loadTexture(Path.getComplexRankUI(GachaGoldenHeroConst.JOYBONUS_AWARDINDEX_IDX[rankIndex]))
    self._textRank:setVisible(rankIdx > 3)
end

-- @Role    Update AwardsList
function BonusAwardCell:_updateAwardsList(rankData)
    if type(rankData) ~= "table" then
        return
    end

    if rawequal(rankData.involvement, 1) then
        self._textRank:setString(Lang.get("gacha_goldenhero_awardsjoin"))
    else
        self._textRank:setString(tostring(rankData.rank_min) .."-" ..tostring(rankData.rank_max))
    end
    local itemList = {}
    for i=1,10 do
        local itemType = rankData["type_" ..i]
        if type(itemType) and itemType > 0 then
            table.insert(itemList, {type = rankData["type_" ..i], value = rankData["value_" ..i], size = rankData["size_" ..i]})
        end
    end
    self._awardsListview:setMaxItemSize(7)
    self._awardsListview:setListViewSize(820,120)
    self._awardsListview:setItemsMargin(5)
    self._awardsListview:updateUI(itemList, 1)
end



return BonusAwardCell