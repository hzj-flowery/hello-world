
local ViewBase = require("app.ui.ViewBase")
local MainAvatorsNode = class("MainAvatorsNode", ViewBase)
local FunctionConst = require("app.const.FunctionConst")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local RedPointHelper = require("app.data.RedPointHelper")
local DataConst = require("app.const.DataConst")
local AvatarDataHelper = require("app.utils.data.AvatarDataHelper")

function MainAvatorsNode:ctor()
    self._resourceNode = nil
    local resource = {
		file = Path.getCSB("MainAvatorsNode", "main"),
		size = {1136, 640},
		binding = {
		}
	}
    self:setName("MainAvatorsNode")
	MainAvatorsNode.super.ctor(self, resource)
end

function MainAvatorsNode:onCreate()
    self._heroAvatar1:changeTitle()   -- 主角头上称号显示与不显示
end

function MainAvatorsNode:updateAll()
    logWarn("MainAvatorsNode:updateAll")
    self:_updateHeroAvatar()
end

function MainAvatorsNode:onEnter()
    self._signalUserDataUpdate      = G_SignalManager:add(SignalConst.EVENT_RECV_ROLE_INFO, handler(self, self._onEventUserDataUpdate))
    self._signalUserLevelUpdate     = G_SignalManager:add(SignalConst.EVENT_USER_LEVELUP, handler(self, self._onEventUserLevelUpdate))
	self._signalChangeHeroFormation = G_SignalManager:add(SignalConst.EVENT_CHANGE_HERO_FORMATION_SUCCESS, handler(self, self._onEventUserHeroChange))
    self._signalRedPointUpdate      = G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self,self._onEventRedPointUpdate))
    self._signalOfficialLevelUp     = G_SignalManager:add(SignalConst.EVENT_OFFICIAL_LEVEL_UP, handler(self, self._onEventOfficialLevelUp  ))
	self._signalEquipTitle = G_SignalManager:add(SignalConst.EVENT_EQUIP_TITLE, handler(self, self._onEventTitleChange))   -- 称号装备
    self._signalUnloadTitle = 
        G_SignalManager:add(SignalConst.EVENT_UNLOAD_TITLE, handler(self, self._onEventTitleChange))   -- 称号卸下
    self._signalUpdateTitleInfo =
        G_SignalManager:add(SignalConst.EVENT_UPDATE_TITLE_INFO, handler(self, self._onEventTitleChange)) -- 称号更新
    self._funcId2HeroReach = {} --存储武将各个模块的红点值
    self:updateAll()
    
    G_HeroVoiceManager:setIsInMainMenu(true)
    if not G_TutorialManager:isDoingStep() then
        G_HeroVoiceManager:startPlayMainMenuVoice()
    end
end

function MainAvatorsNode:onExit()
    G_HeroVoiceManager:setIsInMainMenu(false)
    if not G_TutorialManager:isDoingStep() then
        G_HeroVoiceManager:stopPlayMainMenuVoice()
    end

    self._signalUserDataUpdate:remove()
    self._signalUserDataUpdate = nil
    self._signalUserLevelUpdate:remove()
    self._signalUserLevelUpdate =nil
    self._signalChangeHeroFormation:remove()
    self._signalChangeHeroFormation =nil
  

    self._signalRedPointUpdate:remove()
    self._signalRedPointUpdate = nil

    self._signalOfficialLevelUp:remove()
    self._signalOfficialLevelUp = nil

    self._signalEquipTitle:remove()
    self._signalEquipTitle = nil
    self._signalUnloadTitle:remove()
    self._signalUnloadTitle = nil
    self._signalUpdateTitleInfo:remove()
    self._signalUpdateTitleInfo=nil
end

function MainAvatorsNode:_onClickHeroAvatar(mainAvatar)

end

