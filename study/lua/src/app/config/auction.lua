--auction

-- key
local __key_map = {
  id = 1,    --id-int 
  name = 2,    --子叶签-string 
  auction_type = 3,    --拍卖所属类型-int 
  auction_open_time = 4,    --拍卖开启时间-int 
  auction_continued_time = 5,    --拍卖持续时间-int 
  touch_time = 6,    --顶价触发时间-int 
  extend_time = 7,    --顶价延长时间-int 
  end_time = 8,    --结束时间-int 
  cfg_name = 9,    --对应产出配表-string 

}

-- data
local auction = {
    _data = {
        [1] = {101,"军团BOSS",1,300,600,30,30,0,"boss_auction_content",},
        [2] = {102,"军团答题",1,300,600,30,30,0,"answer_auction_content",},
        [3] = {103,"军团试炼",1,300,600,30,30,0,"guild_stage_auction_content",},
        [4] = {104,"三国战记",1,300,600,30,30,0,"guild_boss_auction_content",},
        [5] = {105,"军团战",1,300,600,30,30,0,"guild_war_auction_content",},
        [6] = {201,"全服",2,300,0,30,30,79200,"",},
        [7] = {301,"阵营竞技",3,300,600,30,30,0,"pvppro_auction_content",},
        [8] = {401,"城池行商",4,300,600,30,30,0,"guild_war_city_auction_content",},
        [9] = {501,"神秘行商",5,300,0,30,30,70200,"update_auction_content",},
        [10] = {601,"跨服个人",6,300,600,30,30,0,"pvpsingle_auction_content",},
        [11] = {106,"跨服军团战",1,300,600,30,30,0,"guild_cross_war_auction_group",},
        [12] = {107,"跨服BOSS",1,300,600,30,30,0,"cross_boss_auction_content",},
    }
}

-- index
local __index_id = {
    [101] = 1,
    [102] = 2,
    [103] = 3,
    [104] = 4,
    [105] = 5,
    [106] = 11,
    [107] = 12,
    [201] = 6,
    [301] = 7,
    [401] = 8,
    [501] = 9,
    [601] = 10,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in auction")
        return t._raw[__key_map[k]]
    end
}

-- 
function auction.length()
    return #auction._data
end

-- 
function auction.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function auction.indexOf(index)
    if index == nil or not auction._data[index] then
        return nil
    end

    return setmetatable({_raw = auction._data[index]}, mt)
end

--
function auction.get(id)
    
    return auction.indexOf(__index_id[id])
        
end

--
function auction.set(id, tkey, nvalue)
    local record = auction.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function auction.index()
    return __index_id
end

return auction