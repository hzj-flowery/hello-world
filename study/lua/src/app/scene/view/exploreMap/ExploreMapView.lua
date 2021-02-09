local ViewBase = require("app.ui.ViewBase")
local ExploreMapView = class("ExploreMapView", ViewBase)
local ExploreMapHelper = require("app.scene.view.exploreMap.ExploreMapHelper")
local ExploreMap = require("app.config.explore_map")
local Path = require("app.utils.Path")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local CSHelper  = require("yoka.utils.CSHelper")
local Role = require("app.config.role")
local ExploreConst = require("app.const.ExploreConst")
local AudioConst = require("app.const.AudioConst")
local Queue = require("app.utils.Queue")
local ExploreMapLayer = require("app.scene.view.exploreMap.ExploreMapLayer")
local ParameterIDConst = require("app.const.ParameterIDConst")


ExploreMapView.MAX_ROLL_TIME = 99999 --自动游历次数限制

function ExploreMapView:ctor(id)
    --ui csb node
    self._scrollMap = nil   --滚动容器
    self._exploreProgress = nil  --百分比文字
    self._expProgress = nil     -- 升级经验
    self._topBar = nil          --顶部条
    self._panelEffect = nil     --effect黑色背景
    self._nodeEffect = nil      --特效播放节点
    self._checkBox = nil        --自动游历
    self._openTips = nil        --自动游历提示文本
    self._checkBoxOneKey = nil
    self._openTipsOneKey = nil
    self._nodeCheckbox = nil    --复选框占位
    self._nodeTips = nil        --tips占位

    self._btnRoll = nil         --游历按键
    self._imageRedNum = nil
    -- UI
    self._mapLayer = nil         --地图信息
    self._eventIcons = nil           --游历事件icons
    self._exploreGainEft = nil      --播放获得动画的节点
    self._diceEffect = nil      --骰子特效
    --数据
    self._data = G_UserData:getExplore():getExploreById(id)

    self._baseAwards = {}       --每次走完后奖励
    self._crit = 1              --每次走完之后奖励的倍数
    self._isDouble = false      -- 老玩家回归双倍标志
    self._additionAward = {}    --额外奖励
    self._finishExplore = false --是否完成
    self._canDoDice = true      --是否可以点击骰子
    self._diceNum = 0           --投出的格子数
    self._remainCount = 0           ----剩余游历次数
    self._isFirstOnEnter = true     -- 第一次进入界面, 不是从其他界面pop 回来
    self._isNotFirstPass = nil      --非首次通关
    self._isPlayAction = nil


    --动作列表 （ 主要解决 同时播2个action 的问题 ）
    --当 半价商店 或 慕名而来 因时间到了 在播消失时 正好奇遇事件触发
    self._actionsQueue = Queue.new(10)

    self._moveFinishTutorialStepCount = 0 --确保 move finish 只会pao
	local resource = {
		file = Path.getCSB("ExploreMapView", "exploreMap"),
		size = G_ResolutionManager:getDesignSize(),
		binding = {
            _btnRoll = {
                events = {{event = "touch", method = "_onBtnRoll"}}
            }
		}
	}

    self:setName("ExploreMapView")
	ExploreMapView.super.ctor(self, resource)
end

function ExploreMapView:onCreate()

    dump(self._data)
    self._topBar:setTitle(self._data:getConfigData().name, 40, Colors.DARK_BG_THREE, Colors.DARK_BG_OUTLINE)
 	local TopBarStyleConst = require("app.const.TopBarStyleConst")
	self._topBar:updateUI(TopBarStyleConst.STYLE_EXPLORE)

    self._checkBox:addEventListener(handler(self, self._onClickCheckBox))
    self._checkBoxOneKey:addEventListener(handler(self, self._onClickCheckBoxOneKey))


    self._imageRedNum:setVisible(false)
    --初始化UI
    self._mapLayer = ExploreMapLayer.new(self._scrollMap, self._data)
    self:_addParticle()
    self._panelEffect:setVisible(false)
    self._nodeEffectOriginPos = cc.p(self._nodeEffect:getPositionX(),self._nodeEffect:getPositionY())
    --游历事件UI
    local ExploreMapViewIcons = require("app.scene.view.exploreMap.ExploreMapViewIcons")
    self._eventIcons = ExploreMapViewIcons.new(self, self._eventIconListView)
    self._isNotFirstPass = G_UserData:getExplore():isExplorePass(self._data:getId())
	local posx = self._eventIconListView:getPositionX()
	self._eventIconListView:setPositionX(posx + G_ResolutionManager:getBangOffset())
