--instrument_rank

-- key
local __key_map = {
  rank_id = 1,    --id-int 
  instrument_id = 2,    --界限突破id-int 
  cost_silver = 3,    --进阶消耗银币-int 
  name_1 = 4,    --材料1名称-string 
  type_1 = 5,    --消耗资源类型1-int 
  value_1 = 6,    --消耗资源id1-int 
  size_1 = 7,    --消耗资源数量1-int 
  consume_1 = 8,    --材料1每次消耗-int 
  name_2 = 9,    --材料2名称-string 
  type_2 = 10,    --消耗资源类型2-int 
  value_2 = 11,    --消耗资源id2-int 
  size_2 = 12,    --消耗资源数量2-int 
  consume_2 = 13,    --材料2每次消耗-int 
  level = 14,    --神兵突破等级-int 
  level_max = 15,    --突破后进阶等级上限-int 
  cost_size = 16,    --对应品质-int 
  rank_size = 17,    --进阶模板ID-int 

}

-- data
local instrument_rank = {
    _data = {
        [1] = {1,0,18000000,"春秋",6,92,36,1,"战国",6,93,36,1,50,75,5,2,},
        [2] = {1,1,75000000,"礼记",6,555,18,1,"周易",6,556,18,1,75,100,6,5,},
        [3] = {1,2,0,"春秋",0,0,0,0,"战国",0,0,0,0,100,0,7,7,},
        [4] = {2,0,75000000,"礼记",6,555,18,1,"周易",6,556,18,1,75,100,6,3,},
        [5] = {2,1,0,"春秋",0,0,0,0,"战国",0,0,0,0,100,0,7,8,},
    }
}

-- index
local __index_rank_id_instrument_id = {
    ["1_0"] = 1,
    ["1_1"] = 2,
    ["1_2"] = 3,
    ["2_0"] = 4,
    ["2_1"] = 5,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in instrument_rank")
        return t._raw[__key_map[k]]
    end
}

-- 
function instrument_rank.length()
    return #instrument_rank._data
end

-- 
function instrument_rank.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function instrument_rank.indexOf(index)
    if index == nil or not instrument_rank._data[index] then
        return nil
    end

    return setmetatable({_raw = instrument_rank._data[index]}, mt)
end

--
function instrument_rank.get(rank_id,instrument_id)
    
    local k = rank_id .. '_' .. instrument_id
    return instrument_rank.indexOf(__index_rank_id_instrument_id[k])
        
end

--
function instrument_rank.set(rank_id,instrument_id, tkey, nvalue)
    local record = instrument_rank.get(rank_id,instrument_id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function instrument_rank.index()
    return __index_rank_id_instrument_id
end

return instrument_rank