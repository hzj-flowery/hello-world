--mine_output

-- key
local __key_map = {
  id = 1,    --id-int 
  templet_id = 2,    --模板id-int 
  population = 3,    --人数-int 
  state = 4,    --状态-int 
  description = 5,    --状态描述-string 
  icon = 6,    --状态图片-string 
  output = 7,    --产量-int 
  output_change = 8,    --产量变化-int 
  output_show = 9,    --显示产量-string 
  proportion = 10,    --比例-int 

}

-- data
local mine_output = {
    _data = {
        [1] = {1,0,20,0,"正常","img_mine_quantity01",0,1000,"",1000,},
        [2] = {2,0,30,0,"正常","img_mine_quantity01",0,1000,"",1000,},
        [3] = {3,0,40,0,"正常","img_mine_quantity01",0,1000,"",1000,},
        [4] = {4,0,50,0,"正常","img_mine_quantity01",0,1000,"",1000,},
        [5] = {5,0,99999,0,"正常","img_mine_quantity01",0,1000,"",1000,},
        [6] = {6,1,20,0,"正常","img_mine_quantity01",695,1000,"600/天",1000,},
        [7] = {7,1,30,1,"拥挤","img_mine_quantity03",695,800,"480/天",1000,},
        [8] = {8,1,40,2,"爆满","img_mine_quantity04",695,600,"360/天",1000,},
        [9] = {9,1,50,2,"爆满","img_mine_quantity04",695,600,"360/天",1000,},
        [10] = {10,1,99999,2,"爆满","img_mine_quantity04",695,600,"360/天",1000,},
        [11] = {11,2,20,0,"正常","img_mine_quantity01",463,1000,"400/天",1000,},
        [12] = {12,2,30,1,"拥挤","img_mine_quantity03",463,800,"320/天",1000,},
        [13] = {13,2,40,2,"爆满","img_mine_quantity04",463,600,"240/天",1000,},
        [14] = {14,2,50,2,"爆满","img_mine_quantity04",463,600,"240/天",1000,},
        [15] = {15,2,99999,2,"爆满","img_mine_quantity04",463,600,"240/天",1000,},
        [16] = {16,3,20,0,"正常","img_mine_quantity01",232,1000,"200/天",1000,},
        [17] = {17,3,30,1,"拥挤","img_mine_quantity03",232,800,"160/天",1000,},
        [18] = {18,3,40,2,"爆满","img_mine_quantity04",232,600,"120/天",1000,},
        [19] = {19,3,50,2,"爆满","img_mine_quantity04",232,600,"120/天",1000,},
        [20] = {20,3,99999,2,"爆满","img_mine_quantity04",232,600,"120/天",1000,},
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
        assert(__key_map[k], "cannot find " .. k .. " in mine_output")
        return t._raw[__key_map[k]]
    end
}

-- 
function mine_output.length()
    return #mine_output._data
end

-- 
function mine_output.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function mine_output.indexOf(index)
    if index == nil or not mine_output._data[index] then
        return nil
    end

    return setmetatable({_raw = mine_output._data[index]}, mt)
end

--
function mine_output.get(id)
    
    return mine_output.indexOf(__index_id[id])
        
end

--
function mine_output.set(id, key, value)
    local record = mine_output.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function mine_output.index()
    return __index_id
end

return mine_output