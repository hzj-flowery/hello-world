local PopupBase = require("app.ui.PopupBase")
local PopupTowerSuperStage = class("PopupTowerSuperStage", PopupBase)
local TowerChooseCell = require("app.scene.view.tower.TowerChooseCell")
local FunctionConst = require("app.const.FunctionConst")
local PopupTowerSuperStageCell = import(".PopupTowerSuperStageCell")
local UserDataHelper = require("app.utils.UserDataHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")
local DropHelper = require("app.utils.DropHelper")
function PopupTowerSuperStage:ctor(layerConfig)
    self._commonNodeBk = nil
    self._listItemSource = nil
    self._textZhanli = nil
    self._textFightCount = nil
    self._commonSweep = nil
    self._commonFight = nil
    self._item01 = nil
    self._item02 = nil
    self._heroAvator = nil
    self._imageReceived = nil

    self._selectIndex = nil
    self._canFightMaxIndex = nil

	local resource = {
		file = Path.getCSB("PopupTowerSuperStage", "tower"),
		binding = {
			_commonSweep = {
				events = {{event = "touch", method = "_onSweepClick"}}
			},
            _commonFight = {
                events = {{event = "touch", method = "_onChallengeClick"}}
            },
		}
	}
	PopupTowerSuperStage.super.ctor(self, resource)
end

function PopupTowerSuperStage:onCreate()
    self._commonNodeBk:setTitle(Lang.get("challenge_tower_super_title"))
    self._commonNodeBk:addCloseEventListener(handler(self,self._onCloseClick))
    self._commonNodeBk:moveTitleToTop()

    self._commonSweep:setString(Lang.get("challenge_tower_super_sweep"))
    self._commonFight:setString(Lang.get("challenge_tower_super_fight"))

   

    self:_initListView(self._listItemSource )
end

function PopupTowerSuperStage:onEnter()
    self._signalTowerExecuteSuper = G_SignalManager:add(SignalConst.EVENT_TOWER_EXECUTE_SUPER, handler(self, self._onEventTowerExecuteSuper))
    self._signalTowerGetInfo = G_SignalManager:add(SignalConst.EVENT_TOWER_GET_INFO, handler(self, self._onEventTowerGetInfo))

    self:_refreshStageView()
    self:_refreshStageList()
    self:_refreshBtns()

    local stageId = G_UserData:getTowerData():getShowRewardSuperStageId()
    if stageId ~= 0 then
        self:_showFirstRewards(stageId)
        G_UserData:getTowerData():setShowRewardSuperStageId(0)
    end
    
end

function PopupTowerSuperStage:onExit()
    self._signalTowerExecuteSuper:remove()
    self._signalTowerExecuteSuper = nil

    self._signalTowerGetInfo:remove()
	self._signalTowerGetInfo = nil
end

function PopupTowerSuperStage:_onEventTowerGetInfo(event)
    self:_refreshStageView()
    self:_refreshStageList()
end

function PopupTowerSuperStage:_initListView(listView)
	listView:setTemplate(PopupTowerSuperStageCell)
	listView:setCallback(handler(self, self._onItemUpdate), handler(self, self._onItemSelected))
	listView:setCustomCallback(handler(self, self._onItemTouch))
end

function PopupTowerSuperStage:_onItemUpdate(item, index)
    local data = self._currListData[index+1]
    if data then
        item:updateInfo(data,index + 1,self._selectIndex,self._canFightMaxIndex)
    end
    
end

function PopupTowerSuperStage:_onItemSelected(item, index)
    local data = self._currListData[ index + 1]
    --[[
    local open = G_UserData:getTowerData():isSuperStageOpen(data:getId())
    if not open then
        return
    end
    ]]
    self._selectIndex  = index + 1
    G_UserData:getTowerData():setSuperStageSelectStageId(data:getId())

    self:_refreshStageUnitView(data)
    self:_refreshListView(self._listItemSource ,self._currListData)
end

function PopupTowerSuperStage:_onItemTouch(index, itemPos)
end

function PopupTowerSuperStage:_refreshListView(listView,listData)
	self._currListData = listData
	local lineCount = #listData
	listView:clearAll()
	listView:resize(lineCount)
	--listView:jumpToTop()
end

function PopupTowerSuperStage:_onSweepClick(sender)
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpened, errMsg = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_TOWER_SUPER_SWEEP)
    if isOpened == false then
        if errMsg then G_Prompt:showTip(errMsg) end
        return
    end

    local stageUnitData = self._currListData[self._selectIndex]
    local stageId = stageUnitData:getId()
    logWarn(" _onSweepClick "..stageId )
    if not stageUnitData:isPass() then
         G_Prompt:showTip(Lang.get("challenge_tower_super_sweep_hint"))
        return
    end

    if G_UserData:getTowerData():getSuperChallengeCount() <= 0 then
        G_Prompt:showTip(Lang.get("challenge_tower_super_no_count"))
        return
    end

    G_UserData:getTowerData():c2sExecuteTowerSuperStage(stageId, 2)
end

function PopupTowerSuperStage:_onChallengeClick(sender)
    local stageUnitData = self._currListData[self._selectIndex]
    local open = G_UserData:getTowerData():isSuperStageOpen(stageUnitData:getId())
    if not open then
        local needStageUnit = G_UserData:getTowerData():getSuperStageUnitData(stageUnitData:getConfig().need_id)
        local preStageName = needStageUnit and needStageUnit:getConfig().name or ""
        G_Prompt:showTip(Lang.get("challenge_tower_pass_condition",{name = preStageName})) 
        return
    end

    if G_UserData:getTowerData():getSuperChallengeCount() <= 0 then
        G_Prompt:showTip(Lang.get("challenge_tower_super_no_count"))
        return
    end

    local stageId = stageUnitData:getId()
    logWarn(" _onChallengeClick "..stageId )
    
    G_UserData:getTowerData():c2sExecuteTowerSuperStage(stageId, 1)
