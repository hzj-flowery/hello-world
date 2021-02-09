--顶部条 资源信息

local UserDataHelper = require("app.utils.UserDataHelper")
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local CommonTopBarItem = class("CommonTopBarItem")
local DataConst = require("app.const.DataConst")
local ParameterIDConst = require("app.const.ParameterIDConst")

local EXPORTED_METHODS = {
    "updateUI",
    "showPanelBlue"
}

function CommonTopBarItem:ctor()
    self._labelNumber = nil
    self._imageResIcon = nil
    self._buttonAdd = nil

    self._type = nil --记录一下类型
end

function CommonTopBarItem:_init()
    self._labelNumber = ccui.Helper:seekNodeByName(self._target, "Label_numer")
    self._imageResIcon = ccui.Helper:seekNodeByName(self._target, "Image_res_icon")
    self._buttonAdd = ccui.Helper:seekNodeByName(self._target, "Button_add")
    self._panelClick = ccui.Helper:seekNodeByName(self._target, "Panel_click")
    self._panelBlue = ccui.Helper:seekNodeByName(self._target, "Panel_Blue")

    self._buttonAdd:addClickEventListenerEx(handler(self, self._onAddClick), true, nil, 0)
    self._panelClick:addClickEventListenerEx(handler(self, self._onAddClick), true, nil, 0)

    self:_registerRoll(self)
end

function CommonTopBarItem:_registerRoll(listener)
    if cc.isRegister("CommonRollNumber") then
        cc.bind(self._labelNumber, "CommonRollNumber")
    end
    self._labelNumber:setRollListener(listener)
end

function CommonTopBarItem:showPanelBlue(s)
    -- body
    self._panelBlue:setVisible(s)
end

function CommonTopBarItem:bind(target)
    self._target = target
    self:_init()
    cc.setmethods(target, self, EXPORTED_METHODS)
end

function CommonTopBarItem:unbind(target)
    cc.unsetmethods(target, EXPORTED_METHODS)
end

function CommonTopBarItem:updateUI(type, value)
    self._type = type
    self._value = value

    local size = UserDataHelper.getNumByTypeAndValue(type, value)
    local typeRes = TypeConvertHelper.convert(type, value, size)
    if typeRes.res_mini then
        self._imageResIcon:loadTexture(typeRes.res_mini)
    end

    if type == TypeConvertHelper.TYPE_POWER then
        self._labelNumber:updateTxtValue(typeRes.size, nil, 5)
     --5次滚满
    else
        self:setNumberValue(typeRes.size, type)
    end
    if type == TypeConvertHelper.TYPE_MINE_POWER then
        self._buttonAdd:setVisible(e)
        self._panelClick:setTouchEnabled(e)
    end
end

function CommonTopBarItem:setNumberValue(value, type)
    local maxValue = G_RecoverMgr:getRecoverLimitByResId(self._value)
    local TextHelper = require("app.utils.TextHelper")
    local sizeText = TextHelper.getAmountText(value)
    if type == TypeConvertHelper.TYPE_MINE_POWER then
        maxValue = tonumber(require("app.config.parameter").get(ParameterIDConst.TROOP_MAX).content)
    end
    --[[if G_UserData:getMineCraftData():isSelfPrivilege() then
        local MineCraftHelper = require("app.scene.view.mineCraft.MineCraftHelper")
        local soilderAdd  = MineCraftHelper.getParameterContent(G_ParameterIDConst.MINE_CRAFT_SOILDERADD)
        maxValue = (maxValue + soilderAdd)
    end]]
    if maxValue > 0 then
        self._labelNumber:setString(sizeText .. "/" .. maxValue)
    else
        self._labelNumber:setString(sizeText)
    end
end

--第一次updateTxtValue时使用这个值判断滚动
function CommonTopBarItem:getNumberValue()
    local size = UserDataHelper.getNumByTypeAndValue(self._type, self._value)
    return size
end

function CommonTopBarItem:_procRes(itemType, itemValue)
    local function getResFunc(itemValue)
        local resName = DataConst.getResName(itemValue)
        local funcName = "_proc_" .. resName

        if self[funcName] and type(self[funcName]) == "function" then
            return self[funcName]
        end
    end
    local resFunc = nil
    if itemType == TypeConvertHelper.TYPE_POWER or itemType == TypeConvertHelper.TYPE_RESOURCE then
        resFunc = getResFunc(itemValue)
    end

    --有自定义处理函数，则走自定义处理函数
    if resFunc then
        resFunc(self)
        return
    end

    if itemType == TypeConvertHelper.TYPE_RESOURCE then
        --这里是处理体力与精力，需要有特殊逻辑弹框
        if
            itemValue == DataConst.RES_VIT or itemValue == DataConst.RES_SPIRIT or itemValue == DataConst.RES_TOKEN or
                itemValue == DataConst.RES_ARMY_FOOD or
                itemValue == DataConst.RES_MINE_TOKEN
         then
            local LogicCheckHelper = require("app.utils.LogicCheckHelper")
            local success, popDialog = LogicCheckHelper.resCheck(itemValue, -1, true)
            if not popDialog then
                G_Prompt:showTip(Lang.get("common_not_develop"))
            end
            return
        end
    end

    --用于商店界面，假设是资源类型，并且没处理过则弹出弹框
    local PopupItemGuider = require("app.ui.PopupItemGuider").new(Lang.get("way_type_get"))
    PopupItemGuider:updateUI(itemType, itemValue)
    PopupItemGuider:openWithAction()
end

function CommonTopBarItem:_onAddClick(sender)
    self:_procRes(self._type, self._value)
end

function CommonTopBarItem:_proc_diamond()
    --[[local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_RECHARGE)]]
    G_SceneManager:showDialog("app.scene.view.vip.PopupCurrencyExchangeView")
end

function CommonTopBarItem:_proc_power()
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_NEW_STAGE)
end

function CommonTopBarItem:_proc_gold()
    local ActivityConst = require("app.const.ActivityConst")
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_MONEY_TREE)
end

function CommonTopBarItem:_proc_jade2()
    local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
    WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2)
end

return CommonTopBarItem
