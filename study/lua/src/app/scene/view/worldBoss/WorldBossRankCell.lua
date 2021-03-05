--世界boss
local ListViewCellBase = require("app.ui.ListViewCellBase")
local WorldBossRankCell = class("WorldBossRankCell", ListViewCellBase)

local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")

local WorldBossConst = require("app.const.WorldBossConst")
local TextHelper = require("app.utils.TextHelper")

function WorldBossRankCell:ctor()
    --
	--左边控件
    self._nodeGuild = nil
    self._nodePersonal = nil
    local resource = {
        file = Path.getCSB("WorldBossRankCell", "worldBoss"),
        binding = {
		}
    }

    WorldBossRankCell.super.ctor(self, resource)
end


function WorldBossRankCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end



function WorldBossRankCell:updateUI(index, data, tabIndex)
    self._cellData = data
    if data.rank <= 3 and data.rank > 0 then
		self:updateImageView("Image_rank_bk", { visible = true,  texture = Path.getArenaUI("img_qizhi0"..data.rank)})
		self:updateLabel("Text_rank_num", {visible = false})
	else
		self:updateLabel("Text_rank_num", {visible = true, text = data.rank })
		self:updateImageView("Image_rank_bk",{ visible = true, texture = Path.getArenaUI("img_qizhi04") })
	end
    local function getRankColor(rank)
        if rank <=3 and rank > 0  then
            return Colors["WORLD_BOSS_RANK_COLOR"..rank]
        end
        return Colors["WORLD_BOSS_RANK_COLOR4"]
    end

	self._nodeGuild:setVisible(false)
    self._nodePersonal:setVisible(false)
    if tabIndex == WorldBossConst.TAB_INDEX_GUILD then
        self._nodeGuild:setVisible(true)
        self._textGuildName:setString(data.name)
        self._textGuildCount:setString(data.num)
        self._textGuildPoint:setString(TextHelper.getAmountText(data.point))
    else
        self._nodePersonal:setVisible(true)
        self._fileNodePlayerName:updateUI(data.name, data.official)
        self._fileNodePlayerName:setFontSize(18)
        self._textPoint:setString(TextHelper.getAmountText(data.point))
    end


end

return WorldBossRankCell
