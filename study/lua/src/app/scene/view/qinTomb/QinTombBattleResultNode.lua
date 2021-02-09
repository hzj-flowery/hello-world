local popupBase = require("app.ui.PopupBase")
local QinTombBattleResultNode = class("QinTombBattleResultNode", popupBase)
local Path = require("app.utils.Path")
local AudioConst = require("app.const.AudioConst")
local QinTombConst = require("app.const.QinTombConst")

--[[
	message GraveRoundReport{
	optional uint32  team_no =1;
	optional TeamUserInfo attack =2;
	optional TeamUserInfo defense =3;
	optional uint32  result =4;//0是平局 1是输  2是赢
}
]]

local COLOR_GRAY = cc.c3b(0xab,0xab,0xab) --灰色
local COLOR_RED = cc.c3b(0xff,0x00,0x00)  --红
local COLOR_BLUE = cc.c3b(0x00,0x72,0xff)  --蓝色

function QinTombBattleResultNode:ctor(index)
	self._heroIcon1 = nil	--1-6 icon
	self._heroName1 = nil	--1-6 name
	
	local resource = {
		file = Path.getCSB("QinTombBattleResultNode"..index
		, "qinTomb"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
	self:setName("QinTombBattleResultNode")
	QinTombBattleResultNode.super.ctor(self, resource,false, true)
end

function QinTombBattleResultNode:onCreate()

end

--[[
	message GraveRoundReport{
	optional uint32  team_no =1;
	optional TeamUserInfo attack =2;
	optional TeamUserInfo defense =3;
	optional uint32  result =4;//0是平局 1是输  2是赢
}
]]
function QinTombBattleResultNode:updateUI( reportValue, srcType,result)
	self._srcType = srcType
	if reportValue == nil then
		self:updateHeroEmpty()
		return
	end

	self._reportValue = reportValue
	
	self._result = result
	self:updateHeroEmpty()
	self:updateHeroIcon(reportValue)

end

function QinTombBattleResultNode:updateHeroEmpty()
	local heroIcon = self["_heroIcon1"]
	heroIcon:refreshToEmpty(true)

	local heroName = self["_heroName1"]
	heroName:setString(Lang.get("qin_tomb_empty"))
	-- body
	heroIcon:setVisible(true)
	heroName:setVisible(true)
end

function QinTombBattleResultNode:_updateIconDarkEffect( ... )
	
	local heroIcon = self["_heroIcon1"]
	local nodeEffect = self["_nodeEffect1"]
	if heroIcon:isIconDark() == true then
		G_EffectGfxMgr:createPlayGfx(nodeEffect,"effect_xianqinhuangling_jibai")
	end
	
end

function QinTombBattleResultNode:updateNodeState( ... )
	-- body
	if self._srcType == "attack" then
		self._bkImage:loadTexture(Path.getQinTomb("img_qintomb_battle01"))
		self._heroName1:setColor(COLOR_BLUE)
	else
		self._bkImage:loadTexture(Path.getQinTomb("img_qintomb_battle02"))
		self._heroName1:setColor(COLOR_RED)
	end

	if self._result == 1 then --输了，头像变暗
		self._heroIcon1:setIconDark(true)
		self._heroName1:setColor(COLOR_GRAY)
		if self._srcType == "attack" then
			self._bkImage:loadTexture(Path.getQinTomb("img_qintomb_battle01b"))
		else
			self._bkImage:loadTexture(Path.getQinTomb("img_qintomb_battle02b"))
		end	
	else
		self._heroIcon1:setIconDark(false)
	end

	self:_updateIconDarkEffect()

end
function QinTombBattleResultNode:updateHeroIcon(teamUserInfo)

	local avatarBaseId,avatarTable = require("app.utils.UserDataHelper").convertAvatarId(teamUserInfo)
	
	local heroIcon = self["_heroIcon1"]
	if avatarBaseId > 0 then
		heroIcon:updateIcon(avatarTable)
	end

	local commonHeadFrame1 = self["_commonHeadFrame1"]
	if teamUserInfo ~= nil then 
		commonHeadFrame1:updateUI(teamUserInfo.head_frame_id,heroIcon:getScale())
	end

	local heroName = self["_heroName1"]
	heroName:setString(teamUserInfo.name)
	heroIcon:setVisible(true)
	heroName:setVisible(true)
end


function QinTombBattleResultNode:onEnter()

end

function QinTombBattleResultNode:onExit()

end


function QinTombBattleResultNode:showResult( finishCallBack )
	-- body

	self:open()

	local function banziCallBack(eventName,frameIndex, node)

		if eventName == "finish" then
			local action1 = cc.DelayTime:create(QinTombConst.TEAM_BATTLE_RESULT_SHOW_TIME)
			local action2 = cc.CallFunc:create(function()
				local function effectClose( eventName )
					if eventName == "finish" then
						local action1 = cc.DelayTime:create(0.5)
						local action2 = cc.CallFunc:create(function() self:close() end)
						local action = cc.Sequence:create(action1, action2)
						self:runAction(action)
					end
				end
				G_EffectGfxMgr:applySingleGfx(self._panelRoot, "smoving_xianqinhuangling_banzi2", effectClose, nil, nil)
			end)

			self:updateIconDarkEffect()
			local action = cc.Sequence:create(action1, action2)
			self:runAction(action)
		end
	end

	
	G_EffectGfxMgr:applySingleGfx(self._panelRoot, "smoving_xianqinhuangling_banzi", banziCallBack, nil, nil)
	if finishCallBack then
		finishCallBack()
	end
end

return QinTombBattleResultNode
