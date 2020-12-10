-- function
function readOnly(t)
    local proxy = {}
    local mt = {         -- create metatable
       __index = t,
       __newindex = function (t,k,v)
           error("attempt to update a read-only table", 2)
       end
    }
 
    setmetatable(proxy, mt)
    return proxy
end

-- print
logWarn = logWarn or print
logDebug = logDebug or print
logError = logError or print
logNewT  = logNewT or print

-- require
require("yoka.extends.init")

-- var
json		= require("cjson")
timer		= require("timer")
md5			= require("md5")
pbc			= require("yoka.pbc.pbc")
ssocket		= require("ssocket")
base64		= require("base64")