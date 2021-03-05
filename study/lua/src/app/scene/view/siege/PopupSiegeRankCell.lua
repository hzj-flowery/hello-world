local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupSiegeRankCell = class("PopupSiegeRankCell", ListViewCellBase)
local Color = require("app.utils.Color")
local Path = require("app.utils.Path")
local TextHelper = require("app.utils.TextHelper")

PopupSiegeRankCell.RANK_BG_DARK = 4

PopupSiegeRankCell.TYPE_PERSON = 1	--个人
PopupSiegeRankCell.TYPE_GUILD = 2	--工会

function PopupSiegeRankCell:ctor()
    self._rankData = nil
    self._type = nil

    self._textRank = nil    --名次
    self._textName = nil    --名字
    self._textHurt = nil    --章节
    self._imageBG = nil     --排名背景
    self._rankIcon = nil    --排名icon

	local resource = {
		file = Path.getCSB("PopupSiegeRankCell", "siege"),
		binding = {
            _panelBase = {
				events = {{event = "touch", method = "_onPanelClick"}}
			},
		}
	}
	PopupSiegeRankCell.super.ctor(self, resource)
end

function PopupSiegeRankCell:onCreate()
    local size = self._panelBase:getContentSize()
    self:setContentSize(size)
    self._panelBase:setSwallowTouches(false)
    self._rankIcon:setVisible(false)
end

function PopupSiegeRankCell:_createPersonNode()
    self._textRank:setString(self._rankData:getRank())
    local hurt = self._rankData:getHurt()
    local strHurt = TextHelper.getAmountText2(hurt)
    -- if hurt > 100000 then
    --     strHurt = math.floor(hurt/10000)..Lang.get("siege_damage_wan")
    -- end
    self._textHurt:setString(strHurt)
    self._textName:setString(self._rankData:getName())
    local officerLevel = self._rankData:getOfficer_level()
    self._textName:setColor(Color.getOfficialColor(officerLevel))
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textName, officerLevel)
end

function PopupSiegeRankCell:_createGuildNode()
    self._textRank:setString(self._rankData:getRank())
    local hurt = self._rankData:getHurt()
    local strHurt = TextHelper.getAmountText2(hurt)
    -- if hurt > 100000 then
    --     strHurt = math.floor(hurt/10000)..Lang.get("siege_damage_wan")
    -- end
    self._textHurt:setString(strHurt)
    self._textName:setString(self._rankData:getName())
end

function PopupSiegeRankCell:_setNodeBG(rank)
    if rank < 4 then
        local pic = Path.getComplexRankUI("img_com_ranking0"..rank)
        self._imageBG:setScale9Enabled(false)
        self._imageBG:loadTexture(pic)
        self._textRank:setVisible(false)
        self._rankIcon:setRank(rank)
        self._rankIcon:setVisible(true)
        self._imageBGLight:setVisible(true)
    elseif rank % 2 == 1 then
        local pic   = Path.getCommonRankUI("img_com_board_list01a")
        self._imageBG:loadTexture(pic)
        self._imageBG:setScale9Enabled(true)
        self._imageBG:setCapInsets(cc.rect(1, 1, 1, 1))
        self._rankIcon:setVisible(false)
        self._textRank:setVisible(true)
        self._imageBGLight:setVisible(false)
    else
        local pic   = Path.getCommonRankUI("img_com_board_list01b")
        self._imageBG:setScale9Enabled(true)
        self._imageBG:setCapInsets(cc.rect(1, 1, 1, 1))
        self._imageBG:loadTexture(pic)
        self._rankIcon:setVisible(false)
        self._textRank:setVisible(true)
        self._imageBGLight:setVisible(false)
    end
end

function PopupSiegeRankCell:_onPanelClick(sender)
	local offsetX = math.abs(sender:getTouchEndPosition().x - sender:getTouchBeganPosition().x)
	local offsetY = math.abs(sender:getTouchEndPosition().y - sender:getTouchBeganPosition().y)
	if offsetX < 20 and offsetY < 20  then
        if self._type == PopupSiegeRankCell.TYPE_PERSON then
            local userId = self._rankData:getUser_id()
            if userId ~= G_UserData:getBase():getId() then
                G_UserData:getBase():c2sGetUserBaseInfo(userId)
            end
        end
	end
end


function PopupSiegeRankCell:refreshInfo(rankData, type)
    self._type = type
    self._rankData = rankData
    if type == PopupSiegeRankCell.TYPE_PERSON then 
        self:_createPersonNode()
    elseif type == PopupSiegeRankCell.TYPE_GUILD then 
        self:_createGuildNode()
    end
    local rank = self._rankData:getRank()
    self:_setNodeBG(rank)
end


return PopupSiegeRankCell