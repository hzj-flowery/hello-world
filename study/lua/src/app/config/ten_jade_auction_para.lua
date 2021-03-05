--ten_jade_auction_para

-- key
local __key_map = {
  id = 1,    --序号-int 
  key = 2,    --参数名称-string 
  content = 3,    --参数内容-string 

}

-- data
local ten_jade_auction_para = {
    _data = {
        [1] = {1,"open_count_down","0",},
        [2] = {2,"extend_start_time","60",},
        [3] = {3,"extend_time","120",},
        [4] = {4,"safe_num","100",},
        [5] = {5,"server_num","8",},
        [6] = {6,"intrance_open_time","00|00|00",},
        [7] = {7,"intrance_close_time","23|59|59",},
        [8] = {8,"termination_time","3600",},
        [9] = {9,"cross_chat_open","300",},
        [10] = {10,"cross_chat_close","300",},
        [11] = {11,"show_icon_1","16|2102",},
        [12] = {12,"show_icon_2","16|4108",},
        [13] = {13,"show_icon_3","16|4104",},
        [14] = {14,"show_icon_4","11|1503",},
        [15] = {15,"activity_name","一元起拍",},
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
        assert(__key_map[k], "cannot find " .. k .. " in ten_jade_auction_para")
        return t._raw[__key_map[k]]
    end
}

-- 
function ten_jade_auction_para.length()
    return #ten_jade_auction_para._data
end

-- 
function ten_jade_auction_para.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function ten_jade_auction_para.indexOf(index)
    if index == nil or not ten_jade_auction_para._data[index] then
        return nil
    end

    return setmetatable({_raw = ten_jade_auction_para._data[index]}, mt)
end

--
function ten_jade_auction_para.get(id)
    
    return ten_jade_auction_para.indexOf(__index_id[id])
        
end

--
function ten_jade_auction_para.set(id, tkey, nvalue)
    local record = ten_jade_auction_para.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function ten_jade_auction_para.index()
    return __index_id
end

return ten_jade_auction_para