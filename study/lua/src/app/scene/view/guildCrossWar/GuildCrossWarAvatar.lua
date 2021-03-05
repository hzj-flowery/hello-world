-- Author: panhoa
-- Date:
-- 
local ViewBase = require("app.ui.ViewBase")
local GuildCrossWarAvatar = class("GuildCrossWarAvatar", ViewBase)
local CurveHelper = require("app.scene.view.guildCrossWar.CurveHelper")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local UIHelper = require("yoka.utils.UIHelper")
local GuildCrossWarHelper = require("app.scene.view.guildCrossWar.GuildCrossWarHelper")


function GuildCrossWarAvatar:ctor(unitId)
    self._commonHeroAvatar = nil
    self._panelbk       = nil --Panel
    self._avatarName    = nil
    self._avatarGuild   = nil
    self._percentText   = nil

    self._unitId     = unitId
    self._curPointId = 0
    self._moving     = false 
    self._isModelCreated   = false
    self._isModelPccupied  = false
    self._avatarAction     = 1
    
    local resource = {
        file = Path.getCSB("GuildCrossWarAvatar", "guildCrossWar"),
    }
    GuildCrossWarAvatar.super.ctor(self, resource)
end

function GuildCrossWarAvatar:onCreate()
    self:_updateUnitData()
    self:_initSwallowTouches()
    self:setVisible(true)
end

function GuildCrossWarAvatar:onEnter()
end

function GuildCrossWarAvatar:onExit()
end

function GuildCrossWarAvatar:_initSwallowTouches()
    self._imageProc:setSwallowTouches(false)
    self._avatarName:setSwallowTouches(false)
    self._avatarGuild:setSwallowTouches(false)

    for i=1, 3 do
        self["_monsterBlood" ..i]:setSwallowTouches(false)
    end
end

-- @Role    Reborn
function GuildCrossWarAvatar:playRebornAction(callback, updateCallback)
    --[[if self._commonHeroAvatar == nil then
        return
    end]]

    local node = cc.Node:create()
    self:addChild(node)
    local seq = cc.Sequence:create(
        cc.CallFunc:create(function()
            --self._nodeAvatar:setVisible(false)
            self._avatarName:setVisible(false)
            self._avatarGuild:setVisible(false)
            self:setRoleVisible(false)
            if self._commonHeroAvatar and self._avatarAction ~= 3 then
                self._avatarAction = 3
                self._commonHeroAvatar:setAction("dizzy", false)
            end
        end),
        cc.DelayTime:create(1.0),
        cc.FadeOut:create(0.2),
        cc.CallFunc:create(function()
            self:_synPosition()
            if callback then
                callback()
            end
        end),
        cc.DelayTime:create(13.0),
        cc.CallFunc:create(handler(self, self._playAvatarBornEffect)),
        cc.FadeIn:create(0.1),
        cc.CallFunc:create(function()
            --self._nodeAvatar:setVisible(true)
            self._avatarName:setVisible(true)
            self._avatarGuild:setVisible(true)
            self:setRoleVisible(true)
            if self._commonHeroAvatar and self._avatarAction ~= 1 then
                self._avatarAction = 1
                self._commonHeroAvatar:setAction("idle", true)
            end
            self._userData:setHp(self._userData:getMax_hp())
            self:updateAvatarHp()
            if updateCallback then
                updateCallback()
            end
        end),
        cc.RemoveSelf:create()
    )
    node:runAction(seq)
end

function GuildCrossWarAvatar:getCurState()
    return self._userData:getCurrState()
end

-- @Role    Reborn Action
function GuildCrossWarAvatar:_playAvatarBornEffect()
    local function effectFunction(effect)
		local EffectGfxNode = require("app.effect.EffectGfxNode")
		if effect == "effect_zm_boom" then
			local subEffect = EffectGfxNode.new("effect_zm_boom")
            subEffect:play()
			return subEffect
		end
    end
    local function eventFunction(event)
		if event == "finish" then
        elseif event == "hero" then
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeRebornEffect, "moving_wuchabiebuzhen_wujiang", effectFunction, eventFunction , false)
end

