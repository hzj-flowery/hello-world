--city_timeshow

-- key
local __key_map = {
  id = 1,    --id-int 
  start_day = 2,    --一年内开始天数-int 
  end_day = 3,    --一年内结束天数-int 
  scene_day = 4,    --白天主城-int 
  scene_night = 5,    --晚上主城-int 
  background = 6,    --登陆图场景-string 
  load = 7,    --登陆图场景-string 
  effect = 8,    --登陆图场景-string 
  is_move = 9,    --是否可移动-int 
  front_x = 10,    --front_x-int 
  middle_x = 11,    --middle_x-int 
  back_x = 12,    --back_x-int 
  front_y = 13,    --front_y-int 
  middle_y = 14,    --middle_y-int 
  back_y = 15,    --back_y-int 

}

-- data
local city_timeshow = {
    _data = {
        [1] = {1,1,16,121,122,"res/ui3/login/login_bg18.jpg","res/ui3/login/img_loginloading18.jpg","moving_denglu18",0,50,30,20,50,30,20,},
        [2] = {2,17,31,121,122,"res/ui3/login/login_bg19.jpg","res/ui3/login/img_loginloading19.jpg","moving_denglu19",0,50,30,20,50,30,20,},
        [3] = {3,32,38,133,134,"res/ui3/login/login_bg7.jpg","res/ui3/login/img_loginloading7.jpg","moving_denglu7",0,50,30,20,50,30,20,},
        [4] = {4,39,60,133,134,"res/ui3/login/login_bg20.jpg","res/ui3/login/img_loginloading20.jpg","moving_denglu20",0,50,30,20,50,30,20,},
        [5] = {5,61,79,106,104,"res/ui3/login/img_loginloading8.jpg","res/ui3/login/img_loginloading8.jpg","moving_denglu8",0,50,30,20,50,30,20,},
        [6] = {6,80,94,106,104,"res/ui3/login/img_loginloading8.jpg","res/ui3/login/img_loginloading8.jpg","moving_denglu8",0,50,30,20,50,30,20,},
        [7] = {7,95,111,106,104,"res/ui3/login/login_bg9.jpg","res/ui3/login/img_loginloading9.jpg","moving_denglu9",0,50,30,20,50,30,20,},
        [8] = {8,112,128,123,124,"res/ui3/login/login_bg16.jpg","res/ui3/login/img_loginloading16.jpg","moving_denglu16",0,50,30,20,50,30,20,},
        [9] = {9,129,157,125,126,"res/ui3/login/login_bg10.jpg","res/ui3/login/img_loginloading10.jpg","moving_denglu10",0,50,30,20,50,30,20,},
        [10] = {10,158,188,125,126,"res/ui3/login/login_bg12.jpg","res/ui3/login/img_loginloading12.jpg","moving_denglu12",0,50,30,20,50,30,20,},
        [11] = {11,189,203,125,126,"res/ui3/login/login_bg12.jpg","res/ui3/login/img_loginloading12.jpg","moving_denglu12",0,50,30,20,50,30,20,},
        [12] = {12,204,219,127,128,"res/ui3/login/login_bg.jpg","res/ui3/login/img_loginloading.jpg","moving_denglu2",0,50,30,20,50,30,20,},
        [13] = {13,220,237,127,128,"res/ui3/login/login_bg3.png","res/ui3/login/img_loginloading3.jpg","moving_denglu3",0,50,30,20,50,30,20,},
        [14] = {14,238,250,127,128,"res/ui3/login/login_bg3.png","res/ui3/login/img_loginloading3.jpg","moving_denglu3",0,50,30,20,50,30,20,},
        [15] = {15,251,265,112,113,"res/ui3/login/login_bg13.jpg","res/ui3/login/img_loginloading13.jpg","moving_denglu13",0,50,30,20,50,30,20,},
        [16] = {16,266,281,112,113,"res/ui3/login/login_bg14.jpg","res/ui3/login/img_loginloading14.jpg","moving_denglu14",0,50,30,20,50,30,20,},
        [17] = {17,282,298,129,130,"res/ui3/login/login_bg14.jpg","res/ui3/login/img_loginloading14.jpg","moving_denglu14",0,50,30,20,50,30,20,},
        [18] = {18,299,311,129,130,"res/ui3/login/login_bg15.jpg","res/ui3/login/img_loginloading15.jpg","moving_denglu15",0,50,30,20,50,30,20,},
        [19] = {19,312,330,131,132,"res/ui3/login/login_bg18.jpg","res/ui3/login/img_loginloading18.jpg","moving_denglu18",0,50,30,20,50,30,20,},
        [20] = {20,331,341,131,132,"res/ui3/login/login_bg18.jpg","res/ui3/login/img_loginloading18.jpg","moving_denglu18",0,50,30,20,50,30,20,},
        [21] = {21,342,359,116,117,"res/ui3/login/login_bg17.jpg","res/ui3/login/img_loginloading17.jpg","moving_denglu17",0,50,30,20,50,30,20,},
        [22] = {22,360,366,116,117,"res/ui3/login/img_loginloading6.jpg","res/ui3/login/img_loginloading6.jpg","moving_denglu6",0,50,30,20,50,30,20,},
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
        assert(__key_map[k], "cannot find " .. k .. " in city_timeshow")
        return t._raw[__key_map[k]]
    end
}

-- 
function city_timeshow.length()
    return #city_timeshow._data
end

-- 
function city_timeshow.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function city_timeshow.indexOf(index)
    if index == nil or not city_timeshow._data[index] then
        return nil
    end

    return setmetatable({_raw = city_timeshow._data[index]}, mt)
end

--
function city_timeshow.get(id)
    
    return city_timeshow.indexOf(__index_id[id])
        
end

--
function city_timeshow.set(id, tkey, nvalue)
    local record = city_timeshow.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function city_timeshow.index()
    return __index_id
end

return city_timeshow