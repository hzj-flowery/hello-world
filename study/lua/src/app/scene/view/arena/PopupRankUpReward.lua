--排名提升弹出动画
local PopupBase = require("app.ui.PopupBase")
local PopupRankUpReward = class("PopupRankUpReward", PopupBase)
local Path = require("app.utils.Path")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local UIHelper  = require("yoka.utils.UIHelper")
local CSHelper = require("yoka.utils.CSHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst =require("app.const.DataConst")
function PopupRankUpReward:ctor(rankUpInfo, onCloseCall)
	assert(rankUpInfo, "rankUpInfo can not be nil")
	--dump(rankUpInfo)
    self._listViewItem = nil
    self._commonNodeBk = nil
	self._labelMaxRank = nil --历史最高排名
	self._oldRank = rankUpInfo.oldRank
	self._newRank = rankUpInfo.newRank
	self._reward = rankUpInfo.award
	self._onCloseCall = onCloseCall
	self._isAction = true
	local resource = {
		file = Path.getCSB("PopupRankUpReward", "arena"),
		binding = {
			
		}
	}
	self:setName("PopupRankUpReward")
	PopupRankUpReward.super.ctor(self, resource, true)
end

--
function PopupRankUpReward:onCreate()
	self._fileNodeContinnue:setVisible(false)
end


function PopupRankUpReward:onEnter()
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN)
	self:play()
	local AudioConst = require("app.const.AudioConst")
	G_AudioManager:playSoundWithId(AudioConst.SOUND_ARENA_RANK_UP)
	self._isAction = true
end

function PopupRankUpReward:onClose()
	--抛出新手事件出新手事件
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END)

	if self._onCloseCall then
		self._onCloseCall()
	end
end

function PopupRankUpReward:showUI()
	self:open()
end

--
function PopupRankUpReward:onBtnCancel()
	self:close()
end


function PopupRankUpReward:_createActionNode(effect)
	local function effectFunction(effect)
		if effect == "shuoming_1" then
			return self:_createShuoMing1()
		elseif effect == "shuoming_2" then
			local reward = self._reward or 
				{type =TypeConvertHelper.TYPE_RESOURCE, value =DataConst.RES_DIAMOND , size = 1000 }
				
			return self:_createShuoMing2(reward)
		end
	end

	local function eventFunction(event)
		
    end

    if effect == "paiming_shuzi_1" then
		if self._oldRank == 0 then
			local node = self:_createNum1(Lang.get("arena_rank_zero"))
			local label = node:getSubNodeByName("label1")
			label:setPosition(-35,0)
			return node
		end
		return self:_createNum1(self._oldRank)
	elseif effect == "paiming_shuzi_2" then
		return self:_createNum2(self._newRank)
    elseif effect == "moving_paiming_shuoming" then
		local node = cc.Node:create()
	    local effect = G_EffectGfxMgr:createPlayMovingGfx( node, "moving_paiming_shuoming", effectFunction, eventFunction , false )
		effect:play()
        return node        
	end
end

function PopupRankUpReward:_createNum1(num)
	local paramList = {
		[1] ={
			name = "label1",
			text = num,
			fontSize = 48,
			color = Colors.SYSTEM_TIP,
			outlineColor = Colors.SYSTEM_TIP_OUTLINE,
			outlineSize = 3,
		},
	}
	local labelNode = UIHelper.createLabels(paramList)
	return labelNode
end

function PopupRankUpReward:_createNum2(num)
	local paramList = {
		[1] ={
			name = "label1",
			text = num,
			fontSize = 48,
			color = Colors.CLASS_GREEN,
			outlineColor = Colors.CLASS_GREEN_OUTLINE,
			outlineSize = 3,
		},
	}
	local labelNode = UIHelper.createLabels(paramList)
	return labelNode
end

