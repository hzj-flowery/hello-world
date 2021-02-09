local BaseService = require("app.service.BaseService")
local MineDataService = class("MineDataService",BaseService)

local ParameterIDConst = require("app.const.ParameterIDConst")
local Parameter = require("app.config.parameter")

function MineDataService:ctor()
    MineDataService.super.ctor(self)
    self:start()
end

function MineDataService:tick()
    G_UserData:getMineCraftData():checkTimeLimit()
end


return MineDataService
