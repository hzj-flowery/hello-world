


local ViewBase = require("app.ui.ViewBase")
local GuildWarPointNameNode = class("GuildWarPointNameNode")
local GuildWarConst = require("app.const.GuildWarConst")
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")

function GuildWarPointNameNode:ctor(target)
	self._target = target
	self._textName = ccui.Helper:seekNodeByName(self._target, "TextName") 
	self._textGuild = ccui.Helper:seekNodeByName(self._target, "TextGuild") 
end


function GuildWarPointNameNode:updateInfo(cityId,config)

	if config.point_type == GuildWarConst.POINT_TYPE_CRYSTAL then
		local user = self:_getDefenderName(cityId)
		if user then
			self._textName:setString(config.name)
			self._textGuild:setVisible(true)
			self._textGuild:setString(
				Lang.get("guildwar_crystal_name",{
					user = user
				})
			)
			self._textGuild:setPosition(config.hp_x-config.clickPos.x,config.hp_y-config.clickPos.y+20)
			self:_refreshColor(cityId)

			dump(user)
		else
			print("-------------------- aaa")
			self._textGuild:setVisible(false)
			self._textName:setString(config.name)
		end
		
	else
		self._textGuild:setVisible(false)
		self._textName:setString(config.name)
	end
	
end


function GuildWarPointNameNode:_getDefenderName(cityId) 
    local guildId = G_UserData:getGuildWar():getBattleDefenderGuildId(cityId )
    local guildInfo = G_UserData:getGuildWar():getBattleDefenderGuildInfo(cityId )
    local showDefender = guildId and guildId ~= 0
    if showDefender then
       return  guildInfo.guildName
    end
	return nil
end

function GuildWarPointNameNode:_refreshColor(cityId)
	local isDefender = GuildWarDataHelper.selfIsDefender(cityId)
	if isDefender then
		self._textGuild:setColor(Colors.GUILD_WAR_SAME_GUILD_COLOR)
		self._textGuild:enableOutline(Colors.GUILD_WAR_SAME_GUILD_COLOR_OUTLINE , 2)
	else
		self._textGuild:setColor(Colors.GUILD_WAR_ENEMY_COLOR)
		self._textGuild:enableOutline(Colors.GUILD_WAR_ENEMY_COLOR_OUTLINE , 2)
	end
end




return GuildWarPointNameNode