local PopupBase = require("app.ui.PopupBase")
local PopupBossDetail = class("PopupBossDetail", PopupBase)

local Drop = require("app.config.drop")

local UIHelper = require("yoka.utils.UIHelper")
local Color = require("app.utils.Color")

local UserDataHelper = require("app.utils.UserDataHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local DataConst = require("app.const.DataConst")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local Parameter = require("app.config.parameter")
local DropHelper = require("app.utils.DropHelper")
local ParameterIDConst = require("app.const.ParameterIDConst")


function PopupBossDetail:ctor(chapterType,chapterId, bossData, isBossPage, isPopStageView)
    self._chapterType = chapterType
    self._chapterId = chapterId
    self._bossData = bossData
    self._isBossPage = isBossPage
	self._isPopStageView = isPopStageView
    self._btnFormation = nil    --阵容
    self._btnFight = nil        --战斗
    self._btnClose = nil        --关闭按钮

    self._listenerBossFight = nil

    self._detailBG = nil    --详细面板
    self._drop1 = nil       --经验掉落
    self._drop2 = nil       --金币掉落
    self._listDrop = nil    --掉落列表
	local resource = {
		file = Path.getCSB("PopupBossDetail", "stage"),
		binding = {
			_btnAttack = {
				events = {{event = "touch", method = "_onFightClick"}}
			},
            _btnFormation = 
            {
                events = {{event = "touch", method = "_onFormationClick"}}
            },
            _btnClose = 
            {
                events = {{event = "touch", method = "_onCloseClick"}}
            }
		}
	}
	PopupBossDetail.super.ctor(self, resource)
end

function PopupBossDetail:onCreate()
    self:_createHeroSpine()
    self._btnAttack:setString(Lang.get("stage_fight"))
end

function PopupBossDetail:onEnter()
    self._listenerBossFight = G_NetworkManager:add(MessageIDConst.ID_S2C_ActDailyBoss, handler(self, self._recvBossFight))

    local myLevel = G_UserData:getBase():getLevel()
    local exp = Parameter.get(ParameterIDConst.MISSION_DROP_EXP).content * myLevel * self._bossData.cost
    local money = Parameter.get(ParameterIDConst.MISSION_DROP_MONEY).content * myLevel * self._bossData.cost

    self._drop1:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_EXP, exp)
    self._drop2:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD, money)

    self._cost:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, self._bossData.cost)

    self._textTitle:setString(self._bossData.name)

    self:_updateDropList()
end

function PopupBossDetail:onExit()
    if self._listenerBossFight then
        self._listenerBossFight:remove()
        self._listenerBossFight = nil
    end
end

--英雄spine
function PopupBossDetail:_createHeroSpine()
    self._ImageHero:updateUI(self._bossData.res_id)
    -- self._ImageHero:setBubble(self._stageInfo.talk, nil, 2, true)
end

--关闭按钮
function PopupBossDetail:_onCloseClick()
    self:closeWithAction()

    if self._isPopStageView then
        G_SceneManager:popScene()
    end
end

--战斗按钮
function PopupBossDetail:_onFightClick()
    local chapterId = self._chapterId
    local bossId = self._bossData.id
    local needVit = self._bossData.cost
    --检查BOSS是否存在

    local chapterData = G_UserData:getChapter():getChapterByTypeId( self._chapterType,chapterId)
    if chapterData:getBossId() == 0 or chapterData:getBossState() ~= 0 then
        G_Prompt:showTip(Lang.get("chapter_boss_not_find"))
        return 
    end

    local success = LogicCheckHelper.enoughValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_VIT, needVit)
    if success then 
        G_NetworkManager:send(MessageIDConst.ID_C2S_ActDailyBoss, 
            {
                chapter_id = chapterId,
                boss_id = bossId,
            })
    end
end


--点击阵容
function PopupBossDetail:_onFormationClick()
	local popupEmbattle = require("app.scene.view.team.PopupEmbattle").new()
	popupEmbattle:openWithAction() 
end

--跟新掉落列表
function PopupBossDetail:_updateDropList()
   
    local awards = DropHelper.getDropReward(self._bossData.drop)
    self._listDrop:setListViewSize(450, 100)
    for i, v in pairs(awards) do
        v.size = 1
    end
    self._listDrop:updateUI(awards, 1,false,true)
    self._listDrop:setItemsMargin(20)
    self._awardsList = awards
end

--打副本消息处理
function PopupBossDetail:_recvBossFight(id, message)

    if message.ret ~= 1 then
        return
    end

    local ReportParser = require("app.fight.report.ReportParser")
    local reportData = ReportParser.parse( message.battle_report )
    local BattleDataHelper = require("app.utils.BattleDataHelper")
    local battleData = BattleDataHelper.parseDailyBossData(message, self._bossData.in_res,true)

    local win = reportData:isWin()
    local isPop = self._isPopStageView
    if win then
        local chapterData = G_UserData:getChapter()
        chapterData:defeatBoss(message.chapter_id)
        self:close()
    end

    G_SceneManager:showScene("fight", reportData, battleData, false, isPop)
end

return PopupBossDetail