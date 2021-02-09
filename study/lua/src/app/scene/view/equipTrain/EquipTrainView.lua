--
-- Author: Liangxu
-- Date: 2017-04-17 15:07:46
-- 装备培养界面
local ViewBase = require("app.ui.ViewBase")
local EquipTrainView = class("EquipTrainView", ViewBase)
local EquipConst = require("app.const.EquipConst")
local EquipTrainHelper = require("app.scene.view.equipTrain.EquipTrainHelper")
local TeamViewHelper = require("app.scene.view.team.TeamViewHelper")
local LogicCheckHelper = require("app.utils.LogicCheckHelper")
local FunctionCheck = require("app.utils.logic.FunctionCheck")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local ListCellTabIcon = require("app.scene.view.recovery.ListCellTabIcon")

EquipTrainView.JADE_ARROW_X_OFFSET = 220
EquipTrainView.JADE_ARROW_X_SCALE = 195

EquipTrainView.layerViews = {
    [EquipConst.EQUIP_TRAIN_STRENGTHEN] = require("app.scene.view.equipTrain.EquipTrainStrengthenLayer"),
    [EquipConst.EQUIP_TRAIN_REFINE] = require("app.scene.view.equipTrain.EquipTrainRefineLayer"),
    [EquipConst.EQUIP_TRAIN_LIMIT] = require("app.scene.view.equipTrain.EquipTrainLimitLayer"),
    [EquipConst.EQUIP_TRAIN_JADE] = require("app.scene.view.equipTrain.EquipTrainJadeLayer")
}

function EquipTrainView:ctor(equipId, trainType, rangeType, isJumpWhenBack)
    G_UserData:getEquipment():setCurEquipId(equipId)
    self._selectTabIndex = trainType or EquipConst.EQUIP_TRAIN_STRENGTHEN
    self._rangeType = rangeType or EquipConst.EQUIP_RANGE_TYPE_1
    self._isJumpWhenBack = isJumpWhenBack --当点返回时，是否要跳过上一个场景
    self._allEquipIds = {}

    self._panelContent = nil --容器
    self._topbarBase = nil --顶部条

    local resource = {
        file = Path.getCSB("EquipTrainView", "equipment"),
        size = G_ResolutionManager:getDesignSize(),
        binding = {
            _buttonLeft = {
                events = {{event = "touch", method = "_onButtonLeftClicked"}}
            },
            _buttonRight = {
                events = {{event = "touch", method = "_onButtonRightClicked"}}
            }
        }
    }
    EquipTrainView.super.ctor(self, resource)
end

function EquipTrainView:onCreate()
    self._subLayers = {} --存储子layer
    local TopBarStyleConst = require("app.const.TopBarStyleConst")
    self._topbarBase:updateUI(TopBarStyleConst.STYLE_COMMON)
    self._topbarBase:setImageTitle("txt_sys_com_zhuangbei")
    if self._isJumpWhenBack then
        self._topbarBase:setCallBackOnBack(handler(self, self._setCallback))
    end
    self._leftArrowPosX = self._buttonLeft:getPositionX()
    self._rightArrowPosX = self._buttonRight:getPositionX()

    self:_initTab()
end

function EquipTrainView:onEnter()
    local equipId = G_UserData:getEquipment():getCurEquipId()
    self:_updateAllEquipIds(equipId)

    self:_updateView()
    self:_updateTabIcons()
    self:_updateLimitUpRedPoint()
    --抛出新手事件出新手事件
    G_SignalManager:dispatch(SignalConst.EVENT_TUTORIAL_STEP, self.__cname)
    self._signalUpdateLimitUpRedPoint =
        G_SignalManager:add(SignalConst.EVENT_RED_POINT_UPDATE, handler(self, self._updateLimitUpRedPoint))
    self._signalUpdateEquipmentNums =
        G_SignalManager:add(SignalConst.EVENT_UPDATE_EQUIPMENT_NUMS, handler(self, self._updateEquipmentNums))

    self._signalEquipTrainChangeView =
        G_SignalManager:add(SignalConst.EVENT_EQUIP_TRAIN_CHANGE_VIEW, handler(self, self._onEventChangeView))
