function table2json(t)  
        local function serialize(tbl)  
                local tmp = {}  
                for k, v in pairs(tbl) do  
                        local k_type = type(k)  
                        local v_type = type(v)  
                        local key = (k_type == "string" and "\"" .. k .. "\":")  
                            or (k_type == "number" and "")  
                        local value = (v_type == "table" and serialize(v))  
                            or (v_type == "boolean" and tostring(v))  
                            or (v_type == "string" and "\"" .. v .. "\"")  
                            or (v_type == "number" and v)  
                        tmp[#tmp + 1] = key and value and tostring(key) .. tostring(value) or nil  
                end  
                if table.maxn(tbl) == 0 then  
                        return "{" .. table.concat(tmp, ",") .. "}"  
                else  
                        return "[" .. table.concat(tmp, ",") .. "]"  
                end  
        end  
        assert(type(t) == "table")  
        return serialize(t)  
end  
function pairsByKeys(t)
    local a = {}
    for n in pairs(t) do a[#a + 1] = n end
    table.sort(a)
    local i = 0
    return function ()
        i = i + 1
        return a[i], t[a[i]]
    end
end
print("ready---")
file = io.open("test.ts", "w+")
file:write("export var LangTemplate = {}\n")
-- for key, value in pairs(language) do 
for key, value in pairsByKeys (language) do     
	-- print("---"..key);
	if type(value)=="table" then
	   local re = table2json(value)
	   local sub = string.sub(re,1,1)
	   --print("f---------",sub)
	--    file:write("LangTemplate['"..key.."'] = ".."'"..re.."'".."\n")

	   file:write("LangTemplate['"..key.."'] = "..re.."\r\n")
	else 
		
		if string.find(value,"\"") ~= nil then
			local str = string.format("%q",value)
			print("value-----",str);
			file:write("LangTemplate['"..key.."'] = "..str.."\r\n")
		else
		-- if string.find(value,"\n")>=0 then
		value = string.gsub(value,"\n","_waitReplaceZM_")
		-- end
		file:write("LangTemplate['"..key.."'] = ".."'"..value.."'".."\r\n")
		end
	end
end 