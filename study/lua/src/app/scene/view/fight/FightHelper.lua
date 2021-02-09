local FightHelper = {}

local MonsterTalk = require("app.config.monster_talk")
local Engine = require("app.fight.Engine")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local FunctionConst = require("app.const.FunctionConst")
local MonsterTalk = require("app.config.monster_talk")
local BattleDataHelper = require("app.utils.BattleDataHelper")
local StoryChatConst = require("app.const.StoryChatConst")
local StoryTouch = require("app.config.story_touch")
local Engine = require("app.fight.Engine")

local SpeedCount = 4

function FightHelper.processData(battleData, report)
    battleData.star = report:getStar()
	battleData.loseType = report:getLoseType()
end

--检查是否需要添加怪物说话的情况
function FightHelper.checkMonsterTalk(monsterTeamId, battleStar)
    if monsterTeamId == 0 then 
        return 
    end
    local count = MonsterTalk.length()
    local userLevel = G_UserData:getBase():getLevel()
    for i = 1, count do 
        local talkConfig = MonsterTalk.indexOf(i)
        if userLevel > talkConfig.lv_min and userLevel <= talkConfig.lv_max and talkConfig.teamid == monsterTeamId then     --等级区间符合，并且怪物id符合
            local engine = Engine.getEngine()
            if battleStar == 0 then     --输了
                engine:addLoseTalk(talkConfig)
            end
            if talkConfig.battle == "9" then    --填9表示任意情况
                engine:addMonsterTalk(talkConfig)
            else 
                local star = string.split(talkConfig.battle, "|")
                for i, v in pairs(star) do
                    if tonumber(v) == battleStar then
                        engine:addMonsterTalk(talkConfig)
                        break
                    end
                end                
            end
        end
     end
end

--检查是否有速度引导动画
function FightHelper.checkSpeedLead()
    local lead = nil
    local isDoubleOpen, _, functionInfoDouble = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_2)
    local isTripleOpen, _, functionInfoTriple = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_3)
    local isQuadruple, _, functionInfoQuadruple = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_4)
	local userLevel = G_UserData:getBase():getLevel()
    local params = G_StorageManager:loadUser("lead_speed") or {} 
    local hasLeadDouble = params.leadDouble or 0
    local hasleadTriple = params.leadTriple or 0
    local hasleadQuadruple = params.leadQuadruple or 0
    if isDoubleOpen and userLevel <= functionInfoDouble.level + 1 and hasLeadDouble == 0 then  
        lead = 2 --两倍速
    elseif isTripleOpen and userLevel <= functionInfoTriple.level + 1 and hasleadTriple == 0 then
        lead = 3 --三倍速
    elseif isQuadruple and userLevel <= functionInfoQuadruple.level + 1 and hasleadQuadruple == 0 then
        lead = 4 --4倍速
    end 
    return lead
end

--写入倍速引导
function FightHelper.writeSpeedLead(leadType) 
    local lead = {0, 0, 0}
    for i = 1, leadType-1 do 
        if lead[i] then 
            lead[i] = 1
        end
    end
    G_StorageManager:saveWithUser("lead_speed", {
        leadDouble = lead[1],
        leadTriple = lead[2],
        leadQuadruple = lead[3],
    })	
end

--检查是否是需要check对话的类型
function FightHelper.checkIsChatType(battleType)
    --普通副本，名将副本，名将本帐篷
	if battleType == BattleDataHelper.BATTLE_TYPE_NORMAL_DUNGEON or 
		battleType == BattleDataHelper.BATTLE_TYPE_FAMOUS or 
		battleType == BattleDataHelper.BATTLE_TYPE_GENERAL then 
			return true
	end
    return false
end
    
--是否需要对话剧情
function FightHelper.checkStoryChat(checkType, waveId, stageId, isWin, heroId)
    local count = StoryTouch.length()
    for i = 1, count do
        local touch = StoryTouch.indexOf(i)
        if touch.control_value1 == stageId and touch.control_type == checkType then 
			if checkType == StoryChatConst.TYPE_BEFORE_FIGHT then			--战斗前
                if touch.control_value2 == waveId then
                    return touch.story_touch
				end
			elseif checkType == StoryChatConst.TYPE_WIN then				--胜利结束
				if isWin and touch.control_value2 == waveId then
                    return touch.story_touch
                end		
			elseif checkType == StoryChatConst.TYPE_MONSTER_DIE then		--怪物死亡
                if heroId == touch.hero_id then
					Engine.getEngine():pause()
                    return touch.story_touch
				end	
			elseif checkType == StoryChatConst.TYPE_START_ATTACK then		--攻击前，这边waveid是回合数
				if heroId == touch.hero_id and waveId == touch.control_value2 then
					return touch.story_touch
				end
			elseif checkType == StoryChatConst.TYPE_ENTER_STAGE then		--跳入之后对话
				if heroId == touch.hero_id then
                    return touch.story_touch
				end
			end
        end
    end
end

function FightHelper.getFightSpeed()
    local params = G_StorageManager:loadUser("battle_speed") or {}    
    local openState = {
        LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_2),
        LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_3),
        LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_BATTLE_SPEED_4),
    }

    local maxSpeed = 1
    for i = 1, #openState do 
        if openState[i] == true then 
            maxSpeed = i + 1
        end
    end

    local showUI = openState[1]


    --是否手动设置过
    local manual = params.manual or 0
    local double = params.double or 1
    
    if manual == 1 then
        if params.double <= maxSpeed then 
            return params.double, showUI
        end 
    end

    if manual ~= 1 and maxSpeed > double then 
        FightHelper.writeSpeedFile(maxSpeed)
    end
    return maxSpeed, showUI
end

--检查是否可以到下一个等级，如果不能，返回提示，以及轮回去的等级，可以，返回下一个速度等级
function FightHelper.checkNextSpeed(nowSpeed)
    local nextSpeed = nowSpeed + 1
    nextSpeed = (nextSpeed - 1) % SpeedCount + 1
    if nextSpeed == 1 then 
        return true, nextSpeed
    end
    local ret, errMsg = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_BATTLE_SPEED_"..nextSpeed])
    if not ret then     --如果下一个等级没有开放，那么下一个等级应该会回到1
        nextSpeed = 1
    end
    return ret, nextSpeed, errMsg
end

function FightHelper.writeSpeedFile(speed, isManual)
    local m = 0
    if isManual then 
        m = 1
    end
    G_StorageManager:saveWithUser("battle_speed", {
        double = speed,
        manual = m,
    })
end

function FightHelper.pushDamageData(data)
    if not FightHelper.hpOutFile then 
        FightHelper.hpOutFile = {}
    end
    table.insert(FightHelper.hpOutFile, data)
end

function FightHelper.saveHpTestFile(name)
    local filename = name or "damage_test.json"
    G_StorageManager:save(filename, FightHelper.hpOutFile)
    FightHelper.hpOutFile = {}
end

return FightHelper