end

function ExploreMapView:onEnter()
    G_AudioManager:playMusicWithId(AudioConst.MUSIC_EXPLORE)
    self._signalRollExplore = G_SignalManager:add(SignalConst.EVENT_EXPLORE_ROLL, handler(self, self._onEventRollExplore))
    self._signalGetReward = G_SignalManager:add(SignalConst.EVENT_EXPLORE_GET_REWARD, handler(self, self._onEventGetReward))
    -- self._signalRecvRecoverInfo = G_SignalManager:add(SignalConst.EVENT_RECV_RECOVER_INFO, handler(self, self._refreshCanDiceNum))
    self:_reset()

    self._isFirstOnEnter =  nil
    --抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)

    --G_TutorialManager:skipCurrentTutorial()
end



function ExploreMapView:onExit()
    self._signalRollExplore:remove()
    self._signalRollExplore = nil
    self._signalGetReward:remove()
    self._signalGetReward = nil
    -- self._signalRecvRecoverInfo:remove()
    -- self._signalRecvRecoverInfo = nil

    G_Prompt:clearTips()--清除tip的回调
end

--粒子特效
function ExploreMapView:_addParticle(  )
    -- body
    local particleName = self._data:getConfigData().fly
    if particleName and particleName ~= "" then
        local emitter = cc.ParticleSystemQuad:create(Path.getParticle(particleName))
        if emitter then
            self._particleNode:addChild(emitter)
            emitter:resetSystem()
        end
    end
end


-- 重置数据
function ExploreMapView:_reset()
    -- 停止所用action和特效
    self:stopAllActions()
    self._nodeEffect:stopAllActions()
    self._nodeEffect:removeAllChildren()
    -- action 队列 清空
    self._actionsQueue:clear()

    -- 重置变量
    self._canDoDice = true
    self._isPlayAction = nil
    self._data = G_UserData:getExplore():getExploreById(self._data:getId())

    --创建重置地图
    self._mapLayer:createMap(self._data, not self._isNotFirstPass)
    self._mapLayer:resetStatus()

    --重置特效
    self:_createGainEft() -- 经验 获取tips
    self:_createDiceEffect() -- 骰子特效
    -- 设置checkbox状态
    self:_setCheckBoxState()

    --检查是否到已经到了
    self:_checkEnd()
    self:_refreshUI()
    self:_nextDice()

    self._eventIcons:initDataAndUI()
    if self._isFirstOnEnter then
        --pop 回来不播放onEnter action
        self:pushAction(function()
            self._eventIcons:runFirstOnEnterAction(function()
                if self._eventIcons:getCurVisibelIconsNum() > 0 then
                    self:_eventIconAppearForGuide()
                end
                self:nextAction()
            end)
        end)
    end
end
--创建获得动画
function ExploreMapView:_createGainEft()
    if self._exploreGainEft then
        self._exploreGainEft:removeFromParent()
        self._exploreGainEft = nil
    end
    self._exploreGainEft = require("app.scene.view.exploreMap.ExploreGainEft").new()
    self._exploreGainEft:setPosition(cc.p(G_ResolutionManager:getDesignWidth()*0.5, G_ResolutionManager:getDesignHeight()*0.5 + 100))
    self:addChild(self._exploreGainEft)
end

