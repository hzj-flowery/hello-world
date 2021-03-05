
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupArenaReportCell = class("PopupArenaReportCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")

function PopupArenaReportCell:ctor()
	self._btnLookUp 		= nil     --查看按钮
	self._resourceNode 		= nil 	  --根节点
	self._scrollView 		= nil     --heroIcon
	self._textPlayerName 	= nil     --名称
	self._textPower			= nil	  --战力描述
	self._resInfo1			= nil	  --奖励资源1
	self._resInfo2		    = nil	  --奖励资源2
	self._imageRankbk		= nil 	  --排行榜图片
	self._commonPlayerIcon	= nil 	  --玩家头像
	self._nodeWinLose		= nil 	  --胜利失败
	self._rankNode = nil
	self._bgImage = nil
	self._index = nil
	local resource = {
		file = Path.getCSB("PopupArenaReportCell", "arena"),
	}
	PopupArenaReportCell.super.ctor(self, resource)
end

function PopupArenaReportCell:onCreate()

	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)

end


--
function PopupArenaReportCell:updateUI(index,cellValue)
	self._index = index
	self._reportData = cellValue
	self:_updateReportInfo(cellValue)
end

--[[
	message ArenaReport {
	required uint32 change_rank = 1; //改变排名相对于自己
	required uint64 report_id = 2; //战报ID
	optional uint32 base_id = 3; //对方的base
	optional uint32 level = 4; //对方的等級
	optional uint32 fight_time = 5;//战斗时间
	optional string name = 6;//对方的名字
	required uint64 uid = 7; //玩家自己id
	required bool win = 8; //true 赢 false 输
	optional uint32 num = 9;//打了几次
	optional uint32 win_cnt = 10;//赢了几次
	--officer_level
}
]]
function PopupArenaReportCell:_updateReportInfo(reportInfo)
	local srcRank = 0
	local dstRank = 0
	if reportInfo == nil then
		return
	end
	local showBg = self._index % 2 == 0
	if showBg then
		self._bgImage:loadTexture(Path.getUICommon("img_com_board_list01a"))
		self._bgImage:setScale9Enabled(true)
		self._bgImage:setCapInsets(cc.rect(1,1,1,1))
	else
		self._bgImage:loadTexture(Path.getUICommon("img_com_board_list01b"))
		self._bgImage:setScale9Enabled(true)
		self._bgImage:setCapInsets(cc.rect(1,1,1,1))
	end

	--self._textPlayerName:setString(reportInfo.name)


	self:updateLabel("_textPlayerName",
	{
		text = reportInfo.name,
		color = Colors.getOfficialColor(reportInfo.officer_level),
		outlineColor = Colors.getOfficialColorOutlineEx(reportInfo.officer_level)
	})


	-- self._commonPlayerIcon:setLevel(reportInfo.level)
	self._textPower:setString(TextHelper.getAmountText(reportInfo.power))

	local avatarBaseId, table = require("app.utils.UserDataHelper").convertAvatarId(reportInfo)
	self._commonPlayerIcon:updateIcon(table)
	
	self._commonHeadFrame:updateUI(reportInfo.head_frame_id,self._commonPlayerIcon:getScale())
	self._commonHeadFrame:setLevel(reportInfo.level)
	local reqBatNum = rawget( reportInfo, "num") or 0
	local totalNum = rawget( reportInfo, "battle_num") or 0 -- 实际打了几次
	local winNum = rawget( reportInfo, "win_cnt") or 0

	local isWin = false
	--单次
	if reqBatNum == 1 then
		isWin = winNum > 0
		if isWin then
			self._nodeWinLose:getSubNodeByName("Image_win"):setVisible(true)
			self._nodeWinLose:getSubNodeByName("Image_lose"):setVisible(false)
			self._nodeWinLose:getSubNodeByName("Label_win"):setVisible(false)
		else
			self._nodeWinLose:getSubNodeByName("Image_win"):setVisible(false)
			self._nodeWinLose:getSubNodeByName("Image_lose"):setVisible(true)
			self._nodeWinLose:getSubNodeByName("Label_win"):setVisible(false)
		end
		self._textBattleDesc:setString(" ")
		self._rankNode:setPositionY(58)
	else
		local loseNum = totalNum - winNum
		self._textBattleDesc:setString(Lang.get("arena_report_battle_num", {num = reqBatNum}) )
		self._rankNode:setPositionY(64)

		self._nodeWinLose:getSubNodeByName("Image_win"):setVisible(false)
		self._nodeWinLose:getSubNodeByName("Image_lose"):setVisible(false)
		self._nodeWinLose:getSubNodeByName("Label_win"):setVisible(true)
		self._nodeWinLose:updateLabel("Label_win", {text = winNum})
		self._nodeWinLose:updateLabel("Label_lose", {text = loseNum})
		if loseNum < winNum then
			isWin = true
		end
	end

	self._rankNode:getSubNodeByName("Image_arrow_up"):setVisible(false)
	self._rankNode:getSubNodeByName("Image_arrow_down"):setVisible(false)
	self._textRankDesc:setString(Lang.get("arena_pklog_nochange"))

	self._textRank:setVisible(false)
	local change_rank = reportInfo.change_rank or 0
	if change_rank > 0 then
		self._textRankDesc:setString(Lang.get("arena_pklog_desc"))
		self._textRank:setString(change_rank)
		self._textRank:setVisible(true)
		if isWin then
			self._rankNode:getSubNodeByName("Image_arrow_up"):setVisible(true)
		else
			self._rankNode:getSubNodeByName("Image_arrow_down"):setVisible(true)
		end
	end


	-- local size = self._resourceNode:getContentSize()
	-- self._rankNode:setPositionY(reqBatNum == 1 and  size.height * 0.5 or 55.74 )
	-- if change_rank > 0 then
	-- 	self._rankNode:setPositionX(463.63)
	-- else
	-- 	self._rankNode:setPositionX(495.63)
	-- end
end


--是否为玩家自己
function PopupArenaReportCell:_isSelf()

	if self._reportData.uid == G_UserData:getBase():getId() then
		return true
	end

	return false
end
function PopupArenaReportCell:_onButtonClick(sender)
	logWarn("PopupArenaReportCell:_onButtonClick")
	local curSelectedPos = sender:getTag()
	--dump(curSelectedPos)
	self:dispatchCustomCallback(curSelectedPos)
end


return PopupArenaReportCell
