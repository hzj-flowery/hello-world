--single_scene

-- key
local __key_map = {
  id = 1,    --地图id-int 
  background = 2,    --背景图-string 
  farground = 3,    --远景-string 
  front_eft = 4,    --前层特效（最前面）-string 
  middle_eft = 5,    --中层特效（背景前，人物后）-string 
  back_eft = 6,    --远景特效（远景前，中景后）-string 

}

-- data
local single_scene = {
    _data = {
        [1] = {1,"1.jpg","","","","",},
        [2] = {2,"2_middle.png","2_back.jpg","jiangbianzhandou_front","jiangbianzhandou_middle","jiangbianzhandou_back",},
        [3] = {3,"3.jpg","","","","",},
        [4] = {4,"4_middle.png","4_back.jpg","chengqiangzhandou_front","chengqiangzhandou_middle","chengqiangzhandou_back",},
        [5] = {5,"5.jpg","","fengyiting_front","fengyiting_middle","",},
        [6] = {6,"6.jpg","","","","",},
        [7] = {7,"7.jpg","","taohuayuan_front","taohuayuan","",},
        [8] = {8,"8.jpg","","xiapizhandou_frnot","xiapizhandou_middle","",},
        [9] = {9,"9_middle.png","9_back.jpg","sanling_front","sanling_middle","sanling_back",},
        [10] = {10,"10_middle.png","10_back.png","","huangjinzhandou_middle","huangjinzhandou_back",},
        [11] = {11,"11_middle.png","11_back.jpg","changbanqiaozhandou_front","","changbanqiaozhandou_back",},
        [12] = {12,"12.jpg","","","","",},
        [13] = {13,"13_middle.png","13_back.jpg","nanmanzhandou_front","nanmanzhandou_middle","nanmanzhandou_back",},
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
        assert(__key_map[k], "cannot find " .. k .. " in single_scene")
        return t._raw[__key_map[k]]
    end
}

-- 
function single_scene.length()
    return #single_scene._data
end

-- 
function single_scene.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function single_scene.indexOf(index)
    if index == nil or not single_scene._data[index] then
        return nil
    end

    return setmetatable({_raw = single_scene._data[index]}, mt)
end

--
function single_scene.get(id)
    
    return single_scene.indexOf(__index_id[id])
        
end

--
function single_scene.set(id, key, value)
    local record = single_scene.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function single_scene.index()
    return __index_id
end

return single_scene