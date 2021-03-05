--
-- Author: Liangxu
-- Date: 2017-03-23 15:58:13
-- 武将缘分
local PopupBase = require("app.ui.PopupBase")
local PopupHeroKarma = class("PopupHeroKarma", PopupBase)
local HeroKarmaCell = require("app.scene.view.heroTrain.HeroKarmaCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local CSHelper = require("yoka.utils.CSHelper")
local AttributeConst = require("app.const.AttributeConst")
local TextHelper = require("app.utils.TextHelper")
local HeroConst = require("app.const.HeroConst")
local AudioConst = require("app.const.AudioConst")
local AttrDataHelper = require("app.utils.data.AttrDataHelper")
local UIConst = require("app.const.UIConst")

--需要记录的属性列表
--{属性Id， 对应控件名}
local RECORD_ATTR_LIST = {  
    {AttributeConst.ATK, "_fileNodeAttr1"},
    {AttributeConst.HP, "_fileNodeAttr3"},
    {AttributeConst.PD, "_fileNodeAttr2"},
    {AttributeConst.MD, "_fileNodeAttr4"},
    {AttributeConst.CRIT, nil},
    {AttributeConst.NO_CRIT, nil},
    {AttributeConst.HIT, nil},
    {AttributeConst.NO_HIT, nil},
    {AttributeConst.HURT, nil},
    {AttributeConst.HURT_RED, nil},
}

function PopupHeroKarma:ctor(parentView, heroUnitData, rangeType)
	self._parentView = parentView
	self._heroUnitData = heroUnitData
    self._rangeType = rangeType
    self._allHeroIds = {}

	local resource = {
		file = Path.getCSB("PopupHeroKarma", "hero"),
		binding = {
			_buttonLeft = {
                events = {{event = "touch", method = "_onButtonLeftClicked"}}
            },
            _buttonRight = {
                events = {{event = "touch", method = "_onButtonRightClicked"}}
            },
		}
	}
	self:setName("PopupHeroKarma")
	PopupHeroKarma.super.ctor(self, resource, nil, false)
end

function PopupHeroKarma:onCreate()
	self._activeData = nil --所激活的相关数据
    self._canClose = true --能否关闭
    self._lastAttr = {} --记录在激活缘分UI里的基础属性
    self._diffAttr = {} --记录在激活缘分UI里的属性差值
    
	self._panelBg:addCloseEventListener(handler(self, self._onButtonClose))
	
	self._listView:setTemplate(HeroKarmaCell)
	self._listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	self._listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupHeroKarma:onShowFinish()
		--抛出新手事件出新手事件
		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PopupHeroKarma:onEnter()
	self._signalHeroKarmaActive = G_SignalManager:add(SignalConst.EVENT_HERO_KARMA_ACTIVE_SUCCESS, handler(self, self._heroKarmaActiveSuccess))

    if self._rangeType == HeroConst.HERO_RANGE_TYPE_1 then
        self._allHeroIds = G_UserData:getHero():getRangeDataBySort()
    elseif self._rangeType == HeroConst.HERO_RANGE_TYPE_2 then
        self._allHeroIds = G_UserData:getTeam():getHeroIdsInBattle()
    end

    self._selectedPos = 1
    
    local heroId = self._heroUnitData:getId()
    for i, id in ipairs(self._allHeroIds) do
        if id == heroId then
            self._selectedPos = i
        end
    end
    self._heroCount = #self._allHeroIds
    self:_updateArrowBtn()
    self:_updateView()
end

function PopupHeroKarma:onExit()
	self._signalHeroKarmaActive:remove()
	self._signalHeroKarmaActive = nil
end

function PopupHeroKarma:_updateView()
    local heroBaseId = self._heroUnitData:getBase_id()
    local param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroBaseId)

    if self._heroUnitData:isLeader() then
        self._panelBg:setTitle(Lang.get("hero_karma_title", {name = Lang.get("main_role")}))
    else
        self._panelBg:setTitle(Lang.get("hero_karma_title", {name = param.name}))
    end

    self._karmaData = {}
    local config = self._heroUnitData:getConfig()
    local karmaData = UserDataHelper.getHeroKarmaData(config)
    for i = 1, HeroConst.HERO_KARMA_MAX do --7条缘分
		local data = karmaData[i]
		if data then
            local isReach = UserDataHelper.getReachCond(self._heroUnitData, data["cond1"], data["cond2"]) --是否达成显示条件
            local isActive = self._heroUnitData:isUserHero() and G_UserData:getKarma():isActivated(data.id)
			if isReach or isActive then
				table.insert(self._karmaData, data)
			end
		end
	end
    
    self._count = math.ceil(#self._karmaData / 3)
    self._listView:clearAll()
    self._listView:resize(self._count)

    self:_recordBaseAttr()
    G_UserData:getAttr():recordPower()
end

function PopupHeroKarma:_onItemUpdate(item, index)
    local index = index * 3
	item:update(self._karmaData[index + 1], self._karmaData[index + 2], self._karmaData[index + 3])
end

function PopupHeroKarma:_onItemSelected(item, index)
	
end

function PopupHeroKarma:doActive(id)
    G_UserData:getKarma():c2sHeroActiveDestiny(self._heroUnitData:getBase_id(), id, self._heroUnitData:getId())
end

function PopupHeroKarma:_onItemTouch(index, t)
    local index = index * 3 + t
	local destinyId = self._karmaData[index].id
	G_UserData:getKarma():c2sHeroActiveDestiny(self._heroUnitData:getBase_id(), destinyId, self._heroUnitData:getId())
end

function PopupHeroKarma:_onButtonClose()
    if self._canClose then
        self:close()
    end
end

function PopupHeroKarma:_updateArrowBtn()
    self._buttonLeft:setVisible(self._selectedPos > 1)
    self._buttonRight:setVisible(self._selectedPos < self._heroCount)
end

function PopupHeroKarma:_onButtonLeftClicked()
    if self._selectedPos <= 1 then
        return
    end

    self._selectedPos = self._selectedPos - 1
    local curHeroId = self._allHeroIds[self._selectedPos]
    self._heroUnitData = G_UserData:getHero():getUnitDataWithId(curHeroId)
    self:_updateArrowBtn()
    self:_updateView()
end

function PopupHeroKarma:_onButtonRightClicked()
    if self._selectedPos >= self._heroCount then
        return
    end

    self._selectedPos = self._selectedPos + 1
    local curHeroId = self._allHeroIds[self._selectedPos]
    self._heroUnitData = G_UserData:getHero():getUnitDataWithId(curHeroId)
    self:_updateArrowBtn()
    self:_updateView()
end

function PopupHeroKarma:_heroKarmaActiveSuccess(eventName, destinyId)
    local config = self._heroUnitData:getConfig()
	self._karmaData = UserDataHelper.getHeroKarmaData(config)

	local itemList = self._listView:getItems()
	for i, cell in ipairs(itemList) do
		if cell:getKarmaId1() == destinyId then
			local index = cell:getTag()
			local data1 = self._karmaData[index*3+1]
            local data2 = self._karmaData[index*3+2]
            local data3 = self._karmaData[index*3+3]
			cell:update(data1, data2, data3)
			self._activeData = data1
            self:_recordBaseAttr()
            G_UserData:getAttr():recordPower()
			self:_playEffect(destinyId)
			break
		end
        if cell:getKarmaId2() == destinyId then
            local index = cell:getTag()
            local data1 = self._karmaData[index*3+1]
            local data2 = self._karmaData[index*3+2]
            local data3 = self._karmaData[index*3+3]
            cell:update(data1, data2, data3)
            self._activeData = data2
            self:_recordBaseAttr()
            G_UserData:getAttr():recordPower()
            self:_playEffect(destinyId)
            break
        end
        if cell:getKarmaId3() == destinyId then
            local index = cell:getTag()
            local data1 = self._karmaData[index*3+1]
            local data2 = self._karmaData[index*3+2]
            local data3 = self._karmaData[index*3+3]
            cell:update(data1, data2, data3)
            self._activeData = data3
            self:_recordBaseAttr()
            G_UserData:getAttr():recordPower()
            self:_playEffect(destinyId)
            break
        end
	end
end

function PopupHeroKarma:_playEffect(destinyId)
	local function effectFunction(effect)
        if effect == "effect_yuanfen_baozha" then
            local subEffect = EffectGfxNode.new("effect_yuanfen_baozha")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_bg5" then
        	local subEffect = EffectGfxNode.new("effect_bg5")
            subEffect:play()
            return subEffect
        end

    	if effect == "effect_yuanfen_shandian" then
    		local subEffect = EffectGfxNode.new("effect_yuanfen_shandian")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_yuanfen_guangxian" then
    		local subEffect = EffectGfxNode.new("effect_yuanfen_guangxian")
            subEffect:play()
            return subEffect
    	end

    	if effect == "effect_yuanfen_zhiguang" then
    		local subEffect = EffectGfxNode.new("effect_yuanfen_zhiguang")
            subEffect:play()
            return subEffect
    	end

    	if effect == "heidi" then
            local layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*0.8))
            layerColor:setAnchorPoint(0.5,0.5)
            layerColor:setIgnoreAnchorPointForPosition(false)
            layerColor:setTouchEnabled(true)
            layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
            layerColor:registerScriptTouchHandler(function(event)
                if event == "began" then
                    return true
                elseif event == "ended" then
                    
                end
            end)
            return layerColor
    	end
    		
        return self:_createActionNode(effect)
    end

    local function eventFunction(event)
    	if event == "piaozi" then
    		self:_playKarmaActiveSummary(destinyId)
        elseif event == "finish" then
            self._canClose = true
            self:setShowFinish(true)
       		--抛出新手事件出新手事件
    		G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
        end
    end

    self._canClose = false
    self:setShowFinish(false)

    local len = #self._activeData.heroIds + 1
	local effect = G_EffectGfxMgr:createPlayMovingGfx(self, "moving_yuanfen_"..len.."p", effectFunction, eventFunction , true)
    effect:setPosition(cc.p(0, 0))

    G_AudioManager:playSoundWithId(AudioConst.SOUND_HERO_KARMA) --播音效
