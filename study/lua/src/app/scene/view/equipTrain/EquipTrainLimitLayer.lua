local ViewBase = require("app.ui.ViewBase")
local EquipTrainLimitLayer = class("EquipTrainLimitLayer", ViewBase)
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local LimitCostConst = require("app.const.LimitCostConst")
local EquipLimitCostNode = require("app.scene.view.equipTrain.EquipLimitCostNode")
local EquipLimitCostPanel = require("app.scene.view.equipTrain.EquipLimitCostPanel")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
local UIHelper = require("yoka.utils.UIHelper")
local FunctionConst = require("app.const.FunctionConst")
local UserDataHelper = require("app.utils.UserDataHelper")
local EffectGfxNode = require("app.effect.EffectGfxNode")
local AudioConst = require("app.const.AudioConst")

local ZORDER_COMMON = 0
local ZORDER_MID = 1
local ZORDER_MOVE = 2

EquipTrainLimitLayer.BG_RES = {
    [1001] = "img_limit_bg01",
    [2001] = "img_bg_limit02",
    [3001] = "img_bg_limit02"
}

EquipTrainLimitLayer.NODE_POS_Y_3_4 = {
    [1001] = -130,
    [2001] = -130.5,
    [3001] = -130.5
}

EquipTrainLimitLayer.NODE_FRONT_IMG = {
    [1001] = {
        [2] = "img_limit_gold_hero02a",
        [3] = "img_limit_gold_hero05a",
        [4] = "img_limit_gold_hero06a"
    },
    [2001] = {
        [2] = "img_limit_gold_hero02a",
        [3] = "img_limit_gold_hero05a",
        [4] = "img_limit_gold_hero06a"
    },
    [3001] = {
        [2] = "img_limit_gold_hero02a",
        [3] = "img_limit_gold_hero05a",
        [4] = "img_limit_gold_hero06a"
    }
}

EquipTrainLimitLayer.COST_NODE_POS_Y_NORMAL = -130
EquipTrainLimitLayer.COST_NODE_POS_Y_UP = -140

function EquipTrainLimitLayer:ctor(parentView)
    self._parentView = parentView

    self._lastEquipid = 0
    self._lastSliverNums = 0
    self._lastRefinelevel = 0

    local resource = {
        file = Path.getCSB("EquipTrainLimitLayer", "equipment"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _buttonBreak = {
                events = {{event = "touch", method = "_onButtonBreak"}}
            },
            _buttonDetail = {
                events = {{event = "touch", method = "_onButtonDetail"}}
            }
        }
    }
    EquipTrainLimitLayer.super.ctor(self, resource)
end

function EquipTrainLimitLayer:onCreate()
    self:_updateData()
    self:_initUI()
    self._recordAttr = G_UserData:getAttr():createRecordData(FunctionConst.FUNC_LIMIT_UP_TYPE)
end

function EquipTrainLimitLayer:onEnter()
    self._signalEventEquipLimitUpPutRes =
        G_SignalManager:add(SignalConst.EVENT_EQUIP_LIMIT_UP_PUT_RES, handler(self, self._onEventEquipLimitUpPutRes))
end

function EquipTrainLimitLayer:onExit()
    self._signalEventEquipLimitUpPutRes:remove()
    self._signalEventEquipLimitUpPutRes = nil
end

-- 物品消耗返回
function EquipTrainLimitLayer:_onEventEquipLimitUpPutRes(id, costKey)
    self:_updateData()
    if costKey ~= LimitCostConst.BREAK_LIMIT_UP then -- 非突破操作
        self:_putResEffect(costKey)
        self:_updateNodeSliver()
    else
        G_AudioManager:playSoundWithId(AudioConst.SOUND_LIMIT_TUPO)
        self:_playLvUpEffect()
        self._unitData:setChange(0)
    end
end

function EquipTrainLimitLayer:_playLvUpEffect()
    local function effectFunction(effect)
        return cc.Node:create()
    end
    local function eventFunction(event)
        if event == "faguang" then
        elseif event == "finish" then
            self:_updateView()
            self:_playFire(true)
            local delay = cc.DelayTime:create(0.5) --延迟x秒播飘字
            local sequence =
                cc.Sequence:create(
                delay,
                cc.CallFunc:create(
                    function()
                        self:_playPrompt()
                        self:_updateCost()
                    end
                )
            )
            self:runAction(sequence)
        end
    end
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeHetiMoving, "moving_tujieheti", effectFunction, eventFunction, true)
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        self["_cost" .. key]:playSMoving()
    end
end

function EquipTrainLimitLayer:_playFire(isPlay)
    self._nodeFire:setVisible(true)
    self._nodeFire:removeAllChildren()
    local effectName = isPlay and "effect_tujietiaozi_1" or "effect_tujietiaozi_2"
    if self._suit_id == LimitCostConst.MAX_SUIT_ID then
        local effect = EffectGfxNode.new(effectName)
        self._nodeFire:addChild(effect)
        effect:play()
    end
