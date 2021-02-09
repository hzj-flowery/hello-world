-- Author: hedili
-- Date:2018-04-19 14:10:18
-- Describle：秦皇陵角色
local ViewBase = require("app.ui.ViewBase")
local QinTombAvatar = class("QinTombAvatar", ViewBase)
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local QinTombHelper = import(".QinTombHelper")
local QinTombConst = require("app.const.QinTombConst")
local QinTombAvatarName = import(".QinTombAvatarName")
function QinTombAvatar:ctor(mapNode)
	--csb bind var name
	self._commonHeroAvatar = nil
	self._avatarName = nil
	self._avatarGuild = nil
	self._mapNode = mapNode --地图cocos资源，管理
    self._convertTable = nil
    self._flashTowards = 1

	self._playerNameNode = nil
	local resource = {
		file = Path.getCSB("QinTombAvatar", "qinTomb")
	}
	QinTombAvatar.super.ctor(self, resource)
end

-- Describle：
function QinTombAvatar:onCreate()
end

function QinTombAvatar:onExit()
	if self._flashObj then
		self._flashObj:finish()
		self._flashObj = nil
	end
end

function QinTombAvatar:updateUI(teamUser, teamId, teamLead)
	-- body
	self._userData = teamUser
	self._teamId = teamId
	if self._flashObj then
		self._flashObj:finish()
		self._flashObj = nil
	end
	local baseId, userTable = require("app.utils.UserDataHelper").convertAvatarId(teamUser)

	--这里如果一旦更新相同avatar， 底层会把avatar的动作设置成idle
	if self._convertTable then
		if self._convertTable.avatarBaseId ~= userTable.avatarBaseId then
			self._commonHeroAvatar:updateAvatar(userTable)
			self._convertTable = userTable
		end
	else
		self._convertTable = userTable
		self._commonHeroAvatar:updateAvatar(userTable)
	end

	--是否是队长
	local selfTeamId = G_UserData:getQinTomb():getSelfTeamId()
	--如果是自己队伍，并且不是队长，则显示跟战中
	if selfTeamId == teamId then
		self._followNode:removeAllChildren()
		if teamUser.user_id ~= teamLead then
		--	G_EffectGfxMgr:createPlayGfx(self._followNode, "effect_xianqinhuangling_genzhanzhong", nil, true)
		end
	end

	self._commonHeroAvatar:setScale(0.7)

	local color = QinTombHelper.getPlayerColor(teamUser.user_id, teamId)
	--
	self:updateLabel(
		"_avatarName",
		{
			text = teamUser.name,
			color = color
		}
	)

	self:updateLabel(
		"_avatarGuild",
		{
			text = teamUser.guild_name,
			color = color
		}
	)

	self._avatarName:enableOutline(cc.c3b(0x00, 0x00, 0x00), 1)
	self._avatarGuild:enableOutline(cc.c3b(0x00, 0x00, 0x00), 1)

	--if self._playerNameNode  == nil then
	--	local playerName = QinTombAvatarName.new()
	--	self._playerNameNode = playerName

	--	self._mapNode:addChild(playerName,100000)
	--	self._playerNameNode:setVisible(true)
	--	self._playerNameNode:updateUI(teamUser, teamId )
	--end
	self._commonHeroAvatar:showTitle(teamUser.title, self.__cname)  -- 显示称号
end

--角色颜色
function QinTombAvatar:updateColor(...)
	-- body

	local color = QinTombHelper.getPlayerColor(self._userData.user_id, self._teamId)
	--
	self:updateLabel(
		"_avatarName",
		{
			text = self._userData.name,
			color = color
		}
	)

	self:updateLabel(
		"_avatarGuild",
		{
			text = self._userData.guild_name,
			color = color
		}
	)

	self._avatarName:enableOutline(cc.c3b(0x00, 0x00, 0x00), 1)
	self._avatarGuild:enableOutline(cc.c3b(0x00, 0x00, 0x00), 1)
end

function QinTombAvatar:setAction(...)
	-- body
	self._commonHeroAvatar:setAction(...)
end

