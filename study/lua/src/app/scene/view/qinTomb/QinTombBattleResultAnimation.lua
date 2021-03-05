--秦皇陵
--战斗结果动画
local PopupBase = require("app.ui.PopupBase")
local QinTombBattleResultAnimation = class("QinTombBattleResultAnimation", PopupBase)
local TextHelper = require("app.utils.TextHelper")
local QinTombBattleResultNode = import(".QinTombBattleResultNode")
local UIHelper = require("yoka.utils.UIHelper")


function QinTombBattleResultAnimation:ctor()
    self._panelRoot = nil

	self._nodeList = {}
	self._reportList = {}
	self._finishCall = nil
    local resource = {
        file = Path.getCSB("QinTombBattleResultAnimation", "qinTomb"),
		binding = {
			_panelTouch = {
				events = {{event = "touch", method = "_onClickTouch"}},
			}
		}
    }
    QinTombBattleResultAnimation.super.ctor(self, resource,false,true)
end

function QinTombBattleResultAnimation:onCreate()
	--self._attackList
	--self._defenseList
	self._nodeContinue:setVisible(false)
end


function QinTombBattleResultAnimation:onEnter()
    self:_createEffectNode(self._panelRoot)
end

function QinTombBattleResultAnimation:onExit()

end

function QinTombBattleResultAnimation:updateUI( report )
	-- body
	local reportList = rawget(report, "report")
	local is_win = rawget(report, "is_win") -- 这场战斗是否胜利
	local report_type = rawget(report , "report_type") --1:进攻战报 2： 防守战报

	self._reportList = reportList
	self._isWin = is_win
end

function QinTombBattleResultAnimation:getAttackUser( index )
	-- body
	local reportData = self._reportList[index]
	if reportData then
		return rawget(reportData, "attack"), rawget(reportData,"result")
	end
end

function QinTombBattleResultAnimation:getDefenseUser( index )
	-- body
	local reportData = self._reportList[index]
	if reportData then
		local result =  rawget(reportData,"result")
		local retResult = result
		if result == 2 then --进攻方赢了
			retResult = 1
		elseif result == 1 then --防守方赢了
			retResult = 2 
		end
		
		return rawget(reportData, "defense"),retResult
	end
end

function QinTombBattleResultAnimation:_createActionNode(effect)

	local function createAttackEffect( index )
	    local data,result = self:getAttackUser(index)
		local effect = QinTombBattleResultNode.new(1)
		effect:updateUI(data,"attack",result)
		table.insert( self._nodeList, effect )
        return effect
	end

	local function createDefenseEffect( index )
	    local data,result = self:getDefenseUser(index)
		local effect = QinTombBattleResultNode.new(2)
		effect:updateUI(data,"defense",result)
		table.insert( self._nodeList, effect )
        return effect
	end

    if effect == "hong1" then
        return createDefenseEffect(1)
    elseif effect == "hong2" then    
        return createDefenseEffect(2)
    elseif effect == "hong3" then
        return createDefenseEffect(3)
    elseif effect == "lan1" then
        return createAttackEffect(1)
    elseif effect == "lan2" then
        return createAttackEffect(2)
    elseif effect == "lan3" then
        return createAttackEffect(3)
	elseif effect == "jiesuan" then
		if self._isWin then
			return UIHelper.createImage({texture = Path.getTextBattle("txt_com_battle_v06")}) -- 胜利
		else
			return UIHelper.createImage({texture = Path.getTextBattle("txt_com_battle_f06")}) -- 失败
		end
    end
end


function QinTombBattleResultAnimation:_onClickTouch()
	if self._nodeContinue:isVisible() == true then
		if self._finishCall then
			self._finishCall()
		end	
		self:close()
	end
end

function QinTombBattleResultAnimation:_createEffectNode(rootNode)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local function effectFunction(effect)
    	return self:_createActionNode(effect)    
    end

    local function eventFunction(event,frameIndex, movingNode)
		if event == "die" then
			--播放变灰效果
			for i, value in ipairs(self._nodeList) do
				value:updateNodeState()
			end
		end
        if event == "finish" then
           	self._nodeContinue:setVisible(true)
        end
    end
   
   local node =  G_EffectGfxMgr:createPlayMovingGfx( rootNode, "moving_xianqinhuangling_zhanbao", effectFunction, eventFunction , false )
   return node
end


function QinTombBattleResultAnimation:showResult( finishCall )
	-- body
	self._finishCall = finishCall
	self:open()
end
return QinTombBattleResultAnimation
