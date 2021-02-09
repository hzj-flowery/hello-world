
-- Author: hedili
-- Date:2018-04-19 14:10:17
-- Describle：

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupRunningManResultCell = class("PopupRunningManResultCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

local UserDataHelper = require("app.utils.UserDataHelper")

local RANK_IMAGE_BK = {
	[1] = "img_runway_concord_red",
	[2] = "img_runway_concord_orange",
	[3] = "img_runway_concord_purple",
	--[4] = "img_runway_concord_last",
	--[5] = "img_runway_concord_last",
}

local RANK_OUTLINE_COLOR = {
	[1] =  cc.c3b(0xbe, 0x00, 0x00),   
	[2] =  cc.c3b(0xbe, 0x59, 0x00),   
	[3] =  cc.c3b(0xa7, 0x00, 0xd1),
	[4] =  cc.c3b(0x00, 0x00, 0x00),
	[5] =  cc.c3b(0x00, 0x00, 0x00),   
}
function PopupRunningManResultCell:ctor(rank)

	--csb bind var name
	self._cellRank = rank
	self._commonBuy = nil  --CommonButtonHighLight
	self._commonIcon = nil  --CommonIconTemplate
	self._textDesc1 = nil  --Text
	self._textDesc2 = nil  --Text
	self._textDesc3 = nil  --Text
	self._textDesc3_0 = nil  --Text
	self._textDesc4 = nil  --Text
	self._textPlayerName = nil  --Text
	self._imageTake = nil --Image

	local resource = {
		file = Path.getCSB("PopupRunningManResultCell", "runningMan"),
		binding = {
			
		},
	}

	
	PopupRunningManResultCell.super.ctor(self, resource)
end

function PopupRunningManResultCell:onCreate()
	self:_updateRank(self._cellRank)
end


function PopupRunningManResultCell:playAnimation()
	-- body
	local effectName = ""
	G_EffectGfxMgr:applySingleGfx(self, "smoving_saipao_jifenban", function() 
		
	end , nil, nil)

end


function PopupRunningManResultCell:getCellHeight( ... )
	-- body
	return self._resourceNode:getContentSize().height -3 
end
function PopupRunningManResultCell:_updateRank( rank )
	-- body
	rank = rank or 0
	if rank <= 3 and rank > 0 then
		self:updateImageView("_imageBk", {visible = true, texture = Path.getRunningMan(RANK_IMAGE_BK[rank])} )
		self:updateImageView("Image_rank_bk", Path.getComplexRankUI("icon_ranking0"..rank))
		self:updateImageView("Image_Rank_num", {visible =true, texture = Path.getComplexRankUI("txt_ranking0"..rank) })
		self:updateLabel("Text_rank_num", {visible = false})

		self._textPlayerName:enableOutline(RANK_OUTLINE_COLOR[self._cellRank], 2)
		self._textDesc1:enableOutline(RANK_OUTLINE_COLOR[self._cellRank], 2)
		self._textDesc2:enableOutline(RANK_OUTLINE_COLOR[self._cellRank], 2)
	else
		self:updateImageView("Image_rank_bk", {visible = false})
		self:updateLabel("Text_rank_num", {visible = true, text = rank })
		self._imageBk:setVisible(false)

		self._textPlayerName:enableOutline(RANK_OUTLINE_COLOR[self._cellRank], 1)
		self._textDesc1:enableOutline(RANK_OUTLINE_COLOR[self._cellRank], 1)
		self._textDesc2:enableOutline(RANK_OUTLINE_COLOR[self._cellRank], 1)
	end

end
--[[
	message PlayHorseHero {
	optional uint32 hero_id = 1;		// 英雄id
	optional uint32 hero_win_rate = 2;	// 英雄胜率
	optional uint32 hero_bet_rate = 3;	// 英雄投注率
	optional uint32 hero_odds = 4; // 英雄赔率
}
]]

function PopupRunningManResultCell:_procPlayerIcon( heroData )
	local isPlayer = heroData.isPlayer
	if isPlayer == nil or isPlayer == 0 then
		return
	end
	local simpleUser = heroData.user

	--dump(heroData)
	self:updateLabel("_textPlayerName",
	{
		text = simpleUser.name,
		color = Colors.getOfficialColor(simpleUser.office_level),
		outlineColor = Colors.getOfficialColorOutline(simpleUser.office_level)
	})
	
	local baseId,avatarTable = UserDataHelper.convertAvatarId(simpleUser)
	--self._commonIcon:unInitUI()
	--self._commonIcon:initUI(TypeConvertHelper.TYPE_HERO, baseId)
	--local iconTemplate = self._commonIcon:getIconTemplate()
	--iconTemplate:updateIcon(avatarTable)
	--dump(avatarTable)
	self._commonIcon:updateIcon(avatarTable, nil, simpleUser.head_frame_id)
	
	-- body
end


function PopupRunningManResultCell:_procHeroIcon( heroData )
	-- body
	local typeHeroInfo = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO,heroData.heroId)
	--self._commonIcon:unInitUI()
	--self._commonIcon:initUI(TypeConvertHelper.TYPE_HERO, heroData.heroId)
	--local simpleUser = heroData.user
	--dump(heroData)
	--local baseId,avatarTable = UserDataHelper.convertAvatarId(simpleUser)
	--dump(avatarTable)
	self._commonIcon:updateUI(heroData.heroId);

	self:updateLabel("_textPlayerName",
	{
		text = typeHeroInfo.name,
		color = typeHeroInfo.icon_color,
		outlineColor = typeHeroInfo.icon_color_outline,
	})
end

function PopupRunningManResultCell:updateUI(rankData)
	local heroId = rankData.heroId
	local time = rankData.time
	local heroOdds = rankData.heroOdds

	if rankData.isPlayer == 1 then
		self:_procPlayerIcon(rankData)
	else
		self:_procHeroIcon(rankData)
	end

	--self._commonHeadFrame:updateUI(rankData.user.head_frame_id,self._commonIcon:getScale())
	self._textDesc1:setString(time)

	if math.floor(heroOdds) >= heroOdds then
		self._textDesc2:setString(heroOdds.."") --赔率
	else
		self._textDesc2:setString(heroOdds) --赔率
	end

end





return PopupRunningManResultCell