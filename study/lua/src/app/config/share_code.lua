--share_code

-- key
local __key_map = {
  id = 1,    --序列-int 
  channel = 2,    --渠道名-string 
  package = 3,    --包名-string 
  QR_code = 4,    --二维码文件名-string 

}

-- data
local share_code = {
    _data = {
        [1] = {1,"游卡","default","qr_yoka_default",},
        [2] = {2,"黑马101","default","qr_101_default",},
        [3] = {3,"黑马101","com.tencent.tmgp.gzyx.tdsg","qr_101_guozi",},
        [4] = {4,"黑马101","com.tencent.tmgp.yueke.tdsg","qr_101_guozi",},
        [5] = {5,"黑马101","com.tencent.tmgp.tdsghhflb","qr_101_guozi",},
        [6] = {6,"黑马101","com.tencent.tmgp.tdsgssj","qr_101_guozi",},
        [7] = {7,"黑马101","com.guoziyx.zhsg","qr_101_guozi",},
        [8] = {8,"黑马101","com.guoziyx.jssg","qr_101_guozi",},
        [9] = {9,"黑马101","com.guoziyx.sgmjz","qr_101_guozi",},
        [10] = {10,"黑马101","com.guoziyx.htjw","qr_101_guozi",},
        [11] = {11,"黑马101","com.guoziyx.mjtx","qr_101_guozi",},
        [12] = {12,"黑马101","com.guoziyx.kpsgz","qr_101_guozi",},
        [13] = {13,"黑马101","com.guoziyx.tdsg","qr_101_guozi",},
        [14] = {14,"黑马101","com.guoziyx.htbyw","qr_101_guozi",},
        [15] = {15,"黑马101","com.guoziyx.gssg","qr_101_guozi",},
        [16] = {16,"黑马101","com.guoziyx.lhj","qr_101_guozi",},
        [17] = {17,"黑马101","com.guoziyx.sgsww","qr_101_guozi",},
        [18] = {18,"黑马101","com.tencent.tmgp.yjsg2","qr_101_bawuhou",},
        [19] = {19,"黑马101","com.sgs.sgnxjqb","qr_101_bawuhou",},
        [20] = {20,"黑马101","com.bw.bjtx.xiwan","qr_101_bawuhou",},
        [21] = {21,"黑马101","com.bw.yjsglg.xiwan","qr_101_bawuhou",},
        [22] = {22,"黑马101","com.bw.yjsgvc.xiwan","qr_101_bawuhou",},
        [23] = {23,"黑马101","com.bw.jjsgz.xiwan","qr_101_bawuhou",},
        [24] = {24,"黑马101","com.bw.lssgz.xiwan","qr_101_bawuhou",},
        [25] = {25,"黑马101","com.tencent.tmgp.bwahjy2","qr_101_bawuhou",},
        [26] = {26,"黑马101","com.tencent.tmgp.bwmjsgxw2","qr_101_bawuhou",},
        [27] = {27,"黑马101","com.bw.mjsgz.xiwan","qr_101_bawuhou",},
        [28] = {28,"黑马101","com.tencent.tmgp.xwyjssj","qr_101_bawuhou",},
        [29] = {29,"黑马101","com.tencent.tmgp.yjmj","qr_101_bawuhou",},
        [30] = {30,"黑马101","com.tencent.tmgp.yjsgxxz","qr_101_bawuhou",},
        [31] = {31,"黑马101","com.tencent.tmgp.yjsgsjz","qr_101_bawuhou",},
        [32] = {32,"黑马101","com.tencent.tmgp.yjsg4","qr_101_bawuhou",},
        [33] = {33,"黑马101","com.tencent.tmgp.yjsgsnsj","qr_101_bawuhou",},
        [34] = {34,"黑马101","com.tencent.tmgp.yjsgjpmj","qr_101_bawuhou",},
        [35] = {35,"黑马101","com.tencent.tmgp.yjsgqyz","qr_101_bawuhou",},
        [36] = {36,"黑马103","default","qr_103_default",},
        [37] = {37,"黑马105","default","qr_105_default",},
        [38] = {38,"6kw","default","qr_6kw_default",},
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
    [34] = 34,
    [35] = 35,
    [36] = 36,
    [37] = 37,
    [38] = 38,
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
        assert(__key_map[k], "cannot find " .. k .. " in share_code")
        return t._raw[__key_map[k]]
    end
}

-- 
function share_code.length()
    return #share_code._data
end

-- 
function share_code.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function share_code.indexOf(index)
    if index == nil or not share_code._data[index] then
        return nil
    end

    return setmetatable({_raw = share_code._data[index]}, mt)
end

--
function share_code.get(id)
    
    return share_code.indexOf(__index_id[id])
        
end

--
function share_code.set(id, tkey, nvalue)
    local record = share_code.get(id)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function share_code.index()
    return __index_id
end

return share_code