-- @Role    Move and Attack
function GuildCrossWarAvatar:playAttackAction(attackBack, attackType, gridId)
    -- body
    --[[if self._commonHeroAvatar == nil then
        return
    end]]

    attackType = attackType or GuildCrossWarConst.ATTACK_TYPE_1
    local bExistBoss, bossUnit = self:_isExistBossUnit()

    if rawequal(attackType, GuildCrossWarConst.ATTACK_TYPE_1) and not bExistBoss then
        return
    end

    gridId = gridId or 0
    if rawequal(attackType, GuildCrossWarConst.ATTACK_TYPE_3) then
        local pointId = G_UserData:getGuildCrossWar():getSelfUnit():getCurPointId()
        gridId = GuildCrossWarHelper.getWarCfg(pointId).boss_place
    elseif rawequal(attackType, GuildCrossWarConst.ATTACK_TYPE_1) then
        gridId = bossUnit:getConfig().boss_place
    end

    local targetPos = GuildCrossWarHelper.getWarMapGridCenter(gridId)
    if targetPos == nil then
        return
    end

    local startPos  = self._userData:getCurrPointKeyPos()
    local newTargetPos = cc.pGoldenPoint(clone(startPos), clone(targetPos), GuildCrossWarConst.BOSS_AVATAR_DISTANCE)
    local function rotateCallback(startPos, targetPos)
        if self._commonHeroAvatar then
            self._commonHeroAvatar:turnBack(targetPos.x - startPos.x < 0)
        end
    end

    self._moving = true
    self._nodeRebornEffect:removeAllChildren()

    local node = cc.Node:create()
    self:addChild(node)
    local action = cc.Spawn:create(
        cc.CallFunc:create(function()
            rotateCallback(clone(startPos), clone(newTargetPos)) 
        end),
        cc.Sequence:create(
            cc.CallFunc:create(function()
                if self._commonHeroAvatar and self._avatarAction ~= 4 then
                    self._avatarAction = 4
                    self._commonHeroAvatar:setAction("skill1", false)
                end
            end),
            cc.DelayTime:create(1.0),
            cc.CallFunc:create(function()
                if self._commonHeroAvatar and self._avatarAction ~= 1 then
                    self._avatarAction = 1
                    self._commonHeroAvatar:setAction("idle", true)
                end
                if attackBack then
                    attackBack()
                end
                self._moving = false
                
            end),
            cc.RemoveSelf:create()
        )
    )
    node:runAction(action)
end

function GuildCrossWarAvatar:checkMoving()
    return self._moving
end

function GuildCrossWarAvatar:setMoving(isMoving)
    self._moving = isMoving
end

-- @Role    Return Cur's Point
function GuildCrossWarAvatar:getCurPointId()
    return self._curPointId
end

-- @Role    Return Cur's Point
function GuildCrossWarAvatar:getUId()
    return self._unitId
end

-- @Role    Init Position
function GuildCrossWarAvatar:_synPosition()
    if not GuildCrossWarHelper.isFightingStage() then
        return
    end

    if not self:_updateUnitData() then
        return
    end

    if self._userData == nil then
        return
    end
    local selfPosX, selfPosY = self:getPosition()
    local gridId = GuildCrossWarHelper.getGridIdByPosition(selfPosX, selfPosY)
    if rawequal(gridId, self._userData:getCurGrid()) then
        return
    end

    local currPos = self._userData:getCurrPos()
    if currPos then
        self:setPosition(currPos)
	end
end

-- @Role    removeAvatar
function GuildCrossWarAvatar:releaseAvatar( ... )
    if not self._commonHeroAvatar then
        return
    end
    self._isModelPccupied = false
end

-- @Role    removeAvatar
function GuildCrossWarAvatar:removeAvatar( ... )
    if not self._commonHeroAvatar then
        return
    end

    self._commonHeroAvatar:removeFromParent()
    self._commonHeroAvatar = nil
    self._isModelCreated = false
    self._isModelPccupied = false
end

