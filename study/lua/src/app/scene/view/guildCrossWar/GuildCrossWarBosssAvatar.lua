-- @Author  panhoa
-- @Date    2.18.2019
-- @Role    Monster

local ViewBase = require("app.ui.ViewBase")
local GuildCrossWarBosssAvatar = class("GuildCrossWarBosssAvatar", ViewBase)
local TextHelper = require("app.utils.TextHelper")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


function GuildCrossWarBosssAvatar:ctor(pointId)
    self._commonBossAvatar = nil
    self._bossName         = nil
    self._percentText      = nil
    self._pointId = pointId     -- 据点Id

    -- body
    local resource = {
        file = Path.getCSB("GuildCrossWarBosssAvatar", "guildCrossWar"),
    }
    GuildCrossWarBosssAvatar.super.ctor(self, resource)
end

function GuildCrossWarBosssAvatar:onCreate()
    self._nodeEffect:setVisible(false)
end

function GuildCrossWarBosssAvatar:onEnter()
end

function GuildCrossWarBosssAvatar:onExit()
end

function GuildCrossWarBosssAvatar:getCurState()
    local bExistBoss, curBossUnit = self:_isExistBoss()
    if not bExistBoss then
        return GuildCrossWarConst.BOSS_STATE_DEATH
    end

    local bossState, __ = curBossUnit:getCurState()
    return bossState
end

-- @Role    Exist Boss
function GuildCrossWarBosssAvatar:_isExistBoss()
    local bossMap = G_UserData:getGuildCrossWar():getBossMap()
    if type(bossMap) ~= "table" then
        return false, nil
    end

    local curBossUnit = bossMap[self._pointId]
    if curBossUnit == nil or curBossUnit:getConfig().boss_res == nil then
        return false, nil
    end

    if curBossUnit:getConfig().boss_res <= 0 then 
        return false, nil
    end
    return true, curBossUnit
end

-- @Role    Update BaseInfo
function GuildCrossWarBosssAvatar:_updateBase()
    local bExistBoss, curBossUnit = self:_isExistBoss()
    if not bExistBoss then
        return
    end
    
    local data = curBossUnit:getConfig()
    self._commonBossAvatar:setBaseId(data.boss_res)
    self._commonBossAvatar:setAsset(data.boss_res)
    self._commonBossAvatar:setAction("idle", true)
    self._commonBossAvatar:setLocalZOrder(0)
    self._commonBossAvatar:setScale(0.7)
    self._commonBossAvatar:turnBack(data.face == 1)

    self._bossName:setString(""..data.name)
    self._bossName:setColor(Colors.getColor(data.color))
    self._bossName:enableOutline(Colors.getColorOutline(data.color), 2)

    local pos = GuildCrossWarHelper.getWarMapGridCenter(data.boss_place)
    if pos then
        self:setPosition(pos)
    end

    local guildName = curBossUnit:getGuild_name() ~= "" and (curBossUnit:getGuild_name()..Lang.get("guild_cross_war_bossguild"))
                                                        or ""
    self._bossGuildName:setString(guildName)
    self._nodeAvatarInfo:setPosition(GuildCrossWarConst.BOSS_AVATAR_INFO_POS)
end

-- @Role    Update Boss's HP
function GuildCrossWarBosssAvatar:_updateHP()
    local bExistBoss, curBossUnit = self:_isExistBoss()
    if not bExistBoss then
        return
    end

    if curBossUnit == nil then
        return
    end

    if curBossUnit:getHp() == 0 or curBossUnit:getMax_hp() == 0 then
        return
    end

    local percent = string.format("%.2f", (100 * curBossUnit:getHp() / curBossUnit:getMax_hp()))
    if curBossUnit:getHp() > 0 then
        self._percentText:setString(TextHelper.getAmountText(curBossUnit:getHp()))
    else
        self._percentText:setString(" ")
        self:setVisible(false)
        percent = curBossUnit:isIs_kill() and percent or "100.00%"
    end

    local percentNum = tonumber(percent) or 0
    self["_monsterBlood1"]:setVisible(percentNum > 60)
    self["_monsterBlood2"]:setVisible(percentNum <= 60 and percentNum > 30)
    self["_monsterBlood3"]:setVisible(percentNum <= 30 and percentNum >= 0)
    self["_monsterBlood1"]:setPercent(percentNum)
    self["_monsterBlood2"]:setPercent(percentNum)
    self["_monsterBlood3"]:setPercent(percentNum)
end

-- @Role    Update Boss's label && effect
function GuildCrossWarBosssAvatar:_updateState()
    local bExistBoss, curBossUnit = self:_isExistBoss()
    if not bExistBoss then
        return
    end

    local bossState, stateStr = curBossUnit:getCurState()
    local bAttacking = (GuildCrossWarConst.BOSS_STATE_PK == bossState)
    self:_playAttackAction(bAttacking)
end

-- @Role    UpdateBoss
function GuildCrossWarBosssAvatar:updateUI(callback)
    local bExistBoss, bossUnit = self:_isExistBoss()
    if not bExistBoss then
        return
    end

    if bossUnit:isIs_kill() then
        self:_playDieAction(callback)
        return
    end

    self:_updateBase()
    self:_updateState()
    self:_updateHP()
end

-- @Role    AvatarModel Visible
function GuildCrossWarBosssAvatar:isAvatarModelVisible()
    return self:isVisible()
end

function GuildCrossWarBosssAvatar:_playDieAction(callback)
    local function playBossDieAction()
        self._commonBossAvatar:setAction("die", false)
    end

    local function dieFinishCallBack()
        self:setVisible(false)
        self["_nodeRole"]:setVisible(false)
        G_UserData:getGuildCrossWar():setBossUnitById(self._pointId)
        if callback then
            callback()
        end
    end

    self._nodeRole:stopAllActions()
    self:stopAllActions()
    self._nodeRole:runAction(cc.Sequence:create(
        cc.CallFunc:create(playBossDieAction),
        cc.FadeOut:create(0.5),
        cc.CallFunc:create(dieFinishCallBack)
    ))
end

-- @Role    Boss Action
function GuildCrossWarBosssAvatar:_playAttackAction(bAttacking)
    if not bAttacking then
        return
    end

    local bExistBoss, _ = self:_isExistBoss()
    if not bExistBoss then
        return
    end

    local seq = cc.Sequence:create(
        cc.DelayTime:create(0.8),
        cc.CallFunc:create(function()
            local dirIndex = math.random(1, 2)
            local dir = 1.0
            if dirIndex == 2 then
                dir = -1.0
            end
            self._commonBossAvatar:setAction("skill1", false)
            self._commonBossAvatar:setScaleX(dir)
        end),
        cc.DelayTime:create(1.8),
        cc.CallFunc:create(function()
            self._commonBossAvatar:setAction("idle", true)
        end),
        cc.DelayTime:create(1),
        cc.CallFunc:create(function()
        end)
    )
    local rep = cc.RepeatForever:create(seq)
    self:stopAllActions()
    self:runAction(rep)
end



return GuildCrossWarBosssAvatar