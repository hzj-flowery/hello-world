local PopupBase = require("app.ui.PopupBase")
local PopupStageDetail = class("PopupStageDetail", PopupBase)

local Drop = require("app.config.drop")
local Parameter = require("app.config.parameter")

local UIHelper = require("yoka.utils.UIHelper")

local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DropHelper = require("app.utils.DropHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local Path = require("app.utils.Path")

local ReturnConst = require("app.const.ReturnConst")

function PopupStageDetail:ctor(stageId)
    self._stageData = G_UserData:getStage():getStageById(stageId)
    self._stageInfo = self._stageData:getConfigData()

    --监听
    self._signalExecuteStage = nil      --打副本
    self._signalFastExecute = nil       --扫荡副本
    self._signalSweepFinish = nil       --扫荡完成
    self._signalReset = nil             --重置副本
    self._signalUseItem = nil           --使用物品   

    self._sweepCount = 0        --可扫次数
    self._btnSweep = nil        --扫荡按钮
    self._btnReset = nil        --重制按钮
    self._btnFormation = nil    --阵容
    self._btnFight = nil        --战斗
    self._resetPrice = 0        --重置价格
    self._popupSweep = nil      --弹出扫荡面板
    self._popupSweepSignal = nil    --扫荡面板信号

    self._awardsList = nil      --奖励列表  

    -- self._rebelArmyIds = {}     --未显示的叛军id

    self._drop1 = nil       --两个掉落
    self._drop2 = nil

    --首杀
    self._textFirstKillName = nil

	local resource = {
		file = Path.getCSB("PopupStageDetail", "stage"),
		binding = {
			_btnClose = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
			_btnFight = {
				events = {{event = "touch", method = "_onFightClick"}}
			},
			_btnSweep = {
				events = {{event = "touch", method = "_onSweepClick"}}
			},
            _btnFormation = 
            {
                events = {{event = "touch", method = "_onFormationClick"}}
            },
            _btnReset = 
            {
                events = {{event = "touch", method = "_onResetClick"}}
            },
            _textFirstKillName = 
            {
                events = {{event = "touch", method = "_onFirstKillClick"}}
            },
		}
	}
	PopupStageDetail.super.ctor(self, resource)
end

function PopupStageDetail:onCreate()
    -- self._star = {self._star1, self._star2, self._star3}
    self:setName("PopupStageDetail")
    self:_createHeroSpine()
    self:_updateDropList()
    self._btnReset:setVisible(false)

    -- local spriteFormation = cc.Sprite:create(Path.getCommonIcon("common", "icon_embattlebtn"))
    -- spriteFormation:setPositionX(-50)
    -- self._btnFormation:addChild(spriteFormation)
    -- self._btnFormation:setString(Lang.get("stage_formation"))
    self._btnFight:setString(Lang.get("stage_fight"))
    self._btnReset:setString(Lang.get("stage_reset_word"))

end

function PopupStageDetail:onEnter()

    self:_refreshStageDetail()
    self._signalExecuteStage = G_SignalManager:add(SignalConst.EVENT_EXECUTE_STAGE, handler(self, self._onEventExecuteStage))
    self._signalFastExecute = G_SignalManager:add(SignalConst.EVENT_FAST_EXECUTE_STAGE, handler(self, self._onEventFastExecuteStage))
    self._signalSweepFinish = G_SignalManager:add(SignalConst.EVENT_SWEEP_FINISH, handler(self, self._onEventSweepFinish))
    self._signalReset = G_SignalManager:add(SignalConst.EVENT_RESET_STAGE, handler(self, self._onEventReset))
    self._signalUseItem = G_SignalManager:add(SignalConst.EVNET_USE_ITEM_SUCCESS, handler(self, self._onEventUseItem))
    local runningScene = G_SceneManager:getRunningScene()
	runningScene:addGetUserBaseInfoEvent()
end

function PopupStageDetail:checkRebelArmy()
    local rebel = G_UserData:getStage():getNewRebel()
    if rebel then
        local popupSiegeCome = require("app.scene.view.stage.PopupSiegeCome").new(rebel)
        popupSiegeCome:open()   
        G_UserData:getStage():resetRebel()
    end

end

function PopupStageDetail:onShowFinish( ... )
    -- body
        --抛出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PopupStageDetail:onExit()
    self._signalExecuteStage:remove()
    self._signalExecuteStage = nil
    self._signalFastExecute:remove()
    self._signalFastExecute = nil
    self._signalSweepFinish:remove()
    self._signalSweepFinish = nil
    self._signalReset:remove()
    self._signalReset = nil
    self._signalUseItem:remove()
    self._signalUseItem = nil
end

function PopupStageDetail:_clearSignal()
    if self._popupSweepSignal then
        self._popupSweepSignal:remove()
        self._popupSweepSignal = nil
    end
end

--enter时需要刷新的数值
function PopupStageDetail:_refreshStageDetail()
    self:_setStageName()
    self:_refreshButtonState()
    self:_refreshStar()
    self:_refreshFirstKiller()
    self:_refreshExpMoney()
end

--重置扫荡以及重置状态
function PopupStageDetail:_refreshButtonState()

    local executeCnt = self._stageData:getExecute_count()   --已经打过的次数
    self._sweepCount = self._stageInfo.challenge_num - executeCnt   --最大次数
    self._textCountNum:setString(""..self._sweepCount.."/"..self._stageInfo.challenge_num)
    local sweepVit = self._sweepCount * self._stageInfo.cost
    local myVit = G_UserData:getBase():getResValue(DataConst.RES_VIT)
    local sweepVitEnough = true   --是否有进行一次扫荡的体力
    while myVit < sweepVit do
        self._sweepCount = self._sweepCount - 1
        sweepVit = self._sweepCount * self._stageInfo.cost
        if self._sweepCount <= 0 then
            sweepVitEnough = false
        end
    end
    self._btnSweep:setVisible(true)
    self._btnReset:setVisible(false)
    if self._sweepCount > 10 then
        self._sweepCount = 10
    elseif self._sweepCount <= 0 and not sweepVitEnough then
        self._sweepCount = self._stageInfo.challenge_num - executeCnt
        if self._sweepCount > 10 then
            self._sweepCount = 10
        end
    elseif self._sweepCount <= 0 then
        self._sweepCount = 0
        --这边处理买次数的情况
        self._btnSweep:setVisible(false)
        self._btnReset:setVisible(true)
    end
    self._btnSweep:setString(Lang.get("stage_fight_ten", {count = self._sweepCount}))
    if self._stageData:getStar() == 0 then
        self._btnSweep:setVisible(false)
        self._btnReset:setVisible(false)
    end
end

--设置章节名字
function PopupStageDetail:_setStageName()
    self._textName:setString(self._stageInfo.name)
	self._textName:setColor(Colors.getColorLight(self._stageInfo.color))
	--self._textName:enableOutline(Colors.getColorOutline(self._stageInfo.color), 2)    
end

--刷新星数
function PopupStageDetail:_refreshStar()
    local starCount = self._stageData:getStar()
    for i = 1, 3 do
        if i <= starCount then
            self["_star"..i.."BG"]:setVisible(false)
            self["_star"..i]:setVisible(true)
        else
            self["_star"..i.."BG"]:setVisible(true)
            self["_star"..i]:setVisible(false)
        end
    end
end

--刷新第一个击杀者
function PopupStageDetail:_refreshFirstKiller()
    local firstKiller = self._stageData:getKiller()
    if firstKiller == "" then
        self._textFirstKillName:setString(Lang.get("stage_text_nokiller"))
        self._textFirstKillName:setTouchEnabled(false)
    else
        self._textFirstKillName:setString(firstKiller)
        self._textFirstKillName:setTouchEnabled(true)
    end
end

--刷新获得经验，金币
function PopupStageDetail:_refreshExpMoney()
    local myLevel = G_UserData:getBase():getLevel()
    local exp = Parameter.get(ParameterIDConst.MISSION_DROP_EXP).content
    local money = Parameter.get(ParameterIDConst.MISSION_DROP_MONEY).content
    self._drop1:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_EXP, myLevel * exp * self._stageInfo.cost )
    self._drop2:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, myLevel * money * self._stageInfo.cost)
    self._costStamina:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._stageInfo.cost)
    self._costStamina:setTextColorToATypeGreen()