--创建骰子特效
function ExploreMapView:_createDiceEffect()
    if self._diceEffect then
        self._diceEffect:resetSkeletonPose()
        self._diceEffect:removeSelf()
        self._diceEffect = nil
    end
    self._diceEffect = require("yoka.node.SpineNode").new(1)
    self._diceEffect:setAsset(Path.getEffectSpine("ui101"))
    self._diceEffect:setVisible(false)
    self:addChild(self._diceEffect)

    local pos = self._mapLayer:getWorldPositionByIndex()
    local nodePos = self:convertToNodeSpace(pos)


    self._diceEffect:setPosition(nodePos)
    self._diceEffect.signalComplet:add(function ( ... )
        self:_onDiceFinish()
    end)
end


--跳到底，如果有宝箱没有领
function ExploreMapView:_checkEnd()
    local reward = self._data:getAward()
    if #reward ~= 0 or self._mapLayer:isActorRunEnd() then
        self._finishExplore = true
        logWarn("ExploreMapView----------------- _checkEnd ")
    end
end

--刷新ui
function ExploreMapView:_refreshUI()
    self:_refreshBoxPercent()
    -- self:_refreshCanDiceNum()
end

function ExploreMapView:_refreshBoxPercent()
    local percent = self._mapLayer:getPercent()
    self._exploreProgress:setString(""..percent.."%")

    local userBase = G_UserData:getBase()
    local exp = userBase:getExp()
    local roleData  = Role.get( userBase:getLevel() )
    if roleData then
        local percent = math.floor(exp / roleData.exp * 100)
        if percent > 100 then
          percent = 100
        end
        self._expProgress:setString(""..percent.."%")
    end
end

-- function ExploreMapView:_refreshCanDiceNum()
--     self._imageRedNum:setVisible(false)

--     -- local energyNum = G_UserData:getBase():getResValue(DataConst.RES_SPIRIT)
--     -- local count = math.floor(energyNum/2)
--     -- if count >= 1 then
--     --  self._canRunNum:setString(count)
--     --  self._imageRedNum:setVisible(true)
--     -- else
--     --  self._imageRedNum:setVisible(false)
--     -- end

-- end
--骰子动画结束
function ExploreMapView:_onDiceFinish()
    self._diceEffect:setVisible(false)
    self._exploreGainEft:startEffect(self._baseAwards, self._crit, handler(self, self._finishTextSummary), self._isDouble)
    self._mapLayer:moveForward(self._diceNum, handler(self, self._moveFinish))
end


--角色移动完成回调
function ExploreMapView:_moveFinish()
    local pos = self._mapLayer:getWorldPositionByIndex()
    local nodePos = self:convertToNodeSpace(pos)
    self._diceEffect:setPosition(nodePos)
    --只有在游历引导阶段，该事件才有效
    if G_TutorialManager:isDoingStep(18) or G_TutorialManager:isDoingStep(19) then
        --抛出新手事件出新手事件
        if self._moveFinishTutorialStepCount == 0 then
            self._moveFinishTutorialStepCount = self._moveFinishTutorialStepCount + 1
            G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "ExploreMapView:_moveFinish")
        end
    end
end

--游历到终点处理
function ExploreMapView:_procExploreOver()
    self._remainCount = 0
    self._mapLayer:hidePassBox()

    G_Prompt:showTip(Lang.get("exploer_finish"), handler(self, self._getBoxReward))
end



