local BaseService = require("app.service.BaseService")
local RecruitService = class("RecruitService",BaseService)
local FunctionConst = require("app.const.FunctionConst")

function RecruitService:ctor()
    RecruitService.super.ctor(self)
    self:start()
    self._hasNotice = false
end

function RecruitService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_WEEK_ACTIVITY)
    if not isOpen then
        return
    end

    local hasCount = G_UserData:getRecruitData():hasFreeCount()
    if not hasCount then
        return
    end

    if G_UserData:getRecruitData():hasFreeNormalCount() then
        if not self._hasNotice then
            G_SignalManager:dispatch(SignalConst.EVENT_RED_POINT_UPDATE)
            self._hasNotice = true
        end
    else
        self._hasNotice = false
    end
end



return RecruitService

