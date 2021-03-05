--奖励
local PopupBase = require("app.ui.PopupBase")
local PopupGetRewards = class("PopupGetRewards", PopupBase)
local CSHelper  = require("yoka.utils.CSHelper")
local AnimationConst = require("app.const.AnimationConst")
local AudioConst = require("app.const.AudioConst")

local LINE_ITEM_COUNT = 5  -- 一行5个ICON
local LINE_ITEM_BLACK = 45 -- 物品横排间隔
local LINE_ITEM_BLACK_V = 32 -- 物品横排间隔
local LINE_ITEM_VERTICAL_BLACK = 142

function PopupGetRewards:ctor(callback)
    self._awards = nil
    self._fromText = nil
    self._tipsText = nil
    self._finishCallback = callback
    self._btn = nil
    self._layerColor = nil
    self._scrollView = nil
    self._commonContinueNode = nil
    self._itemShowTimes = 1

    
	PopupGetRewards.super.ctor(self,nil,false,true)

    self._resourceNode = self

    self._titleImagePath = Path.getPopupReward("img_gain_boradtxt01")
    self:setName("PopupGetRewards")
    self:setShowFinish(false)
end

function PopupGetRewards:onEnter()
    self._itemShowTimes = 1
    --self:setShowFinish(false)
end

function PopupGetRewards:onClose( ... )
    -- body
    if self._finishCallback then
		self._finishCallback()
	end
end

function PopupGetRewards:onExit()


    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_START, self.__cname)
end


