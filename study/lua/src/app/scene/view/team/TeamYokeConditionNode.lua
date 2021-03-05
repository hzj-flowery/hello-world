--
-- Author: Liangxu
-- Date: 2017-03-29 18:13:54
-- 武将羁绊条件模块
local TeamYokeConditionNode = class("TeamYokeConditionNode", ccui.Widget)
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")

function TeamYokeConditionNode:ctor()
	local resource = {
		file = Path.getCSB("TeamYokeConditionNode", "team"),
		binding = {

		}
	}
	CSHelper.createResourceNode(self, resource)

	self:_onCreate()
end

function TeamYokeConditionNode:_onCreate()
	local size = self._resourceNode:getContentSize()
	self:setContentSize(size.width, size.height)
end

function TeamYokeConditionNode:updateView(info)
	self._textName:setString("【"..info.name.."】")
	local color = info.isActivated and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
	self._textName:setColor(color)
	local res = info.isActivated and Path.getUICommon("img_com_team_sign01") or Path.getUICommon("img_com_team_sign06")
	self._imageMark:loadTexture(res)
	self._imageMark2:setVisible(info.isActivated)

	local heroIds = info.heroIds
	self._fateType = info.fateType
	for i = 1, 5 do
		local heroId = heroIds[i]
		if heroId then
			self["_fileNodeIcon"..i]:setVisible(true)
			self["_fileNodeIcon"..i]:initUI(info.fateType, heroId)
			self["_fileNodeIcon"..i]:setCallBack(handler(self, self._onClickIcon))
			self["_fileNodeIcon"..i]:setTouchEnabled(true)
			if self:_isHave(info.fateType, heroId) then
				self["_fileNodeIcon"..i]:setIconMask(false)
			else
				self["_fileNodeIcon"..i]:setIconMask(true)
			end
		else
			self["_fileNodeIcon"..i]:setVisible(false)
		end
	end
end

function TeamYokeConditionNode:_isHave(type, id)
	if type == 1 then --武将羁绊
		return G_UserData:getTeam():isInBattleWithBaseId(id) or G_UserData:getTeam():isInReinforcementsWithBaseId(id)
	elseif type == 2 then --装备羁绊
		return G_UserData:getBattleResource():isEquipInBattleWithBaseId(id)
	elseif type == 3 then --宝物羁绊
		return G_UserData:getBattleResource():isTreasureInBattleWithBaseId(id)
	elseif type == 4 then --神兵羁绊
		return G_UserData:getBattleResource():isInstrumentInBattleWithBaseId(id)
	end
end

function TeamYokeConditionNode:_onClickIcon(sender, itemParam)
	local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
    PopupItemGuider:updateUI(self._fateType, itemParam.cfg.id)
    PopupItemGuider:openWithAction()
end

function TeamYokeConditionNode:onlyShow(info)
	self._textName:setString("【"..info.name.."】")
	local color = info.isActivated and Colors.BRIGHT_BG_GREEN or Colors.BRIGHT_BG_TWO
	self._textName:setColor(color)
	local res = info.isActivated and Path.getUICommon("img_sign01") or Path.getUICommon("img_sign01b")
	self._imageMark:loadTexture(res)
	self._imageMark2:setVisible(info.isActivated)

	local heroIds = info.heroIds
	for i = 1, 5 do
		local heroId = heroIds[i]
		if heroId then
			self["_fileNodeIcon"..i]:setVisible(true)
			self["_fileNodeIcon"..i]:initUI(info.fateType, heroId)
			self["_fileNodeIcon"..i]:setIconMask(not info.isActivated)
		else
			self["_fileNodeIcon"..i]:setVisible(false)
		end
	end
end

return TeamYokeConditionNode