end

--

--跟新掉落列表
function PopupStageDetail:_updateDropList()
    local awards = DropHelper.getStageDrop(self._stageInfo)
    self._listDrop:setListViewSize(450, 100)
    for i, v in pairs(awards) do
        v.size = 1
    end

    local StoryChapter = require("app.config.story_chapter")
    local chapterConfigInfo = StoryChapter.get(self._stageInfo.chapter_id)
    local privilegeType = chapterConfigInfo.type == 2 and ReturnConst.PRIVILEGE_ELITE_CHAPTER or ReturnConst.PRIVILEGE_DAILY_STAGE
    local doubleTimes = G_UserData:getReturnData():getPrivilegeRestTimes(privilegeType)

    self._listDrop:updateUI(awards, 1,false,true, doubleTimes > 0)
    self._listDrop:setItemsMargin(20)
    self._awardsList = awards
end

function PopupStageDetail:_createCell(award)
	local widget = ccui.Widget:create()
	local itemNode = require("app.ui.component.ComponentIconHelper").createIcon(award.type, award.value)
	local itemPanel = itemNode:getSubNodeByName("_panelItemContent")
	local itemSize = itemNode:getContentSize()
	local itemParams = itemNode:getItemParams()
	itemNode:setPosition(57, 63)
	widget:setContentSize(cc.size(114,100))
	widget:addChild(itemNode)
	return widget