end

function PopupHeroKarma:_createActionNode(effect)
	local stc, edc = string.find(effect, "moving_yuanfen_icon_")
	if stc then
		local index = string.sub(effect, edc+1, -1)
		local node = self:_createIconNode(tonumber(index))
    	return node
	end

	return cc.Node:create()
end

function PopupHeroKarma:_createIconNode(index)
	local function effectFunction(effect)
        if effect == "icon_2" then
            local icon = CSHelper.loadResourceNode(Path.getCSB("CommonHeroIcon", "common"))            
            local heroId = self._heroUnitData:getBase_id()
            if index > 1 then
            	heroId = self._activeData.heroIds[index-1]
            end
            if heroId then
        		icon:updateUI(heroId)
				return icon
        	end
        end

        if effect == "effect_yuanfen_faguangkuang" then
            local subEffect = EffectGfxNode.new("effect_yuanfen_faguangkuang")
            subEffect:play()
            return subEffect
        end

        if effect == "effect_yuanfen_shanguang" then
            local subEffect = EffectGfxNode.new("effect_yuanfen_shanguang")
            subEffect:play()
            return subEffect
        end
    		
        return cc.Node:create()
    end

    local function eventFunction(event)
        if event == "finish" then
        
        end
    end

    local node = cc.Node:create()
    local resName = "moving_yuanfen_icon_"..index
	local effect = G_EffectGfxMgr:createPlayMovingGfx(node, resName, effectFunction, eventFunction , false)
    return node
