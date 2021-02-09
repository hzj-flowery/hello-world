local PopupBase = require("app.ui.PopupBase")
local PopupGuildDungeonMonsterDetail = class("PopupGuildDungeonMonsterDetail", PopupBase)
local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")

function PopupGuildDungeonMonsterDetail:ctor(data)
    self._data = data
    self._monsterBattleUser = data.monsterBattleUser
    self._rank = data.rank
    self._name = data.name
    self._recordList = data.recordList
    self._memberList = data.memberList
    self._isCreate = true

    self._recordNodeList = {}
	local resource = {
		file = Path.getCSB("PopupGuildDungeonMonsterDetail", "guildDungeon"),
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
	PopupGuildDungeonMonsterDetail.super.ctor(self, resource)
end

function PopupGuildDungeonMonsterDetail:onCreate()
    self._btnFight:setString(Lang.get("stage_fight"))
    self._recordNodeList = {self._fightRecordNode1,self._fightRecordNode2,self._fightRecordNode3}
    self:_createHeroSpine()
end

function PopupGuildDungeonMonsterDetail:onEnter()
    self._signalGuildDungeonChallenge = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_CHALLENGE, handler(self, self._onEventGuildDungeonChallenge))
    self._signalGuildDungeonRecordSyn = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_RECORD_SYN, handler(self, self._onEventGuildDungeonRecordSyn))
	self._signalGuildDungeonMonsterGet = G_SignalManager:add(SignalConst.EVENT_GUILD_DUNGEON_MONSTER_GET, handler(self, self._onEventGuildDungeonMonsterGet))

    if not self._isCreate then
        self:_updateData() 
    end

    self:_refreshStageDetail()

    self._isCreate = false
end

function PopupGuildDungeonMonsterDetail:onExit()
    self._signalGuildDungeonChallenge:remove()
    self._signalGuildDungeonChallenge = nil

    self._signalGuildDungeonRecordSyn:remove()
	self._signalGuildDungeonRecordSyn = nil

	self._signalGuildDungeonMonsterGet:remove()
	self._signalGuildDungeonMonsterGet = nil
end

--打副本消息
function PopupGuildDungeonMonsterDetail:_onEventGuildDungeonChallenge(eventName, message)
    self:close()

    -- local ReportParser = require("app.fight.report.ReportParser")
    -- local reportData = ReportParser.parse(message.battle_report)
    -- local battleData = require("app.utils.BattleDataHelper").parseGuildDungeon(message)

    -- G_SceneManager:showScene("fight", reportData, battleData)

	local function enterFightView(message)
        local ReportParser = require("app.fight.report.ReportParser")
        local battleReport = G_UserData:getFightReport():getReport()
        local reportData = ReportParser.parse(battleReport)
        local battleData = require("app.utils.BattleDataHelper").parseGuildDungeon(message)
    
        G_SceneManager:showScene("fight", reportData, battleData)
	end
	G_SceneManager:registerGetReport(message.battle_report, function() enterFightView(message) end)
end

function PopupGuildDungeonMonsterDetail:_onEventGuildDungeonRecordSyn(event)
    self:_updateData() 
	--self:_refreshStageDetail()
    self:_refreshFightResult()
end

function PopupGuildDungeonMonsterDetail:_onEventGuildDungeonMonsterGet(event)
    self:_updateData() 
	self:_refreshStageDetail()
end

--关闭按钮
function PopupGuildDungeonMonsterDetail:_onCloseClick()
    self:closeWithAction()
end

--战斗按钮
function PopupGuildDungeonMonsterDetail:_onFightClick()

    if not self._data then
        G_Prompt:showTip(Lang.get("guilddungeon_monster_not_exit"))
        return
    end
    local count = UserDataHelper.getGuildDungenoFightCount()
    if count <= 0 then
        G_Prompt:showTip(Lang.get("guilddungeon_not_challenge_count"))
        return
    end

    if self:_isHasChallenge() then
        G_Prompt:showTip(Lang.get("guilddungeon_already_challenge"))
        return
    end

    local LogicCheckHelper  = require("app.utils.LogicCheckHelper")
	local success,popFunc = LogicCheckHelper.checkGuildDungeonInOpenTime()
	if not success then
		return 
	end
    G_SignalManager:dispatch(SignalConst.EVENT_CLEAR_GUILD_INVITE_NOTICE)-- 规避演武场景切换的bug
    local uid = self._monsterBattleUser:getUser():getId() 
    G_UserData:getGuildDungeon():c2sGuildDungeonBattle(uid)