function ExploreMapView:_setCheckBoxState()
    local FunctionCheck = require("app.utils.logic.FunctionCheck")
    local FunctionConst	= require("app.const.FunctionConst")
    local isOpen, des = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EXPLORE_ROLL_TEN)
    if not isOpen then
        local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_EXPLORE_ROLL_TEN)
        self._checkBox:setSelected(true)
        self._checkBox:setEnabled(false)
        self._openTips:setString(Lang.get("explore_open_multiple_level_tips", {level = funcLevelInfo.level}))
     
    else
        -- 未开启时 策划特殊要求要显示一个灰色的勾选状态  当 升级开启等级后 刚勾选状态取消
        if not self._checkBox:isEnabled() then
            self._checkBox:setSelected(false)
        else

            self._checkBox:setSelected(G_UserData:getExplore():getAutoExplore() == ExploreConst.EXPLORE_AUTO)
        end
        self._checkBox:setEnabled(true)
        self._openTips:setString(Lang.get("explore_opened_multiple_tips"))
        
    end


    local oneKeyOpen, des = FunctionCheck.funcIsOpened(FunctionConst.FUNC_EXPLORE_ROLL_ONE_KEY)
    if not oneKeyOpen then
        local funcLevelInfo = require("app.config.function_level").get(FunctionConst.FUNC_EXPLORE_ROLL_ONE_KEY)
        self._checkBoxOneKey:setSelected(true)
        self._checkBoxOneKey:setEnabled(false)
        self._openTipsOneKey:setString(Lang.get("explore_open_one_key_tips", {level = funcLevelInfo.level}))
    else
        -- 未开启时 策划特殊要求要显示一个灰色的勾选状态  当 升级开启等级后 刚勾选状态取消
        if not self._checkBoxOneKey:isEnabled() then
            self._checkBoxOneKey:setSelected(false)
        else

            self._checkBoxOneKey:setSelected(G_UserData:getExplore():getAutoExplore() == ExploreConst.EXPLORE_ONE_KEY)
        end
        self._checkBoxOneKey:setEnabled(true)
        self._openTipsOneKey:setString(Lang.get("explore_opened_one_key_tips"))
    end
    if oneKeyOpen then
        self._checkBox:setPosition(-306.84, 85.28)
        -- self._openTips:setPosition(55.13,27.30)
        -- self._openTips:setAnchorPoint(cc.p(0,0.5))

        self._checkBoxOneKey:setVisible(true)
    else
        -- self._checkBox:setPosition(-253.63,53.70)
        -- self._openTips:setPosition(27.01, -11.66)
        -- self._openTips:setAnchorPoint(cc.p(0.5,0.5))

        self._checkBoxOneKey:setVisible(false)
        if not isOpen then
            --11级以下
            self._openTips:setPosition(cc.p(self._nodeTips:getPositionX(), self._nodeTips:getPositionY()))
            self._checkBox:setPosition(cc.p(self._nodeCheckbox:getPositionX(), self._nodeCheckbox:getPositionY()))
        else
            --只有自动游历
            self._openTips:setPosition(cc.p(55, 23))
            self._checkBox:setPosition(cc.p(self._checkBoxOneKey:getPositionX(), (self._checkBoxOneKey:getPositionY() + self._checkBox:getPositionY())  / 2))
        end
    end
end

function ExploreMapView:_onClickCheckBox(checkbox, event)
    G_UserData:getExplore():setAutoExplore(event == 0 and ExploreConst.EXPLORE_AUTO or 0)
    self._checkBoxOneKey:setSelected(false)
    if event == 1 then
        if self._remainCount > 0 then
            self:_onFinishMultiple()
        end
    end
end

function ExploreMapView:_onClickCheckBoxOneKey(checkbox, event)
    G_UserData:getExplore():setAutoExplore(event == 0 and ExploreConst.EXPLORE_ONE_KEY or 0)
    self._checkBox:setSelected(false)
    if event == 1 then
        if self._remainCount > 0 then
            self:_onFinishMultiple()
        end
    end
end


function ExploreMapView:_onBtnRoll()
    -- 通关之后 快速点击 屏蔽
    if self._finishExplore then
        return
    end
    if self._remainCount > 0 then
        self:_onFinishMultiple()
    else
        --local isCheck = self._checkBox:isSelected()
        --local isEnable = self._checkBox:isEnabled()
        if self:_isAutoExplore() then
            self:_onBeginMultiple()
        elseif self:_isOneKeyExplore() then
            local UIPopupHelper = require("app.utils.UIPopupHelper")
            UIPopupHelper.popupConfirm(Lang.get("explore_one_key_confirm"),function()
                 self:_onBeginMultiple()
            end)
        else
            self:_onDice()
        end
    end
end
-- 一次游历
function ExploreMapView:_onDice()
    if not self._canDoDice then
        self:_onFinishMultiple()
        return
    end
    local reward = self._data:getAward()
    if #reward ~= 0 then
        -- G_Prompt:showTip(Lang.get("explore_box_notice"))
        self:_onFinishMultiple()
        return
    end
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local bagFull = LogicCheckHelper.isPackFull(TypeConvertHelper.TYPE_TREASURE  )
    if bagFull then
        self:_onFinishMultiple()
        return
    end
    local configData = self._data:getConfigData()
    local needSprit = configData.roll_size
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_SPIRIT, needSprit)
    if not success then
        self:_onFinishMultiple()
        return
    end
    G_UserData:getExplore():c2sRollExplore(self._data:getId())