--更新上阵武将列表
function MainAvatorsNode:_updateHeroAvatar()
    local heroIdList = G_UserData:getTeam():getHeroIdsInBattle()
    local startFuncId = FunctionConst.FUNC_TEAM_SLOT1

    local LogicCheckHelper = require("app.utils.LogicCheckHelper")

    for index= 1, 6 do
        local heroNode = self["_heroAvatar"..index]
        if heroNode then
            local funcTeamSoltId= (index-1) + FunctionConst.FUNC_TEAM_SLOT1
            heroNode:setFuncId(funcTeamSoltId)
        end
    end

    --只解锁一个
    local function onlyUnlockOne()
        local unLockOne = 0
        local lockLevel = 0
        for index= 1, 6 do
            local heroNode = self["_heroAvatar"..index]
            local heroId = heroIdList[index]
            if heroNode then
                local funcTeamSoltId= (index-1) + FunctionConst.FUNC_TEAM_SLOT1
                local isOpen = LogicCheckHelper.funcIsOpened( funcTeamSoltId )
                if isOpen == true and heroId == nil then
                    if unLockOne == 0 then
                        heroNode:setLock(false)
                        heroNode:setAdd(true)
                    else
                        heroNode:setLock(false)
                        heroNode:setAdd(false)
                        heroNode:setShadowVisible(false)
                    end
                    unLockOne  = unLockOne + 1
                else
                    if isOpen == false and lockLevel == 0 and heroId == nil then
                        heroNode:showOpenLevel(true)
                        lockLevel = lockLevel + 1
                    end
                end
            end
        end
    end

    onlyUnlockOne()

    for i, value in ipairs(heroIdList) do
        local heroUnit = G_UserData:getHero():getUnitDataWithId(value)
        local heroNode = self["_heroAvatar"..i]
        if heroUnit and heroNode then
            local heroBaseId, isEquipAvatar, avatarLimitLevel, arLimitLevel = AvatarDataHelper.getShowHeroBaseIdByCheck(heroUnit)
            local limitLevel = avatarLimitLevel or heroUnit:getLimit_level()
            local limitRedLevel = arLimitLevel or heroUnit:getLimit_rtg()
            heroNode:updateUI(heroBaseId, isEquipAvatar, limitLevel, limitRedLevel)
            heroNode:updateHeroName(heroUnit:getBase_id(), heroUnit:getRank_lv(),heroUnit:getLevel(),
                heroUnit:getLimit_level(), heroUnit:getLimit_rtg())
            if heroUnit:getConfig().type == 1 then
                heroNode:updateOfficial()
            end
        end
    end
    self:_updateHeroAvatarRedPoint()
end

function MainAvatorsNode:_updateRedPointByFuncId(funcId, param)
    if funcId and funcId > 0 then
        if self:_isInHeroAvatarFuncList(funcId) then
            self:_updateHeroAvatarRedPoint(funcId, param)
        end
    end
end


-- user数据更新
function MainAvatorsNode:_onEventUserDataUpdate(_, param)
    self:_updateHeroAvatar()--改名
end

-- 角色升级，刷新按钮状态
function MainAvatorsNode:_onEventUserLevelUpdate(_, param)
end

-- 角色升级，刷新按钮状态
function MainAvatorsNode:_onEventUserHeroChange(_, param)
    self:_updateHeroAvatar()
end

function MainAvatorsNode:_onEventOfficialLevelUp(_, param)
    self:_updateHeroAvatar()
end

--小红点刷新
function MainAvatorsNode:_onEventRedPointUpdate(id, funcId, param)
   self:_updateRedPointByFuncId(funcId, param)
end

function MainAvatorsNode:_onEventTitleChange()
    logWarn("_onEventTitleChange")
    self._heroAvatar1:changeTitle()  -- 主角头上称号显示与不显示
end

--是否在Avatar红点检测列表中
function MainAvatorsNode:_isInHeroAvatarFuncList(funcId)
    local list = {
        FunctionConst.FUNC_EQUIP,
        FunctionConst.FUNC_TREASURE,
        FunctionConst.FUNC_INSTRUMENT,
        FunctionConst.FUNC_HORSE,
        FunctionConst.FUNC_HERO_TRAIN_TYPE1,
        FunctionConst.FUNC_HERO_TRAIN_TYPE2,
        FunctionConst.FUNC_HERO_TRAIN_TYPE3,
        FunctionConst.FUNC_HERO_TRAIN_TYPE4,
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE4,
        FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
        FunctionConst.FUNC_HORSE_TRAIN,
        FunctionConst.FUNC_HERO_KARMA,
        FunctionConst.FUNC_TACTICS,
    }
    for i, id in ipairs(list) do
        if id == funcId then
            return true
        end
    end
    return false