-- @Role    UpdateUI
function GuildCrossWarAvatar:updateUI(isOnlyShowName, isMoveBeforePos)
    if not self:_updateUnitData() then
        return
    end

    self:_updatePosition(isMoveBeforePos)
    if isOnlyShowName then
        self:_updateBaseUI()
        self:setRoleVisible(false)
        self:setNameVisible(true)
    else
        self:_updateAvatar()
        self:_updateBaseUI()
        self:updateAvatarHp()
        self:setRoleVisible(true)
        self:setNameVisible(true)
    end
end

-- @Role    Is Self
function GuildCrossWarAvatar:isSelf()
    if not self._userData then
        return false
    end
    return self._userData:isSelf()
end

function GuildCrossWarAvatar:isSelfGuild()
    if not self._userData then
        return false
    end
    return self._userData:isSelfGuild()
end

function GuildCrossWarAvatar:getCurGrid()
    if not self._userData then
        return 0
    end
    return self._userData:getCurGrid()
end

function GuildCrossWarAvatar:isMoveEnd()
    if not self._userData then
        return true
    end
    return self._userData:isMoveEnd()
end

function GuildCrossWarAvatar:setRoleVisible(isVisible)
    self._nodeRebornEffect:setVisible(isVisible)
    self._nodeAvatar:setVisible(isVisible)
    self._imageProc:setVisible(isVisible)
    self._monsterBlood3:setVisible(isVisible)
    self._monsterBlood2:setVisible(isVisible)
    self._monsterBlood1:setVisible(isVisible)
    self._percentText:setVisible(isVisible)
    self._bloodNode:setVisible(isVisible)
end

function GuildCrossWarAvatar:setNameVisible(isVisible)
    self._avatarName:setVisible(isVisible)
    self._avatarGuild:setVisible(isVisible)
end

function GuildCrossWarAvatar:isModelCreated( ... )
    return self._isModelCreated
end

function GuildCrossWarAvatar:isModelOccupied( ... )
    return self._isModelPccupied
end

-- @Role    Update Position
function GuildCrossWarAvatar:_updatePosition(isMoveBefore)
    if not self:_isExistAvatar() then
        return
    end

    if self._userData == nil then
        return
    end
    local selfPosX, selfPosY = self:getPosition()
    local gridId = GuildCrossWarHelper.getGridIdByPosition(selfPosX, selfPosY)
    if rawequal(gridId, self._userData:getCurGrid()) then
        return
    end

    local currPos = isMoveBefore and self._userData:getMoveBeforePos() 
                                  or self._userData:getCurrPos()
    if currPos then
        self:setPosition(currPos)
    end
end

-- @Role    Isn't Nil Boss
function GuildCrossWarAvatar:_isExistBossUnit()
    if not self:_isExistAvatar() then
        return false, nil
    end

    self._curPointId = self._userData:getCurPointId()
    local bossUnit = G_UserData:getGuildCrossWar():getBossUnitById(self._curPointId)
    if bossUnit == nil then
        return false, nil
    end
    return true, bossUnit
end

-- @Role    Isn't Nil Avatar
function GuildCrossWarAvatar:_isExistAvatar()
    if self._userData == nil or type(self._userData) ~= "table" then
        return false
    end
    return true
end

-- @Role    Change Avatar
function GuildCrossWarAvatar:updateAvatar(uid, isOnlyShowName, isMoveBeforePos, isNeedCreate)
    -- body
    self._unitId = uid
    if not self:_updateUnitData() then
        return
    end

    if isOnlyShowName then
        self:_updateBaseUI()
        self:_updatePosition(isMoveBeforePos)
        self:setRoleVisible(false)
        self:setNameVisible(true)
    else
        local _, userTable = UserDataHelper.convertAvatarId(self._userData)
        if self._commonHeroAvatar then
            self._commonHeroAvatar:updateAvatar(userTable)
        else

            if isNeedCreate then        
                local CSHelper = require("yoka.utils.CSHelper")
                self._commonHeroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
                self._commonHeroAvatar:updateAvatar(userTable)
                self._commonHeroAvatar:setScale(0.5)
                self._nodeAvatar:addChild(self._commonHeroAvatar)
                self._isModelCreated = true
            end
        end

        self:updateAvatarHp()
        self:_updateBaseUI()
        self:_updatePosition(isMoveBeforePos)
        self:setRoleVisible(true)
        self:setNameVisible(true)
        self._isModelPccupied = true
    end