end

--自动游历  下一次
function ExploreMapView:_nextDice()
    -- self._layerEffect:setVisible(false)
    self._panelEffect:setVisible(false)
    if self._finishExplore then
        self:_procExploreOver()
    end
    self._canDoDice = true
    if self._remainCount > 0 then
        self._remainCount = self._remainCount - 1
        self:_onDice()
    end
    if self._remainCount == 0 then
        self:_onFinishMultiple()
    end
end

--开始自动游历
function ExploreMapView:_onBeginMultiple()
    self._remainCount = ExploreMapView.MAX_ROLL_TIME - 1    -- 0-9 10次，不然会多一次
    self._mapLayer:setActorAutoExploreWord(true)
    self._btnRoll:loadTextures(Path.getExploreImage("txt_youli_tingzhi01"),nil, nil, 0)
    self:_onDice()
end
--结束游历多次次
function ExploreMapView:_onFinishMultiple()
    self._remainCount = 0
    self._mapLayer:setActorAutoExploreWord(false)
    self._btnRoll:loadTextures(Path.getExploreImage("txt_youli_kaishi01"), nil, nil, 0)
end

--收到骰子消息
function ExploreMapView:_onEventRollExplore(eventName, message)
    local num = message.num
    local diceEffectNum = num

    local willEnd, fixNum = self._mapLayer:checkActorWillRunEnd(num)
    if willEnd then
        num = fixNum
        self._finishExplore = true
        diceEffectNum = math.random(num, 6)
    end
    -- 播放骰子动画
    self:_startDiceAnim(num, diceEffectNum)

    -- 奖励 先保存下来  等待 骰子动画播放完成  在播
    self._baseAwards = {}
    self._crit = 1
    if rawget(message, "base_award") then
        for i, v in pairs(message.base_award) do
            local award =
            {
                type = v.type,
                value = v.value,
                size = v.size,
            }
            table.insert(self._baseAwards, award)
        end
        table.sort(self._baseAwards, function(a, b) return a.value > b.value end)
    end
    if rawget(message, "crit") then
        self._crit = message.crit
    end

    if rawget(message, "is_double") then
        self._isDouble = message.is_double
    end

    self._additionAward = {}
    if rawget(message, "box_award") then
        for i, v in pairs(message.box_award) do
            local award =
            {
                type = v.type,
                value = v.value,
                size = v.size,
            }
            table.insert(self._additionAward, award)
        end
    end
end

--骰子开始  diceNum 实际点数  diceEffectNum 特效播放点数--（最后一次与diceNum 不同 ）
function ExploreMapView:_startDiceAnim(diceNum, diceEffectNum)
    self._diceNum = diceNum
    self._canDoDice = false
    self._mapLayer:jumpMap()
    self._diceEffect:setAnimation("dice"..diceEffectNum)
    self._diceEffect:setVisible(true)
	G_AudioManager:playSoundWithId(AudioConst.SOUND_EXPLORE_DICE)
end


--到达终点
function ExploreMapView:_exploreOver()
    self._data:clearRollNum()
    local UserCheck = require("app.utils.logic.UserCheck")
	--首次通关map
	if not self._isNotFirstPass then
		G_UserData:getExplore():setFirstPassCity(self._data:getId())
	end

    local levelUp = UserCheck.isLevelUp(function(showLevelUp)
        --引导阶段，弹出升级界面，不做popScene处理
        if G_TutorialManager:isDoingStep() == true and showLevelUp == true then

        elseif self:_isOneKeyExplore() then --一键游历
            self._isNotFirstPass = G_UserData:getExplore():isExplorePass(self._data:getId())
            self._finishExplore = false
            self:_reset()
            self:_onBeginMultiple()
        else
            G_SceneManager:popScene()
        end
    end)