end

function EquipTrainLimitLayer:_playPrompt()
    local summary = {}
    local content = Lang.get("summary_equip_limit_break_success")
    local param = {
        content = content
    }
    table.insert(summary, param)
    --属性飘字
    self:_addBaseAttrPromptSummary(summary)
    G_Prompt:showSummary(summary)
    --总战力
    G_Prompt:playTotalPowerSummary()
end

--加入基础属性飘字内容
function EquipTrainLimitLayer:_addBaseAttrPromptSummary(summary)
    local TextHelper = require("app.utils.TextHelper")
    local AttrDataHelper = require("app.utils.data.AttrDataHelper")
    local attr = self._recordAttr:getAttr()
    local desInfo = TextHelper.getAttrInfoBySort(attr)
    for i, info in ipairs(desInfo) do
        local attrId = info.id
        local diffValue = self._recordAttr:getDiffValue(attrId)
        if diffValue ~= 0 then
            local param = {
                content = AttrDataHelper.getPromptContent(attrId, diffValue),
                anchorPoint = cc.p(0, 0.5),
                startPosition = {x = UIConst.SUMMARY_OFFSET_X_ATTR}
            }
            table.insert(summary, param)
        end
    end

    return summary
end

-- 释放特效
function EquipTrainLimitLayer:_putResEffect(costKey)
    if self._popupPanel == nil then
        self:_updateCost()
        return
    end

    if self._materialFakeCostCount and self._materialFakeCostCount > 0 then --如果假球已经飞过了，就不再播球了，直接播剩下的特效和飘字
        self._materialFakeCostCount = nil
        self:_updateCost()
    else
        local curCount = self._unitData:getMaterials()[costKey]
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

function EquipTrainLimitLayer:_updateData()
    local equipid = G_UserData:getEquipment():getCurEquipId() -- 装备唯一id
    self._unitData = G_UserData:getEquipment():getEquipmentDataWithId(equipid)
    self._suit_id = self._unitData:getConfig().suit_id
    self._costInfo = EquipTrainHelper.getLimitUpCostInfo()
end

-- 初始化UI
function EquipTrainLimitLayer:_initUI()
    self:_initCostIcon()
    self._buttonHelp:updateLangName("equipment_limit_up_help_txt")
    self._buttonBreak:setString(Lang.get("equip_limit_break_btn"))
    self._nodeSilver:updateUI(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_GOLD)
    self._nodeSilver:setTextColorToDTypeColor()
    G_EffectGfxMgr:createPlayMovingGfx(self._nodeBgMoving, "moving_tujie_huohua", nil, nil, false)
end

-- 文本
function EquipTrainLimitLayer:_updateText()
    local equipBaseId = self._unitData:getBase_id()
    local titleRes = EquipTrainHelper.getLimitUpTitleRes(equipBaseId)
    self._imageTitle:loadTexture(titleRes)
    self._imageTitle:setVisible(titleRes ~= "")
    local config = {}
    if self._suit_id == LimitCostConst.MAX_SUIT_ID then
        config = self._unitData:getConfig()
        self._textName:setAnchorPoint(cc.p(0.5, 0.5))
        self._textName:setPositionX(0)
        self._imageTitleBg:setScale(0.6)
        self._imageTitleBg:setPositionY(235)
    else
        local after_id = self._unitData:getConfig().potential_after
        config = EquipTrainHelper.getConfigByBaseId(after_id)
        self._textName:setAnchorPoint(cc.p(0, 0.5))
        self._textName:setPositionX(56.06)
        self._imageTitleBg:setScale(1)
        self._imageTitleBg:setPositionY(210)
    end
    self._textName:setString(config.name)
    self._textName:setColor(Colors.getColor(config.color))
    local params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_EQUIPMENT, config.id)
    require("yoka.utils.UIHelper").updateTextOutline(self._textName, params)
end

-- 更新银币和突破按钮状态信息
function EquipTrainLimitLayer:_updateNodeSliver()
    if self._suit_id == LimitCostConst.MAX_SUIT_ID then
        self._nodeSilver:setVisible(false)
        self._buttonBreak:setVisible(false)
        return
    end
    local isAllFull = EquipTrainHelper.equipLimitUpIsAllFull()
    self._nodeSilver:setVisible(isAllFull)
    self._buttonBreak:setVisible(isAllFull)
    local isEnough = false
    if isAllFull then
        local TextHelper = require("app.utils.TextHelper")
        local silver = EquipTrainHelper.getLimitUpCoinCost()
        local strSilver = TextHelper.getAmountText3(silver)
        self._nodeSilver:setCount(strSilver, nil, true)
        self._nodeSilver:setVisible(silver > 0)
        local haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2) -- 银币数量
        isEnough = haveCoin >= silver
        if isEnough then
            self._nodeSilver:setTextColorToDTypeColor()
        else
            self._nodeSilver:setCountColorRed(true)
        end
    end
    self._buttonBreak:showRedPoint(isAllFull and isEnough)
