--世界boss
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupCrossWorldBossRobCell = class("PopupCrossWorldBossRobCell", ListViewCellBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local CrossWorldBossConst = require("app.const.CrossWorldBossConst")
local TextHelper = require("app.utils.TextHelper")

function PopupCrossWorldBossRobCell:ctor()
    local resource = {
        file = Path.getCSB("PopupCrossWorldBossRobCell", "crossworldboss"),
        binding = {
		}
    }

    PopupCrossWorldBossRobCell.super.ctor(self, resource)
end


function PopupCrossWorldBossRobCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
    self._commonButton:addClickEventListenerEx(handler(self,self._onButtonClick))
end


function PopupCrossWorldBossRobCell:onEnter()

	
end

function PopupCrossWorldBossRobCell:onExit()

end

function PopupCrossWorldBossRobCell:updateUI( index, data )
    -- body
    self._cellValue = data
    self._playerName:setString(data.name)
    self._playerName:setColor(Colors.getOfficialColor(data.official))
    require("yoka.utils.UIHelper").updateTextOfficialOutline(self._playerName, data.official)
    self._playerSid:setString(data.sname)
    if data.rank <=3 and data.rank >= 1 then
        self:updateImageView("Image_top_rank", {visible = true, texture = Path.getArenaUI("img_qizhi0"..data.rank)})
        self:updateImageView("Image_rank_bk", {visible = true, texture = Path.getComplexRankUI("img_midsize_ranking0"..data.rank)})
        self:updateLabel("Text_rank", {visible = false})
    else
        self:updateImageView("Image_top_rank", {visible = false})
        self:updateImageView("Image_rank_bk", {visible = true, texture = Path.getComplexRankUI("img_midsize_ranking04")})
        self:updateLabel("Text_rank", {visible =true, text = data.rank})
    end

    self._textPoint:setString( TextHelper.getAmountText( data.point) )
    if data.userId == G_UserData:getBase():getId() then
        self._commonButton:setString(Lang.get("worldboss_grob_self_btn"))
        self._commonButton:setEnabled(false)
    else
        self._commonButton:setString(Lang.get("worldboss_grob_btn"))
        --self._commonButton:switchToHightLight()
        self._commonButton:setEnabled(true)
    end

    if data.guildName == nil or data.guildName == "" then
        self._textGuildName:setString(" ")
    else
        self._textGuildName:setString("("..data.guildName..")")
    end
    

    --self._commonButton:setButtonTag(data.userId)
    

    local scrollView = self._scrollView
	local commonHeroArr = scrollView:getChildren()

    for index, commHero in ipairs(commonHeroArr) do
        commHero:setVisible(false)

        local heroData = data.heroList[index]
        if heroData then
            local baseId, limit = unpack(heroData)
            cc.bind(commHero,"CommonHeroIcon")
            
            if baseId and baseId > 0 then
                commHero:setVisible(true)
                commHero:updateUI(baseId, nil, limit)
            end
        end
	end
end

function PopupCrossWorldBossRobCell:_onButtonClick(sender)
	local userId = sender:getTag()
    self:dispatchCustomCallback(self._cellValue.userId, self._cellValue.sid)
end

return PopupCrossWorldBossRobCell
