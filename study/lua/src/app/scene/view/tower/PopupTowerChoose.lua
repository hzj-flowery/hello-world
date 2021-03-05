local PopupBase = require("app.ui.PopupBase")
local PopupTowerChoose = class("PopupTowerChoose", PopupBase)

local TowerChooseCell = require("app.scene.view.tower.TowerChooseCell")
local FunctionConst = require("app.const.FunctionConst")

function PopupTowerChoose:ctor(layerConfig)
    self._layerConfig = layerConfig         --表格信息
    self._chooseBG = nil                    --选择背景框	
    --3块选择面板
    self._chooseCell1 = nil  
    self._chooseCell2 = nil
    self._chooseCell3 = nil     

    self._nodeAvatar = nil          --人物avatar
    self._textCondition = nil       --胜利条件
    self._textStageName = nil       --副本名字
    self._btnFomation = nil         --阵型

    --攻打监听
    self._signalExecute = nil

    self._fightDifficulty = 0       --挑战星数
	local resource = {
		file = Path.getCSB("PopupTowerChoose", "tower"),
		binding = {
			_btnFormation = {
				events = {{event = "touch", method = "_onFormationClick"}}
			},
            _btnClose = {
                events = {{event = "touch", method = "_onCloseClick"}}
            },
		}
	}
    self:setName("PopupTowerChoose")
	PopupTowerChoose.super.ctor(self, resource)
end

function PopupTowerChoose:onCreate()
    self._nodeAvatar:updateUI(self._layerConfig.res_id)
    self._nodeAvatar:setBubble(self._layerConfig.talk, nil, 2, true)
   -- self._btnFormation:updateUI(FunctionConst.FUNC_TEAM)
    local cellNormal = TowerChooseCell.new(self._layerConfig, 1, handler(self, self._onChallengeClick))
    self._chooseCell1:addChild(cellNormal)

    local cellHard = TowerChooseCell.new(self._layerConfig, 2, handler(self, self._onChallengeClick))
    self._chooseCell2:addChild(cellHard)

    local cellHell = TowerChooseCell.new(self._layerConfig, 3, handler(self, self._onChallengeClick))
    self._chooseCell3:addChild(cellHell)

    local winCondition = self._layerConfig.win_value
    if self._layerConfig.win_type == 3 then
        winCondition = winCondition / 10
    end
    local winString = Lang.get("challenge_tower_condition_"..self._layerConfig.win_type, {count = winCondition})
    self._textCondition:setString(winString)

    self._textStageName:setString(self._layerConfig.name)
end

function PopupTowerChoose:onEnter()
    self._signalExecute = G_SignalManager:add(SignalConst.EVENT_TOWER_EXECUTE, handler(self, self._onEventExecute))
    self._signalTowerGetInfo = G_SignalManager:add(SignalConst.EVENT_TOWER_GET_INFO, handler(self, self._onEventTowerGetInfo))

    --抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
end

function PopupTowerChoose:onExit()
    self._signalExecute:remove()
    self._signalExecute = nil

    self._signalTowerGetInfo:remove()
	self._signalTowerGetInfo = nil
end

function PopupTowerChoose:_onEventTowerGetInfo(event)
   
end


function PopupTowerChoose:_onChallengeClick(difficulty)
   
    local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local DataConst	 = require("app.const.DataConst")

     --先判断此关卡是否能打（零点重置了关卡数据）
    local success = LogicCheckHelper.checkTowerCanChallenge(self._layerConfig.id)
    if not success then
        return 
    end

    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_TOWER_COUNT, 1)
    if success then
        self._fightDifficulty = difficulty
        G_UserData:getTowerData():c2sExecuteTower(self._layerConfig.id, difficulty)
    end
end

function PopupTowerChoose:_onEventExecute(eventName, message)
    -- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(message.battle_report)
    -- local battleData = require("app.utils.BattleDataHelper").parseChallengeTowerData(message, self._layerConfig, self._fightDifficulty)
    -- G_SceneManager:showScene("fight", reportData, battleData)

    -- local win = reportData:isWin()
    -- if win then
    --     G_UserData:getTowerData():setShowStarEft(true)
    --     self:close()
    -- end 

    local reportId = message.battle_report

    local function enterFightView()
        local ReportParser = require("app.fight.report.ReportParser")
        local battleReport = G_UserData:getFightReport():getReport()
        local reportData = ReportParser.parse(battleReport)
        local battleData = require("app.utils.BattleDataHelper").parseChallengeTowerData(message, self._layerConfig, self._fightDifficulty)
        G_SceneManager:showScene("fight", reportData, battleData)

        -- if  not message.battle_report.is_win then
        --     G_UserData:getRedPoint():clearRedPointShowFlag(	FunctionConst.FUNC_PVE_TOWER,{fullCount = true})
        -- end

        local win = reportData:isWin()
        if win then
            G_UserData:getTowerData():setShowStarEft(true)
            self:close()
        else 
            G_UserData:getRedPoint():clearRedPointShowFlag(	FunctionConst.FUNC_PVE_TOWER,{fullCount = true})
        end 
    end


	-- local reportId = message.id

	-- local function getReportMsg(reportId)
	-- 	for i, value in ipairs(self._reportList) do
	-- 		if value.report_id == reportId then
	-- 			return value
	-- 		end
	-- 	end
	-- 	return nil
	-- end

	-- local function enterFightView(reportId)
	-- 	local arenaBattleMsg = getReportMsg(reportId)
	-- 	local ReportParser = require("app.fight.report.ReportParser")
	-- 	local battleReport = G_UserData:getFightReport():getReport()
	-- 	local reportData = ReportParser.parse(battleReport)
	-- 	local battleData = require("app.utils.BattleDataHelper").parseBattleReportData(arenaBattleMsg)
	-- 	G_SceneManager:showScene("fight", reportData, battleData)
	-- end
	G_SceneManager:registerGetReport(reportId, function() enterFightView() end)
end

function PopupTowerChoose:_onFormationClick()
   -- G_SceneManager:showScene("team")
    local popupEmbattle = require("app.scene.view.team.PopupEmbattle").new()
	popupEmbattle:openWithAction() 
end

function PopupTowerChoose:_onCloseClick()   
    self:closeWithAction()
end
 
return PopupTowerChoose