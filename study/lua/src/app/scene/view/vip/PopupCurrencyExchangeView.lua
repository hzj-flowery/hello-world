-- Author: Abraham
-- Date:

local PopupBase = require("app.ui.PopupBase")
local PopupCurrencyExchangeView = class("PopupCurrencyExchangeView", PopupBase)
local CurrencyHelper = require("app.scene.view.vip.CurrencyHelper")


function PopupCurrencyExchangeView:ctor()
    self._curJadeNum = 1

	local resource = {
		file = Path.getCSB("PopupCurrencyExchangeView", "vip"),
	}
	PopupCurrencyExchangeView.super.ctor(self, resource,true)
end

function PopupCurrencyExchangeView:onCreate()
    self:_initCommonView()
    self:_initJadeView()
    self:_onNumSelect(1)
end

function PopupCurrencyExchangeView:onEnter()
    self._signalGetRechargeNotice = G_SignalManager:add(SignalConst.EVENT_RECHARGE_NOTICE, handler(self, self._onEventGetRechargeNotice)) --刷新充值 
    self._signalJadeBiExcharge    = G_SignalManager:add(SignalConst.EVENT_DIAMOND_EXCHANGE, handler(self, self._onEventJadeBiExcharge))   
end

function PopupCurrencyExchangeView:onExit()
    if self._signalGetRechargeNotice then
        self._signalGetRechargeNotice:remove()
        self._signalGetRechargeNotice = nil
    end
    if self._signalJadeBiExcharge then
        self._signalJadeBiExcharge:remove()
        self._signalJadeBiExcharge = nil
    end
end

function PopupCurrencyExchangeView:_onBtnClose()
	self:close()
end

function PopupCurrencyExchangeView:_initCommonView( ... )
    -- body
    self._commonPop:setTitle(Lang.get("currency_diamond_title"))
    self._commonPop:addCloseEventListener(handler(self, self._onBtnClose))

    self._commonSelectNum:setMaxLimitEx(9999)
    self._commonSelectNum:updateIncrement(100)
    self._commonSelectNum:setCallBack(handler(self,self._onNumSelect))
    self._commonBtn:setString(Lang.get("currency_diamond_exchange"))
    self._commonBtn:addClickEventListenerEx(handler(self, self._onCurrExchange))
end

function PopupCurrencyExchangeView:_initJadeView( ... )
    -- body
    local num = CurrencyHelper.getCurJadeNum()
    local radio = CurrencyHelper.getDiamondExchangeRadio()
    self._textJade:setString(tostring(num))
    self._textRadio:setString(Lang.get("currency_diamond_radio", {radio = radio}))
end

function PopupCurrencyExchangeView:_updateDiamond(num)
    -- body
    local radio = CurrencyHelper.getDiamondExchangeRadio()
    self._textJade:setString(tostring(num*radio))
end

function PopupCurrencyExchangeView:_updateTxtJadeColor(isFlow)
    -- body
    local color = isFlow and Colors.uiColors.RED or Colors.BRIGHT_BG_ONE
    self._textJade:setColor(color)
end

function PopupCurrencyExchangeView:_onNumSelect(num)
    -- body
    self._curJadeNum = num
    local myNum = CurrencyHelper.getCurJadeNum()
    local radio = CurrencyHelper.getDiamondExchangeRadio()
    self._textDiamond:setString(tostring(num*radio))
    self:_updateTxtJadeColor(num > myNum)
end

function PopupCurrencyExchangeView:_onCurrExchange( ... )
    -- body
    local myNum = CurrencyHelper.getCurJadeNum()
    if self._curJadeNum > myNum then
        local function callBackOk()
            local LogicCheckHelper = require("app.utils.LogicCheckHelper")
            local isOpen,_ = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_JADE2)
            if not isOpen then
                G_Prompt:showTip(Lang.get("currency_diamond_open"))
                return
            end
            
            local WayFuncDataHelper = require("app.utils.data.WayFuncDataHelper")
            WayFuncDataHelper.gotoModuleByFuncId(FunctionConst.FUNC_JADE2)
        end
        local PopupAlert = require("app.ui.PopupAlert").new(Lang.get("common_diamond_title"),Lang.get("common_jade2_not_enough"),callBackOk)
        PopupAlert:setOKBtn(Lang.get("common_vip_func_btn2"))
        PopupAlert:openWithAction()
        return
    end

    local UserDataHelper = require("app.utils.UserDataHelper")
    local noTip = UserDataHelper.getPopModuleShow(self.__cname)
    if not noTip then       -- 本次登录不再提示
        local radio = CurrencyHelper.getDiamondExchangeRadio()
        local params = {
            moduleName = "COST_YUBI_MODULE_NAME_11",
            yubiCount = self._curJadeNum,
            itemCount = self._curJadeNum*radio,
            tipType = 2,
        }
        local UIPopupHelper = require("app.utils.UIPopupHelper")
        UIPopupHelper.popupCostYubiTip(params, function()
                -- body
                G_UserData:getVip():c2sJadeBiExcharge(self._curJadeNum)
            end)
        return
    end
    G_UserData:getVip():c2sJadeBiExcharge(self._curJadeNum)
end

function PopupCurrencyExchangeView:_onEventGetRechargeNotice()
    self:_initJadeView()
    local myNum = CurrencyHelper.getCurJadeNum()
    self:_updateTxtJadeColor(self._curJadeNum > myNum)
end

function PopupCurrencyExchangeView:_onEventJadeBiExcharge()
    -- body
    self:_initJadeView()
    self:_onNumSelect(1)
    self:_onBtnClose()
end

return PopupCurrencyExchangeView