function QinTombAvatar:showShadow(...)
	-- body
	self._commonHeroAvatar:showShadow(...)
end

function QinTombAvatar:setAniTimeScale(...)
	-- body
	self._commonHeroAvatar:setAniTimeScale(...)
end

function QinTombAvatar:turnBack(...)
    self._commonHeroAvatar:turnBack(...)
end

function QinTombAvatar:playAttackEffect()
	G_EffectGfxMgr:createPlayGfx(self._panelTouch, "effect_shuangjian", nil, true)
end

--循环攻击
function QinTombAvatar:playLoopAttackAction()
	-- body
	local startDelay = math.random(1, 5)
	local endDelay = math.random(1, 10)

	local seq = cc.Sequence:create(
	 	cc.DelayTime:create(startDelay * 0.1),
	 	cc.CallFunc:create(
	 		function()
	 			if self._commonHeroAvatar:isAnimExit("skill1") then
	 				self:playAniAndSound()
	 			end
	 		end)
	)
	-- local rep = cc.RepeatForever:create(seq)
	self:stopAllActions()
	self:runAction(seq)

	logWarn(" QinTombAvatar:playLoopAttackAction runAction  " .. self._commonHeroAvatar:getBaseId() )

end

function QinTombAvatar:stopLoopAttackAction(...)
	-- body
	if self._flashObj then
		self._flashObj:finish()
		self._flashObj = nil
	end
	self:stopAllActions()

end

function QinTombAvatar:showPkEffect(hookPos, pkPos)
	-- body
	local offsetPosX = (hookPos.x - pkPos.x) / 2
	local offsetPosY = (hookPos.y - pkPos.y) / 2

	self._pkNode:setScale(0.5)
	self._pkNode:removeAllChildren()
	G_EffectGfxMgr:createPlayGfx(self._pkNode, "effect_shuangjian", nil, true)
	self._pkNode:setPosition(offsetPosX, offsetPosY + QinTombConst.TEAM_PK_EFFECT_HEIGHT)
end

function QinTombAvatar:setAvatarModelVisible(...)
	-- body
	self._commonHeroAvatar:setVisible(...)
end

function QinTombAvatar:setAvatarScaleX(scale)
	-- body
	if scale == 1.0 then
        self._commonHeroAvatar:setScaleX(1.0)
        self._flashTowards = 1
	elseif scale == -1.0 then
        self._commonHeroAvatar:turnBack()
        self._flashTowards = -1
	end
end

function QinTombAvatar:syncVisible(visilbe)
	-- body
	self:setVisible(visilbe)
end

function QinTombAvatar:releaseSelf(...)
end


function QinTombAvatar:setSoundEnable(visible)
	if self._flashObj then
		self._flashObj:setSoundEnable(visible)
	end
end

function QinTombAvatar:playAniAndSound()

	local function getAttackAction()
		--[[
		1.color=4、5、6的武将：hero id&001
		2.橙升红武将：91&hero id&001
		3.男主角：1002
		4.女主角：11002
		--]]
		if self._convertTable.limit == 1 then
			local retId = "91"..self._convertTable.covertId.."001"
			return tonumber(retId)
		else
			if self._convertTable.covertId < 100 then
				if self._convertTable.covertId < 10 then
					return 1001
				end
				if self._convertTable.covertId > 10 then
					return 11001
				end
			end
			local retId = self._convertTable.covertId.."001"
			return tonumber(retId)
		end
		
	end
 	local FlashPlayer = require("app.flash.FlashPlayer")
    local hero, shadow = self._commonHeroAvatar:getFlashEntity()
	local attackId = getAttackAction()
	local hero_skill_play = require("app.config.hero_skill_play")
	local skillData = hero_skill_play.get(attackId)
	if skillData then
		if self._flashObj then
			self._flashObj:finish()
			self._flashObj = nil
		end
		local ani = Path.getAttackerAction(skillData.atk_action)
		self._flashObj = FlashPlayer.new(hero, shadow, ani, self._flashTowards, self._commonHeroAvatar, true )
		self._flashObj:start()
	end

end

return QinTombAvatar
