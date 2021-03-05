local PopupBase = require("app.ui.PopupBase")
local PopupFamousDetail = class("PopupFamous", PopupBase)
local ChapterConst = require("app.const.ChapterConst")
local CSHelper  = require("yoka.utils.CSHelper")
local Parameter = require("app.config.parameter")
local UIHelper = require("yoka.utils.UIHelper")
local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DropHelper = require("app.utils.DropHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")

local ReturnConst = require("app.const.ReturnConst")

-- PopupFamousDetail.DROP_POS = 
-- {
--     [1] = {cc.p(-10,35)},
--     [2] = {cc.p(-10,35),cc.p(120,35)},
-- }

local POS_Y     = {28,28,67}

function PopupFamousDetail:ctor(stageId)
    self._data = G_UserData:getStage():getStageById(stageId)
    self._configData = self._data:getConfigData()

    self._signalExecuteStage = nil      --打副本

    self._nodeEffect = nil  --特效节点
    local resource = {
		file = Path.getCSB("PopupFamousDetail", "stage"),
		binding = {
			-- _btnFight = {
			-- 	events = {{event = "touch", method = "_onFightClick"}}
			-- },
		}
	}
    self:setName("PopupFamousDetail")

	PopupFamousDetail.super.ctor(self, resource)
end

function PopupFamousDetail:onCreate()
    self:_createAnim()
end

function PopupFamousDetail:onEnter()
    self._signalExecuteStage = G_SignalManager:add(SignalConst.EVENT_EXECUTE_STAGE, handler(self, self._onEventExecuteStage))
end

function PopupFamousDetail:onExit()
    self._signalExecuteStage:remove()
    self._signalExecuteStage = nil
end

function PopupFamousDetail:_createAnim()
    local function effectFunction(effect)
        if effect == "lihui" then
            local heroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonStoryAvatar", "common"))
            heroAvatar:updateUI(self._configData.res_id)
            return heroAvatar
        elseif effect == "jiangli1" then
            local reward = DropHelper.getDropReward(self._configData.first_drop)
            return self:_createReward(1, reward)
        elseif effect == "jiangli2" then
            local myLevel = G_UserData:getBase():getLevel()
            local exp = Parameter.get(ParameterIDConst.MISSION_DROP_EXP).content
            local money = Parameter.get(ParameterIDConst.MISSION_DROP_MONEY).content
            local rewards = {}
            rewards[1] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_EXP, size = myLevel * exp * self._configData.cost }
            rewards[2] = {type = TypeConvertHelper.TYPE_RESOURCE, value = DataConst.RES_GOLD, size = myLevel * money * self._configData.cost }
            return self:_createReward(2, rewards)
        elseif effect == "jiangli3" then
            local rewards = DropHelper.getStageDrop(self._configData)
            return self:_createRewardItem(rewards)
        elseif effect == "tiaozhan" then
            return self:_createFightBtn()
        elseif effect == "xiaohao" then
            return self:_createCostNode()
        elseif effect == "mingzi" then
            return self:_createName()
        elseif effect == "close" then
            return self:_createCloseBtn()
        elseif effect == "duihua" then
            return self:_createTalk()
        end
    end
    local function eventFunc(event)
        if event == "finish" then
           	G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP,self.__cname)
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx( self._nodeEffect, "moving_mingjiangfuben", effectFunction, eventFunc, false )
end

function PopupFamousDetail:_createName()
    -- 此处颜色是白色，需要等动画好了，才好显示
    -- local fontColor = Colors.getSummaryLineColor()
    local fontColor = Colors.getFamousNameColor()
    local label = cc.Label:createWithTTF(self._configData.name, Path.getFontW8(), 36)
    label:setColor(fontColor)
    label:setMaxLineWidth(20)
    return label
end

function PopupFamousDetail:_createReward(index, rewards)
    local panelReward = CSHelper.loadResourceNode(Path.getCSB("PanelFamousReward1", "stage"))
    local titleBG = ccui.Helper:seekNodeByName(panelReward, "ImageRewardTitleBG")
    titleBG:setPositionY(POS_Y[index])

    local imgTitle = ccui.Helper:seekNodeByName(panelReward, "_imgTitle")
    local pic = Path.getEssenceText(index)
    imgTitle:loadTexture(pic)

    for i = 1, 2 do 
        local reward = rewards[i]
        if reward then
            local rewardInfo = CSHelper.loadResourceNode(Path.getCSB("CommonResourceInfo", "common"))
            rewardInfo:updateUI(reward.type, reward.value, reward.size)
            local rewardNode = ccui.Helper:seekNodeByName(panelReward, "RewardNode"..i)
            rewardNode:addChild(rewardInfo)
        end
    end

    local doubleTips = ccui.Helper:seekNodeByName(panelReward, "Image_Double")
    doubleTips:setVisible(false)

    if index == 1 then
        local doubleTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_FAMOUS_CHAPTER)
        doubleTips:setVisible((doubleTimes > 0))
    end

    return panelReward
