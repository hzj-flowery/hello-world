local PopupBase = require("app.ui.PopupBase")
local PopupChapterBoss = class("PopupChapterBoss", PopupBase)

local Drop = require("app.config.drop")
local Parameter = require("app.config.parameter")

local UIHelper = require("yoka.utils.UIHelper")
local Color = require("app.utils.Color")

local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")


function PopupChapterBoss:ctor(chapterId, bossData)
    self._chapterId = chapterId
    self._bossData = bossData
    self._btnFormation = nil    --阵容
    self._btnFight = nil        --战斗
    self._signalDailyBossFight = nil        --每日boss战斗
	local resource = {
		file = Path.getCSB("PopupStageDetail", "stage"),
		binding = {
			_btnClose = {
				events = {{event = "touch", method = "_onCloseClick"}}
			},
			_btnFight = {
				events = {{event = "touch", method = "_onFightClick"}}
			},
            _btnFormation = 
            {
                events = {{event = "touch", method = "_onFormationClick"}}
            },
		}
	}
	PopupChapterBoss.super.ctor(self, resource)
end

function PopupChapterBoss:onCreate()
    self:_createHeroSpine()
end

function PopupChapterBoss:onEnter()
    self._signalDailyBossFight = G_SignalManager:add(SignalConst.EVENT_DAILY_BOSS_FIGNT, handler(self, self._onEventBossFight))
end

function PopupChapterBoss:onExit()
    self._signalDailyBossFight:remove()
    self._signalDailyBossFight = nil
end

--enter时需要刷新的数值
function PopupChapterBoss:_refreshStageDetail()
end

--跟新掉落列表
function PopupChapterBoss:_updateDropList()
end

--英雄spine
function PopupChapterBoss:_createHeroSpine()
    self._ImageHero:updateUI(self._bossData.res_id)
    -- self._ImageHero:setBubble(self._stageInfo.talk, nil, 2, true)
end

--关闭按钮
function PopupChapterBoss:_onCloseClick()
    self:closeWithAction()
end

--战斗按钮
function PopupChapterBoss:_onFightClick()
    local chapterId = self._chapterId
    local bossId = self._bossData.id
    local needVit = self._bossData.cost
    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit)
    if success then 
        G_UserData:getChapter():c2sActDailyBoss(chapterId, bossId)
    end
end


--点击阵容
function PopupChapterBoss:_onFormationClick()
	local popupEmbattle = require("app.scene.view.team.PopupEmbattle").new()
	popupEmbattle:openWithAction() 
end


-- --打副本消息处理
function PopupChapterBoss:_onEventBossFight(eventName, message)
    local ReportParser = require("app.fight.report.ReportParser")
    local reportData = ReportParser.parse( message.battle_report )
    local BattleDataHelper = require("app.utils.BattleDataHelper")
    local battleData = BattleDataHelper.parseDailyBossData(message, self._bossData.in_res)

    local win = reportData:isWin()
    if win then
        local chapterData = G_UserData:getChapter()
        chapterData:defeatBoss(message.chapter_id)
        self:close()
    end

    G_SceneManager:showScene("fight", reportData, battleData)    
end

return PopupChapterBoss