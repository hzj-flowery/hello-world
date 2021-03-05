local PatchCode = {}

local _loadstring = loadstring

function PatchCode.loadPatchCode(code)
    if code == nil or code == "" then
        return 
    end

	-- 
	local patchFunction = assert(_loadstring(code))
	if patchFunction ~= nil and type(patchFunction) == "function" then
		patchFunction()
	end
end

return PatchCode