end

function PopupTowerSuperStage:_onEventTowerExecuteSuper(event,message)
    local type = message.type
    if type == 1 then
        -- local ReportParser = require("app.fight.report.ReportParser")
        -- local reportData = ReportParser.parse(message.battle_report)
        -- local battleData = require("app.utils.BattleDataHelper").parseChallengeSuperTowerData(message,stageUnitData:getConfig(),stageUnitData:isPass())
        -- G_SceneManager:showScene("fight", reportData, battleData)
        local function enterFightView()
            local ReportParser = require("app.fight.report.ReportParser")
            local battleReport = G_UserData:getFightReport():getReport()
            local reportData = ReportParser.parse(battleReport)
            local stageUnitData = G_UserData:getTowerData():processStageUnitData(message.stage_id, reportData:isWin())
            local battleData = require("app.utils.BattleDataHelper").parseChallengeSuperTowerData(message, stageUnitData:getConfig(), stageUnitData:isPass())
            G_SceneManager:showScene("fight", reportData, battleData)
        end
        local reportId = message.battle_report
        G_SceneManager:registerGetReport(reportId, function() enterFightView() end)    
    else
        --刷新关卡
        self:_refreshStageView()
        self:_showRewards(message)
    end


end

function PopupTowerSuperStage:_showRewards(message)
    local firstRewards = rawget(message,"first_reward") or {}
    local rewards = rawget(message,"reward") or {}
    local list = {}
    for k,v in ipairs(firstRewards) do
        table.insert( list,v)
    end

    for k,v in ipairs(rewards) do
        table.insert( list,v)
    end
    local popupGetRewards = require("app.ui.PopupGetRewards").new()
    popupGetRewards:show(list,nil,nil,nil)
end

function PopupTowerSuperStage:_showFirstRewards(id)
    local unitData = G_UserData:getTowerData():getSuperStageUnitData(id)
    if unitData then
        local config = unitData:getConfig()
        local firstDropRewardList = DropHelper.getDropReward(config.first_drop)  
        
        dump(popupGetRewards)
        self:runAction(cc.Sequence:create(
			cc.DelayTime:create(0.3),
			cc.CallFunc:create(function()
				 local popupGetRewards = require("app.ui.PopupGetRewards").new()
                 popupGetRewards:show(firstDropRewardList,nil,nil,nil)
			end)
		) )

       
    end
end

function PopupTowerSuperStage:_refreshStageUnitView(stageUnitData)
    if not stageUnitData then
        return
    end
    local isReceived = stageUnitData:isPass()
    local config = stageUnitData:getConfig()

    self._textZhanli:setString(tostring(config.combat))

    self._imageReceived:setVisible(isReceived)


    local firstDropRewardList = DropHelper.getDropReward(config.first_drop)
    local passDropRewardList = DropHelper.getDropReward(config.drop)

    local firstDropReward = firstDropRewardList[1]
    local passDropReward = passDropRewardList[1]
    
    self._item01:unInitUI()
	self._item01:initUI(firstDropReward.type,firstDropReward.value,firstDropReward.size)
    self._item01:setIconMask(isReceived)

    self._item02:unInitUI()
	self._item02:initUI(passDropReward.type,passDropReward.value,passDropReward.size)


    self._heroAvator:updateUI(config.res_id)
	--self._heroAvator:setTouchEnabled(false)	
	--self._heroAvator:setScale(1)
	--self._heroAvator:turnBack()
end

function PopupTowerSuperStage:_refreshStageView()
    local count = G_UserData:getTowerData():getSpuer_cnt()
    local totalCount = UserDataHelper.getParameter(ParameterIDConst.TOWER_SUPER_CHALLENGE_MAX_TIME)
    self._textFightCount:setString(tostring(totalCount-count))
end

function PopupTowerSuperStage:_onCloseClick()   
    self:closeWithAction()
end

function PopupTowerSuperStage:_getLastStageIndex(listViewData)
    local selectIndex = 0
    for k,v in ipairs(listViewData) do
        if not G_UserData:getTowerData():isSuperStageOpen(v:getId()) then
             selectIndex = k-1
            break
        end
        selectIndex = selectIndex + 1
    end
    selectIndex = math.max(1,selectIndex)
    return selectIndex
end

function PopupTowerSuperStage:_getIndexByStageId(listViewData,id)
    for k,v in ipairs(listViewData) do
        if v:getId() ==  id then
            return k
        end
    end
    return nil
end

function PopupTowerSuperStage:_refreshStageList()
    local listViewData = G_UserData:getTowerData():getSuperStageList()
    self._canFightMaxIndex = self:_getLastStageIndex(listViewData)--找出最后可打的一关
    self._selectIndex = self:_getIndexByStageId(listViewData,G_UserData:getTowerData():getSuperStageSelectStageId()) or self._canFightMaxIndex
	self:_refreshListView(self._listItemSource ,listViewData)
    self:_refreshStageUnitView(self._currListData[ self._selectIndex])


    self._listItemSource:setLocation(self._selectIndex,300)

end

function PopupTowerSuperStage:_refreshBtns()
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local sweepShow = LogicCheckHelper.funcIsShow(FunctionConst.FUNC_TOWER_SUPER_SWEEP)
    self._commonSweep:setVisible(sweepShow)

     if not sweepShow then
         self._commonFight:setPositionX(0)
     else
        self._commonSweep:setPositionX(-105)
        self._commonFight:setPositionX(105)
     end
end


 
return PopupTowerSuperStage