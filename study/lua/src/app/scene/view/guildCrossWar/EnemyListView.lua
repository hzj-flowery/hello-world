-- @Author panhoa
-- @Date 05.07.2019
-- @Role 

local ViewBase = require("app.ui.ViewBase")
local EnemyListView = class("EnemyListView", ViewBase)
local TabScrollView = require("app.utils.TabScrollView")
local EnemyListCell = import(".EnemyListCell")
local GuildCrossWarHelper = import(".GuildCrossWarHelper")
local GuildCrossWarConst = require("app.const.GuildCrossWarConst")
local TextHelper = require("app.utils.TextHelper")


function EnemyListView:ctor(attackCallback)
    self._scrollView = nil
    self._tabListView= nil
    self._textTime   = nil
    self._isAutoArrow= true
    self._enemyList  = {}
    self._attackCallback = attackCallback

    local resource = {
        file = Path.getCSB("EnemyListView", "guildCrossWar"),
        binding = {
			_btnArrow = {
                events = {{event = "touch", method = "_onButtonArrow"}}
            },
            _panelTouch = {
				events = {{event = "touch", method = "_onTouchCallBack"}}
            }
        }
    }
    EnemyListView.super.ctor(self, resource)
end

function EnemyListView:onCreate()
    self:_initPosition()
    self:_initScrollView()
    self:_createSwordEft()
    self._cityNode:setVisible(false)
    self._imageArrow:setSwallowTouches(false)
end

function EnemyListView:onEnter()
    self:updateScrollView()
end

function EnemyListView:onExit()
end

function EnemyListView:_initPosition( ... )
    self._oriPosition = cc.p(self._resource:getPosition())
    self._oriBtnRankPosition = cc.p(self._btnArrow:getPosition())
    local oriSize = self._resource:getContentSize() 
    self._newTargetPos = cc.p(self._oriPosition.x + oriSize.width, self._oriPosition.y)
    self._newBtnRankPos = cc.p(self._oriPosition.x + oriSize.width - 24, self._oriBtnRankPosition.y)
    self:setContentSize(oriSize)
end

function EnemyListView:_onButtonArrow(sender)
    if sender then
        self._isAutoArrow = (not self._isAutoArrow)
    end

    local bVisible = (not self._resource:isVisible())
    self._imageArrow:setFlippedX(not bVisible)    
    if bVisible then
        self._resource:setVisible(true)
        self._resource:runAction(cc.Sequence:create(
        cc.CallFunc:create(function()
        end),
        cc.MoveBy:create(0.2, cc.pSub(self._oriPosition, self._newTargetPos))
        ))

        self._btnArrow:runAction(cc.Sequence:create(
        cc.MoveBy:create(0.2, cc.pSub(self._oriBtnRankPosition, self._newBtnRankPos))
        ))
    else
        self._resource:runAction(cc.Sequence:create(
        cc.MoveBy:create(0.2, cc.pSub(self._newTargetPos, self._oriPosition)),
        cc.CallFunc:create(function()
            self._resource:setVisible(false)
        end)
        ))

        self._btnArrow:runAction(cc.Sequence:create(
        cc.MoveBy:create(0.2, cc.pSub(self._newBtnRankPos, self._oriBtnRankPosition))
        ))
    end
end

function EnemyListView:_onTouchCallBack(sender,state)
	if(state == ccui.TouchEventType.ended) or not state then
		local moveOffsetX = math.abs(sender:getTouchEndPosition().x-sender:getTouchBeganPosition().x)
		local moveOffsetY = math.abs(sender:getTouchEndPosition().y-sender:getTouchBeganPosition().y)
        if moveOffsetX < 20 and moveOffsetY < 20 then
            if self._enemyCity and self._enemyCity[1] then
                self:_onCellTouch(nil, {type = self._enemyCity[1].type, id = self._enemyCity[1].value:getKey_point_id()})
            end
		end
	end
end