end

--点击阵容
function PopupGuildDungeonMonsterDetail:_onFormationClick()
	local popupEmbattle = require("app.scene.view.team.PopupEmbattle").new()
	popupEmbattle:openWithAction() 
end

function PopupGuildDungeonMonsterDetail:_updateData()
    local data = UserDataHelper.getGuildDungeonMonsterData(self._rank)
    --可能第二天这个排名的怪刷没了
    if data then
        self._monsterBattleUser = data.monsterBattleUser
        self._rank = data.rank
        self._name = data.name
        self._recordList = data.recordList
        self._memberList = data.memberList
    end
    self._data = data
end

--是否挑战过此副本
function PopupGuildDungeonMonsterDetail:_isHasChallenge()
    for k,v in pairs(self._memberList) do
        if v:isSelf() then
            return true
        end
    end
    return false
end

--英雄spine
function PopupGuildDungeonMonsterDetail:_createHeroSpine()
   self._ImageHero:updateUI(self._monsterBattleUser:getPlayer_info().covertId, nil, nil, self._monsterBattleUser:getPlayer_info().limitLevel)
end

--敌方阵容
function PopupGuildDungeonMonsterDetail:_refreshEnemyFormation()
    local heros = self._monsterBattleUser:getHeros()
    local embattle = self._monsterBattleUser:getEmbattle()
    dump(embattle)
    for i=1, 6 do
         self["_heroAvater"..i]:setVisible(false)
    end
    for i=1, 6 do
        local hero = heros[i]
        local pos = embattle[i]
        if hero and pos and pos ~= 0 then
            self["_heroAvater"..pos]:setVisible(true)
            self["_heroAvater"..pos]:setScale(0.8)
           
            if i == 1 then
                local playerInfo = self._monsterBattleUser:getPlayer_info()
                self["_heroAvater"..pos]:updateUI(playerInfo.covertId, nil, nil, playerInfo.limitLevel)
            else
                 self["_heroAvater"..pos]:updateUI(hero:getBase_id(), nil, nil, hero:getLimit_level(), nil, nil, hero:getLimit_rtg())    
            end
            
            

        end
    end    

end

--刷新战斗结果
function PopupGuildDungeonMonsterDetail:_refreshFightResult()
    local recordList = self._recordList
    local memberList = self._memberList

    
    for k,v in ipairs(self._recordNodeList) do
        local record = recordList[k]
        local member = memberList[k]
        if record then
            self["_textNoRecord"..k]:setVisible(false)
            v:setVisible(true)
            local attackName =  nil
            if member then
                attackName = tostring(member:getRankPower()) .. "." .. record:getPlayer_name()
            else
                attackName = record:getPlayer_name()
            end 
            v:updateView(
              record:isIs_win(),
              attackName,
              Colors.getOfficialColor(record:getPlayer_officer()),
              Colors.getOfficialColorOutlineEx(record:getPlayer_officer())
            )
        else
            self["_textNoRecord"..k]:setVisible(true)
            v:setVisible(false)
        end
    end 
end

--刷新奖励
function PopupGuildDungeonMonsterDetail:_refreshRewardView()
    local GuildStageAtkReward = require("app.config.guild_stage_atk_reward")
    local stageConfig = GuildStageAtkReward.get(self._rank)
    self._dropItem:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GONGXIAN,stageConfig.win_reward)
end

--刷新对话
function PopupGuildDungeonMonsterDetail:_refreshTalk()
     local talkStr = UserDataHelper.getGuildDungeonTalk(self._monsterBattleUser )
     self._commonTalk:setText(talkStr,300,self._isCreate)
end

function PopupGuildDungeonMonsterDetail:_refreshStageDetail()
    self:_refreshMonsterBaseInfo()
    self:_refreshEnemyFormation()
    self:_refreshFightResult()
    self:_refreshRewardView()
    self:_refreshTalk()
end

function PopupGuildDungeonMonsterDetail:_refreshMonsterBaseInfo()
    self._textName:setString(self._monsterBattleUser:getUser():getName())
    self._fileNodePower:updateUI(self._monsterBattleUser:getUser():getPower())
end

return PopupGuildDungeonMonsterDetail