--recommend_upgrade

-- key
local __key_map = {
  id = 1,    --id-int 
  function_level_id = 2,    --功能id-int 
  upgrade_limit = 3,    --上限参数-int 
  upgrade_percent = 4,    --预期参数1-string 
  percent_1_Lower = 5,    --预期参数1等级下限-int 
  percent_1_upper = 6,    --预期参数1等级上限-int 
  upgrade_percent_2 = 7,    --预期参数2-string 
  percent_2_Lower = 8,    --预期参数2等级下限-int 
  percent_2_upper = 9,    --预期参数2等级上限-int 
  upgrade_percent_3 = 10,    --预期参数3-string 
  percent_3_Lower = 11,    --预期参数3等级下限-int 
  percent_3_upper = 12,    --预期参数3等级上限-int 
  upgrade_level = 13,    --推荐等级-int 
  function_jump = 14,    --跳转方向-int 
  bubble_id = 15,    --提示文字id-int 

}

-- data
local recommend_upgrade = {
    _data = {
        [1] = {0,0,0,"",0,0,"",0,0,"",0,0,0,0,2000,},
        [2] = {1,102,1000,"#LEVEL#*1",1,999,"",0,0,"",0,0,1,3,2001,},
        [3] = {2,104,1000,"(#LEVEL#+5)/10",1,999,"",0,0,"",0,0,1,3,2002,},
        [4] = {3,107,1000,"#LEVEL#-50",1,999,"",0,0,"",0,0,85,3,2003,},
        [5] = {4,112,1000,"#LEVEL#*2",1,999,"",0,0,"",0,0,1,3,2004,},
        [6] = {5,114,1000,"#LEVEL#/4",1,999,"",0,0,"",0,0,1,3,2005,},
        [7] = {6,122,1000,"#LEVEL#/2",1,107,"(#LEVEL#+40)/2",108,119,"80",120,999,1,3,2006,},
        [8] = {7,123,1000,"#LEVEL#*120/1000",1,107,"(#LEVEL#*120+5000)/1000",108,119,"25",120,999,1,3,2007,},
        [9] = {8,134,1000,"#LEVEL#/2",1,101,"#LEVEL#*10/16",102,119,"100",120,999,1,3,2008,},
    }
}

-- index
local __index_id = {
    [0] = 1,
    [1] = 2,
    [2] = 3,
    [3] = 4,
    [4] = 5,
    [5] = 6,
    [6] = 7,
    [7] = 8,
    [8] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in recommend_upgrade")
        return t._raw[__key_map[k]]
    end
}

-- 
function recommend_upgrade.length()
    return #recommend_upgrade._data
end

-- 
function recommend_upgrade.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function recommend_upgrade.indexOf(index)
    if index == nil or not recommend_upgrade._data[index] then
        return nil
    end

    return setmetatable({_raw = recommend_upgrade._data[index]}, mt)
end

--
function recommend_upgrade.get(id)
    
    return recommend_upgrade.indexOf(__index_id[id])
        
end

--
function recommend_upgrade.set(id, tkey, nvalue)
    local record = recommend_upgrade.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function recommend_upgrade.index()
    return __index_id
end

return recommend_upgrade