function EnemyListView:_createSwordEft()
	local EffectGfxNode = require("app.effect.EffectGfxNode")
	local function effectFunction(effect)
        if effect == "effect_shuangjian"then
            local subEffect = EffectGfxNode.new("effect_shuangjian")
            subEffect:play()
            return subEffect 
        end
    end
    self._nodeSword:removeAllChildren()
    self._swordEffect = G_EffectGfxMgr:createPlayMovingGfx(self._nodeSword, "moving_shuangjian", effectFunction, nil, false)
	self._swordEffect:setPosition(0,0)
    self._swordEffect:setAnchorPoint(cc.p(0.5,0.5))
    self._swordEffect:setVisible(false)
end

function EnemyListView:_initScrollView()
    local scrollViewParam = {
		template = EnemyListCell,
		updateFunc = handler(self, self._onUpdate),
		selectFunc = handler(self, self._onCellSelected),
		touchFunc = handler(self, self._onCellTouch),
	}
    self._tabListView = TabScrollView.new(self._scrollView, scrollViewParam, 1)
end

function EnemyListView:_onUpdate(item, index)
    if type(self._enemyList) ~= "table" or table.nums(self._enemyList) <= 0 then
        return
    end

    local newIdx = (index + 1)
    if self._enemyList[newIdx] then
        local itemData = {
            index = newIdx,
            objectType = self._enemyList[newIdx].objectType,
            type = self._enemyList[newIdx].type,
            cfg = self._enemyList[newIdx].value,
        }
        item:updateUI(itemData)
    end
end

function EnemyListView:_onCellSelected(item, index) 
end

function EnemyListView:_onCellTouch(index, data)
    if not data then
        return
    end
    
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if not selfUnit then
        return
    end

    if G_ServerTime:getLeftSeconds(selfUnit:getFight_cd()) <= 0 then
        if selfUnit:isMoving() then
            return
        end

        if self._attackCallback and data.type == 1 then
            self._attackCallback(data.gridId)
        end
        G_UserData:getGuildCrossWar():c2sBrawlGuildsFight(data.type, data.id)
    else
        G_Prompt:showTip(Lang.get("guild_cross_war_noattack"))
    end
end

function EnemyListView:_updateEnemyData( ... )
    self._enemyList = {}
    self._enemyCity = {}

    self._isExistCity = false
    local selfPointHole = {}
    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if not selfUnit or selfUnit:isMoving() then
        return self._isExistCity
    end
    
    -- Avatar
    selfPointHole = selfUnit:getCurPointHole()
    local userList = G_UserData:getGuildCrossWar():getUserMap()
    for k, value in pairs(userList) do
        if GuildCrossWarHelper.getWarMapCfg(value:getCurGrid()) then
            if not value:isSelf() and GuildCrossWarHelper.isExitCurAround(value:getUid()) then
                local bVisible = (not value:isSelfGuild()) and (GuildCrossWarHelper.checkCanMovedPoint(selfPointHole, 
                                    GuildCrossWarHelper.getWarMapCfg(value:getCurGrid())))
                if bVisible then
                    table.insert(self._enemyList, {value = value, type = 1, objectType = 1})        -- 1.1 强敌：相邻
                elseif rawequal(value:getCurGrid(), selfUnit:getCurGrid()) and (not value:isSelfGuild()) then
                    table.insert(self._enemyList, {value = value, type = 1, objectType = 1})        -- 1.2 强敌：本格
                end
            end
        end
    end

    -- City
    local pointData = GuildCrossWarHelper.getWarCfg(selfUnit:getCurPointId())
    if pointData and not rawequal(pointData.type, 1) then -- 不在原始据点
        local retList = G_UserData:getGuildCrossWar():getWarHoleList()
        local bAround = cc.pGetDistance(cc.p(retList[selfUnit:getCurGrid()].x, retList[selfUnit:getCurGrid()].y), 
                                         cc.p(retList[pointData.boss_place].x,  retList[pointData.boss_place].y)) == 1 or false
        if bAround then
            local selfCityData = G_UserData:getGuildCrossWar():getCityMap()[selfUnit:getCurPointId()]
            if selfCityData and (not selfCityData:isSelfGuild()) then
                self._isExistCity = true
                table.insert(self._enemyCity, 1, {value = selfCityData, type = 0, objectType = 2})-- 2. 城池
            end
        end
    end

    -- Boss
    if rawequal(G_UserData:getGuildCrossWar():getSelfOriPoint(), selfUnit:getCurPointId()) then
        local bossData = G_UserData:getGuildCrossWar():getBossMap()[selfUnit:getCurPointId()]
        if bossData and (not bossData:isIs_kill()) then
            local bossGrid = bossData:getConfig().boss_place
            local gridList = GuildCrossWarHelper.isAroundGrid(bossGrid)
            for k, v in pairs(gridList) do
                if rawequal(selfUnit:getCurGrid(), v.id) and bossData:getHp() ~= 0 then
                    -- boss攻击范围
                    if v.isCanAtk then
                        table.insert(self._enemyList, 1, {value = bossData, type = 0, objectType = 3})  -- 3. Boss
                        break
                    end
                end
            end
        end
    end

    return self._isExistCity