function PopupGetRewards:_updateAwards(rewardParentNodes, awards, isDouble)
    local itemScale = 1 ---缩放80%
    local itemWidgets = {}
    local lineNum = math.ceil(#awards/LINE_ITEM_COUNT)--行数
    local maxCol = lineNum <= 1 and #awards or LINE_ITEM_COUNT
    local commonTemSize = cc.size(0,0)
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")

    for i = 1, #awards, 1 do
        local award = awards[i]
        local size = isDouble == true and award.size * 2 or award.size
        local itemNode = require("app.ui.component.ComponentIconHelper").createIcon(award.type, award.value, size)
		local itemPanel = itemNode:getSubNodeByName("_panelItemContent")
		-- local itemSize = itemPanel:getContentSize()
        local itemSize = cc.size(98,98) --  因为panel size都是98 

        if rawequal(award.type, TypeConvertHelper.TYPE_HEAD_FRAME) then
            itemScale = (itemScale * 1.0)
        end

        itemNode:showDoubleTips(isDouble)

        if award.type == TypeConvertHelper.TYPE_PET then
            itemNode:showPetIconInitialStars()
        end

		itemNode:showName(true)
        rewardParentNodes:addChild(itemNode)

        local currLineNum = math.ceil(i/LINE_ITEM_COUNT)--行数
        local currCol = i - (currLineNum -1) * LINE_ITEM_COUNT

        currLineNum = lineNum - currLineNum + 1

        local x = (currCol - 1) * itemSize.width * itemScale + (currCol - 1) * LINE_ITEM_BLACK
        local y = (currLineNum -1) * itemSize.height * itemScale + (currLineNum -1) * LINE_ITEM_BLACK_V + 22--补上最后一排的道具名
        itemNode:setPositionX(x + itemSize.width * itemScale * 0.5)
        itemNode:setPositionY(y + itemSize.height * itemScale * 0.5)
        itemWidgets[i] = itemNode

        commonTemSize = itemSize
    end

    local totalW = maxCol * commonTemSize.width * itemScale + math.max(maxCol - 1,0) * LINE_ITEM_BLACK
    local totalH = lineNum * commonTemSize.height * itemScale  + math.max(lineNum -1,0 ) * LINE_ITEM_BLACK_V

    if lineNum > 0 then
        totalH = totalH + 22--补上最后一排的道具名
    end

    rewardParentNodes:setContentSize(cc.size(totalW,totalH))
    return itemWidgets
end

-- 自动合并相同的道具
function PopupGetRewards:showRewardsWithAutoMerge(awards,finishCallback)
    local tempAwards = {}
    local keyMap = {}
    for k, v in ipairs(awards) do
        local key = string.format("%s_%s", v.type, v.value)
        local index = keyMap[key]
        if not index then
            index = k
            keyMap[key] = index
            local temp = {}
            temp.type = v.type
            temp.value = v.value
            temp.size = 0
            tempAwards[index] = temp
        end
        tempAwards[index].size = tempAwards[index].size + v.size
    end
    self:show(tempAwards,nil,nil,finishCallback)
end

function PopupGetRewards:showRewards(awards,finishCallback)
    self:show(awards,nil,nil,finishCallback)
end


function PopupGetRewards:_createTouchLayer(isDrawCard)
    --创建屏蔽层
    local numAlpha =  0.75
    local layerColor = cc.LayerColor:create(cc.c4b(0, 0, 0, 255*numAlpha))
    layerColor:setIgnoreAnchorPointForPosition(false)
    layerColor:setTouchMode(cc.TOUCHES_ONE_BY_ONE)
    layerColor:setTouchEnabled(true)

    layerColor:registerScriptTouchHandler(function(event,x,y)
        if event == "began" then
            return true
        elseif event == "ended" then
           if self:isShowFinish() == true then
                if isDrawCard then
                    G_SignalManager:dispatch(SignalConst.EVENT_GACHA_GOLDENHERO_DRAWCLOSE)
                end
                self:close()
		   end
        end
    end)
    self:addChild(layerColor)
    self._layerColor = layerColor

end
---==========================
---获取奖励弹窗，但以类似提示的样式弹出
---@awards 奖励列表
---@text01 获得来源提示文字
---@text02 tips文字
---@finishCallback 结束回调
---==========================
function PopupGetRewards:show(awards,fromText,tipsText,finishCallback, titleImagePath, isDouble)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_POPUP_REARD)
    
    assert(awards or type(awards) == "table", "Invalid awards " .. tostring(awards))

    if #awards == 0 then
        print("awards length is 0")
        return
    end
    if finishCallback then
         self._finishCallback = finishCallback
    end

    local DropHelper = require("app.utils.DropHelper")
    awards = DropHelper.sortDropList(awards)

    self._awards = awards
    self._fromText = fromText
    self._tipsText = tipsText
    if titleImagePath then
        self._titleImagePath = titleImagePath
    end

    self:_createTouchLayer()
    local effectNode = self:_createEffectNode(self)

    local commonContinueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    commonContinueNode:setPositionY(-289)
    commonContinueNode:setVisible(false)
    self:addChild(commonContinueNode)
    self._commonContinueNode = commonContinueNode

    --创建奖励父节点
    local rewardsNode = ccui.Widget:create()--display.newNode()
    local itemWidgets =  self:_updateAwards(rewardsNode, awards, isDouble)

    local duration = AnimationConst.FRAME_RATE * 9
    if #awards > LINE_ITEM_COUNT then
        local contentSize = rewardsNode:getContentSize()
        local scrollViewSize = cc.size(contentSize.width+40,271)--道具名最大8个字，加40像素避免被切掉
        scrollViewSize.height = math.min(scrollViewSize.height,contentSize.height)
        local scrollView = ccui.ScrollView:create()
        scrollView:setDirection(ccui.ScrollViewDir.vertical)
        scrollView:setScrollBarEnabled(false)
        scrollView:setPosition(cc.p(0,0))
        scrollView:setInnerContainerSize(contentSize)
        scrollView:setContentSize(scrollViewSize)
        scrollView:addChild(rewardsNode)
        self:addChild(scrollView)

        rewardsNode:setAnchorPoint(cc.p(0.5,0))
        rewardsNode:setPosition(scrollViewSize.width* 0.5,0)

        scrollView:setPosition(0,25)
        scrollView:setAnchorPoint(cc.p(0.5,0.5))
        self._scrollView = scrollView
        self._scrollView:setVisible(false)
    else
        self:addChild(rewardsNode)
        rewardsNode:setAnchorPoint(cc.p(0.5,0.5))
        rewardsNode:setPosition(0,45)
        for k,node in ipairs(itemWidgets) do
            local action,time = self:itemAppearAction(duration)
            duration = duration + time
            node:setVisible(false)
            node:setOpacity(0)
            node:runAction(action)
        end
    end


    local delayAction = cc.DelayTime:create(duration)

    local function callStepAction( ... )
        --抛出新手事件
        if self._scrollView then self._scrollView:setVisible(true) end
        self:setShowFinish(true)
        self.signal:dispatch("anim")
        --G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
    end

    local callAction = cc.CallFunc:create(callStepAction)
    self:runAction(cc.Sequence:create(delayAction,callAction))

    self:open()
