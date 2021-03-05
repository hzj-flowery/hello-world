local Version = {}

Version.LATEST = 1
Version.CURRENT = -1

function Version.compare(latest, current)
	local latestVersions = string.split(latest, ".")
    local currentVersions = string.split(current, ".")

    local len = math.min(#latestVersions, #currentVersions)
    for i=1, len do
        if checknumber(latestVersions[i]) > checknumber(currentVersions[i]) then
            return Version.LATEST
        else 
            if checknumber(latestVersions[i]) < checknumber(currentVersions[i]) then
                return Version.CURRENT
            end
        end
    end
    
    return 0
end

function Version.toNumber(version)
    if type(version) ~= "string" then 
        return 0
    end

    local versionNos = {}

    for v in string.gmatch(version,"(%d+)") do
        table.insert(versionNos, v)
    end
    if #versionNos < 1 then 
        return 0
    end

    local versionNumber = 0
    local count = #versionNos
    for loopi = 0, #versionNos - 1, 1 do 
        versionNumber = versionNumber + (tonumber(versionNos[count - loopi]) or 0)*math.pow(100, loopi) 
    end

    return versionNumber
end

function Version.toString(versionNum)
    if type(versionNum) ~= "number" then 
        return ""
    end
    local versionStr = tostring(versionNum)
    local loopi = math.floor( (#versionStr-1) / 2 )
    local strVersion = ""
    local startValue = versionNum
    for i=loopi, 0, -1 do
        local tempValue = math.pow(100, i)
        local value = math.floor( startValue / tempValue )
        if i == loopi then
            strVersion = strVersion..value
        else
            strVersion = strVersion.."."..value
        end
        startValue = startValue - tempValue*value
    end
    return strVersion
end
return Version