end


function MainAvatorsNode:_updateHeroAvatarRedPoint(funcId, param)
    local function checkEquipRP(pos)
        local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_EQUIP, "posRP", pos)
        return reach
    end

    local function checkTreasureRP(pos)
        local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TREASURE, "posRP", pos)
        return reach
    end

    local function checkInstrumentRP(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        if heroId > 0 then
            local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
            local heroBaseId = unitData:getBase_id()
            local param = {pos = pos, heroBaseId = heroBaseId}
            local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_INSTRUMENT, "posRP", param)
            return reach
        end
        return false
    end

    local function checkHorseRP(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        if heroId > 0 then
            local unitData = G_UserData:getHero():getUnitDataWithId(heroId)
            local heroBaseId = unitData:getBase_id()
            local param = {pos = pos, heroBaseId = heroBaseId}
            local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_HORSE, "posRP", param)
            return reach
        end
        return false
    end 

    local function checkHeroUpgrade(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE1, heroUnitData)
        return reach
    end

    local function checkHeroBreak(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE2, heroUnitData)
        return reach
    end

    local function checkHeroAwake(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE3, heroUnitData)
        return reach
    end

    local function checkHeroLimit(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_TRAIN_TYPE4, heroUnitData)
        return reach
    end

    local function checkEquipStrengthen(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE1, pos)
        return reach
    end

    local function checkEquipRefine(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE2, pos)
        return reach
    end

    local function checkTreasureUpgrade(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE1, pos)
        return reach
    end

    local function checkTreasureRefine(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE2, pos)
        return reach
    end

    local function checkTreasureLimit(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_TREASURE_TRAIN_TYPE4, pos)
        return reach
    end

    local function checkInstrumentAdvance(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1, pos)
        return reach
    end

    local function checkHorseUpStar(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HORSE_TRAIN, pos)
        return reach
    end

    local function checkKarma(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_KARMA, heroUnitData)
        return reach
    end

    local function checkTactics(pos)
        local reach = RedPointHelper.isModuleSubReach(FunctionConst.FUNC_TACTICS, "posRP", pos)
        return reach
    end

    local function checkHeroChange(pos)
        local heroId = G_UserData:getTeam():getHeroIdWithPos(pos)
        local heroUnitData = G_UserData:getHero():getUnitDataWithId(heroId)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_HERO_CHANGE, heroUnitData)
        return reach
    end

    local function checkAvatar(pos)
        if pos ~= 1 then
            return false
        end
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_AVATAR)
        return reach
    end

    local function checkEquipJade(pos)
        local reach = RedPointHelper.isModuleReach(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3, pos)
        return reach
    end

    local checkFuncs = {
        [FunctionConst.FUNC_EQUIP] = checkEquipRP,
        [FunctionConst.FUNC_TREASURE] = checkTreasureRP,
        [FunctionConst.FUNC_INSTRUMENT] = checkInstrumentRP,
        [FunctionConst.FUNC_HORSE] = checkHorseRP,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE1] = checkHeroUpgrade,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE2] = checkHeroBreak,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE3] = checkHeroAwake,
        [FunctionConst.FUNC_HERO_TRAIN_TYPE4] = checkHeroLimit,
        [FunctionConst.FUNC_EQUIP_TRAIN_TYPE1] = checkEquipStrengthen,
        [FunctionConst.FUNC_EQUIP_TRAIN_TYPE2] = checkEquipRefine,
        [FunctionConst.FUNC_TREASURE_TRAIN_TYPE1] = checkTreasureUpgrade,
        [FunctionConst.FUNC_TREASURE_TRAIN_TYPE2] = checkTreasureRefine,
        [FunctionConst.FUNC_TREASURE_TRAIN_TYPE4] = checkTreasureLimit,
        [FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1] = checkInstrumentAdvance,
        [FunctionConst.FUNC_HORSE_TRAIN] = checkHorseUpStar,
        [FunctionConst.FUNC_HERO_KARMA] = checkKarma,
        [FunctionConst.FUNC_TACTICS] = checkTactics,
        [FunctionConst.FUNC_HERO_CHANGE] = checkHeroChange,
        [FunctionConst.FUNC_AVATAR] = checkAvatar,
        [FunctionConst.FUNC_EQUIP_TRAIN_TYPE3] = checkEquipJade,
    }

    --红点相关的
    local redPointFuncId = {
        FunctionConst.FUNC_EQUIP,
        FunctionConst.FUNC_TREASURE,
        FunctionConst.FUNC_INSTRUMENT,
        FunctionConst.FUNC_HORSE,
        FunctionConst.FUNC_HERO_TRAIN_TYPE1,
        FunctionConst.FUNC_HERO_TRAIN_TYPE2,
        FunctionConst.FUNC_HERO_TRAIN_TYPE3,
        FunctionConst.FUNC_HERO_TRAIN_TYPE4,
        FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1,
        FunctionConst.FUNC_HORSE_TRAIN,
        FunctionConst.FUNC_HERO_KARMA,
        FunctionConst.FUNC_HERO_CHANGE,
        FunctionConst.FUNC_AVATAR,
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE3,
        FunctionConst.FUNC_TACTICS,
    }
    --箭头相关的
    local arrowFuncId = {
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE1,
        FunctionConst.FUNC_EQUIP_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE1,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE2,
        FunctionConst.FUNC_TREASURE_TRAIN_TYPE4,
    }

    local heroIdList = G_UserData:getTeam():getHeroIdsInBattle()
    for i, value in ipairs(heroIdList) do
        local heroNode = self["_heroAvatar"..i]
        local reachArrow = false
        local reachRedPoint = false
        if heroNode then
            if funcId then
                if param then
                    local item2FuncId = nil
                    for j = 1, #param do
                        local item = param[j]
                        if item.id then
                            if funcId == FunctionConst.FUNC_HERO_TRAIN_TYPE2 and item.id == DataConst.ITEM_BREAK then--是突破丹才判断
                                item2FuncId = funcId
                                break
                            end
                            if funcId == FunctionConst.FUNC_EQUIP_TRAIN_TYPE2
                            and item.id == DataConst["ITEM_REFINE_STONE_1"]
                            and item.id == DataConst["ITEM_REFINE_STONE_2"]
                            and item.id == DataConst["ITEM_REFINE_STONE_3"]
                            and item.id == DataConst["ITEM_REFINE_STONE_4"] then --是精炼石才判断
                                item2FuncId = funcId
                                break
                            end
                            if funcId == FunctionConst.FUNC_TREASURE_TRAIN_TYPE2 and item.id == DataConst.ITEM_TREASURE_REFINE_STONE then--宝物精炼石
                                item2FuncId = funcId
                                break
                            end
                            if funcId == FunctionConst.FUNC_INSTRUMENT_TRAIN_TYPE1 and item.id == DataConst.ITEM_INSTRUMENT_STONE then--神兵进阶石
                                item2FuncId = funcId
                                break
                            end
                        end
                    end
                    if item2FuncId then
                        local func = checkFuncs[item2FuncId]
                        if func then
                            self._funcId2HeroReach[item2FuncId] = func(i)
                        end
                    end
                else
                    local func = checkFuncs[funcId]
                    if func then
                        self._funcId2HeroReach[funcId] = func(i)
                    end
                end
            else
                for j, funcId in ipairs(arrowFuncId) do
                    local func = checkFuncs[funcId]
                    if func then
                        local reach = func(i)
                        self._funcId2HeroReach[funcId] = reach
                        if reach then
                            reachArrow = true
                            break
                        end
                    end
                end
                for j, funcId in ipairs(redPointFuncId) do
                    local func = checkFuncs[funcId]
                    if func then
                        local reach = func(i)
                        self._funcId2HeroReach[funcId] = reach
                        if reach then
                            reachRedPoint = true
                            break
                        end
                    end
                end
            end

            if reachArrow then
                heroNode:showRedPoint(reachRedPoint)
                heroNode:showImageArrow(false)
            else
                heroNode:showRedPoint(reachRedPoint)
                heroNode:showImageArrow(false)
            end
        end
    end
end


return MainAvatorsNode
