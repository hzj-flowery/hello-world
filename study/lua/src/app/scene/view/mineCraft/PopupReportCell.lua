local ListViewCellBase = require("app.ui.ListViewCellBase")
local PopupReportCell = class("PopupReportCell", ListViewCellBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local TextHelper = require("app.utils.TextHelper")
local MineReportBarNode = require("app.scene.view.mineCraft.MineReportBarNode")
local HeroConst = require("app.const.HeroConst")

PopupReportCell.REPORT_TYPE_ATTACK = 1 	--进攻
PopupReportCell.REPORT_TYPE_DEF = 2		--防守

function PopupReportCell:ctor()
    self._leftNamePosX = 0
    self._rightNamePosX = 0
    
	local resource = {
		file = Path.getCSB("PopupReportCell", "mineCraft"),
	}
	PopupReportCell.super.ctor(self, resource)
end

function PopupReportCell:onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
	self._playerIcon2:setCallBack(handler(self, self._onPanelClick))
	self._playerIcon2:setTouchEnabled(true)
	self._armyBar1 = MineReportBarNode.new(self._bar1)
	self._armyBar2 = MineReportBarNode.new(self._bar2)
	self._imageState:ignoreContentAdaptWithSize(true)
    self._imageState2:ignoreContentAdaptWithSize(true)

	self._textTotal:setVisible(false)
	self._imageTotalBG:setVisible(false)
end

function PopupReportCell:updateUI(index, reportData)
	self._index = index
	self._reportData = reportData
	self:_updateReportInfo()    
end

function PopupReportCell:_updateReportInfo()
	local reportData = self._reportData

	local isMyAttack = true 
	if reportData:getReport_type() == PopupReportCell.REPORT_TYPE_DEF then
		isMyAttack = false
	end
	self:_updateBG(isMyAttack)

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
	self:_updateWin(myWin, reportData:isSelf_is_die(), reportData:isTar_is_die())
	self:_updateTime(reportData:getFight_time())

	local myArmy = reportData:getSelf_army()
	if reportData:isSelf_is_die() then 
		myArmy = 0
	end

	local tarArmy = reportData:getTar_army()
	if reportData:isTar_is_die() then 
		tarArmy = 0
	end

	self._armyBar1:updateUI(myArmy, reportData:getSelf_dec_army(), false, reportData:isSelf_is_privilege(), reportData:getSelf_infamy_add())
	self._armyBar2:updateUI(tarArmy, reportData:getTar_dec_army(), true, reportData:isTar_is_privilege(), reportData:getTar_infamy_add())

    self._imagePrivilegeLeft:setVisible(reportData:isSelf_is_privilege())
	self._imagePrivilegeRight:setVisible(reportData:isTar_is_privilege())
	

    if self._imagePrivilegeLeft:isVisible() then
        local x = self["_textName1"]:getPositionX()
        self._leftNamePosX = self._leftNamePosX == 0 and x or self._leftNamePosX
        self["_textName1"]:setPositionX(self._leftNamePosX + 30)
    else
        local x = self["_textName1"]:getPositionX()
        self._leftNamePosX = self._leftNamePosX == 0 and x or self._leftNamePosX
        self["_textName1"]:setPositionX(self._leftNamePosX)
    end
    if self._imagePrivilegeRight:isVisible() then
        local x = self["_textName2"]:getPositionX()
        self._rightNamePosX = self._rightNamePosX == 0 and x or self._rightNamePosX
        self["_textName2"]:setPositionX(self._rightNamePosX - 30)
    else
        local x = self["_textName2"]:getPositionX()
        self._rightNamePosX = self._rightNamePosX == 0 and x or self._rightNamePosX
        self["_textName2"]:setPositionX(self._rightNamePosX)
    end
end

function PopupReportCell:_updateBG(isMyAttack)
	if isMyAttack then 
		local bgPath = Path.getMineImage("img_mine_arena02")
		self._imageStateBG:loadTexture(bgPath)
		self._textRepType:setString(Lang.get("mine_rep_type_attack"))
	else
		local bgPath = Path.getMineImage("img_mine_arena01")
		self._imageStateBG:loadTexture(bgPath)
		self._textRepType:setString(Lang.get("mine_rep_type_def"))
	end
end

function PopupReportCell:_updateWin(myWin, myDie, tarDie)
	local pathWin = Path.getTextSignet("txt_battle02_win")
	local pathLose = Path.getTextSignet("txt_battle02_lose")
	local pathDie = Path.getTextSignet("img_zhenwang01")
	if myWin then 
		self._imageState:loadTexture(pathWin)
		self._imageState2:loadTexture(pathLose)
	else
		self._imageState2:loadTexture(pathWin)
		self._imageState:loadTexture(pathLose)
	end
	if myDie then 
		self._imageState:loadTexture(pathDie)
	end
	if tarDie then 
		self._imageState2:loadTexture(pathDie)
	end
end

function PopupReportCell:_updatePlayerDetail(index, name, officerLevel, avatarId, limit, frameId)
	self["_playerIcon"..index]:updateUI(avatarId, nil, limit)
	self["_playerIcon"..index]:updateHeadFrame(frameId)
	self:updateLabel("_textName"..index, 
	{
		text =  name,
		color = Colors.getOfficialColor(officerLevel),
		outlineColor = Colors.getOfficialColorOutlineEx(officerLevel),
    })
end

function PopupReportCell:_updateTime(fightTime)
	local timeDiff = G_ServerTime:getPassTime(fightTime)
	self._textTime:setString(timeDiff)
end

function PopupReportCell:_onPanelClick(sender)
	G_UserData:getBase():c2sGetUserBaseInfo(self._reportData:getUid())
end

return PopupReportCell
