--竞技场巅峰对决cell

local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupArenaPeekCell = class("PopupArenaPeekCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")

local RANK_IMG_OFFSET  = 6--123名图片的间距

function PopupArenaPeekCell:ctor()
	self._btnLookUp 		= nil     --查看按钮
	self._nodePlayer1		= nil	  --玩家节点1
	self._nodePlayer2 		= nil	  --玩家节点2
	self._imageRank = nil--123名图片
	self._textRankDesc = nil
	local resource = {
		file = Path.getCSB("PopupArenaPeekCell", "arena"),

	}
	PopupArenaPeekCell.super.ctor(self, resource)
end

function PopupArenaPeekCell:onCreate()
	self._btnLookUp:setString(Lang.get("arena_top_rank_cell_btn_txt"))
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._btnLookUp:addClickEventListenerEx(handler(self,self._onButtonClick))
end


--

--[[
	//武将
message Hero {
	optional uint64 id = 1; //唯一ID
	optional uint32 base_id = 2; //静态表ID
	optional uint32 level = 3; //等级
	optional uint32 exp = 4; //经验
	optional uint32 history_gold = 5; //历史消耗银两
	optional uint32 quality = 6;//品质
	optional uint32 rank_lv = 7; //突破等级
	repeated uint32 association = 8; //羁绊
}
]]
function PopupArenaPeekCell:updateUI(index,cellValue)
	if cellValue == nil then
		return
	end
	local attack = cellValue.attack -- BattleUser
	local defense = cellValue.defense -- BattleUser






	self._arenaBattle = cellValue

	self:_updatePlayerInfo(self._nodePlayer1,self._playerName1,attack)
	self:_updatePlayerInfo(self._nodePlayer2,self._playerName2,defense)

	-- dump(attack.user.name)

	self:updateLabel("_textRankDesc",
	{
		text = Lang.get("arena_peek_rank_change", {
			rank2 = tostring(cellValue.defense_rank),
			})
	})

	if cellValue.defense_rank <= 3 then
		local desContentSize = self._textRankDesc:getContentSize()

		self._imageRankValue:setVisible(true)
		self._textRankValue:setVisible(false)
		self._imageRank:loadTexture(Path.getComplexRankUI("icon_ranking0"..cellValue.defense_rank))
		self._imageRankValue:loadTexture(Path.getComplexRankUI("txt_ranking0"..cellValue.defense_rank))
		-- self._imageRank:setPositionX(desContentSize.width + RANK_IMG_OFFSET)
	else
		self._imageRankValue:setVisible(false)
		self._textRankValue:setVisible(true)
		self._imageRank:loadTexture(Path.getComplexRankUI("icon_ranking04"))
		self._textRankValue:setString(cellValue.defense_rank or "")
	end

	local leftTime = rawget(cellValue, "time")
	if not leftTime then
		self._fightTime:setVisible(false)
	else
		self._fightTime:setVisible(true)
		self._fightTime:setString(G_ServerTime:getPassTime(leftTime))
	end



end

function PopupArenaPeekCell:_updatePlayerInfo(nodePlayer,labelName,battleUser)


	local scrollView = nodePlayer:getSubNodeByName("Scroll_View")
	local commonHeroArr = scrollView:getChildren()
	--TODO
	--scrollView需要把位置重置

	local function updateAvatar( battleUser, commHero, hero )
		-- body
		local avatarBaseId, table = require("app.utils.UserDataHelper").convertAvatarId(battleUser.user)

		if avatarBaseId > 0 then
			commHero:updateIcon(table)
		else
			commHero:updateUI(hero.base_id)
		end
	end
	for index, commHero in ipairs(commonHeroArr) do
		local hero = battleUser.heros[index]
		cc.bind(commHero,"CommonHeroIcon")
		commHero:setVisible(true)
		if index == 1 then
			updateAvatar(battleUser, commHero, hero)
		else
			if hero then
				commHero:updateUI(hero.base_id)
			else
				commHero:refreshToEmpty()
			end
		end
	end
	local srcollView = nodePlayer:getSubNodeByName("Scroll_View")
	srcollView:setSwallowTouches(false)
	srcollView:setScrollBarEnabled(false)
	local officalInfo = G_UserData:getBase():getOfficialInfo()
	-- local nameWidget = nodePlayer:updateLabel("Text_PlayerName",
	-- {
	-- 	text = battleUser.user.name,
	-- })
    labelName:setString(battleUser.user.name)


	nodePlayer:updateLabel("Text_power",
	{
		text = TextHelper.getAmountText(battleUser.user.power),
	})
	-- local imagePower = nodePlayer:getSubNodeByName("Image_power")
	-- imagePower:setPositionX(nameWidget:getPositionX() + nameWidget:getContentSize().width + 10)
end

function PopupArenaPeekCell:_onButtonClick(sender)
	logWarn("PopupArenaPeekCell:_onButtonClick")
	--local curSelectedPos = sender:getTag()
	--dump(curSelectedPos)
	self:dispatchCustomCallback(self._arenaBattle.report_id)
end


return PopupArenaPeekCell
