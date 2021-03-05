local popupBase = require("app.ui.PopupBase")
local QinTombBattleResult = class("QinTombBattleResult", popupBase)
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
function QinTombBattleResult:ctor()
	self._heroIcon1 = nil	--1-6 icon
	self._heroName1 = nil	--1-6 name
	

	local resource = {
		file = Path.getCSB("QinTombBattleResult", "qinTomb"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
		}
	}
	self:setName("QinTombBattleResult")
	QinTombBattleResult.super.ctor(self, resource,false, true)
end

function QinTombBattleResult:onCreate()

end

--[[
	message GraveRoundReport{
	optional uint32  team_no =1;
	optional TeamUserInfo attack =2;
	optional TeamUserInfo defense =3;
	optional uint32  result =4;//0是平局 1是输  2是赢
}
]]
function QinTombBattleResult:updateUI( report )
	-- body
	local reportList = rawget(report, "report")

	local win_team = rawget(report, "win_team")
	local fail_team = rawget(report , "fail_team")
	local isSelfWinTeam = win_team == G_UserData:getQinTomb():getSelfTeamId()

	dump(reportList)

	local function getReportNum( reportList )
		-- body
		local number = 0
		for i, value in ipairs(reportList) do
			if rawget(value,"attack") or rawget(value,"defense") then
				number = number + 1
			end
		end
		return number
	end
	for index =1, 6 do
		local heroIcon = self["_heroIcon"..index]
		local heroName = self["_heroName"..index]
		heroIcon:setVisible(false)
		heroName:setVisible(false)
	end

	self._panelBk1:setVisible(false)
	self._panelBk2:setVisible(false)
	local panelBk = nil
	if isSelfWinTeam then
		self._panelBk1:setVisible(true)
		panelBk = self._panelBk1
	else
		self._panelBk2:setVisible(true)
		panelBk = self._panelBk2
	end
	
	local number = getReportNum(reportList)
	dump(number)

	if number > 0 then
		panelBk:setContentSize(QinTombConst.TEAM_BATTLE_RESULT[number])
		self._battleText:setPosition(QinTombConst.TEAM_BATTLE_RESULT_TEXT[number])
	end

	for i, value in ipairs(reportList) do

		if rawget(value,"attack") or rawget(value,"defense") then
			self:updateHeroEmpty(i)
			self:updateHeroEmpty(i+3)
		end
		if rawget(value,"attack") then
			self:updateHeroIcon(i,value.attack,value.result)
		end
		if rawget(value,"defense") then
			if value.result == 1 then
				self:updateHeroIcon(i+3,value.defense,2)
			elseif value.result == 2 then
				self:updateHeroIcon(i+3,value.defense,1)
			else
				self:updateHeroIcon(i+3,value.defense,0)
			end
		end

		
	end
end

function QinTombBattleResult:updateHeroEmpty(index)
	local heroIcon = self["_heroIcon"..index]
	heroIcon:refreshToEmpty()
	local heroName = self["_heroName"..index]
	heroName:setString(Lang.get("qin_tomb_empty"))
	-- body
	heroIcon:setVisible(true)
	heroName:setVisible(true)
end

function QinTombBattleResult:updateIconDarkEffect( ... )
	-- body
	for index =1, 6 do
		local heroIcon = self["_heroIcon"..index]
		local nodeEffect = self["_nodeEffect"..index]
		if heroIcon:isIconDark() == true then
			G_EffectGfxMgr:createPlayGfx(nodeEffect,"effect_xianqinhuangling_jibai")
		end
	end
end
function QinTombBattleResult:updateHeroIcon(index, teamUserInfo,result)
	
	local avatarBaseId = require("app.utils.UserDataHelper").convertAvatarId(teamUserInfo)
	
	local heroIcon = self["_heroIcon"..index]
	if avatarBaseId > 0 then
		heroIcon:updateUI(avatarBaseId)
		if result == 1 then --输了，头像变暗
			heroIcon:setIconDark(true)
		else
			heroIcon:setIconDark(false)
		end
	end

	local heroName = self["_heroName"..index]
	heroName:setString(teamUserInfo.name)
	-- body
	heroIcon:setVisible(true)
	heroName:setVisible(true)
end


function QinTombBattleResult:onEnter()

end

function QinTombBattleResult:onExit()

end


function QinTombBattleResult:showResult( finishCallBack )
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

return QinTombBattleResult