end

function EnemyListView:_updateCityHp(data)
    -- body
    if data:getMax_hp() == 0 or data:getHp() == 0 then
        return
    end 
    
    local curHp = TextHelper.getAmountText(data:getHp())
    if self._colorProgress:getCurHp() == curHp then
        return
    end

    local percent =  math.floor(data:getHp() * 100/data:getMax_hp())
    self._textBuildingHp:setString(percent .."%")
    self._colorProgress:setPercent(percent, true, nil, {yellowPercent = 60, redPercent = 30, curHp = curHp})
end

function EnemyListView:_updateCity( ... )
    -- body
    if not self._isExistCity or not self._enemyCity then
        return
    end

    if not self._enemyCity[1] or not self._enemyCity[1].value then
        return
    end

    local data = self._enemyCity[1].value
    local pointData = GuildCrossWarHelper.getWarCfg(data:getKey_point_id())
    local name = pointData.point_name or ""
    self._textCityName:setString(name)
    self._textCityHpTitle:setString(Lang.get("guild_cross_war_enemycell_hp2"))

    self:_updateCityHp(data)
end

function EnemyListView:updateCountDown( ... )
    if not GuildCrossWarHelper.isFightingStage() then
        return
    end

    local selfUnit = G_UserData:getGuildCrossWar():getSelfUnit()
    if not selfUnit then
        return
    end

    local fightCD = G_ServerTime:getLeftSeconds(selfUnit:getFight_cd())
    if fightCD < 0 then
        self._textTime:setString(0 .."s")
        return
    end

    local fightColor = fightCD > 0 and cc.c3b(0xff, 0x00, 0x00) or cc.c3b(0x2f, 0x9f, 0x07)
    fightCD = fightCD > 0 and fightCD or 0
    self._textTime:setColor(fightColor)
    self._textTime:setString(fightCD .."s")
end

function EnemyListView:updateScrollView()
    local state, __ = GuildCrossWarHelper.getCurCrossWarStage()
    if state == GuildCrossWarConst.ACTIVITY_STAGE_1 then
        if self._resource:isVisible() then
            self:_onButtonArrow()
        end
        return
    end

    if self:_updateEnemyData() then
        self:_updateCity()
        self._swordEffect:setVisible(true)
    end

    local enemyListNum = table.nums(self._enemyList)
    local sizeIndex = self._isExistCity and 2 or 1
    self._cityNode:setVisible(self._isExistCity)

    if self._scrollView:getTag() ~= sizeIndex then
        self._scrollView:setPositionY(GuildCrossWarConst.ENEMYLISTVIEW_POS[sizeIndex])
        self._scrollView:setTag(sizeIndex)
        self._scrollView:setInnerContainerSize(GuildCrossWarConst.ENEMYLISTVIEW_SIZE[sizeIndex])
        self._scrollView:setContentSize(GuildCrossWarConst.ENEMYLISTVIEW_SIZE[sizeIndex])
    end
    
    self._tabListView:updateListView(1, enemyListNum)
    enemyListNum = self._isExistCity and (enemyListNum + 1) or enemyListNum


    if self._isAutoArrow then
        if not self._resource:isVisible() and enemyListNum > 0 then
            self:_onButtonArrow()
        elseif self._resource:isVisible() and enemyListNum <= 0 then
            --self._scrollView:clearCellAnimation()
            self:_onButtonArrow()
        end
    end
end


return EnemyListView