end

--播放缘分激活成功飘字
function PopupHeroKarma:_playKarmaActiveSummary(destinyId)
    local summary = {}

    if destinyId then
        local heroParam = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, self._heroUnitData:getBase_id())
        local config = UserDataHelper.getHeroFriendConfig(destinyId)
        local karmaName = config.friend_name
        local content = Lang.get("summary_karma_active", {
            heroName = heroParam.name,
            colorHero = Colors.colorToNumber(heroParam.icon_color),
            outlineHero = Colors.colorToNumber(heroParam.icon_color_outline),
            karmaName = karmaName
        })
        local param = {
            content = content,
        } 
        table.insert(summary, param)
    end
    
    self:_addBaseAttrPromptSummary(summary)

    G_Prompt:showSummary(summary)
    G_Prompt:playTotalPowerSummary()
end

--加入基础属性飘字内容
function PopupHeroKarma:_addBaseAttrPromptSummary(summary)
    for i, one in ipairs(RECORD_ATTR_LIST) do
        local attrId = one[1]
        local dstNodeName = one[2]
        local diffValue = self._diffAttr[attrId]
        if diffValue ~= 0 then
            local param = {
                content = AttrDataHelper.getPromptContent(attrId, diffValue),
                anchorPoint = cc.p(0, 0.5),
                startPosition = {x = UIConst.SUMMARY_OFFSET_X_ATTR},
            }
            table.insert(summary, param)
        end
    end

    return summary
end

function PopupHeroKarma:_recordBaseAttr()
    local param = {
        heroUnitData = self._heroUnitData,
    }
    local attrInfo = UserDataHelper.getTotalAttr(param)

    local diffAttr = {}
    for i, one in ipairs(RECORD_ATTR_LIST) do
        local id = one[1]
        local lastValue = self._lastAttr[id] or 0
        local curValue = attrInfo[id] or 0
        local diffValue = curValue - lastValue
        diffAttr[id] = diffValue
    end

    self._diffAttr = diffAttr
    self._lastAttr = attrInfo
end

return PopupHeroKarma
