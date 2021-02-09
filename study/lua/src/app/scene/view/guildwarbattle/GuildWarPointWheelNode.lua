
-- Author: �û�����
-- Date:2018-07-19 15:24:37
-- Describle：

local ViewBase = require("app.ui.ViewBase")
local GuildWarPointWheelNode = class("GuildWarPointWheelNode", ViewBase)
local GuildWarDataHelper = require("app.utils.data.GuildWarDataHelper")
local UIHelper = require("yoka.utils.UIHelper")

function GuildWarPointWheelNode:ctor()

	--csb bind var name
	self._imageBg = nil
	self._buttonAttack = nil  --Button
	self._buttonMove = nil  --Button
	self._buttonSeek = nil  --Button
	self._buttonClose = nil
	self._data = nil
	self._listener = nil
	local resource = {
		file = Path.getCSB("GuildWarPointWheelNode", "guildwarbattle"),
		binding = {
			_buttonAttack = {
				events = {{event = "touch", method = "_onButtonAttack"}}
			},
			_buttonMove = {
				events = {{event = "touch", method = "_onButtonMove"}}
			},
			_buttonSeek = {
				events = {{event = "touch", method = "_onButtonSeek"}}
			},
			_buttonClose = {
				events = {{event = "touch", method = "_onButtonClose"}}
			},
		},
	}
	GuildWarPointWheelNode.super.ctor(self, resource)
end

-- Describle：
function GuildWarPointWheelNode:onCreate()

end

-- Describle：
function GuildWarPointWheelNode:onEnter()

end

-- Describle：
function GuildWarPointWheelNode:onExit()

end

-- Describle：
function GuildWarPointWheelNode:_onButtonAttack()
	-- 检查CD
	local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
	local success = GuildWarCheck.guildWarCanAttackPoint(self._data.cityId,self._data.pointId,false,true)
	if success then
		local pointId = self._data.pointId 
		G_UserData:getGuildWar():c2sGuildWarBattleWatch(pointId)
	end


end

-- Describle：
function GuildWarPointWheelNode:_onButtonMove()
	-- 检查CD
	local GuildWarCheck = require("app.utils.logic.GuildWarCheck")
	local success = GuildWarCheck.guildWarCanMove(self._data.cityId,self._data.pointId,false,true)
	if success then
		local pointId = self._data.pointId --myWatchUser:getPoint()--目标据点
		G_UserData:getGuildWar():c2sMoveGuildWarPoint(pointId)
	end

end

-- Describle：
function GuildWarPointWheelNode:_onButtonSeek()
	-- body
	local PopupGuildWarPointDetail = require("app.scene.view.guildwarbattle.PopupGuildWarPointDetail")
	local popup = PopupGuildWarPointDetail.new(self._data.cityId,self._data.pointId)
	popup:setName("PopupGuildWarPointDetail")
	popup:openWithAction()
end

function GuildWarPointWheelNode:_onButtonClose()
	if self._listener then
		self._listener()
	end
end


--出口光标
function GuildWarPointWheelNode:_onImageSign()
	--出城
	local pointId = self._data.pointId
	G_UserData:getGuildUser():c2sMoveGuildWarPoint(pointId)
end

function GuildWarPointWheelNode:updateInfo(data)
	--data.cityId
	--data.pointId
	self._data = data
	self:_showBtn(true)

	
	local config = GuildWarDataHelper.getGuildWarConfigByCityIdPointId(data.cityId,data.pointId)
	local clickPointX,clickPointY = config.clickPos.x,config.clickPos.y-- GuildWarDataHelper.decodePoint(config.click_point)
	self:setPosition(clickPointX,clickPointY-87)

	--移动攻击查看
	local GuildWarCheck = require("app.utils.logic.GuildWarCheck")

	local canMove = GuildWarCheck.guildWarCanMove(data.cityId,data.pointId,true,false)
	local canAttack = GuildWarCheck.guildWarCanAttackPoint(data.cityId,data.pointId,true,false)
	local canSeek = GuildWarCheck.guildWarCanSeek(data.cityId,data.pointId,false)

	self._buttonAttack:setVisible(canAttack)
	self._buttonMove:setVisible(canMove)
	self._buttonSeek:setVisible(canSeek)
end

function GuildWarPointWheelNode:refreshView()
	if self._data then
		self:updateInfo(self._data)
	end
	
end

function GuildWarPointWheelNode:_showBtn(visible)
	self._imageBg:setVisible(visible)
	self._buttonAttack:setVisible(visible)
	self._buttonMove:setVisible(visible)
	self._buttonSeek:setVisible(visible)
end

function GuildWarPointWheelNode:setCloseListener(listener)
	self._listener = listener
end

return GuildWarPointWheelNode