end

-- 更新装备item
function EquipTrainLimitLayer:_updateItem()
    local equipBaseId = self._unitData:getBase_id()
    local config = self._unitData:getConfig()
    if config.potential_after > 0 then
        equipBaseId = config.potential_after
    end
    self._equipAvatar:updateUI(equipBaseId)
    self._equipAvatar:setShadowPosY(-20)
end

-- 打开材料面板
function EquipTrainLimitLayer:_openPopupPanel(costKey, limitLevel)
    if self._popupPanel ~= nil then
        return
    end

    self._popupPanel =
        EquipLimitCostPanel.new(
        costKey,
        handler(self, self._onClickCostPanelItem),
        handler(self, self._onClickCostPanelStep),
        handler(self, self._onClickCostPanelStart),
        handler(self, self._onClickCostPanelStop),
        limitLevel,
        self["_costNode" .. costKey],
        LimitCostConst.LIMIT_UP_EQUIP
    )
    self._popupPanelSignal = self._popupPanel.signal:add(handler(self, self._onPopupPanelClose))
    self._nodePopup:addChild(self._popupPanel)
    self._popupPanel:updateUI()
end

-- 检查材料是否已满
function EquipTrainLimitLayer:_checkIsMaterialFull(costKey)
    local materials = self._unitData:getMaterials()
    local curSize = materials[costKey]
    local maxSize = self._costInfo["size_" .. costKey]

    if curSize >= maxSize then
        return true
    else
        return false
    end
end

-- 处理界限突破逻辑
function EquipTrainLimitLayer:_doPutRes(costKey, materials)
    local pos = costKey
    local subItem = materials[1]
    if costKey == LimitCostConst.LIMIT_COST_KEY_2 then
        local equipid = EquipTrainHelper.getCostEquipId(subItem.id)
        subItem = {id = equipid, num = subItem.num}
    end
    G_UserData:getEquipment():c2sEquipmentLimitCost(self._unitData:getId(), pos, subItem)
    self._costMaterials = materials
end

function EquipTrainLimitLayer:_createEmitter(costKey)
    local names = {
        -- [LimitCostConst.LIMIT_COST_KEY_1] = "tujiegreen",
        [LimitCostConst.LIMIT_COST_KEY_2] = "tujieblue",
        [LimitCostConst.LIMIT_COST_KEY_3] = "tujiepurple",
        [LimitCostConst.LIMIT_COST_KEY_4] = "tujieorange"
    }
    -- logWarn("EquipTrainLimitLayer:_createEmitter " .. costKey)
    local emitter = cc.ParticleSystemQuad:create("particle/" .. names[costKey] .. ".plist")
    emitter:resetSystem()
    return emitter
end

--飞球特效
function EquipTrainLimitLayer:_playEmitterEffect(emitter, startNode, endNode, costKey, curCount)
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
                    local limitLevel = self._unitData:getLevel()
                    self["_cost" .. costKey]:playRippleMoveEffect(limitLevel, curCount)
                end
            ),
            cc.RemoveSelf:create()
        )
    )
end

-- 点击消耗材料
function EquipTrainLimitLayer:_onClickCostPanelItem(costKey, materials)
    if self:_checkIsMaterialFull(costKey) == true then
        return
    end
    self:_doPutRes(costKey, materials)
end

-- 持续按住消耗材料按钮每步调用
function EquipTrainLimitLayer:_onClickCostPanelStep(costKey, itemId, itemValue, costCountEveryTime)
    if self._materialFakeCount <= 0 then
        return false
    end

    if self._materialFakeCurSize >= self._costInfo["size_" .. costKey] then
        G_Prompt:showTip(Lang.get("limit_material_full"))
        return false, nil, true
    end

    local realCostCount = math.min(self._materialFakeCount, costCountEveryTime)
    self._materialFakeCount = self._materialFakeCount - realCostCount
    self._materialFakeCostCount = self._materialFakeCostCount + realCostCount

    local costSizeEveryTime = realCostCount
    -- if costKey == LimitCostConst.LIMIT_COST_KEY_1 then
    --     costSizeEveryTime = itemValue * realCostCount
    -- end
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

-- 开始按住消耗材料
function EquipTrainLimitLayer:_onClickCostPanelStart(costKey, itemId, count)
    self._materialFakeCount = count
    self._materialFakeCostCount = 0
    local materials = self._unitData:getMaterials() -- 材料当前进度
    self._materialFakeCurSize = materials[costKey]
end

function EquipTrainLimitLayer:_onClickCostPanelStop()
end