end

-- @Role    Update Avatar
function GuildCrossWarAvatar:_updateAvatar()
    if not self:_isExistAvatar() then
        return
    end

    if self._commonHeroAvatar then
        return
    end
    if self._unitId and self:_updateUnitData() then
        local CSHelper = require("yoka.utils.CSHelper")
        local _, userTable = UserDataHelper.convertAvatarId(self._userData)
        self._commonHeroAvatar = CSHelper.loadResourceNode(Path.getCSB("CommonHeroAvatar", "common"))
        self._commonHeroAvatar:updateAvatar(userTable)
        self._commonHeroAvatar:setScale(0.5)
        self._nodeAvatar:addChild(self._commonHeroAvatar)
        self._isModelCreated = true
        self._isModelPccupied= true
    end
end

-- @Role    Update BaseInfo
function GuildCrossWarAvatar:_updateBaseUI()
    if not self:_isExistAvatar() then
        return
    end

    self._avatarName:setString(self._userData:getName())
    self._avatarGuild:setString(self._userData:getGuild_name())
    local guildColor = GuildCrossWarHelper.getPlayerColor(self._userData:getUid())
    self._avatarGuild:setColor(guildColor)
    self._avatarName:setColor(guildColor)
end

function GuildCrossWarAvatar:updateAvatarHp(isBlooding, isChangeRole)
    if not self:_updateUnitData() then
        return
    end

    if not self._userData then
        return
    end
    if isBlooding then
        local lastBlood = self._percentText:getTag() or 0
        local bloodingHp = (lastBlood - self._userData:getHp())
        if bloodingHp > 0 then
            self:_updateBlood(bloodingHp)
        end
    end

    if isChangeRole then
        self:_updateBaseUI()
    end
    
    local percent = string.format("%.2f", (100 * self._userData:getHp() / self._userData:getMax_hp()))
    local curHp = self._userData:getHp() > 0 and self._userData:getHp() or self._userData:getInit_hp()
    self._percentText:setString(" ")
    self._percentText:setTag(curHp)

    local percentNum = tonumber(percent) or 0
    self["_monsterBlood1"]:setVisible(percentNum > 60)
    self["_monsterBlood2"]:setVisible(percentNum <= 60 and percentNum > 30)
    self["_monsterBlood3"]:setVisible(percentNum <= 30 and percentNum > 0)
    self["_monsterBlood1"]:setPercent(percentNum)
    self["_monsterBlood2"]:setPercent(percentNum)
    self["_monsterBlood3"]:setPercent(percentNum)
end

-- @Role    Update _userData
function GuildCrossWarAvatar:_updateUnitData()
    if self._unitId then
        local unitData = G_UserData:getGuildCrossWar():getUnitById(self._unitId)
        self._userData = unitData
        return true
    end
    return false
end

--------------------------------------------------------------------------------
-- @Role    PathFinding
function GuildCrossWarAvatar:moving(cameraFollow, callback)
    if self._commonHeroAvatar == nil then
        self:updateUI(true, true)
    end

    self._moving = true
    self._cameraFollow = cameraFollow or nil
    self._lastPathCallBack = callback or nil
    if self._commonHeroAvatar and self._avatarAction ~= 2 then
        self._avatarAction = 2
        self._commonHeroAvatar:setAction("run", true)
    end

    self:_doMoveAvatar()
end

-- @Role    Moving
function GuildCrossWarAvatar:_doMoveAvatar()
    if not self:_updateUnitData() then
        return
    end

    local selfPosX, selfPosY = self:getPosition()
    local finalPath, cameraPath = self._userData:getMovingPath(selfPosX, selfPosY, self._cameraFollow ~= nil)
    if type(finalPath) == "number" then
        return
    end

    self._userData:setReachEdge(false)
    self._userData:setMoving(true)
    local curveLine = {}
    self._movePathList = finalPath
    if self._cameraFollow then
        self._cameraFollow(cameraPath)
    end

    if self._commonHeroAvatar and self._avatarAction ~= 2 then
        self._avatarAction = 2
        self._commonHeroAvatar:setAction("run", true)
    end
    self:_loopMoveAvatar()