end

--英雄spine
function PopupStageDetail:_createHeroSpine()
    self._ImageHero:updateUI(self._stageInfo.res_id)
    self._ImageHero:setBubble(self._stageInfo.talk, nil, 2, true)
end

--关闭按钮
function PopupStageDetail:_onCloseClick()
    self:closeWithAction()
end


--战斗按钮
function PopupStageDetail:_onFightClick()
    --先判断包裹，再判断体力，次数
    local bagFull = LogicCheckHelper.checkPackFullByAwards(self._awardsList)
    if bagFull then
        return
    end
    local needVit = self._stageInfo.cost
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit)
    if not success then
        return
    end
    if self._sweepCount <= 0 then
        self:_onResetClick()
        return
    end
    G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_PAUSE)
    G_SignalManager:dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE) -- 规避演武场景切换的bug
    G_UserData:getStage():c2sExecuteStage(self._stageInfo.id)
end

--点击扫荡
function PopupStageDetail:_onSweepClick()
    local isOpen, desc = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SWEEP)
    if not isOpen then
        G_Prompt:showTip(desc)
        return
    end
    local bagFull = LogicCheckHelper.checkPackFullByAwards(self._awardsList)
    if bagFull then
        return
    end
    local star = self._stageData:getStar()
    if star ~= 3 then
        G_Prompt:showTip(Lang.get("sweep_enable"))
        return
    end
    local needVit = self._stageInfo.cost * self._sweepCount
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit)
    if success then
        G_SignalManager:dispatch(SignalConst.EVENT_TOPBAR_PAUSE)
        -- self._sweepCount = 3
        G_UserData:getStage():c2sFastExecuteStage(self._stageInfo.id, self._sweepCount)   
    end

    return true
end

