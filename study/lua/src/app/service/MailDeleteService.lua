--邮件删除服务
local BaseService = require("app.service.BaseService")
local MailDeleteService = class("MailDeleteService",BaseService)
 local UserDataHelper = require("app.utils.UserDataHelper")

function MailDeleteService:ctor()
    MailDeleteService.super.ctor(self)
    self:start()
end

function MailDeleteService:tick()
    --场景检测
    local runningSceneName = display.getRunningScene():getName() 
    if  runningSceneName ~= "main" then
        return
    end

    --判断是否开启功能
    local LogicCheckHelper = require("app.utils.LogicCheckHelper")
    local isOpen = LogicCheckHelper.funcIsOpened(FunctionConst.FUNC_MAIL)
    if not isOpen then
        return
    end

    local deleteMailIds = UserDataHelper.getExpiredMailIds()
    if #deleteMailIds > 0 then
         G_UserData:getMails():c2sDelAllMail(deleteMailIds)
    end
   
end

return MailDeleteService

