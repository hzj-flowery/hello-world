local parser = require("yoka.pbc.parser")
local protobuf = require("yoka.pbc.protobuf")

local pbc = {}

--
function pbc.readFile(filePath, fileName)
    local buffer = cc.FileUtils:getInstance():getStringFromFile(filePath)
    parser.registerBuffer(fileName, buffer)
end

--
function pbc.readBuffer(buffer, fileName)
    parser.registerBuffer(fileName, buffer)
end

--
local function _expand(t)
    if type(t) == "table" then
        for k, v in pairs(t) do  
            if type(v) == "table"  then
                local meta = getmetatable(v)
                if meta and meta.__pairs ~= nil then
                    protobuf.expand(v)
                end
                _expand(v)
            else

            end
        end
    end
end

--
function pbc.encode(id, buff)
    --dump(buff)
    return protobuf.encode(id, buff)
end

--
function pbc.decode(id, buff, len)
    if len == 0 then
        return {}
    end
    
    local buff, err = protobuf.decode(id, buff, len)
    _expand(buff)

    if buff == false then
        return nil
    else
        return buff
    end
end

return pbc