--创建说明
function PopupRankUpReward:_createShuoMing1()

	if self._oldRank == 0 then
		local node = cc.Node:create()
		return node
	end

    local addRank = self._oldRank - self._newRank 

	local paramList = {
		[1] = {
			type = "label",
			text = Lang.get("arena_reward_dlg1"),
			fontSize = 22,
			color = Colors.SYSTEM_TIP,
			outlineColor = Colors.SYSTEM_TIP_OUTLINE,
			anchorPoint = cc.p(0, 0.5),
		},
	
		[2] = {
			type = "image",	
			texture = Path.getUICommon("img_com_arrow06"),
		},
		[3] = {
			type = "label",
			text = Lang.get("arena_reward_dlg3",{rank= addRank}),
			fontSize = 22,
			color = Colors.CLASS_GREEN,
		},
	}
	
	local node = UIHelper.createRichItems(paramList,true)
	--node:setPositionX(-200)
	return node
end

function PopupRankUpReward:_createShuoMing2(reward)
	local itemParams = TypeConvertHelper.convert(reward.type, reward.value, reward.size)
	local paramList = {
		[1] = {
			type = "label",
			text = Lang.get("arena_reward_dlg2"),
			fontSize = 22,
			color = Colors.SYSTEM_TIP,
			outlineColor = Colors.SYSTEM_TIP_OUTLINE,
			anchorPoint = cc.p(0, 0.5),
		},
	
		[2] = {
			type = "image",	
			texture = itemParams.res_mini,
		},
		[3] = {
			type = "label",
			name = "res1",
			text = itemParams.size,
			fontSize = 22,
			color = Colors.DARK_BG_ONE,
		},
	}
	
	local node = UIHelper.createRichItems(paramList,true)
	local resWidget = node:getSubNodeByName("res1")
	resWidget:setPositionX(resWidget:getPositionX() + 3)
	--node:setPositionX(-200)
	return node
end

function PopupRankUpReward:play()

	
    local function effectFunction(effect)
        if effect == "effect_bg5"then
            local subEffect = EffectGfxNode.new("effect_bg5")
            subEffect:play()
            return subEffect
        elseif effect == "effect_txt_bg" then
            local subEffect = EffectGfxNode.new("effect_txt_bg")
            subEffect:play()
            return subEffect
        elseif effect == "effect_paiming_dazi" then
            local subEffect = EffectGfxNode.new("effect_paiming_dazi")


            subEffect:play()
            return subEffect
        elseif effect == "effect_bejilibao_allbg" then
            local subEffect = EffectGfxNode.new("effect_bejilibao_allbg")
            subEffect:play()
            return subEffect
        elseif effect == "effect_win_2" then
            local subEffect = EffectGfxNode.new("effect_win_2")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg4" then
            local subEffect = EffectGfxNode.new("effect_bg4")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg3" then
            local subEffect = EffectGfxNode.new("effect_bg3")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg2" then
            local subEffect = EffectGfxNode.new("effect_bg2")
            subEffect:play()
            return subEffect
		elseif effect == "effect_bg1" then
            local subEffect = EffectGfxNode.new("effect_bg1")
            subEffect:play()
            return subEffect
		elseif effect == "effect_paiming_jiantou" then
            local subEffect = EffectGfxNode.new("effect_paiming_jiantou")
            subEffect:play()
            return subEffect
        else
            return self:_createActionNode(effect)    
        end
    end

    local function eventFunction(event)
        if event == "finish" then
            self._isAction = false
			self._fileNodeContinnue:setVisible(true)
        end
    end

    local effect = G_EffectGfxMgr:createPlayMovingGfx( self:getResourceNode(), "moving_paiming", effectFunction, eventFunction , false )
    local size = self:getResourceNode():getContentSize()  
    effect:setPosition(0, 0)
end


--动画播放完成后才能关闭
function PopupRankUpReward:onTouchHandler(event,x,y)
	if event == "began" then
        return true
    elseif event == "ended" then
        if self:getNumberOfRunningActions() == 0 then
			local rect = self._resourceNode:getBoundingBox()
			if self._isShowFinish == true and self._isAction == false then
				if not cc.rectContainsPoint(rect, cc.p(x, y)) then
					self:closeWithAction()
				end
			end
        end
    end
end

return PopupRankUpReward