-- @Author panhoa
-- @Date 10.17.2018
-- @Role

local ViewBase = require("app.ui.ViewBase")
local MatchSuccessPlayerInfoPanel = class("MatchSuccessPlayerInfoPanel", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function MatchSuccessPlayerInfoPanel:ctor()
	-- body
	self._ownPanel		= nil
    self._otherPanel	= nil
    self._fileNodeIconOwn = nil
    self._fileNodeIconOther = nil
	self._imageOwnSword  = nil
	self._imageOwnTitle = nil
	self._imageOwnStar  = nil
	self._serverOwnName = nil
	self._playerOwnName = nil

	self._imageOtherSword= nil
	self._imageOtherTitle = nil
	self._imageOtherStar  = nil
	self._serverOtherName = nil
	self._playerOtherName = nil

    local resource = {
		file = Path.getCSB("MatchSuccessPlayerInfoPanel", "seasonSport"),
	}
	MatchSuccessPlayerInfoPanel.super.ctor(self, resource)
end

-- @Role
function MatchSuccessPlayerInfoPanel:onCreate()
	self._ownPanel:setVisible(false)
	self._otherPanel:setVisible(false)
end

-- @Role
function MatchSuccessPlayerInfoPanel:onEnter()
end

-- @Role
function MatchSuccessPlayerInfoPanel:onExit()
end

function MatchSuccessPlayerInfoPanel:setName(type, nameStr)
	if type == 1 then
		self._ownPanel:setName(nameStr)
	else
		self._otherPanel:setName(nameStr)
	end
end

-- @Role	刷新当前段位信息
-- @Param	data
function MatchSuccessPlayerInfoPanel:updateUI(state)
	local data = {}
	if state == 1 then
		data = G_UserData:getSeasonSport():getOwn_DanInfo()
	elseif state == 2 then
		data = G_UserData:getSeasonSport():getOther_DanInfo()
	end
	self._ownPanel:setVisible(data.isOwn)
	self._otherPanel:setVisible(not data.isOwn)

	if not data or rawget(data,"star") == nil then
		return
	end

	if rawget(data, "officialLevel") == nil or rawget(data,"star") == 0 then
		return
	end

    if data.isOwn then
		local avatarData = {
			baseId = G_UserData:getHero():getRoleBaseId(),
			avatarBaseId = G_UserData:getBase():getAvatar_base_id(),
			covertId = data.baseId,
			isHasAvatar = G_UserData:getBase():getAvatar_base_id() and G_UserData:getBase():getAvatar_base_id() > 0 
		}
		if avatarData.covertId ~= nil and avatarData.covertId ~= 0 then
			self._fileNodeIconOwn:updateIcon(avatarData)
			self._fileNodeIconOwn:setIconMask(false)
		end

		self._commonFrameOwn:updateUI(G_UserData:getBase():getHead_frame_id(),self._fileNodeIconOwn:getScale())
		local ownColor   =   Colors.getOfficialColor(data.officialLevel)
		local ownStarInfo = SeasonSportHelper.getDanInfoByStar(data.star)
		local ownDan = tonumber(SeasonSportHelper.getDanInfoByStar(data.star).rank_1)
		self._imageOwnSword:setTexture(Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[ownDan]))
		self._imageOwnTitle:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[ownDan]))
		self._imageOwnStar:loadTexture(Path.getSeasonStar(ownStarInfo.name_pic))

		if string.match(data.sid, "(%a+%d+)") ~= nil then
			local nameStr = (string.match(data.sid, "(%a+%d+)") ..".")
			self._serverOwnName:setString(nameStr)
		else
			self._serverOwnName:setString(data.sid)
		end 
		local targetPosX = (self._serverOwnName:getPositionX() + self._serverOwnName:getContentSize().width 
															   + SeasonSportConst.POSITION_PLAYERNAME_OFFSETX/2)
		self._playerOwnName:setPositionX(targetPosX)
		self._playerOwnName:setString(data.name)
		self._playerOwnName:setColor(ownColor)
	else
		local avatarData = {
			baseId = data.baseId,
			avatarBaseId = data.avatarId,
			covertId = require("app.utils.UserDataHelper").convertToBaseIdByAvatarBaseId(data.avatarId, data.baseId),
			isHasAvatar = data.avatarId and data.avatarId > 0,
		}
		if avatarData.covertId ~= nil and avatarData.covertId ~= 0 then
			self._fileNodeIconOther:updateIcon(avatarData)
			self._fileNodeIconOther:setIconMask(false)
		end

		self._commonFrameOther:updateUI(data.head_frame_id,self._fileNodeIconOther:getScale())
		local otherColor =   Colors.getOfficialColor(data.officialLevel)
		local otherDan = tonumber(SeasonSportHelper.getDanInfoByStar(data.star).rank_1)
		local otherStarInfo = SeasonSportHelper.getDanInfoByStar(data.star)

		self._imageOtherSword:setTexture(Path.getSeasonDan(SeasonSportConst.SEASON_DANFLAG[otherDan]))
		self._imageOtherTitle:loadTexture(Path.getSeasonStar(SeasonSportConst.SEASON_DANNAME[otherDan]))
		self._imageOtherStar:loadTexture(Path.getSeasonStar(otherStarInfo.name_pic))
		self._playerOtherName:setString(data.name)
		self._playerOtherName:setColor(otherColor)

		if string.match(data.sid, "(%a+%d+)") ~= nil then
			local nameStr = (string.match(data.sid, "(%a+%d+)") ..".")
			self._serverOtherName:setString(nameStr)
		else
			self._serverOtherName:setString(data.sid)
		end
		local targetPosX = (self._playerOtherName:getPositionX() - self._playerOtherName:getContentSize().width
																 - SeasonSportConst.POSITION_PLAYERNAME_OFFSETX/2)
		self._serverOtherName:setPositionX(targetPosX)
	end
end


return MatchSuccessPlayerInfoPanel