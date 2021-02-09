--guild_cross_war_auction_group

-- key
local __key_map = {
  id = 1,    --编号-int 
  group = 2,    --掉落组-int 
  type = 3,    --掉落类型-int 
  auction_full_tab = 4,    --所属全服拍卖页签-int 
  value = 5,    --类型值-int 
  size = 6,    --堆叠-int 
  start_price = 7,    --起拍价-int 
  fare = 8,    --加价-int 
  net = 9,    --一口价-int 
  price_id = 10,    --货币类型，0元宝，1玉璧-int 

}

-- data
local guild_cross_war_auction_group = {
    _data = {
        [1] = {1,1,11,5,1406,1,27000,4050,67500,0,},
        [2] = {2,1,11,5,1407,1,27000,4050,67500,0,},
        [3] = {3,1,11,5,1408,1,27000,4050,67500,0,},
        [4] = {4,2,6,10,555,1,2700,405,6750,0,},
        [5] = {5,2,6,10,556,1,2700,405,6750,0,},
        [6] = {6,3,6,10,721,1,3200,480,8000,0,},
        [7] = {7,3,6,10,722,1,3200,480,8000,0,},
        [8] = {8,4,6,4,706,1,3000,450,7500,0,},
        [9] = {9,5,14,6,101,1,8000,1200,20000,0,},
        [10] = {10,5,14,6,102,1,8000,1200,20000,0,},
        [11] = {11,5,14,6,103,1,8000,1200,20000,0,},
        [12] = {12,5,14,6,104,1,8000,1200,20000,0,},
        [13] = {13,6,7,6,140001,1,3000,450,7500,1,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in guild_cross_war_auction_group")
        return t._raw[__key_map[k]]
    end
}

-- 
function guild_cross_war_auction_group.length()
    return #guild_cross_war_auction_group._data
end

-- 
function guild_cross_war_auction_group.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function guild_cross_war_auction_group.indexOf(index)
    if index == nil or not guild_cross_war_auction_group._data[index] then
        return nil
    end

    return setmetatable({_raw = guild_cross_war_auction_group._data[index]}, mt)
end

--
function guild_cross_war_auction_group.get(id)
    
    return guild_cross_war_auction_group.indexOf(__index_id[id])
        
end

--
function guild_cross_war_auction_group.set(id, tkey, nvalue)
    local record = guild_cross_war_auction_group.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function guild_cross_war_auction_group.index()
    return __index_id
end

return guild_cross_war_auction_group