end

-- @Role    
function GuildCrossWarAvatar:_loopMoveAvatar()
    if self._movePathList and #self._movePathList > 0 then
        if self._commonHeroAvatar and self._avatarAction ~= 2 then
            self._avatarAction = 2
            self._commonHeroAvatar:setAction("run", true)
        end
        local path = self._movePathList[1]
        self:_moveAvatar(path)
        table.remove(self._movePathList, 1)
    else
        if self._commonHeroAvatar and self._avatarAction ~= 1 then
            self._avatarAction = 1
            self._commonHeroAvatar:setAction("idle", true)
        end
        if self._userData then
            self._userData:setReachEdge(true)
            self._userData:setMoving(false)
        end
        self._moving = false
        
        -- Gp home and return blood
        if self._userData and GuildCrossWarHelper.isOriPoint(self._userData:getCurPointId()) then
            self._userData:setHp(self._userData:getMax_hp())
            self:updateAvatarHp()
        end

        if self._lastPathCallBack then
            local bUpdateCanGrid = self._cameraFollow or false
            self._lastPathCallBack(bUpdateCanGrid)
        end
    end
end

-- @Role    Moving
function GuildCrossWarAvatar:_moveAvatar(path)
    -- body
    local curveConfigList = path.curLine
    local totalTime = (path.totalTime * 1000)
    local endTime = (G_ServerTime:getMSTime() + path.totalTime * 1000)
    
    local function movingEnd(...)
        self:_loopMoveAvatar()
    end
    
    local function rotateCallback(angle, oldPos, newPos)
        if self._commonHeroAvatar and type(newPos) == "table" then
            if math.floor(math.abs(newPos.x - oldPos.x)) <= 1 then
                self._commonHeroAvatar:turnBack(newPos.x < newPos.x)
            else
                self._commonHeroAvatar:turnBack(newPos.x < oldPos.x)
            end
        end
        local posY = self:getPositionY()
        self:setLocalZOrder(GuildCrossWarConst.UNIT_ZORDER - posY)
    end
    
    local function moveCallback(newPos, oldPos)
        if type(newPos) == "table" and table.nums(newPos) == 2 then
            self:setPosition(newPos)
        end
    end
    
    CurveHelper.doCurveMove(self,
        movingEnd,
        rotateCallback,
        moveCallback,
        curveConfigList,
        totalTime,
        endTime)
end

-- @Role    Syn ServerState
function GuildCrossWarAvatar:synServerPos()
    self:_synPosition()
end

-- @Role    _updateBlood
function GuildCrossWarAvatar:_updateBlood(hp)
    self._bloodNode:removeChildByName("blood")
    local startPosX = self._bloodNode:getPositionX()
    local startPosY = self._bloodNode:getPositionY()

    startPosX = startPosX + 10
    startPosY = startPosY + 10
    local txtBlood = UIHelper.createLabel({fontSize = 26, fontName = Path.getCommonFont(), outlineColor = cc.c3b(0x63, 0x06, 0x06)})
    txtBlood:setString(tostring("-" ..hp))
    txtBlood:setColor(Colors.BRIGHT_BG_RED)
    txtBlood:setPosition(cc.p(startPosX, startPosY))
    txtBlood:setAnchorPoint(cc.p(0.5, 0.5))
    txtBlood:setName("blood")
    self._bloodNode:addChild(txtBlood)

    local endPos = cc.p(startPosX + 20, startPosY + 60)
    local pointPos1 = cc.p(startPosX + 5, startPosY + 20)
	local pointPos2 = cc.p((startPosX + endPos.x) / 2, startPosY + 40)
	local bezier = {
		pointPos1,
		pointPos2,
		endPos
	}
	local action1 = cc.BezierTo:create(0.5, bezier)
	local action2 = cc.EaseSineIn:create(action1)
    txtBlood:runAction(
		cc.Sequence:create(
			action2,
			cc.CallFunc:create(function()
            end),
            cc.DelayTime:create(0.7),
			cc.RemoveSelf:create()
		)
	)
end



return GuildCrossWarAvatar
