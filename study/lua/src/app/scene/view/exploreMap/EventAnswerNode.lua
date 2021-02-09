local ViewBase = require("app.ui.ViewBase")
local EventAnswerNode = class("EventAnswerNode", ViewBase)

local ExploreAnswer = require("app.config.explore_answer")
local EventAnswerCell = require("app.scene.view.exploreMap.EventAnswerCell")
local scheduler = require("cocos.framework.scheduler")

EventAnswerNode.ANSWER_COUNT = 4

function EventAnswerNode:ctor(eventData)
    self._eventData = eventData
    self._configData = ExploreAnswer.get(eventData:getValue1())
	assert(self._configData ~= nil, "can not find answer config id = "..eventData:getValue1())
    self._answerPanels = {}
    self._myAnswer = eventData:getParam()      --我的答案

    --ui
    self._nodeCell1 = nil       --答案节点1
    self._nodeCell2 = nil       --答案节点2
    self._nodeCell3 = nil       --答案节点3
    self._nodeCell4 = nil       --答案节点4
    self._nodeRight = nil       --正确奖励
    self._talkQuestion = nil    --问题
    self._isVisible = nil
    self._leftTimeLabel = nil --倒计时

    local resource = {
		file = Path.getCSB("EventAnswerNode", "exploreMap"),
        binding = {
        }
	}
    self:setName("EventAnswerNode")
	EventAnswerNode.super.ctor(self, resource)
end

function EventAnswerNode:onCreate()
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end

function EventAnswerNode:onEnter()
    self:_setReward()
    self:_setQuestion()
    self:_setAnswer()
    if self._myAnswer ~= 0 then
        self:_showAnswer()
    end
    self._isVisible = true
    --抛出新手事件出新手事件
    self._countDownScheduler = scheduler.scheduleGlobal(handler(self, self._onTimer), 0.5)
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function EventAnswerNode:onExit()
    self._isVisible = nil
    scheduler.unscheduleGlobal(self._countDownScheduler)
    self._countDownScheduler = nil
end

--设置答对答错奖励
function EventAnswerNode:_setReward()
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local rightItemParams = TypeConvertHelper.convert(self._configData.right_type, self._configData.right_resource)
    if rightItemParams.res_mini then
        self._rightResIcon:loadTexture(rightItemParams.res_mini)
    end
    self._rightResSize:setString(self._configData.right_size)

    local wrongItemParams = TypeConvertHelper.convert(self._configData.wrong_type, self._configData.wrong_resource)
    if wrongItemParams.res_mini then
        self._wrongResIcon:loadTexture(wrongItemParams.res_mini)
    end
    self._wrongResSize:setString(self._configData.wrong_size)
end

--设置问题
function EventAnswerNode:_setQuestion()
    local question = self._configData.description
    self._talkQuestion:setString(question)
end

--设置回答
function EventAnswerNode:_setAnswer()
    for i= 1, EventAnswerNode.ANSWER_COUNT do
        local eventAnswerCell = EventAnswerCell.new(self._configData, i, handler(self, self._onAnswerClick))
        self["_nodeCell"..i]:addChild(eventAnswerCell)
        table.insert(self._answerPanels, eventAnswerCell)
    end
end

--点击答案
function EventAnswerNode:_onAnswerClick(index)

    -- 超出游历时间
    local endTime = self._eventData:getEndTime()
    local curTime =  G_ServerTime:getTime()
    if curTime > endTime then
        G_Prompt:showTip(Lang.get("explore_event_time_over"))
        return
    end

    --如果已经有答案了，拒绝输入
    if self._myAnswer ~= 0 then
        return
    end
    self._myAnswer = index
    -- self._eventData:setParam(self._myAnswer)

    G_UserData:getExplore():c2sExploreDoEvent(self._eventData:getEvent_id(), self._myAnswer)
end

--处理事件
function EventAnswerNode:doEvent(message)
    local function callback()
		if rawget(message, "awards") then
			local rewards = {}
			for i, v in pairs(message.awards) do
				local reward =
				{
					type = v.type,
					value = v.value,
					size = v.size,
				}
				table.insert(rewards, reward)
			end
            G_Prompt:showAwards(rewards)

            --引导下一步
            if G_TutorialManager:isDoingStep(19) and self._isVisible then
                local delayAction = cc.DelayTime:create(0.4)
                local function callStepAction( ... )
                    --抛出新手事件

                    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
                end

                local callAction = cc.CallFunc:create(callStepAction)
                self:runAction(cc.Sequence:create(delayAction,callAction))
            end
			-- local PopupGetRewards = require("app.ui.PopupGetRewards").new()
			-- PopupGetRewards:showRewards(rewards)
		end
    end
	G_UserData:getExplore():setEventParamById(self._eventData:getEvent_id(), self._myAnswer)
    local isRight = self:_showAnswer()
    -- callback()
    if isRight then
        G_Prompt:showTip(Lang.get("explore_answer_right"), callback)
    else
        G_Prompt:showTip(Lang.get("explore_answer_wrong"), callback)
    end
end

--显示答案
function EventAnswerNode:_showAnswer()
    for _, v in pairs(self._answerPanels) do
        v:disableAnswer()
    end
    -- local rightAnswer = self._configData.right_answer
    local rightAnswer = self._eventData:getValue2()
    if self._myAnswer ~= rightAnswer then
        self._answerPanels[self._myAnswer]:setRight(false)
        self._answerPanels[rightAnswer]:setRight(true)
    else
        self._answerPanels[self._myAnswer]:setRight(true)
    end
    return self._myAnswer == rightAnswer
end

function EventAnswerNode:_onTimer()
    self._leftTimeLabel:setString(G_ServerTime:getLeftSecondsString(self._eventData:getEndTime(), "00:00:00"))
end

return EventAnswerNode
