-- Author: Abraham
-- Date:

local CurrencyHelper = {}
local UserDataHelper = require("app.utils.UserDataHelper")

--@Role     
function CurrencyHelper.getCurJadeNum()    
    local TypeConvertHelper = require("app.utils.TypeConvertHelper")
    local DataConst = require("app.const.DataConst")
    local num = UserDataHelper.getNumByTypeAndValue(TypeConvertHelper.TYPE_RESOURCE, DataConst.RES_JADE2)
    return num
end

--@Role     
function CurrencyHelper.getDiamondExchangeRadio( ... )
    -- body
    local radio = UserDataHelper.getParameter(G_ParameterIDConst.DIAMOND_EXCHANGE_RADIO)
    return radio
end



return CurrencyHelper