end

function PopupFamousDetail:_createRewardItem(rewards)
    local panelReward = CSHelper.loadResourceNode(Path.getCSB("PanelFamousReward2", "stage"))

    local imgTitle = ccui.Helper:seekNodeByName(panelReward, "_imgTitle")
    local pic = Path.getEssenceText(3)
    imgTitle:loadTexture(pic)

    local titleBG = ccui.Helper:seekNodeByName(panelReward, "ImageRewardTitleBG")
    titleBG:setPositionY(POS_Y[3])

    local doubleTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_FAMOUS_CHAPTER)

    local itemCount = #rewards
    for i = 1, itemCount do 
        local reward = rewards[i]
        local rewardInfo = CSHelper.loadResourceNode(Path.getCSB("CommonIconTemplate", "common"))
        rewardInfo:initUI(reward.type, reward.value, 0)
        rewardInfo:showDoubleTips(doubleTimes > 0)
        local rewardNode = ccui.Helper:seekNodeByName(panelReward, "RewardNode"..i)
        rewardNode:addChild(rewardInfo)
    end

    return panelReward
end

function PopupFamousDetail:_createFightBtn()
    if self._data:getExecute_count() >= self._configData.challenge_num then
        return display.newSprite(Path.getTextSignet("img_yitiaozhan"))
    else 
        local node = cc.Node:create()

        -- local cost = CSHelper.loadResourceNode(Path.getCSB("CommonResourceInfo", "common"))
        -- cost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._configData.cost)
        -- node:addChild(cost)
        -- cost:setPositionY(20)
        -- cost:showResName(true, Lang.get("famous_cost"))

        local fightBtn = CSHelper.loadResourceNode(Path.getCSB("CommonButtonLevel0Highlight", "common"))
        node:addChild(fightBtn)
        fightBtn:setPositionY(5)
        fightBtn:setString(Lang.get("stage_fight"))
        fightBtn:addClickEventListenerEx(handler(self, self._onFightClick))
        fightBtn:setName("_btnFight")
        local imgSward = cc.Sprite:create(Path.getPreBattleImg("img_prebattle_btnicon"))
        fightBtn:addChild(imgSward)
        imgSward:setPosition(cc.p(-40, 1))

        return node
    end
end

function PopupFamousDetail:_createCostNode()
    local node = cc.Node:create()

    if self._data:getExecute_count() >= self._configData.challenge_num then
        return node
    end

    local cost = CSHelper.loadResourceNode(Path.getCSB("CommonResourceInfo", "common"))
    cost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._configData.cost)
    node:addChild(cost)
    cost:setPositionY(-10)
    cost:showResName(true, Lang.get("famous_cost"))

    return node
end

function PopupFamousDetail:_onFightClick()
    local leftCount = G_UserData:getChapter():getFamousLeftCount()
    if leftCount <= 0 then
        G_Prompt:showTip(Lang.get("famous_no_count"))
        return
    end
    local bagFull = LogicCheckHelper.checkPackFullByAwards(self._awardsList)
    if bagFull then
        return
    end
    local needVit = self._configData.cost
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit)
    if not success then
        return
    end
    G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_PAUSE)
    G_UserData:getStage():c2sExecuteStage(self._configData.id)
end

function PopupFamousDetail:_createCloseBtn()
    local params = {
        texture = Path.getEmbattle("btn_embattle_close"),
    }
    local close = UIHelper.createImage(params)
    close:setTouchEnabled(true)
    close:addTouchEventListener(handler(self, self._onCloseClick))
    return close
end

function PopupFamousDetail:_onCloseClick(sender, event)
    if event == 2 then
        self:closeWithAction()
    end
end

function PopupFamousDetail:_createTalk()
    local talkNode = cc.Node:create()
    if self._configData.talk ~= "" then
        local talk = CSHelper.loadResourceNode(Path.getCSB("CommonTalkNodeFamous", "common"))
        talk:setText(self._configData.talk, 400)
        talkNode:addChild(talk)
        talk:setPosition(-130, -50)
    end
    return talkNode
end

function PopupFamousDetail:_onEventExecuteStage(eventName,_,_,_,isWin)
    if isWin then
        self:close()        
    end
end

return PopupFamousDetail