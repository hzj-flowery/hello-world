local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupMineSweepTotalCell = class("PopupMineSweepTotalCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")
local MineReportBarNode = require("app.scene.view.mineCraft.MineReportBarNode")
local HeroConst = require("app.const.HeroConst")


function PopupMineSweepTotalCell:ctor(reportData, isTotalNode)
    self._reportData = reportData
	local resource = {
		file = Path.getCSB("PopupMineSweepTotalCell", "mineCraft"),
	}
    PopupMineSweepTotalCell.super.ctor(self, resource)
end

function PopupMineSweepTotalCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._armyBar1 = MineReportBarNode.new(self._bar1)
	self._armyBar2 = MineReportBarNode.new(self._bar2)

	self:_updateReportInfo()
end

function PopupMineSweepTotalCell:_updateReportInfo()
	local reportData = self._reportData

	local myBaseData = G_UserData:getBase()
	local heroId = myBaseData:getPlayerBaseId()
	local avatarId = myBaseData:getAvatar_base_id()
	local limit = 0
	if avatarId ~= 0 then 
		local avatarConfig = require("app.utils.data.AvatarDataHelper").getAvatarConfig(avatarId)
		if avatarConfig.limit == 1 then
			limit = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
		end
		heroId = avatarConfig.hero_id
	end
	self:_updatePlayerDetail(1, myBaseData:getName(), myBaseData:getOfficer_level(), heroId, limit)

	heroId = reportData:getBase_id()
	limit = 0
	if reportData:getAvatar_base_id() and reportData:getAvatar_base_id() > 0 then
		-- baseId = require("app.utils.data.AvatarDataHelper").getAvatarConfig(reportData:getAvatar_base_id()).hero_id
		local avatarConfig = require("app.utils.data.AvatarDataHelper").getAvatarConfig(reportData:getAvatar_base_id())
		if avatarConfig.limit == 1 then
			limit = HeroConst.HERO_LIMIT_RED_MAX_LEVEL
		end
		heroId = avatarConfig.hero_id
	end

	self:_updatePlayerDetail(2, reportData:getName(), reportData:getOfficer_level(), heroId, limit)
	local star = reportData:getWin_type()
	local myWin = true
	if star <= 0 then 
		myWin = false
	end

	local myArmy = reportData:getSelf_army()
	if reportData:isSelf_is_die() then 
		myArmy = 0
	end

	local tarArmy = reportData:getTar_army()
	if reportData:isTar_is_die() then 
		tarArmy = 0
	end

	self._armyBar1:updateUI(myArmy, reportData:getSelf_dec_army(), false, G_UserData:getMineCraftData():isSelfPrivilege())
	self._armyBar2:updateUI(tarArmy, reportData:getTar_dec_army(), true, reportData:isTar_is_privilege())
end

function PopupMineSweepTotalCell:_updatePlayerDetail(index, name, officerLevel, avatarId, limit)
	self["_playerIcon"..index]:updateUI(avatarId, nil, limit)
	self:updateLabel("_textName"..index, 
	{
		text =  name,
		color = Colors.getOfficialColor(officerLevel),
		outlineColor = Colors.getOfficialColorOutlineEx(officerLevel)
	})
end

function PopupMineSweepTotalCell:updateTotal(win, lose, selfDie, tarDie, selfArmy, tarArmy, selfRedArmy, tarRedArmy, selfInfame, tarInfame)
	self._textTotal:setVisible(true)
	self._textTotal:setString(Lang.get("mine_sweep_total",{count1 = win, count2 = lose}))
	if selfDie then
		self._playerIcon1:setIconMask(true)
		self._textDie1:setVisible(true)
		selfArmy = 0
	else
		self._playerIcon1:setIconMask(false)
		self._textDie1:setVisible(false)
	end
	if tarDie then
		self._playerIcon2:setIconMask(true)
		self._textDie2:setVisible(true)
		tarArmy = 0
	else
		self._playerIcon2:setIconMask(false)
		self._textDie2:setVisible(false)
	end
	self._armyBar1:updateUI(selfArmy, selfRedArmy, false, G_UserData:getMineCraftData():isSelfPrivilege(), selfInfame)
	self._armyBar2:updateUI(tarArmy, tarRedArmy, true, self._reportData:isTar_is_privilege(), tarInfame)
end


return PopupMineSweepTotalCell