end

function EquipTrainView:_updateAllEquipIds(equipId)
    if self._rangeType == EquipConst.EQUIP_RANGE_TYPE_1 then
        self._allEquipIds = G_UserData:getEquipment():getListDataBySort()
    elseif self._rangeType == EquipConst.EQUIP_RANGE_TYPE_2 then
        local unit = G_UserData:getEquipment():getEquipmentDataWithId(equipId)
        local pos = unit:getPos()
        if pos then
            self._allEquipIds = G_UserData:getBattleResource():getEquipIdsWithPos(pos)
        end
    end
    self._selectedPos = 1

    for i, id in ipairs(self._allEquipIds) do
        if id == equipId then
            self._selectedPos = i
        end
    end
    self._equipCount = #self._allEquipIds
end

function EquipTrainView:_updateEquipmentNums()
    local equipId = G_UserData:getEquipment():getCurEquipId()
    self:_updateAllEquipIds(equipId)
end

function EquipTrainView:_onEventChangeView(id, index)
    self:_onClickTabIcon(index)
end

function EquipTrainView:onExit()
    self._signalUpdateLimitUpRedPoint:remove()
    self._signalUpdateLimitUpRedPoint = nil
    self._signalUpdateEquipmentNums:remove()
    self._signalUpdateEquipmentNums = nil

    self._signalEquipTrainChangeView:remove()
    self._signalEquipTrainChangeView = nil
end

function EquipTrainView:_initTab()
    -- for i = 1, EquipConst.EQUIP_TRAIN_MAX_TAB do
    -- 	local txt = Lang.get("equipment_train_tab_icon_" .. i)
    -- 	local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst["FUNC_EQUIP_TRAIN_TYPE" .. i])
    -- 	self["_nodeTabIcon" .. i]:updateUI(txt, isOpen, i)
    -- 	self["_nodeTabIcon" .. i]:setCallback(handler(self, self._onClickTabIcon))
    -- end

    self:_updateTrainTab()
end

function EquipTrainView:_onClickTabIcon(index)
    if index == self._selectTabIndex then
        return
    end
    -- logWarn("EquipTrainView:_updateTabIcons " .. index)
    self._selectTabIndex = index
    self:_updateTabIcons()
    self:_updateView()
end

function EquipTrainView:_updateTabIcons()
    local tabData = EquipTrainHelper.getShowEquipTrainTab()
    local flag = false
    for i = 1, #tabData do
        self["_nodeTabIcon" .. i]:setSelected(tabData[i] == self._selectTabIndex)
        flag = flag or tabData[i] == self._selectTabIndex
    end
    if not flag then
        self._selectTabIndex = tabData[1]
        self._nodeTabIcon1:setSelected(true)
        self:_updateView()
    end
end

function EquipTrainView:_updateView()
    local layer = self._subLayers[self._selectTabIndex]
    if layer == nil then
        layer = EquipTrainView.layerViews[self._selectTabIndex].new(self)
        if layer then
            self._panelContent:addChild(layer)
            self._subLayers[self._selectTabIndex] = layer
        end
    end
    for k, subLayer in pairs(self._subLayers) do
        subLayer:setVisible(false)
    end
    if layer then
        layer:setVisible(true)
        layer:updateInfo()
    end
    self:updateArrowBtn()
end

function EquipTrainView:_setCallback()
    G_UserData:getTeamCache():setShowEquipTrainFlag(true)
    G_SceneManager:popSceneByTimes(2) --pop2次，返回阵容界面
end

