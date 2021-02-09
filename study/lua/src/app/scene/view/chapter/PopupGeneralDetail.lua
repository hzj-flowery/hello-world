local PopupBase = require("app.ui.PopupBase")
local PopupGeneralDetail = class("PopupGeneralDetail", PopupBase)
local ChapterConst = require("app.const.ChapterConst")
local ReturnConst = require("app.const.ReturnConst")

function PopupGeneralDetail:ctor(data)
    self._data = data
    self._configData = data:getConfigData()

    self._panelBG = nil         --弹框
    self._imageChapter = nil    --章节图片
    self._textDetail = nil      --描述
    self._listDrop = nil        --掉落列表
    self._btnFight = nil        --战斗按钮
    self._imagePass = nil       --已通关
    self._textOpenInfo = nil    --挑战条件

    self._signalFightGeneral = nil      --攻打

    local resource = {
		file = Path.getCSB("PopupGeneralDetail", "chapter"),
		binding = {
			_btnFight = {
				events = {{event = "touch", method = "_onFightClick"}}
			},
		}
	}
	PopupGeneralDetail.super.ctor(self, resource)
end

function PopupGeneralDetail:onCreate()
    self._textDetail:setString(self._configData.des)
    self._btnFight:setString(Lang.get("stage_fight"))
    self._panelBG:addCloseEventListener(handler(self, self._onCloseClick))
    self._panelBG:setTitle(self._configData.name)
    local pic = Path.getFamousImage(self._configData.pic)
    self._imageChapter:loadTexture(pic)
    self:_updateDropList()
    self:_refreshFightState()
end

function PopupGeneralDetail:onEnter()
    self._signalFightGeneral = G_SignalManager:add(SignalConst.EVENT_CHALLENGE_HERO_GENERAL, handler(self, self._onEventFightGeneral))
end

function PopupGeneralDetail:onExit()
    self._signalFightGeneral:remove()
    self._signalFightGeneral = nil
end

function PopupGeneralDetail:_refreshFightState()
    self._btnFight:setVisible(false)
    self._imagePass:setVisible(false)
    self._textOpenInfo:setVisible(false)

    if self._data:isPass() then 
        self._imagePass:setVisible(true)
    else
        local chapterData = G_UserData:getChapter():getChapterByTypeId(ChapterConst.CHAPTER_TYPE_FAMOUS, self._configData.need_chapter)
        if chapterData:isLastStagePass() then 
            self._btnFight:setVisible(true)
        else
            self._textOpenInfo:setVisible(true)
            self._textOpenInfo:setString(Lang.get("general_open_info", {name = chapterData:getConfigData().name}))
        end
    end
end

function PopupGeneralDetail:_onCloseClick()
    self:closeWithAction()
end

function PopupGeneralDetail:_onFightClick()
    G_UserData:getChapter():c2sChallengeHeroChapter(self._configData.id)
end

--跟新掉落列表
function PopupGeneralDetail:_updateDropList()
    local DropHelper = require("app.utils.DropHelper")
    local awards = DropHelper.getStageDrop(self._configData)
    self._listDrop:setListViewSize(450, 100)

    local doubleTimes = G_UserData:getReturnData():getPrivilegeRestTimes(ReturnConst.PRIVILEGE_FAMOUS_CHAPTER)

    if doubleTimes > 0 then
        for k, v in pairs(awards) do
            v.size = v.size * 2
        end
    end

    self._listDrop:updateUI(awards, 1,false,true, doubleTimes > 0)
    self._listDrop:setItemsMargin(20)
end

function PopupGeneralDetail:_onEventFightGeneral(eventName, message)
    -- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(message.battle_report)
    -- local BattleDataHelper = require("app.utils.BattleDataHelper")
    -- local battleData = BattleDataHelper.parseFamousDungeon(message, self._data)
    -- G_SceneManager:showScene("fight", reportData, battleData)
    -- if message.win then 
    --     self:close()
    -- end
    local function enterFightView()
        local battleReport = G_UserData:getFightReport():getReport()
        local ReportParser = require("app.fight.report.ReportParser")
        local reportData = ReportParser.parse(battleReport)
        local BattleDataHelper = require("app.utils.BattleDataHelper")
        local battleData = BattleDataHelper.parseFamousDungeon(message, self._data)
        
        G_SceneManager:showScene("fight", reportData, battleData)
        if message.win then 
            self:close()
        end
    end

    G_SceneManager:registerGetReport(message.battle_report, function() enterFightView() end)
end



return PopupGeneralDetail