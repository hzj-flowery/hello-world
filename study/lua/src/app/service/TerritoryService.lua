local BaseService = require("app.service.BaseService")
local TerritoryService = class("TerritoryService",BaseService)

function TerritoryService:ctor()
    TerritoryService.super.ctor(self)
    self:start()

    self._redPoint = nil
end

function TerritoryService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" and runningSceneName ~= "challenge" and runningSceneName ~= "territory" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_PVE_TERRITORY)
    if not isOpen then
        return
    end
   
    local redValue1 = G_UserData:getTerritory():isShowRedPoint()--宝箱
    local redValue2 = G_UserData:getTerritory():isRiotRedPoint()--暴动援助和暴动宝箱
    local redPoint = redValue1 or redValue2
    if self._redPoint == nil then
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
        print("------------------------------------------TerritoryService: redPoint")
    elseif self._redPoint ~= redPoint then
        G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_PVE_TERRITORY)
        print("------------------------------------------TerritoryService: redPoint")
    end
    self._redPoint = redPoint
end



return TerritoryService

