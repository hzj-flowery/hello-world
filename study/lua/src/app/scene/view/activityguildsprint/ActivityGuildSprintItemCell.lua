
local ListViewCellBase = require("app.ui.ListViewCellBase")
local ActivityGuildSprintItemCell = class("ActivityGuildSprintItemCell", ListViewCellBase)
local TextHelper = require("app.utils.TextHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
--local ActivityGuildSprintItemCell = require()

function ActivityGuildSprintItemCell:ctor()
    self._imageBg = nil
    self._imageRank = nil
	self._textRank = nil
	self._textGuildName = nil

	self._items = {}

    local resource = {
        file = Path.getCSB("ActivityGuildSprintItemCell", "activityguildsprint"),
        binding = {
		}
    }
    ActivityGuildSprintItemCell.super.ctor(self, resource)
end

function ActivityGuildSprintItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	 self._itemWidgets = { 
		 {self._item01},
	     {self._item02},
		 {self._item03}
	 }
end

function ActivityGuildSprintItemCell:updateUI(data,index)
    self._data = data
    local rank = data.rank_min
	local rankData = data.rankData


	if rank <= 3 and rank > 0 then
		self:updateImageView("Image_bk", {visible = true, texture = Path.getCustomActivityUI("img_rank0"..rank)} )
		self:updateImageView("Image_rank_bk", Path.getComplexRankUI("icon_ranking0"..rank))
		self:updateImageView("Image_Rank_num", {visible =true, texture = Path.getComplexRankUI("txt_ranking0"..rank) })
		self:updateLabel("Text_rank_num", {visible = false})
	else
		self:updateImageView("Image_Rank_num", {visible = false})
		self:updateLabel("Text_rank_num", {visible = true, text = rank })
		self:updateImageView("Image_rank_bk", Path.getComplexRankUI("icon_ranking04"))

		if index >= 4 and index % 2 == 1 then
			self:updateImageView("Image_bk", { visible = true, texture = Path.getCustomActivityUI("img_rank05") })
		elseif index >= 4 and index % 2 == 0 then
			self:updateImageView("Image_bk", { visible =true, texture = Path.getCustomActivityUI("img_rank04") })
		end
	end
	
  
    for i, items in ipairs(self._itemWidgets) do	
		local config = data["config"..tostring(i)]
		local itemList = {}
		if config then
			itemList = UserDataHelper.makeRewards(config,3,"award_")
		end	
		
		for k,item in ipairs(items) do
			local itemData = itemList[k]
			if itemData then
				item:setVisible(true)
				item:unInitUI()
				item:initUI(itemData.type, itemData.value, itemData.size)
				item:setTouchEnabled(true)
				item:showIconEffect()
			else
				item:setVisible(false)
			end
		end
       
	end

	if rankData then
		self._textGuildName:setString(rankData:getGuild_name())
	else
		self._textGuildName:setString("")	
	end
	
	if data.rank_min ==  data.rank_max then
		self._textGuildName:setVisible(true)
		self._textRank:setVisible(false)	
		self:updateImageView("Image_rank_bk", {visible = true} )
	else
		self._textGuildName:setVisible(false)
		self._textRank:setVisible(true)
		self:updateImageView("Image_rank_bk", {visible = false} )

		local txt = Lang.get("activity_guild_sprint_rank",{minRank = data.rank_min,maxRank = data.rank_max})
		self._textRank:setString(txt)
	
	end
end

return ActivityGuildSprintItemCell
