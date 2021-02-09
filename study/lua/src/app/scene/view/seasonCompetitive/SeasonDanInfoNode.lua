-- @Author panhoa
-- @Date 8.16.2018
-- @Role 匹配所显示段位信息

local ViewBase = require("app.ui.ViewBase")
local SeasonDanInfoNode = class("SeasonDanInfoNode", ViewBase)
local SeasonSportConst = require("app.const.SeasonSportConst")
local SeasonSportHelper = require("app.scene.view.seasonSport.SeasonSportHelper")


function SeasonDanInfoNode:ctor()
	-- body
	self._ownPanel		= nil
	self._otherPanel	= nil
	self._imageOwnSword  = nil
	self._imageOwnTitle = nil
	self._imageOwnStar  = nil
	self._serverOwnName = nil
	self._playerOwnName = nil
	self._precedenceOwn = nil

	self._imageOtherSword= nil
	self._imageOtherTitle = nil
	self._imageOtherStar  = nil
	self._serverOtherName = nil
	self._playerOtherName = nil
	self._precedenceOther = nil

    local resource = {
		file = Path.getCSB("SeasonDanInfoNode", "seasonCompetitive"),
	}
	SeasonDanInfoNode.super.ctor(self, resource)
end

-- @Role
function SeasonDanInfoNode:onCreate()
end

-- @Role
function SeasonDanInfoNode:onEnter()
	self._precedenceOwn:setVisible(false)
	self._precedenceOther:setVisible(false)
end

-- @Role
function SeasonDanInfoNode:onExit()
end

-- @Role 	先后手
function SeasonDanInfoNode:updateOwnProir(bVisible)
	self._precedenceOwn:setVisible(bVisible)
end

-- @Role 	先后手
function SeasonDanInfoNode:updateOtherProir(bVisible)
	self._precedenceOther:setVisible(bVisible)
end

-- @Role	刷新当前段位信息
-- @Param	data
function SeasonDanInfoNode:updateUI(data)
	self._ownPanel:setVisible(data.isOwn)
	self._otherPanel:setVisible(not data.isOwn)

	if not data or rawget(data,"star") == nil then
		return
	end

	if rawget(data, "officialLevel") == nil or rawget(data,"star") == 0 then
		return
	end

	if data.isOwn then
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

return SeasonDanInfoNode 