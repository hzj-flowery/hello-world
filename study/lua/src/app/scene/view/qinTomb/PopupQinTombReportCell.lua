--秦皇陵战报
local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupQinTombReportCell = class("PopupQinTombReportCell", ListViewCellBase)
local Path = require("app.utils.Path")
local AudioConst = require("app.const.AudioConst")
local TextHelper = require("app.utils.TextHelper")

function PopupQinTombReportCell:ctor()
	self._scrollMap = nil	--底图
	self._topBar = nil		--顶部条

	local resource = {
		file = Path.getCSB("PopupQinTombReportCell", "qinTomb"),
		binding = {
		}
	}
	self:setName("PopupQinTombReportCell")
	PopupQinTombReportCell.super.ctor(self, resource)
end

function PopupQinTombReportCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

--[[
	message GraveReport{
	repeated GraveRoundReport report =1;
	optional uint32  report_time  =2;
	optional uint32  win_team =3;
	optional uint32  fail_team =4;
}
]]

function PopupQinTombReportCell:_isSelfAttack( reportList )
	-- body
	for i ,value in ipairs(reportList) do
		if value.attack.user_id == G_UserData:getBase():getId() then
			return true
		end
	end
	return false
end

function PopupQinTombReportCell:updateUI(report, index)
	-- body

	dump(report)
	local reportList = rawget(report, "report")
	local is_win = rawget(report, "is_win")
	local report_type = rawget(report , "report_type") or 1
	
	--战报类型，1进攻战报， 2防守战报
	if report_type == 1 then
		self._textReportResult:setString(Lang.get("qin_tomb_report1"))
	else
		self._textReportResult:setString(Lang.get("qin_tomb_report2"))
	end

	if report_type == 1 then
		if is_win then
			self._imageLeftResult:loadTexture(Path.getBattleFont("txt_com_battle_v05"))
			self._imageRightResult:loadTexture(Path.getBattleFont("txt_com_battle_f05"))
		else
			self._imageLeftResult:loadTexture(Path.getBattleFont("txt_com_battle_f05"))
			self._imageRightResult:loadTexture(Path.getBattleFont("txt_com_battle_v05"))
		end
	elseif report_type == 2 then
		if is_win then
			self._imageRightResult:loadTexture(Path.getBattleFont("txt_com_battle_v05"))
			self._imageLeftResult:loadTexture(Path.getBattleFont("txt_com_battle_f05"))
		else
			self._imageRightResult:loadTexture(Path.getBattleFont("txt_com_battle_f05"))
			self._imageLeftResult:loadTexture(Path.getBattleFont("txt_com_battle_v05"))
		end
	end

	
	for i, value in ipairs(reportList) do
		local attack = rawget(value,"attack") 
		local defense = rawget(value,"defense")
		local result = rawget(value,"result")
		
		self:updateHeroIcon(i,attack,result)
		if result == 1 then
			self:updateHeroIcon(i+3,defense,2)
		elseif result == 2 then
			self:updateHeroIcon(i+3,defense,1)
		elseif result == 0 then
			self:updateHeroIcon(i+3,defense,0)
		end

	end

	local leftTime = rawget(report, "report_time")
	if not leftTime then
		self._textTimeLeft:setVisible(false)
	else
		self._textTimeLeft:setVisible(true)
		self._textTimeLeft:setString(G_ServerTime:getPassTime(leftTime))
	end

end

function PopupQinTombReportCell:onEnter()

end

function PopupQinTombReportCell:onExit()

end

function PopupQinTombReportCell:updateHeroIcon(index, teamUserInfo, result)
	local nodePlayer = self["_nodePlayer"..index]
	if nodePlayer == nil then
		return
	end

	local heroIcon = nodePlayer:getSubNodeByName("FileNode_1")
	cc.bind(heroIcon, "CommonHeroIcon")
	local textGroup = nodePlayer:getSubNodeByName("Text_group")
	local textPower = nodePlayer:getSubNodeByName("Text_power")
	textGroup:setString(Lang.get("qin_tomb_report_guild1"))
	textPower:setString(Lang.get("qin_tomb_report_power1"))

	local frameNode = nodePlayer:getSubNodeByName("CommonHeadFrame")
	cc.bind(frameNode, "CommonHeadFrame")
	

	if result == 2 then
		nodePlayer:updateImageView("Image_head",{texture = Path.getTextBattle("txt_com_battle_win"),visible = true})
	end
	if result == 1 then
		nodePlayer:updateImageView("Image_head",{texture = Path.getTextBattle("txt_com_battle_lose"),visible = true})
	end
	if result == 0 then
		nodePlayer:updateImageView("Image_head",{texture = Path.getTextBattle("txt_com_battle_ping"),visible = true})
	end

	local heroName = nodePlayer:getSubNodeByName("Text_PlayerName")
	if teamUserInfo == nil then
		heroIcon:refreshToEmpty(true)
		heroName:setString(Lang.get("qin_tomb_empty"))
		return
	end

	local avatarBaseId,avatarTable = require("app.utils.UserDataHelper").convertAvatarId(teamUserInfo)
	heroIcon:updateIcon(avatarTable)
	frameNode:updateUI(teamUserInfo.head_frame_id,heroIcon:getScale())

	if teamUserInfo.office_level > 0 then
		heroName:setColor(Colors.getOfficialColor(teamUserInfo.office_level))
		require("yoka.utils.UIHelper").updateTextOfficialOutline(heroName, teamUserInfo.office_level)
	end
	
	heroName:setString(teamUserInfo.name)

	if teamUserInfo.guild_name ~= "" then
		textGroup:setString(Lang.get("qin_tomb_report_guild", {name = teamUserInfo.guild_name}))
	end
	
	local power = TextHelper.getAmountText( teamUserInfo.power )
	textPower:setString(Lang.get("qin_tomb_report_power", {name = power}))


end


return PopupQinTombReportCell