end

--格子弹出获得物品后回掉
function ExploreMapView:_finishTextSummary()
    --检查是否升级
    if self._finishExplore then
        self:_procExploreOver()
    else
        local UserCheck = require("app.utils.logic.UserCheck")
        local levelUp = UserCheck.isLevelUp(handler(self, self._checkAdditionAward))
        if levelUp then
            self:_setCheckBoxState()
            --当触发升级的时候 停止自动游历
            self:_onFinishMultiple()
        end
        self:_refreshUI()
    end
end

--意外获得
function ExploreMapView:_checkAdditionAward()
    if #self._additionAward == 0 then
        self:_checkEventTrigger()
        return
    end
    G_Prompt:showAwards(self._additionAward or {})
    self:_finishGetEft()
end

--自动结束天降宝物
function ExploreMapView:_finishGetEft()
    local action1 = cc.DelayTime:create(0.3)
    local action2 = cc.CallFunc:create(function()
            self:_nextDice()
            self._mapLayer:hideCurPosIcon()
        end)
    local action = cc.Sequence:create(action1, action2)
    self:runAction(action)
end

--检查事件触发
function ExploreMapView:_checkEventTrigger()
    -- local moveDuration = 0.5

    local eventType = self._mapLayer:getCurPosEventType()
    if eventType ~= 0 then
        if self._mapLayer:isCurPosTreasure() then
            self:_nextDice()
        else
            self:_playEventEffect(eventType)
        end
        self._mapLayer:hideCurPosIcon()
    else
        self:_nextDice()
    end
end


--出发奇遇动画
function ExploreMapView:_playEventEffect(type)
    local function createEventEffectFunc()
		self._eventIcons:updateEventIconsDataByType(type)
		self._eventIcons:checkIconInVisibleViewPort(type, function()

		end)
		self._panelEffect:setVisible(true)
		local ExploreDiscover = require("app.config.explore_discover")
		local discoverData = ExploreDiscover.get(type)
		assert(discoverData, "type = "..type)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		local function effectFunction(effect)
			if string.find(effect, "effect_") then
				local subEffect = EffectGfxNode.new(effect)
				subEffect:play()
				return subEffect
			elseif effect == "tubiao" then
				local spriteName = Path.getExploreIconImage(discoverData.res_id2.."_icon")
				local sprite = display.newSprite(spriteName)
				return sprite
			elseif effect == "mingzi" then
				local labelName = cc.Label:createWithTTF("【"..discoverData.name.."】", Path.getCommonFont(), 22)
				local color, outline = Colors.getFTypeColor()
				labelName:setColor(color)
				labelName:enableOutline(outline, 2)
				return labelName
			end
		end
		local function eventFunction(event)
			if event == "finish" then
				self:_addEventIcons(type)
			elseif event == "beijing" then
				self._panelEffect:setVisible(false)
			end
		end

		self._nodeEffect:setPosition(self._nodeEffectOriginPos)
		self._nodeEffect:setScale(1)
		local effect = G_EffectGfxMgr:createPlayMovingGfx( self._nodeEffect, "moving_chufaqiyu", effectFunction, eventFunction ,false )
		G_AudioManager:playSoundWithId(AudioConst.SOUND_EXPLORE_EVENT)
	end
    self:pushAction(createEventEffectFunc)
end

-- 奇遇特效播放 完成后 播放icons动作
function ExploreMapView:_addEventIcons(eventType)
    assert(eventType ~= nil, "eventType == nil")
    -- self._eventIcons:updateEventIconsDataByType(eventType)
    -- self._eventIcons:checkIconInVisibleViewPort(eventType, function()
        local targetPos = self._eventIcons:getIconWorldPosByType(eventType)
        assert(targetPos ~= nil, "targetPos == nil")
        local parent = self._nodeEffect:getParent()
        targetPos = parent:convertToNodeSpace(targetPos)
        local time = math.sqrt((targetPos.x - self._nodeEffectOriginPos.x)*(targetPos.x - self._nodeEffectOriginPos.x) +
                                (targetPos.y - self._nodeEffectOriginPos.y)*(targetPos.y - self._nodeEffectOriginPos.y))/1600.0
        local moveToAction = cc.MoveTo:create(time, targetPos)
        local sclaeToAction = cc.ScaleTo:create(time, 0.3)
        local spawnAction = cc.Spawn:create(moveToAction, sclaeToAction)
        local callFuncAction = cc.CallFunc:create(function()
            self._nodeEffect:removeAllChildren()
            self._eventIcons:doLayout(eventType, function()
                self:_eventIconAppearForGuide()
                self:_nextDice()
                self:nextAction()
            end)
        end)
        local seqAction = cc.Sequence:create(spawnAction, callFuncAction)
        self._nodeEffect:runAction(seqAction)
    -- end)
