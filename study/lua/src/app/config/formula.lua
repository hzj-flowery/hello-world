--formula

-- key
local __key_map = {
  id = 1,    --编号-int 
  formula = 2,    --公式-string 

}

-- data
local formula = {
    _data = {
        [1] = {1,"(($ATK$*9+$PD$*27+$MD$*27+$HP$*1)*($HURT$+$HURT_RED$+$PVP_HURT$+$PVP_HURT_RED$+$HIT$+$NO_HIT$+$CRIT$+$NO_CRIT$+$CRIT_HURT$+$CRIT_HURT_RED$))/5+$TALENT_POWER$",},
        [2] = {2,"$HERO_POWER$+$OFFICIAL_POWER$",},
        [3] = {3,"((#ATK#*9+#PD#*27+#MD#*27+#HP#*1)*(#HURT#+#HURT_RED#+#PVP_HURT#+#PVP_HURT_RED#+#HIT#+#NO_HIT#+#CRIT#+#NO_CRIT#+#CRIT_HURT#+#CRIT_HURT_RED#))/5+#TALENT_POWER#+#OFFICIAL_POWER#/6+#AVATAR_POWER#/6+#PET_POWER#/6+#SILKBAG_POWER#+#AVATAR_EQUIP_POWER#+#TREE_POWER#/6+#HORSE_POWER#+#JADE_POWER#+#HISTORICAL_HERO_POWER#+#TACTICS_POWER#+#BOUT_POWER#",},
        [4] = {4,"(#ATK#*9+#PD#*27+#MD#*27+#HP#*1)/5*2.5+#PET_INITIAL_POWER#",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in formula")
        return t._raw[__key_map[k]]
    end
}

-- 
function formula.length()
    return #formula._data
end

-- 
function formula.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function formula.indexOf(index)
    if index == nil or not formula._data[index] then
        return nil
    end

    return setmetatable({_raw = formula._data[index]}, mt)
end

--
function formula.get(id)
    
    return formula.indexOf(__index_id[id])
        
end

--
function formula.set(id, key, value)
    local record = formula.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function formula.index()
    return __index_id
end

return formula