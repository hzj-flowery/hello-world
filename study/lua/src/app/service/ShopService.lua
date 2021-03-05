local BaseService = require("app.service.BaseService")
local ShopService = class("ShopService",BaseService)
local ShopConst = require("app.const.ShopConst")
local UserDataHelper = require("app.utils.UserDataHelper")
function ShopService:ctor()
    ShopService.super.ctor(self)
    self:start()

    self._redPoint = nil
end

function ShopService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_SHOP_SCENE)
    if not isOpen then
        return
    end

 
    local recoverTime,isRecoverFull,intervalTime = UserDataHelper.getShopRecoverMaxRefreshCountTime(ShopConst.HERO_SHOP)
 
    local redPoint = isRecoverFull 
    if self._redPoint == nil then
         G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SHOP_SCENE)
         print("------------------------------------------ShopService: redPoint")
    elseif self._redPoint ~= redPoint then
         G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_SHOP_SCENE)
         print("------------------------------------------ShopService: redPoint")
    end
    self._redPoint = redPoint
end



return ShopService