-- 材料面板关闭
function EquipTrainLimitLayer:_onPopupPanelClose(event)
    if event == "close" then
        self._popupPanel = nil
        if self._popupPanelSignal then
            self._popupPanelSignal:remove()
            self._popupPanelSignal = nil
        end
    end
end

-- 点击详情按钮
function EquipTrainLimitLayer:_onButtonDetail()
    -- logWarn("EquipTrainLimitLayer:_onButtonDetail")
    local unitData = self._unitData
    if self._unitData:getConfig().suit_id == LimitCostConst.MAX_SUIT_ID then
        unitData = EquipTrainHelper.copyEquipData(self._unitData)
        unitData:setBase_id(self._unitData:getBase_id() - 100)
        unitData:setConfig(EquipTrainHelper.getConfigByBaseId(unitData:getBase_id()))
    end
    local popupEquipLimitDetail = require("app.scene.view.equipTrain.PopupEquipLimitDetail").new(unitData)
    popupEquipLimitDetail:openWithAction()
end

-- 界限突破
function EquipTrainLimitLayer:_onButtonBreak()
    local Silver = EquipTrainHelper.getLimitUpCoinCost()
    local haveCoin = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, 2) -- 银币数量
    if haveCoin < Silver then
        G_Prompt:showTip(Lang.get("equip_limit_up_sliver_not_enough"))
        return
    end
    local materials = {{id = 0, num = 0}}
    self:_doPutRes(LimitCostConst.BREAK_LIMIT_UP, materials)
end

-- 初始化四类小球
function EquipTrainLimitLayer:_initCostIcon()
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        self["_cost" .. key] =
            EquipLimitCostNode.new(
            self["_costNode" .. key],
            key,
            handler(self, self._onClickCostAdd),
            LimitCostConst.LIMIT_UP_EQUIP
        )
    end
end

-- 点击添加材料按钮（）
function EquipTrainLimitLayer:_onClickCostAdd(costKey)
    local limitLevel = self._unitData:getLevel()
    self:_openPopupPanel(costKey, limitLevel)
end

function EquipTrainLimitLayer:_updateView()
    self:_updateText()
    self:_updateItem()
    self:_updateNodeSliver()
    local bgres = Path.getLimitImgBg(EquipTrainLimitLayer.BG_RES[self._suit_id])
    if bgres then
        self._imageBg:loadTexture(bgres)
    end
    local posy = EquipTrainLimitLayer.NODE_POS_Y_3_4[self._suit_id]
    if posy then
        self._cost3:setPositionY(posy)
        self._cost4:setPositionY(posy)
    end
    local resIds = EquipTrainLimitLayer.NODE_FRONT_IMG[self._suit_id]
    if resIds then
        for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
            self["_cost" .. key]:setImageFront(resIds[key])
        end
    end
end

-- 更新小球数据
function EquipTrainLimitLayer:_updateCost()
    local limitLevel = self._unitData:getLevel()
    local curCounts = self._unitData:getMaterials()
    for key = LimitCostConst.LIMIT_COST_KEY_2, LimitCostConst.LIMIT_COST_KEY_4 do
        self["_costNode" .. key]:setLocalZOrder(ZORDER_COMMON)
        if self._suit_id == LimitCostConst.MAX_SUIT_ID then
            self["_costNode" .. key]:setVisible(false)
        else
            self["_cost" .. key]:updateUI(limitLevel, curCounts[key])
            local show = EquipTrainHelper.isHaveLimitUpCostMaterials(key)
            self["_cost" .. key]:showRedPoint(show)
            self["_cost" .. key]:changeImageName()
        end
    end
end

-- 更新界面信息
function EquipTrainLimitLayer:updateInfo()
    self:_updateData()
    self:_updateView()
    self:_updateCost()
    if self._suit_id == LimitCostConst.MAX_SUIT_ID then
        self:_playFire(true)
    else
        self._nodeFire:setVisible(false)
    end
    self:_popupTipsText()
    if self._popupPanel then
        self._popupPanel:close()
    end
end

function EquipTrainLimitLayer:_popupTipsText()
    if self._suit_id == LimitCostConst.MAX_SUIT_ID then
        return
    end
    if self._unitData:getChange() == 0 then
        return
    elseif self._unitData:getChange() == 1 then
        local isAllFull = EquipTrainHelper.equipLimitUpIsAllFull()
        if isAllFull then
            G_Prompt:showTip(Lang.get("equip_limit_up_tips_2"))
        end
    elseif self._unitData:getChange() == 2 then
        G_Prompt:showTip(Lang.get("equip_limit_up_tips_1"))
    elseif self._unitData:getChange() == 3 then
        G_Prompt:showTip(Lang.get("equip_limit_up_tips_1"))
    end
    self._unitData:setChange(0)
end

return EquipTrainLimitLayer