end

--点击宝箱领取
function ExploreMapView:_getBoxReward()
    self._finishExplore = true
    G_UserData:getExplore():c2sExploreGetReward(self._data:getId())
end

--获得通关奖励
function ExploreMapView:_getExplorePassAwards()
    local passAwards = {}
    local configData = self._data:getConfigData()
    if self._isNotFirstPass then       --不是第一次通关
        for i = 1, 3 do
            local award =
            {
                type = configData["reward"..i.."_type"],
                value = configData["reward"..i.."_resource"],
                size = configData["reward"..i.."_size"],
            }
            if award.type and award.type ~= 0 then
                table.insert(passAwards, award)
            end
        end
    else        --第一次通关奖励
        for i = 1, 3 do
            local award =
            {
                type = configData["first"..i.."_type"],
                value = configData["first"..i.."_resource"],
                size = configData["first"..i.."_size"],
            }
            if award.type and award.type ~= 0 then
                table.insert(passAwards, award)
            end
        end
    end
    return passAwards
end

--领取成功
function ExploreMapView:_onEventGetReward(eventName, message)
    local popupGetRewards = require("app.ui.PopupGetRewards").new(handler(self, self._exploreOver))
    local title = ""
    local titlePath = ""
    if self._isNotFirstPass then
        title = Lang.get("explore_box_title_normal")
        titlePath = Path.getSystemImage("txt_sys_tongguanbaoxiang")
    else
        title = Lang.get("explore_box_title_first")
        titlePath = Path.getSystemImage("txt_sys_shoutongbaoxiang")
    end
    local awards = self:_getExplorePassAwards()

    if self:_isOneKeyExplore() then
        local onEventCallback = function(event)
            if event == "anim" then
                --继续游历
                popupGetRewards:close()
            elseif event == "close" then
                if self._popupSignal then
                    self._popupSignal:remove()
                    self._popupSignal = nil
                end
            end
        end
        self._popupSignal = popupGetRewards.signal:add(onEventCallback)
    end

    popupGetRewards:show(awards, title, nil, nil, titlePath)


end

--序列播放action 避免多个动画一起执行导致bug
function ExploreMapView:pushAction(func)
    self._actionsQueue:push(func)
    if not self._isPlayAction then
        self._isPlayAction = true
        self:nextAction()
    end
end
--播放下一个 action
function ExploreMapView:nextAction()
    local func = self._actionsQueue:pop()
    if not func then
        self._isPlayAction = nil
        return
    end
    func()
end

--引导游历事件 动画播放完成触发显示接口
function ExploreMapView:_eventIconAppearForGuide()

    --hardCode..
    --只有在游历引导阶段，该事件才有效
    if G_TutorialManager:isDoingStep(18) or G_TutorialManager:isDoingStep(19) then
        --抛出新手事件出新手事件
        G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, "ExploreMapView:_eventIconAppearForGuide")
    end

end

function ExploreMapView:_isAutoExplore()
  local isCheck = self._checkBox:isSelected()
  local isEnable = self._checkBox:isEnabled()
    if isCheck and isEnable then
        return true
    end
    return false
end

function ExploreMapView:_isOneKeyExplore()
    local isCheck = self._checkBoxOneKey:isSelected()
    local isEnable = self._checkBoxOneKey:isEnabled()
    if isCheck and isEnable then
        return true
    end
    return false
end

return ExploreMapView