end

---==========================
---获取奖励弹窗，但以类似提示的样式弹出
---@awards 奖励列表
---@text01 获得来源提示文字
---@text02 tips文字
---@finishCallback 结束回调
---==========================
function PopupGetRewards:showDrawCard(awards,fromText,tipsText,finishCallback, titleImagePath)
    G_AudioManager:playSoundWithId(AudioConst.SOUND_POPUP_REARD)
    
    assert(awards or type(awards) == "table", "Invalid awards " .. tostring(awards))

    if #awards == 0 then
        print("awards length is 0")
        return
    end
    if finishCallback then
         self._finishCallback = finishCallback
    end

    --dump(awards, "PopupGetRewards:showDrawCard bafore ::: ")
    --local DropHelper = require("app.utils.DropHelper")
    --awards = DropHelper.sortDropList(awards)
    --dump(awards, "PopupGetRewards:showDrawCard after ::: ")

    self._fromText = fromText
    self._tipsText = tipsText
    if titleImagePath then
        self._titleImagePath = titleImagePath
    end

    self:_createTouchLayer(true)
    self._layerColor:setTouchEnabled(false)
    local bgSp = display.newSprite(Path.getPopupReward("img_gain_borad01"))
    bgSp:setPositionY(35)
    self:addChild(bgSp)

    local commonContinueNode = CSHelper.loadResourceNode(Path.getCSB("CommonContinueNode", "common"))
    commonContinueNode:setPositionY(-289)
    commonContinueNode:setVisible(true)
    self:addChild(commonContinueNode)

    --创建奖励父节点
    local rewardsNode = ccui.Widget:create()--display.newNode()
    local itemWidgets =  self:_updateAwards(rewardsNode, awards)

    local duration = AnimationConst.FRAME_RATE * 9
    if #awards > LINE_ITEM_COUNT then
        local contentSize = rewardsNode:getContentSize()
        self:addChild(rewardsNode)
        rewardsNode:setAnchorPoint(cc.p(0.5,0))
        rewardsNode:setPosition(0, -90)

        self._clonewidgets = itemWidgets
        self._duration = duration
        self._isContinue = true
        
        for k,node in ipairs(itemWidgets) do
            node:setVisible(false)
            node:setOpacity(0)
        end
    else
        self:addChild(rewardsNode)
        rewardsNode:setAnchorPoint(cc.p(0.5,0.5))
        rewardsNode:setPosition(0,45)

        self._clonewidgets = itemWidgets
        self._duration = duration
        self._isContinue = true
        for k,node in ipairs(itemWidgets) do
            node:setVisible(false)
            node:setOpacity(0)
        end
    end


    local delayAction = cc.DelayTime:create(self._duration)

    local function callStepAction( ... )
        --抛出新手事件
        if self._scrollView then self._scrollView:setVisible(true) end
        self:setShowFinish(true)
        self.signal:dispatch("anim")
        --G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
    end

    local callAction = cc.CallFunc:create(callStepAction)
    self:runAction(cc.Sequence:create(delayAction,callAction))

    self:open()
    self:_loopShowNode()
end

function PopupGetRewards:_showNode(item, isHero, runCallBack)
    isHero =  isHero or false
    local action,_ = self:itemAppearAction(self._duration, isHero, function()
        if self._isContinue then
            self:_loopShowNode()
        else
            if runCallBack then
                runCallBack()
            end
        end
    end)
    self._duration = (self._duration + 0.01)
    item:runAction(action)
end