function EquipTrainView:updateArrowBtn()
    local isShow = self._selectedPos > 1
    local isShow2 = self._selectedPos < self._equipCount
    if self._selectTabIndex == EquipConst.EQUIP_TRAIN_LIMIT then
        isShow = false
        isShow2 = false
    end
    self._buttonLeft:setVisible(isShow)
    self._buttonRight:setVisible(isShow2)
    if self._selectTabIndex == EquipConst.EQUIP_TRAIN_JADE then
        self._buttonLeft:setPositionX(
            self._leftArrowPosX + EquipTrainView.JADE_ARROW_X_OFFSET - EquipTrainView.JADE_ARROW_X_SCALE
        )
        self._buttonRight:setPositionX(
            self._rightArrowPosX + EquipTrainView.JADE_ARROW_X_OFFSET + EquipTrainView.JADE_ARROW_X_SCALE
        )
    else
        self._buttonLeft:setPositionX(self._leftArrowPosX)
        self._buttonRight:setPositionX(self._rightArrowPosX)
    end
end

function EquipTrainView:_updateTrainTab()
    local tabData = EquipTrainHelper.getShowEquipTrainTab()
    if #tabData <= 0 then
        return
    end

    self._scrollViewTab:removeAllChildren()
    for index = 1, EquipConst.EQUIP_TRAIN_MAX_TAB do
        self["_nodeTabIcon" .. index] = nil
    end
    for index = 1, #tabData do
        self["_nodeTabIcon" .. index] = ListCellTabIcon.new(handler(self, self._onClickTabIcon))
        self["_nodeTabIcon" .. index]:setTxtListPrex("equipment_train_tab_icon_")
        self["_nodeTabIcon" .. index]:setFuncionConstPrex("FUNC_EQUIP_TRAIN_TYPE")
        self["_nodeTabIcon" .. index]:updateUI(index, tabData[index], #tabData)
        self._scrollViewTab:pushBackCustomItem(self["_nodeTabIcon" .. index])
    end
end

function EquipTrainView:_onButtonLeftClicked()
    if self._selectedPos <= 1 then
        return
    end

    self._selectedPos = self._selectedPos - 1
    self:changeUpdate()
end

function EquipTrainView:_onButtonRightClicked()
    if self._selectedPos >= self._equipCount then
        return
    end

    self._selectedPos = self._selectedPos + 1
    self:changeUpdate()
end

-- 左右切换时更新界面
function EquipTrainView:changeUpdate()
    local curEquipId = self._allEquipIds[self._selectedPos]
    G_UserData:getEquipment():setCurEquipId(curEquipId)
    self:_updateTrainTab()
    self:_updateView()
    self:_updateTabIcons()
    self:_updateLimitUpRedPoint()
end

function EquipTrainView:getAllEquipIds()
    return self._allEquipIds
end

function EquipTrainView:getEquipCount()
    return self._equipCount
end

function EquipTrainView:setSelectedPos(pos)
    self._selectedPos = pos
end

function EquipTrainView:getSelectedPos()
    return self._selectedPos
end

function EquipTrainView:setArrowBtnEnable(enable)
    self._buttonLeft:setEnabled(enable)
    self._buttonRight:setEnabled(enable)
end

function EquipTrainView:_updateLimitUpRedPoint()
    for index = 1, EquipConst.EQUIP_TRAIN_MAX_TAB do
        if self["_nodeTabIcon" .. index] then
            if self["_nodeTabIcon" .. index]:getTag() == EquipConst.EQUIP_TRAIN_LIMIT then
                local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE4)
                local isRed = EquipTrainHelper.isNeedRedPoint() and isOpen
                self["_nodeTabIcon" .. index]:showRedPoint(isRed)
            elseif self["_nodeTabIcon" .. index]:getTag() == EquipConst.EQUIP_TRAIN_JADE then
                local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_EQUIP_TRAIN_TYPE3)
                local isRed = EquipTrainHelper.needJadeRedPoint(G_UserData:getEquipment():getCurEquipId()) and isOpen
                self["_nodeTabIcon" .. index]:showRedPoint(isRed)
            end
        end
    end
end

return EquipTrainView
