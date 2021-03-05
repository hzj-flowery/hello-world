local ViewBase = require("app.ui.ViewBase")
local CommonLimitBaseView = class("CommonLimitBaseView", ViewBase)

CommonLimitBaseView.limitPopupPanel = require("app.ui.PopupCommonLimitCost") -- 可自定义
CommonLimitBaseView.limitCostNode = require("app.ui.component.CommonLimitCostNode") -- 可自定义

function CommonLimitBaseView:ctor(resource)
    CommonLimitBaseView.super.ctor(self, resource)
    self:_updateMaterialMaxSize()
end

function CommonLimitBaseView:_newCostNode(costKey)
end

function CommonLimitBaseView:_onClickCostAdd(costKey)
    logWarn("CommonLimitBaseView:_onClickCostAdd")
    self:_openPopupPanel(costKey, self:_getLimitLevel())
end

function CommonLimitBaseView:_openPopupPanel(costKey, level)
    if self._popupPanel ~= nil then
        return
    end
    self._popupPanel =
        self.class.limitPopupPanel.new(
        costKey,
        handler(self, self._onClickCostPanelItem),
        handler(self, self._onClickCostPanelStep),
        handler(self, self._onClickCostPanelStart),
        handler(self, self._onClickCostPanelStop),
        level,
        self["_costNode" .. costKey]
    )
    self._popupPanelSignal = self._popupPanel.signal:add(handler(self, self._onPopupPanelClose))
    self._nodePopup:addChild(self._popupPanel)
    self._popupPanel:updateUI()
end

function CommonLimitBaseView:_onPopupPanelClose(event)
    if event == "close" then
        self._popupPanel = nil
        if self._popupPanelSignal then
            self._popupPanelSignal:remove()
            self._popupPanelSignal = nil
        end
    end
end

function CommonLimitBaseView:_onClickCostPanelItem(costKey, materials)
    if self:_checkIsMaterialFull(costKey) == true then
        return
    end

    self:_doPutRes(costKey, materials)
end

function CommonLimitBaseView:_onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime)
    if self._materialFakeCount <= 0 then
        return false
    end

    if self._materialFakeCurSize >= self._materialMaxSize[costKey] then
        G_Prompt:showTip(Lang.get("hero_limit_material_full"))
        return false, nil, true
    end

    local realCostCount = math.min(self._materialFakeCount, costCountEveryTime)
    self._materialFakeCount = self._materialFakeCount - realCostCount
    self._materialFakeCostCount = self._materialFakeCostCount + realCostCount

    local costSizeEveryTime = self:_getCostSizeEveryTime(costKey, itemValue, realCostCount, costCountEveryTime)
    self._materialFakeCurSize = self._materialFakeCurSize + costSizeEveryTime

    if self._popupPanel then
        local emitter = self:_createEmitter(costKey)
        local startNode = self._popupPanel:findNodeWithItemId(itemId)
        local endNode = self["_costNode" .. costKey]
        self:_playEmitterEffect(emitter, startNode, endNode, costKey, self._materialFakeCurSize)
        startNode:setCount(self._materialFakeCount)
    end
    return true, realCostCount
end

function CommonLimitBaseView:_onClickCostPanelStart(costKey, itemId, count)
    self._materialFakeCount = count
    self._materialFakeCostCount = 0
    self._materialFakeCurSize = self:_getFakeCurSize(costKey)
end

function CommonLimitBaseView:_onClickCostPanelStop()
end

function CommonLimitBaseView:_createEmitter(costKey)
    local names = self:_getEmitterNames()
    local emitter = cc.ParticleSystemQuad:create("particle/" .. names[costKey] .. ".plist")
    emitter:resetSystem()
    return emitter
end

