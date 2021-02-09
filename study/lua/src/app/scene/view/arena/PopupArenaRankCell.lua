
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupArenaRankCell = class("PopupArenaRankCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ArenaHelper    = require("app.scene.view.arena.ArenaHelper")

function PopupArenaRankCell:ctor()
	self._btnLookUp 		= nil     --查看按钮
	self._resourceNode 		= nil 	  --根节点
	self._scrollView 		= nil     --
	self._textPlayerName 	= nil     --名称
	self._textPower			= nil	  --战力描述
	self._resInfo1			= nil	  --奖励资源1
	self._resInfo2		    = nil	  --奖励资源2
	self._imageRankbk		= nil 	  --排行榜图片
	self._commonHero1		= nil     --heroIcon
	self._rankBg = nil                --排行榜第一名底图
	self._rankValueBg = nil           --排行榜排名底图
	self._textRank = nil               --排行榜排名

	local resource = {
		file = Path.getCSB("PopupArenaRankCell", "arena"),

	}
	PopupArenaRankCell.super.ctor(self, resource)
end

function PopupArenaRankCell:onCreate()

	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

	self._btnLookUp:setString(Lang.get("arena_top_rank_cell_btn_txt"))
	self._btnLookUp:addClickEventListenerEx(handler(self, self._onButtonClick))
end


--
function PopupArenaRankCell:updateUI(index, cellValue)

	self:_updatePlayerInfo(index, cellValue)
end


--[[
	//竞技场
message ArenaToChallengeUser {
	required uint64 user_id = 1; //玩家ID
	required uint32 rank = 2; //排名
	required string name = 3; //玩家名字
	required uint32 base_id = 4;
	required uint32 power = 5; //战力
	optional uint32 avatar = 6; //
	repeated uint32 heros = 7;
}

]]
function PopupArenaRankCell:_updatePlayerInfo(index,playerData)
	self._playerData = playerData

	local TextHelper = require("app.utils.TextHelper")
	self._textPlayerName:setString(playerData.name)


	self:updateLabel("_textPlayerName",
	{
		text = playerData.name,
		--color = Colors.getOfficialColor(playerData.officer_level),
		--outlineColor = Colors.getOfficialColorOutline(playerData.officer_level)
	})

	self._textPower:setString(TextHelper.getAmountText(playerData.power))
	local heroList = playerData.heros


	local function updateAvatar( playerData, commHero )
		-- body
		local avatarBaseId, table = require("app.utils.UserDataHelper").convertAvatarId(playerData)
		commHero:updateIcon(table)

	end

	for i=1, 6 do
		local commHero = self._scrollView:getSubNodeByName("Common_hero"..i)
		commHero:setVisible(false)
	end


	for i, hero in ipairs(heroList) do
		if hero ~= 0 then
		
			local commHero = self._scrollView:getSubNodeByName("Common_hero"..i)
			cc.bind(commHero,"CommonHeroIcon")
			if hero < 100 then --baseId小于100
				updateAvatar(playerData, commHero )
			else
				commHero:updateUI(hero)
			end
		
			commHero:setVisible(true)
		end
	end
	local officelLevel = playerData.officer_level or 0
	self._textPlayerName:setColor(Colors.getOfficialColor(officelLevel))
	require("yoka.utils.UIHelper").updateTextOfficialOutline(self._textPlayerName, officelLevel)

    -- local nodeRank = self:getSubNodeByName("Node_rank")
	-- local textRank = ArenaHelper.updateArenaRank(nodeRank,playerData.rank)
	local rank = playerData.rank or 0
	if rank <= 3  and rank > 0 then
        self._rankBg:loadTexture(Path.getComplexRankUI("img_midsize_ranking0"..rank))
        self._rankValueBg:loadTexture(Path.getComplexRankUI("img_qizhi0"..rank))
		self._rankValueBg:setVisible(true)
		-- self._textRank:setVisible(false)
        self._textRank:setString(rank)
	else
        self._rankBg:loadTexture(Path.getComplexRankUI("img_midsize_ranking04"))
        -- self._rankValueBg:loadTexture(Path.getArenaUI("img_qizhi04"))
		self._rankValueBg:setVisible(false)
		self._textRank:setVisible(true)

		if rank == 0 then
			self._textRank:setString(Lang.get("arena_rank_zero"))
		else
			self._textRank:setString(rank)
		end

		-- self._textPlayerName:setPositionX(textRank:getPositionX() + textRank:getContentSize().width + 5)
    end
    
    if rank < 4 and rank > 0 then
        local ArenaConst    = require("app.const.ArenaConst")
		self._textRank:setColor(ArenaConst.RANK_COLOR[rank])
	else
		self._textRank:setColor(Colors.BRIGHT_BG_ONE)
    end

	local awardList = ArenaHelper.getAwardListByRank(rank)
	dump(awardList)
	for i, value in ipairs(awardList) do
		self["_resInfo"..i]:setVisible(true)
		self["_resInfo"..i]:updateUI(value.type,value.value,value.size)
        self["_resInfo"..i]:setTextColorToBTypeColor()
        self["_resInfo"..i]:setFontSize(20)
	end

end


function PopupArenaRankCell:_onButtonClick(sender)
	logWarn("PopupArenaRankCell:_onButtonClick")
	local curSelectedPos = sender:getTag()

	if self._playerData.user_id == G_UserData:getBase():getId() then
		return
	end

	self:dispatchCustomCallback(curSelectedPos)
end


return PopupArenaRankCell
