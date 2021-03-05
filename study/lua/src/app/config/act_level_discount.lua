--act_level_discount

-- key
local __key_map = {
  id = 1,    --编号-int 
  show_level = 2,    --显示等级-int 
  unlock_level = 3,    --解锁等级-int 
  time_limit = 4,    --时间限制-int 
  good_id = 5,    --商品id-int 
  name = 6,    --物品名称-string 
  type = 7,    --物品类型-int 
  value = 8,    --类型值-int 
  size = 9,    --数量-int 

}

-- data
local act_level_discount = {
    _data = {
        [1] = {1,30,30,24,10033,"紫将任选宝箱",6,114,1,},
        [2] = {2,30,35,24,10034,"橙色宝物任选箱",6,109,1,},
        [3] = {3,30,40,24,10035,"高级精炼石",6,13,30,},
        [4] = {4,30,40,24,10036,"高级精炼石",6,13,50,},
        [5] = {5,40,46,24,10037,"神兵进阶石",6,19,500,},
        [6] = {6,40,46,24,10038,"橙色神兵任选箱",6,107,1,},
        [7] = {7,40,46,24,10039,"橙色万能神兵",6,80,5,},
        [8] = {8,46,50,24,10040,"宝物精炼石",6,10,100,},
        [9] = {9,46,50,24,10041,"橙色兵书任选宝箱",6,123,1,},
        [10] = {10,46,50,24,10042,"橙色宝物印任选宝箱",6,124,1,},
        [11] = {11,50,58,24,10068,"关银屏锦囊",11,1101,1,},
        [12] = {12,50,58,24,10069,"张星彩锦囊",11,1102,1,},
        [13] = {13,50,58,24,10070,"关羽锦囊",11,1205,1,},
        [14] = {14,60,75,24,10046,"置换符",6,41,2,},
        [15] = {15,75,83,24,10099,"青龙原石",6,701,2,},
        [16] = {16,75,83,24,10100,"白虎原石",6,703,2,},
        [17] = {17,83,85,24,10101,"春秋",6,92,4,},
        [18] = {18,83,85,24,10102,"战国",6,93,4,},
        [19] = {19,85,90,24,10103,"礼记",6,555,3,},
        [20] = {20,85,90,24,10104,"周易",6,556,3,},
        [21] = {21,90,95,24,10105,"朱雀原石",6,704,2,},
        [22] = {22,90,95,24,10106,"玄武原石",6,702,2,},
        [23] = {23,95,100,24,10107,"春秋",6,92,4,},
        [24] = {24,95,100,24,10108,"战国",6,93,4,},
        [25] = {25,100,102,24,10117,"礼记",6,555,3,},
        [26] = {26,100,102,24,10118,"周易",6,556,3,},
        [27] = {27,102,104,24,10119,"青龙原石",6,701,2,},
        [28] = {28,102,104,24,10120,"白虎原石",6,703,2,},
        [29] = {29,104,106,24,10121,"春秋",6,92,4,},
        [30] = {30,104,106,24,10122,"战国",6,93,4,},
        [31] = {31,106,108,24,10123,"礼记",6,555,3,},
        [32] = {32,106,108,24,10124,"周易",6,556,3,},
        [33] = {33,108,110,24,10125,"三清化形羽",6,84,1,},
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
    [22] = 22,
    [23] = 23,
    [24] = 24,
    [25] = 25,
    [26] = 26,
    [27] = 27,
    [28] = 28,
    [29] = 29,
    [3] = 3,
    [30] = 30,
    [31] = 31,
    [32] = 32,
    [33] = 33,
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
        assert(__key_map[k], "cannot find " .. k .. " in act_level_discount")
        return t._raw[__key_map[k]]
    end
}

-- 
function act_level_discount.length()
    return #act_level_discount._data
end

-- 
function act_level_discount.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function act_level_discount.indexOf(index)
    if index == nil or not act_level_discount._data[index] then
        return nil
    end

    return setmetatable({_raw = act_level_discount._data[index]}, mt)
end

--
function act_level_discount.get(id)
    
    return act_level_discount.indexOf(__index_id[id])
        
end

--
function act_level_discount.set(id, key, value)
    local record = act_level_discount.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function act_level_discount.index()
    return __index_id
end

return act_level_discount