--飞球特效
function CommonLimitBaseView:_playEmitterEffect(emitter, startNode, endNode, costKey, curCount)
    local function getRandomPos(startPos, endPos)
        local pos11 = cc.p(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 3 / 4)
        local pos12 = cc.p(startPos.x + (endPos.x - startPos.x) * 1 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2)
        local pos21 = cc.p(startPos.x + (endPos.x - startPos.x) * 3 / 4, startPos.y + (endPos.y - startPos.y) * 1 / 2)
        local pos22 = cc.p(startPos.x + (endPos.x - startPos.x) * 1 / 2, startPos.y + (endPos.y - startPos.y) * 1 / 4)
        local tbPos = {
            [1] = {pos11, pos12},
            [2] = {pos21, pos22}
        }

        local index = math.random(1, 2)
        return tbPos[index][1], tbPos[index][2]
    end
    local UIHelper = require("yoka.utils.UIHelper")
    local startPos = UIHelper.convertSpaceFromNodeToNode(startNode, self)
    emitter:setPosition(startPos)
    self:addChild(emitter)
    local endPos = UIHelper.convertSpaceFromNodeToNode(endNode, self)
    local pointPos1, pointPos2 = getRandomPos(startPos, endPos)
    local bezier = {
        pointPos1,
        pointPos2,
        endPos
    }
    local action1 = cc.BezierTo:create(0.7, bezier)
    local action2 = cc.EaseSineIn:create(action1)

    emitter:runAction(
        cc.Sequence:create(
            action2,
            cc.CallFunc:create(
                function()
                    local realCount = self:_getFakeCurSize(costKey)
                    local isFull = realCount >= self._materialMaxSize[costKey]
                    curCount = isFull and realCount or curCount -- 特效速度慢，可能在最后一下还是上一次的假数据，强行拉回来
                    self["_cost" .. costKey]:playRippleMoveEffect(1, curCount)
                end
            ),
            cc.RemoveSelf:create()
        )
    )
end

-- 可重写，自己设置飞球特效
function CommonLimitBaseView:_getEmitterNames()
    local names = {
        [1] = "tujiegreen",
        [2] = "tujieblue",
        [3] = "tujiepurple",
        [4] = "tujieorange"
    }
    return names
end

function CommonLimitBaseView:_playLvUpEffect()
    local function effectFunction(effect)
        return cc.Node:create()
    end
    local function eventFunction(event)
        if event == "faguang" then
        elseif event == "finish" then
            local delay = cc.DelayTime:create(0.5) --延迟x秒播飘字
            local sequence =
                cc.Sequence:create(
                delay,
                cc.CallFunc:create(
                    function()
                        if self._lvUpCallback then
                            self._lvUpCallback()
                        end
                    end
                )
            )
            self:runAction(sequence)
        end
    end
    self:_updateMaterialMaxSize()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeHetiMoving, "moving_tujieheti", effectFunction, eventFunction, true)
    self:_playCostNodeSMoving()
end

function CommonLimitBaseView:_putResEffect(costKey)
    if self._popupPanel == nil then
        self:_updateCost()
        return
    end

    if self._materialFakeCostCount and self._materialFakeCostCount > 0 then --如果假球已经飞过了，就不再播球了，直接播剩下的特效和飘字
        self._materialFakeCostCount = nil
        self:_updateCost()
    else
        local curCount = self:_getFakeCurSize(costKey)
        for i, material in ipairs(self._costMaterials) do
            local itemId = material.id
            local emitter = self:_createEmitter(costKey)
            local startNode = self._popupPanel:findNodeWithItemId(itemId)
            local endNode = self["_costNode" .. costKey]
            self["_cost" .. costKey]:lock()
            self:_playEmitterEffect(emitter, startNode, endNode, costKey, curCount)
        end
    end
    self._popupPanel:updateUI()
    if self:_checkIsMaterialFull(costKey) == true then
        self._popupPanel:close()
    end
end

function CommonLimitBaseView:_updateMaterialMaxSize()
    self._materialMaxSize = self:_getMaterialMaxSize()
end

-- 可重写，获取每次增加的进度值
function CommonLimitBaseView:_getCostSizeEveryTime(costKey, itemValue, realCostCount, costCountEveryTime)
    return costCountEveryTime
end

-- 必须重写，获取当前材料进度
function CommonLimitBaseView:_getFakeCurSize(costKey)
    return 0
end

-- 必须重写，检查材料是否已满
function CommonLimitBaseView:_checkIsMaterialFull(costKey)
    return false
end

-- 必须重写，获取每种材料最大值
function CommonLimitBaseView:_getMaterialMaxSize()
end

-- 必须重写，投放材料发给后台
function CommonLimitBaseView:_doPutRes(costKey, materials)
end

-- 必须重写，更新每一个小球
function CommonLimitBaseView:_updateCost()
    logWarn("CommonLimitBaseView:_updateCost")
end

-- 重写，获取突破等级
function CommonLimitBaseView:_getLimitLevel()
    return 0
end

-- 放置材料成功时的回调
function CommonLimitBaseView:setLvUpCallback(callback)
    self._lvUpCallback = callback
end

-- 有哪些小球需要播放移动动画
function CommonLimitBaseView:_playCostNodeSMoving()
end

return CommonLimitBaseView
