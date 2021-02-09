local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupTowerRankNode = class("PopupTowerRankNode", ListViewCellBase)
local Hero = require("app.config.hero")
local Color = require("app.utils.Color")

PopupTowerRankNode.RANK_BG_DARK = 4

function PopupTowerRankNode:ctor(rankData)
    self._rankData = rankData

    self._textRank = nil    --名次
    self._textName = nil    --名字
    self._textRound = nil   --章节
    self._textStar = nil    --星数
    self._imageBG = nil     --背景图片
    -- self._imageRank = nil   --排行图标，前3

	local resource = {
		file = Path.getCSB("PopupTowerRankNode", "tower"),
		binding = {
            _panelBase = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupTowerRankNode.super.ctor(self, resource)
end

function PopupTowerRankNode:onCreate()
    local size = self._panelBase:getContentSize()
    self:setContentSize(size)
    self._panelBase:setSwallowTouches(false)
    -- self._imageRank:setVisible(false)

    local rank = self._rankData:getRank()
    local officerLevel = self._rankData:getOfficer_level()
    self:_setNodeBG(rank)

    self._textRank:setString(self._rankData:getRank())
    self._textStar:setString(self._rankData:getStar())
    self._textName:setString(self._rankData:getName())
    local layer = self._rankData:getLayer()
    self._textRound:setString(Lang.get("challenge_tower_rank_layer_count", {count = layer}))

    local commonColor = Color.getRankColor(rank)
    self._textRank:setColor(commonColor)
    self._textStar:setColor(commonColor)
    self._textRound:setColor(commonColor)

    self._textName:setColor(Color.getOfficialColor(officerLevel))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, officerLevel)
end

function PopupTowerRankNode:_setNodeBG(rank)
    if rank < 4 then
        local pic = Path.getComplexRankUI("img_com_ranking0"..rank)
        self._imageBG:loadTexture(pic)
        self._textRank:setVisible(false)
        local icon = Path.getRankIcon(rank)
        -- self._imageRank:loadTexture(icon)
        -- self._imageRank:setVisible(true)
        self._rank:setRank(rank)
        self._rank:setVisible(true)
        self._imageBGLight:setVisible(true)
    else
        self._textRank:setVisible(true)
        -- self._imageRank:setVisible(false)
        self._rank:setVisible(false)
        self._imageBGLight:setVisible(false)
    end

    if rank >= 4 and rank % 2 == 1 then
        local pic = Path.getComplexRankUI("img_com_ranking04")
        self._imageBG:loadTexture(pic)
        -- self._imageBG:setVisible(true)
    elseif rank >= 4 and rank % 2 == 0 then
        local pic = Path.getComplexRankUI("img_com_ranking05")
        self._imageBG:loadTexture(pic)
        -- self._imageBG:setVisible(false)
    end
end

function PopupTowerRankNode:_onPanelClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        -- G_Prompt:showTip("我是 userid = "..self._rankData:getUser_id().." "..self._rankData:getName().." 的详细面板")
        local userId = self._rankData:getUser_id()
        if userId ~= G_UserData:getBase():getId() then
            G_UserData:getBase():c2sGetUserBaseInfo(userId)
        end
	end
end


return PopupTowerRankNode