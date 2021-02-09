
-- Author: hedili
-- Date:2018-04-19 14:10:18
-- Describle：秦皇陵玩家名称节点， 
-- 名称与avatar分离，这样名称层级可以到最上层
local ViewBase = require("app.ui.ViewBase")
local QinTombAvatarName = class("QinTombAvatarName", ViewBase)
local QinTombConst = require("app.const.QinTombConst")

local QinTombHelper = import(".QinTombHelper")
function QinTombAvatarName:ctor(teamUser)
	self._avatarName = nil
	self._avatarGuild = nil  

	local resource = {
		file = Path.getCSB("QinTombAvatarName", "qinTomb"),

	}
	QinTombAvatarName.super.ctor(self, resource)
end

-- Describle：
function QinTombAvatarName:onCreate()

end

function QinTombAvatarName:updateUI( teamUser, teamId )
	-- body
	local color = QinTombHelper.getPlayerColor(teamUser.user_id, teamId)
	--
	self:updateLabel("_avatarName",{
		text = teamUser.name,
		color = color,
	})

	self:updateLabel("_avatarGuild",{
		text = teamUser.guild_name,
		color = color,
	})

end

function QinTombAvatarName:updatePosition(pos)
	-- body

	--dump(pos)

	self:setPosition(pos)
	self:setLocalZOrder(QinTombConst.TEAM_ZORDER_NAME-pos.y)
end

return QinTombAvatarName