function PopupGetRewards:_loopShowNode()
    local function finishCallback()
        self._isContinue = true
    end

    if self._clonewidgets and #self._clonewidgets > 0 then
        local node = self._clonewidgets[1]
        local itemParams = node:getItemParams()
        if itemParams.type == 1 then
            self._isContinue = false
            self:_showNode(node, true, function()
                table.remove(self._clonewidgets, 1)
                local GoldHeroShow = require("app.scene.view.gachaDrawGoldHero.GoldHeroShow").new(itemParams.value, function()
                    self._isContinue = true
                    self:_loopShowNode()
                end)
                GoldHeroShow:open()
            end)
        else
            self:_showNode(node)
            table.remove(self._clonewidgets, 1)
        end
    else
        self._layerColor:setTouchEnabled(true)
    end
end


function PopupGetRewards:isAnimEnd()
    return self:isShowFinish()
end
--出现动画
function PopupGetRewards:itemAppearAction(delayTime, isHeroIcon, finishCallback)
    local time = AnimationConst.FRAME_RATE * 3
	return cc.Sequence:create(
		cc.DelayTime:create(delayTime),
        cc.ScaleTo:create(0, 0.7),
        cc.Show:create(),
        cc.CallFunc:create(function( ... )
             if self._itemShowTimes > 10 then --音效只能播放10次
                return
             end
             G_AudioManager:playSoundWithId(AudioConst.SOUND_GET_ONE_REARD)
             self._itemShowTimes =  self._itemShowTimes + 1
        end),
        cc.Spawn:create(cc.ScaleTo:create(time, 1), cc.FadeIn:create(time)),
        cc.DelayTime:create(isHeroIcon and 0.3 or 0),
        cc.CallFunc:create(function()
            if finishCallback then
                finishCallback()
            end
        end)
	),time
end


function PopupGetRewards:_createActionNode(effect)
    
    
    if effect == "txt" then
        local txtSp = display.newSprite(self._titleImagePath)
        return txtSp
    elseif effect == "all_bg" then
         local bgSp = display.newSprite(Path.getPopupReward("img_gain_borad01"))
         return bgSp
    elseif effect == "button" then
        --[[
         local confirmBtn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common"))
         confirmBtn:setString(Lang.get("common_btn_sure"))
         confirmBtn:setCascadeOpacityEnabled(true)
         confirmBtn:setCascadeColorEnabled(true)
         confirmBtn:addClickEventListenerEx(handler(self,self.close))
         confirmBtn:setTouchEnabled(false)--动画跑完才能触发
         confirmBtn:setButtonName("confirmBtn")
         self._btn = confirmBtn
         return confirmBtn
         ]]
         self._btn = self._commonContinueNode
         self._commonContinueNode:setVisible(true)
         return display.newNode()
    elseif effect == "txt_meirilibao" then
        if self._fromText  then
            local labelGetFrom = cc.Label:createWithTTF(self._fromText , Path.getCommonFont(), 20)
            labelGetFrom:setColor(Colors.SYSTEM_TIP )
            labelGetFrom:enableOutline(Colors.SYSTEM_TIP_OUTLINE,2)
            return labelGetFrom
        else
            return display.newNode()
        end
    elseif effect == "txt_shuoming" then
        if self._tipsText then
            local labelTip = cc.Label:createWithTTF(self._tipsText , Path.getCommonFont(), 20)
            labelTip:setColor(Colors.BRIGHT_BG_TWO )
            labelTip:setCascadeOpacityEnabled(true)
            labelTip:setCascadeColorEnabled(true)
            return labelTip
        else
            return display.newNode()
        end

    end
end

function PopupGetRewards:_createEffectNode(rootNode)
    local EffectGfxNode = require("app.effect.EffectGfxNode")
    local TextHelper = require("app.utils.TextHelper")
    local function effectFunction(effect)
        if TextHelper.stringStartsWith(effect,"effect_") then
            local subEffect = EffectGfxNode.new(effect)
            subEffect:play()
            return subEffect
		else
			return self:_createActionNode(effect)
		end
    end
    local function eventFunction(event,frameIndex, movingNode)
        if event == "finish" then

        end
    end
   local node =  G_EffectGfxMgr:createPlayMovingGfx( rootNode, "moving_choujiang_hude", effectFunction, eventFunction , false )
   return node
end

return PopupGetRewards
