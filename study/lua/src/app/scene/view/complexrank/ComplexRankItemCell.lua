--
-- Author: hedl
-- Date: 2017-9-5 13:50:59
--
local HeadFrameItemData = require("app.data.HeadFrameItemData")

local ListViewCellBase = require("app.ui.ListViewCellBase")
local ComplexRankItemCell = class("ComplexRankItemCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local TextHelper = require("app.utils.TextHelper")
local ComplexRankConst = require("app.const.ComplexRankConst")

function ComplexRankItemCell:ctor()
	self._fileNodePlayerIcon = nil
	self._fileNodePlayer = nil
	self._textGuildName = nil
	local resource = {
		file = Path.getCSB("ComplexRankItemCell", "complexrank"),
		binding = {
			_resourceNode = {
				events = {{event = "touch", method = "_onPanelClick"}}
			}
		}
	}
	ComplexRankItemCell.super.ctor(self, resource)
end

function ComplexRankItemCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self:getSubNodeByName("Node_power"):setVisible(false)
	self:getSubNodeByName("Node_level"):setVisible(false)
	self:getSubNodeByName("Node_normal"):setVisible(false)
	self:getSubNodeByName("Node_group"):setVisible(false)
	self:getSubNodeByName("Node_star"):setVisible(false)
	self:getSubNodeByName("Node_tower"):setVisible(false)
end

--[[
	message UserPowerRankInfo {
	required uint64 user_id = 1;
	optional string name = 2;	//名字
	optional uint32 level = 3;
	optional uint32 base_id = 4;
	optional uint32 rank_lv = 5;
	optional uint32 power = 6;	//战力
	optional uint32 rank = 7;	//排名
	optional string guild = 8;	//工会
}
]]
function ComplexRankItemCell:updateUI(index, data, rankType)
	self._cellValue = data
	if data == nil then
		return
	end
	-- dump(data)
	--[[
	self._fileNodePlayerIcon:unInitUI()
	self._fileNodePlayerIcon:initUI(TypeConvertHelper.TYPE_HERO, data.baseId)
	self._fileNodePlayerIcon:setVisible(true)
]]
	if rankType ~= ComplexRankConst.USER_GUILD_RANK then
		self._fileNodePlayerIcon:updateIcon(data.playerHeadInfo)
		self._commonHeadFrame:updateUI(data.head_frame_id,self._fileNodePlayerIcon:getScale())
	end

	self:updateRankType(rankType, data)
	local node_title = self:getSubNodeByName("Node_title")
	if data.titleId and data.titleId > 0 then
		UserDataHelper.appendNodeTitle(node_title, data.titleId, self.__cname)
		node_title:setVisible(true)
		local posx = self._fileNodePlayer:getPositionX()
		local width = self._fileNodePlayer:getWidth()
		local PopupHonorTitleHelper = require("app.scene.view.playerDetail.PopupHonorTitleHelper")
		local size = PopupHonorTitleHelper.getTitleSize(data.titleId)
		node_title:setPositionX(posx + width + size.width * 0.5 - 15)
	else
		node_title:setVisible(false)
	end

	if data.rank <= 3 and data.rank > 0 then
		self:updateImageView("Image_bk", {visible = true, texture = Path.getComplexRankUI("img_large_ranking0" .. data.rank)})
		self:updateImageView("Image_bk_bg", {visible = true})
		self:updateImageView("Image_rank_bk", Path.getComplexRankUI("icon_ranking0" .. data.rank))
		self:updateImageView("Image_Rank_num", {visible = true, texture = Path.getComplexRankUI("txt_ranking0" .. data.rank)})
		-- self:updateLabel("Text_rank_num", {visible = false})
		self._rankNum:setVisible(false)
	else
		self:updateImageView("Image_Rank_num", {visible = false})
		self._rankNum:setVisible(true)
		self._rankNum:setString(data.rank)
		-- self:updateLabel("Text_rank_num", {visible = true, text = data.rank})
		self:updateImageView("Image_rank_bk", Path.getComplexRankUI("icon_ranking04"))

		self:updateImageView("Image_bk_bg", {visible = false})

		if data.rank >= 4 and data.rank % 2 == 1 then
			--Path.getComplexRankUI("img_ranking05")
			self:updateImageView("Image_bk", {visible = true, texture = Path.getCommonRankUI("img_com_board_list01a") })
		elseif data.rank >= 4 and data.rank % 2 == 0 then
			self:updateImageView("Image_bk", {visible = true, texture = Path.getCommonRankUI("img_com_board_list01b")})
		end
	end
end

function ComplexRankItemCell:updateRankType(rankType, data)
	if rankType == ComplexRankConst.USER_GUILD_RANK then
		--self._fileNodePlayerIcon:loadIcon(Path.getCommonIcon("guild",data.guildIconId))
		local node = self:getSubNodeByName("Node_group")
		node:setVisible(true)
		node:updateLabel("Text_guildName", data.guildName)
		node:updateLabel("Text_guild_num", data.memberCount)
		node:updateLabel(
			"Text_guild_player",
			{
				text = data.leaderName,
				color = Colors.getOfficialColor(data.leaderOfficialLv),
				outlineColor = Colors.getOfficialColorOutlineEx(data.leaderOfficialLv),
			}
		)

		local node = self:getSubNodeByName("Node_level")
		node:setVisible(true)
		node:updateLabel("Text_bmp_text", data.level)
		self._fileNodePlayerIcon:setVisible(false)
		self._commonHeadFrame:setVisible(false)
	else
		local node = self:getSubNodeByName("Node_normal")
		self._fileNodePlayer:updateUI(data.name, data.officialLv)
		self._fileNodePlayer:setFontSize(22)
		node:updateLabel("Text_guildName", data.guildName)
		node:setVisible(true)
	end

	if rankType == ComplexRankConst.STAGE_STAR_RANK or rankType == ComplexRankConst.ELITE_STAR_RANK then
		local node = self:getSubNodeByName("Node_star")
		node:setVisible(true)
		node:updateLabel("Text_bmp_text", TextHelper.getAmountText(data.star))
		return
	end

	if rankType == ComplexRankConst.TOWER_STAR_RANK then
		local node = self:getSubNodeByName("Node_tower")
		node:setVisible(true)
		node:updateLabel("Text_bmp_text", TextHelper.getAmountText(data.star))
		return
	end

	if rankType == ComplexRankConst.USER_POEWR_RANK then
		local node = self:getSubNodeByName("Node_power")
		node:setVisible(true)
		node:updateLabel("Text_bmp_text", TextHelper.getAmountText(data.power))
		return
	end

	if rankType == ComplexRankConst.USER_LEVEL_RANK then
		local node = self:getSubNodeByName("Node_level")
		node:setVisible(true)
		node:updateLabel("Text_bmp_text", data.level)
		return
	end

	if rankType == ComplexRankConst.USER_ARENA_RANK then
		local node = self:getSubNodeByName("Node_power")
		node:setVisible(true)
		node:updateLabel("Text_bmp_text", TextHelper.getAmountText(data.power))
		return
	end

	if rankType == ComplexRankConst.ACTIVE_PHOTO_RANK then
		local node = self:getSubNodeByName("Node_power")
		node:setVisible(true)
		node:updateLabel("Image_name",Lang.get("complex_rank_arrage_des5"))
		node:updateLabel("Text_bmp_text", data.photo_count)
	end

	if rankType == ComplexRankConst.AVATAR_PHOTO_RANK then
		local node = self:getSubNodeByName("Node_power")
		node:setVisible(true)
		node:updateLabel("Image_name",Lang.get("complex_rank_arrage_des5"))
		node:updateLabel("Text_bmp_text", data.avaterNum)
	end
end

function ComplexRankItemCell:_onPanelClick(iconNameNode)
	dump(iconNameNode)
	local curSelectedPos = self:getTag()
	logWarn(" ComplexRankItemCell:_onBtnClick  " .. curSelectedPos)
	--点击自己则无效

	if self._cellValue == nil then
		return
	end

	if self._cellValue.userId == G_UserData:getBase():getId() then
		return
	end
	self:dispatchCustomCallback(curSelectedPos)
end

return ComplexRankItemCell
