--防沉迷
local BaseService = require("app.service.BaseService")
local IndulgeService = class("IndulgeService",BaseService)
local FunctionConst = require("app.const.FunctionConst")

function IndulgeService:ctor()
    IndulgeService.super.ctor(self)
    self:start()

    self._showStage01 = nil
    self._showStage02 = nil
    self._alertDialog = nil
end

function IndulgeService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_INDULGE)
    if not isOpen then
        return
    end

    local TimeConst = require("app.const.TimeConst")
	local visible01 = G_UserData:getBase():getOnlineTime() >= TimeConst.INDULGE_TIME_01
    local visible02 = G_UserData:getBase():getOnlineTime() >= TimeConst.INDULGE_TIME_02
    local showDialog = false
    if visible01 == true and self._showStage01 ~= visible01 then
        self._showStage01 = visible01
        print("------------------------------------------IndulgeService:EVENT_MAIN_CITY_CHECK_BTNS")
        G_SignalManager:dispatch(SignalConst.EVENT_MAIN_CITY_CHECK_BTNS, FunctionConst.FUNC_AVOID_GAME)

        showDialog = true
        self._alertDialog = alertDialog print("------------------------------------------IndulgeService:show dialog 01")
    end

    if visible02 == true and self._showStage02 ~= visible02 then
        self._showStage02 = visible02
        showDialog = true
        print("------------------------------------------IndulgeService:show dialog 02")
      
        
    end

    if showDialog then
        if self._alertDialog then
            self._alertDialog:removeFromParent()
        end
        local UIPopupHelper = require("app.utils.UIPopupHelper")
        local alertDialog = UIPopupHelper.popupIndulgeDialog(handler(self,self._exitDialog))
        self._alertDialog = alertDialog
    end
  

end

function IndulgeService:_exitDialog()
    self._alertDialog = nil
end

return IndulgeService

