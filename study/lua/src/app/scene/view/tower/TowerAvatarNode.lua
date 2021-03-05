local ViewBase = require("app.ui.ViewBase")
local TowerAvatarNode = class("TowerAvatarNode", ViewBase)

TowerAvatarNode.STAR_DELAY = 0.3
TowerAvatarNode.STAR_SCALE = 0.7

function TowerAvatarNode:ctor(index)
    
    self._panelAvatar = nil     --avatar
    self._panelTouch = nil      --点击面板
    self._nodeInfo = nil        --信息节点
    self._stageName = nil       --节点名字
    self._starPanel1 = nil      --星星1
    self._starPanel2 = nil      --星星2
    self._starPanel3 = nil      --星星3
    self._nodeSword = nil       --剑特效

    self._layerConfig = nil     --表格信息
    self._layerData = nil       --信息
    self._nextLayer = nil       --下一层，需要攻啊的层数
    self._nowLayer = 0          --现在层数

	self._starEftCount = 0 		--播放星星的数量
	self._starEftFinish = 0		--完成播放动画的数量
    self._starEffect = {}

    local resource = {
        file = Path.getCSB("TowerAvatarNode", "tower"),
        size = {1136, 640},
		binding = {
            _panelTouch = {
				events = {{event = "touch", method = "_onAvatarClick"}}
			},
		}
    }
    self:setName("TowerAvatarNode"..index)
    TowerAvatarNode.super.ctor(self, resource)
end

function TowerAvatarNode:onCreate()
    self._starPanel = {self._starPanel1, self._starPanel2, self._starPanel3}
end

--刷新，传入信息，表格，下一层攻打层数
function TowerAvatarNode:refresh(layerData, layerConfig, nextLayer)
    self._layerConfig = layerConfig
    self._layerData = layerData
    self._nextLayer = nextLayer
    self._nowLayer = G_UserData:getTowerData():getNow_layer()
    self._stageName:setString(self._layerConfig.name)
	self._stageName:setColor(Colors.getColor(self._layerConfig.color))
	self._stageName:enableOutline(Colors.getColorOutline(self._layerConfig.color), 1)
	self._panelAvatar:updateUI(self._layerConfig.res_id)
	self._panelAvatar:setTouchEnabled(false)	
	self._panelAvatar:turnBack()
	local height = self._panelAvatar:getHeight()
	self._nodeInfo:setPositionY(height)

    local layerId = self._layerConfig.id
    if layerId <= self._nowLayer then        --已经打过的
        self:showSword(false)
        self:showBubble(false)
    elseif layerId == self._nextLayer then
        self:showSword(true)
        self:showBubble(true)
    else
        self:showSword(false)
        self:showBubble(false)     
    end
    self:_refreshStar()
end

--刷新星星
function TowerAvatarNode:_refreshStar()
    if self._layerConfig.id == self._nowLayer and G_UserData:getTowerData():isShowStarEft() then
		self:_setStarCount(0)
		self:_playStarEft()
        G_UserData:getTowerData():setShowStarEft(false)
		return 
	end
	local star = 0
    if self._layerData then
	    star = self._layerData:getNow_star()
    end    
	self:_setStarCount(star)
end

--设置星星数量
function TowerAvatarNode:_setStarCount(count)
    self:_clearStarEffect()
	for i, v in pairs(self._starPanel) do
		local starNode = v:getSubNodeByName("Star")
        starNode:setVisible(false)
		if i <= count then
			starNode:setVisible(true)
		end
	end
end

--删除星星动画
function TowerAvatarNode:_clearStarEffect()
    for i, v in pairs(self._starEffect) do
        v:removeFromParent()
    end
    self._starEffect = {}   
end

--更新剑动画
function TowerAvatarNode:showSword(s)
    self._nodeSword:removeAllChildren()
    if s then
    	local EffectGfxNode = require("app.effect.EffectGfxNode")
        local function effectFunction(effect)
            if effect == "effect_shuangjian"then
                local subEffect = EffectGfxNode.new("effect_shuangjian")
                subEffect:play()
                return subEffect 
            end
        end
        local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeSword, "moving_shuangjian", effectFunction, nil, false )
    end
end

--说话
function TowerAvatarNode:showBubble(s)
    if s then
        self._panelAvatar:setBubble(self._layerConfig.talk, nil, 2)
	else
        self._panelAvatar:setBubbleVisible(false)
    end
end

--点击人物
function TowerAvatarNode:_onAvatarClick()
    local layerId = self._layerConfig.id
    if layerId == self._nextLayer then
    --self._nextLayer == self._nowLayer 只有宝箱没开启时候的特殊状态
        if self._nextLayer == self._nowLayer then
            G_Prompt:showTip(Lang.get("challenge_tower_already"))
        else
            local popupTowerChoose = require("app.scene.view.tower.PopupTowerChoose").new(self._layerConfig)
            popupTowerChoose:openWithAction()
        end
    elseif layerId > self._nextLayer then
        G_Prompt:showTip(Lang.get("challenge_tower_not_reach"))
    elseif layerId < self._nextLayer then
        G_Prompt:showTip(Lang.get("challenge_tower_already"))
    end
end

--播放星星特效
function TowerAvatarNode:_playStarEft()
	local star = self._layerData:getNow_star()
	self._starEftCount = star
	self._starEftFinish = 0
	for i = 1, star do
		local starPanel = self._starPanel[i]
		local delayTime = TowerAvatarNode.STAR_DELAY * (i-1)
		self:_playSingleStarEft(starPanel, delayTime)
	end
end

--播放单个星星动画
function TowerAvatarNode:_playSingleStarEft(node, delayTimme)
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_xiaoxingxing"then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect 
        end
    end
	local function eventFunction(event)
		if event == "finish" then
			self._starEftFinish = self._starEftFinish + 1
			if self._starEftFinish >= self._starEftCount then
				--动画全部完结
				-- G_SignalManager:dispatch(SignalConst.EVENT_STAR_EFFECT_END)
                -- self:_onEventStarEffectEnd()		
            end
		end
	end
	local function funcStar()	
		local effect = G_EffectGfxMgr:createPlayMovingGfx( node, "moving_xiaoxingxing", effectFunction, eventFunction, false )	
		local nodeSize = node:getContentSize()
		local pos = cc.p(nodeSize.width*0.5, nodeSize.height*0.5)
		effect:setPosition(pos)
		effect:setScale(TowerAvatarNode.STAR_SCALE)
        table.insert(self._starEffect, effect)
	end
	local action1 = cc.DelayTime:create(delayTimme)
	local action2 = cc.CallFunc:create(function() funcStar() end)
	local action = cc.Sequence:create(action1, action2)
	node:runAction(action)
end

return TowerAvatarNode