--重置副本
function PopupStageDetail:_onResetClick()
    local VipFunctionIDConst = require("app.const.VipFunctionIDConst")
    local resetCount = self._stageData:getReset_count()
    local timesOut = LogicCheckHelper.vipTimesOutCheck(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE, resetCount, Lang.get("stage_no_reset_count"))
    if not timesOut then
        local vipInfo = G_UserData:getVip():getVipFunctionDataByType(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE)
        local resetLimit = vipInfo.value
        resetLimit = resetLimit - resetCount
        self._resetPrice = UserDataHelper.getPriceAdd(100, resetCount + 1 )
        local PopupSystemAlert = require("app.ui.PopupSystemAlert")
        local popupSystemAlert = PopupSystemAlert.new(Lang.get("stage_tips"), Lang.get("stage_reset_warning",{count = self._resetPrice, leftcount = resetLimit}), handler(self, self._sendResetMsg))
        popupSystemAlert:setCheckBoxVisible(false)
        popupSystemAlert:openWithAction()        
    end
    -- local vipInfo = G_UserData:getVip():getVipFunctionDataByType(VipFunctionIDConst.VIP_FUNC_ID_MAIN_STAGE)
    -- local resetLimit = vipInfo.value
    -- -- local resetLimit = 200
    
    -- if resetCount >= resetLimit then
    --     G_Prompt:showTip(Lang.get("stage_no_reset_count"))
    -- else
    --     self._resetPrice = UserDataHelper.getPriceAdd(100, resetCount)
    --     local PopupSystemAlert = require("app.ui.PopupSystemAlert")
    --     local popupSystemAlert = PopupSystemAlert.new(Lang.get("stage_tips"), Lang.get("stage_reset_warning",{count = self._resetPrice, leftcount = resetLimit}), handler(self, self._sendResetMsg))
    --     popupSystemAlert:setCheckBoxVisible(false)
    --     popupSystemAlert:openWithAction()
    -- end

    return true
end

--发送重置消息
function PopupStageDetail:_sendResetMsg()
    local UserCheck = require("app.utils.logic.UserCheck")
    local success, errorFunc = UserCheck.enoughCash(self._resetPrice)
    if success == false then
        errorFunc()
        return
    end

    --if success then
    G_UserData:getStage():c2sResetStage(self._stageInfo.id)    
    --end
end

--点击阵容
function PopupStageDetail:_onFormationClick()
	local popupEmbattle = require("app.scene.view.team.PopupEmbattle").new()
	popupEmbattle:openWithAction() 
end

--获得最大扫荡次数
function PopupStageDetail:getMaxSweepCount()
    return self._sweepCount
end

--扫荡信息
function PopupStageDetail:_onEventFastExecuteStage(eventName, results)
    self:_refreshStageDetail()
    self:_refreshPopupSweep()
    self._popupSweep:updateReward(results, self._awardsList) 
    self._popupSweep:start()
    -- for i, v in pairs(rebels) do
    --     table.insert(self._rebelArmys, v)
    -- end   
end

--更新扫荡界面
function PopupStageDetail:_refreshPopupSweep(isReset)
    local callback = nil
    local btnString = ""
    if self._sweepCount == 0 then
        callback = handler(self, self._onResetClick)
        btnString = Lang.get("stage_reset_word")
    else
        callback = handler(self, self._onSweepClick)
        btnString = Lang.get("stage_fight_ten", {count = self._sweepCount})
    end

    if not isReset and not self._popupSweep then
        self._popupSweep = require("app.scene.view.stage.PopupSweep").new(callback)
        self._popupSweepSignal = self._popupSweep.signal:add(handler(self, self._onSweepClose))
        self._popupSweep:openWithAction()
    elseif self._popupSweep then
        self._popupSweep:setCallback(callback)
    end
    if self._popupSweep then
        self._popupSweep:setBtnResetString(btnString)
    end
end

--扫荡结束
function PopupStageDetail:_onEventSweepFinish(eventName)
    self:checkRebelArmy()
end

--sweep关闭信号处理
function PopupStageDetail:_onSweepClose(event)
    if event == "close" then
        self._popupSweep = nil
        self:_clearSignal()
    end
end

--重置副本
function PopupStageDetail:_onEventReset()
    self:_refreshStageDetail()
    self:_refreshPopupSweep(true)
end

--打副本消息
function PopupStageDetail:_onEventExecuteStage(eventName, message, isFirstPass)
    if isFirstPass then
        self:close()        
    end
end

function PopupStageDetail:_onFirstKillClick()
    local userId = self._stageData:getKillerId()
    if userId ~= G_UserData:getBase():getId() then
        G_UserData:getBase():c2sGetUserBaseInfo(userId)
    end
end

function PopupStageDetail:_onEventUseItem()
    self:_refreshButtonState()
    if self._popupSweep then
        self:_refreshPopupSweep()
    end
end

return PopupStageDetail