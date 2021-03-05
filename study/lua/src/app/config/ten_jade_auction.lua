--ten_jade_auction

-- key
local __key_map = {
  id = 1,    --id-int 
  day_min = 2,    --天数min-int 
  day_max = 3,    --天数max-int 
  num_min = 4,    --人数min-int 
  num_max = 5,    --人数max-int 
  reward_id1 = 6,    --奖励组1-int 
  reward_id2 = 7,    --奖励组2-int 
  reward_id3 = 8,    --奖励组3-int 
  reward_id4 = 9,    --奖励组4-int 
  reward_id5 = 10,    --奖励组5-int 
  reward_id6 = 11,    --奖励组6-int 
  reward_id7 = 12,    --奖励组7-int 
  reward_id8 = 13,    --奖励组8-int 
  reward_id9 = 14,    --奖励组9-int 
  reward_id10 = 15,    --奖励组10-int 

}

-- data
local ten_jade_auction = {
    _data = {
        [1] = {1,1,9999,2001,9999,101,102,0,0,0,0,0,0,0,0,},
        [2] = {2,1,9999,1901,2000,201,202,0,0,0,0,0,0,0,0,},
        [3] = {3,1,9999,1801,1900,301,302,0,0,0,0,0,0,0,0,},
        [4] = {4,1,9999,1701,1800,401,402,0,0,0,0,0,0,0,0,},
        [5] = {5,1,9999,1601,1700,501,502,0,0,0,0,0,0,0,0,},
        [6] = {6,1,9999,1501,1600,601,602,0,0,0,0,0,0,0,0,},
        [7] = {7,1,9999,1401,1500,701,702,0,0,0,0,0,0,0,0,},
        [8] = {8,1,9999,1301,1400,801,802,0,0,0,0,0,0,0,0,},
        [9] = {9,1,9999,1201,1300,901,902,0,0,0,0,0,0,0,0,},
        [10] = {10,1,9999,1101,1200,1001,1002,0,0,0,0,0,0,0,0,},
        [11] = {11,1,9999,1001,1100,1101,1102,0,0,0,0,0,0,0,0,},
        [12] = {12,1,9999,901,1000,1201,1202,0,0,0,0,0,0,0,0,},
        [13] = {13,1,9999,801,900,1301,1302,0,0,0,0,0,0,0,0,},
        [14] = {14,1,9999,701,800,1401,1402,0,0,0,0,0,0,0,0,},
        [15] = {15,1,9999,601,700,1501,1502,0,0,0,0,0,0,0,0,},
        [16] = {16,1,9999,501,600,1601,1602,0,0,0,0,0,0,0,0,},
        [17] = {17,1,9999,401,500,1701,1702,0,0,0,0,0,0,0,0,},
        [18] = {18,1,9999,301,400,1801,1802,0,0,0,0,0,0,0,0,},
        [19] = {19,1,9999,201,300,1901,1902,0,0,0,0,0,0,0,0,},
        [20] = {20,1,9999,101,200,2001,2002,0,0,0,0,0,0,0,0,},
        [21] = {21,1,9999,0,100,2101,2102,0,0,0,0,0,0,0,0,},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 10,
    [11] = 11,
    [12] = 12,
    [13] = 13,
    [14] = 14,
    [15] = 15,
    [16] = 16,
    [17] = 17,
    [18] = 18,
    [19] = 19,
    [2] = 2,
    [20] = 20,
    [21] = 21,
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
        assert(__key_map[k], "cannot find " .. k .. " in ten_jade_auction")
        return t._raw[__key_map[k]]
    end
}

-- 
function ten_jade_auction.length()
    return #ten_jade_auction._data
end

-- 
function ten_jade_auction.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function ten_jade_auction.indexOf(index)
    if index == nil or not ten_jade_auction._data[index] then
        return nil
    end

    return setmetatable({_raw = ten_jade_auction._data[index]}, mt)
end

--
function ten_jade_auction.get(id)
    
    return ten_jade_auction.indexOf(__index_id[id])
        
end

--
function ten_jade_auction.set(id, tkey, nvalue)
    local record = ten_jade_auction.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function ten_jade_auction.index()
    return __index_id
end

return ten_jade_auction