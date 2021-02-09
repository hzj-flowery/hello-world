local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupStarRankNode = class("PopupStarRankNode", ListViewCellBase)
local Hero = require("app.config.hero")
local Color = require("app.utils.Color")
-- local Path = require("app.utils.Path")

PopupStarRankNode.RANK_BG_DARK = 4

function PopupStarRankNode:ctor(rankData)
    -- self._rankData = rankData

    self._textRank = nil    --名次
    self._textName = nil    --名字
    self._textRound = nil   --章节
    self._textStar = nil    --星数
    self._imageBG = nil     --背景图片
    -- self._imageRank = nil   --排行图标，前3
    self._rank = nil        --排行图标

	local resource = {
		file = Path.getCSB("PopupStarRankNode", "stage"),
		binding = {
            _panelBase = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupStarRankNode.super.ctor(self, resource)
end

function PopupStarRankNode:onCreate()
    self._size = self._panelBase:getContentSize()
    self:setContentSize(self._size)
    self._panelBase:setSwallowTouches(false)
    self._rank:setVisible(false)
    self._imageBG:setScale9Enabled(false)
end

function PopupStarRankNode:refreshInfo(rankData)
    self._rankData = rankData
    local rank = self._rankData:getRank()
    local officerLevel = self._rankData:getOfficer_level()
    self:_setNodeBG(rank)

    self._textRank:setString(rank)
    self._textStar:setString(self._rankData:getStar())
    self._textName:setString(self._rankData:getName())
    local chapter = self._rankData:getChapter()
    self._textRound:setString(Lang.get("mission_star_chapter", {num = chapter}))

    -- local commonColor = Color.getRankColor(rank)
    -- self._textRank:setColor(commonColor)
    -- self._textStar:setColor(commonColor)
    -- self._textRound:setColor(commonColor)

    self._textName:setColor(Color.getOfficialColor(officerLevel))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, officerLevel)
end

function PopupStarRankNode:_setNodeBG(rank)
    if rank < 4 then
        self._imageBG:setScale9Enabled(false)
        local pic = Path.getComplexRankUI("img_com_ranking0"..rank)
        self._imageBG:loadTexture(pic)

        self._imageBGLight:setVisible(true)

        self._imageBG:ignoreContentAdaptWithSize(true)
        self._textRank:setVisible(false)
        local icon = Path.getRankIcon(rank)
        self._rank:setRank(rank)
        self._rank:setVisible(true)
    else
        self._textRank:setVisible(true)
        -- self._imageRank:setVisible(false)
        self._rank:setVisible(false)

        self._imageBGLight:setVisible(false)
    end

    
    if rank >= 4 and rank % 2 == 1 then
        local pic = Path.getCommonRankUI("img_com_board_list01b")
        self._imageBG:loadTexture(pic)
        self._imageBG:ignoreContentAdaptWithSize(true)

        self._imageBG:setCapInsets(cc.rect(2, 3, 2, 1))
        self._imageBG:setScale9Enabled(true)
        self._imageBG:setContentSize(self._size)        
        -- self._imageBG:setVisible(true)
    elseif rank >= 4 and rank % 2 == 0 then
        local pic = Path.getCommonRankUI("img_com_board_list01a")
        self._imageBG:loadTexture(pic)
        self._imageBG:ignoreContentAdaptWithSize(true)
        self._imageBG:setCapInsets(cc.rect(2, 2, 1, 1))
        self._imageBG:setScale9Enabled(true)
        self._imageBG:setContentSize(self._size)        
        -- self._imageBG:setVisible(false)
    end
end

function PopupStarRankNode:_onPanelClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        local userId = self._rankData:getUser_id()
        if userId ~= G_UserData:getBase():getId() then
            G_UserData:getBase():c2sGetUserBaseInfo(userId)
        end
	end
end


return PopupStarRankNode