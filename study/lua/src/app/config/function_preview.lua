--function_preview

-- key
local __key_map = {
  id = 1,    --编号-int 
  function_id = 2,    --function_level_id-int 
  text = 3,    --文本描述-string 
  name_pic = 4,    --名称图片-string 

}

-- data
local function_preview = {
    _data = {
        [1] = {1,321,"#level#级开启，招募武将可激活上阵武将名将册，战力会有大幅提升！","img_newopen_mingjiangce",},
        [2] = {2,131,"#level#级可穿戴装备，初级装备可从主线副本获得！","img_newopen_zhuangbei1",},
        [3] = {3,304,"#level#级开启第4阵位，可上阵第4名武将！","img_newopen_zhenwei4",},
        [4] = {4,71,"#level#级开启竞技场，挑战可获得大量元宝，排名越高奖励越多！","img_newopen_arena",},
        [5] = {5,73,"#level#级开启游历系统，在神州大地上游历，触发奇遇可获得宝物！","img_newopen_discover",},
        [6] = {6,901,"达到#level#级，主角和武将可突破+2，每次突破都会大幅提升武将战斗力！","img_newopen_tupo2",},
        [7] = {8,305,"#level#级开启第5阵位，可上阵第5名武将！","img_newopen_zhenwei5",},
        [8] = {9,13,"#level#级开启官衔，晋升官衔，争夺荣耀巅峰！","img_newopen_official",},
        [9] = {10,76,"#level#级开启，挑战历代名将，勇夺装备精华，神装等你来拿！","img_newopen_guoguan",},
        [10] = {11,54,"#level#级开启日常副本，海量资源天天拿！","img_newopen_richang",},
        [11] = {12,5,"#level#级开启军团，打军团BOSS拿海量元宝分红！","img_newopen_juntuan",},
        [12] = {13,902,"达到#level#级，主角和武将可突破+3！","img_newopen_tupo3",},
        [13] = {14,306,"#level#级开启第6阵位，可上阵第6名武将！","img_newopen_zhenwei6",},
        [14] = {15,77,"#level#级开启领地巡逻，派遣名将巡逻城池，得海量资源，还有几率偶遇整将！","img_newopen_lingdi",},
        [15] = {16,310,"#level#级开启援军，招募武将上阵援助，激活羁绊，享有大量战力加成！","img_newopen_yuanjun",},
        [16] = {17,903,"达到#level#级，主角和武将可突破+4！","img_newopen_tupo4",},
        [17] = {18,114,"#level#级开启装备精炼，装备精炼可大大提高战斗力，别忘了多多收集精炼石哟！","img_newopen_zhuangbei",},
        [18] = {19,56,"#level#级开启名将副本，海量元宝、将魂任你拿！","img_newopen_mingjiangfuben",},
        [19] = {20,78,"#level#级开启南蛮入侵，挑战蛮荒凶徒，获取神兵利器！","img_newopen_nanman",},
        [20] = {21,123,"#level#级开启宝物精炼，主公记得多买宝物精炼石！","img_newopen_baowu",},
        [21] = {22,107,"#level#级开启武将觉醒，武将觉醒可大大提高武将的基础属性！","img_newopen_juexing",},
        [22] = {23,91,"#level#级开启锦囊系统，装备锦囊大大增强武将特性，玩法更多变哟！","img_newopen_jinnang",},
        [23] = {24,86,"#level#级开启变身卡，可自由转换主角，随心所欲搭配阵营，玩的更嗨！","img_newopen_bianshenka",},
        [24] = {25,930,"#level#级开启神兽功能，萌宠在手，天下我有！","img_newopen_shenshou",},
        [25] = {26,33,"#level#级开启武将置换，可随意置换橙、红武将，随心所欲玩转阵容！","img_newopen_zhihuan",},
        [26] = {27,108,"#level#级开启界限突破，橙色武将逆天改命，实力暴涨！","img_newopen_jiexian",},
        [27] = {28,118,"#level#级开启玉石镶嵌，装备属性如虎添翼，战斗力更上一层楼！","img_newopen_jade",},
        [28] = {29,734,"#level#级开启战法，运筹帷幄之中，决胜千里之外！","img_newopen_zhanfa",},
    }
}

-- index
local __index_id = {
    [1] = 1,
    [10] = 9,
    [11] = 10,
    [12] = 11,
    [13] = 12,
    [14] = 13,
    [15] = 14,
    [16] = 15,
    [17] = 16,
    [18] = 17,
    [19] = 18,
    [2] = 2,
    [20] = 19,
    [21] = 20,
    [22] = 21,
    [23] = 22,
    [24] = 23,
    [25] = 24,
    [26] = 25,
    [27] = 26,
    [28] = 27,
    [29] = 28,
    [3] = 3,
    [4] = 4,
    [5] = 5,
    [6] = 6,
    [8] = 7,
    [9] = 8,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in function_preview")
        return t._raw[__key_map[k]]
    end
}

-- 
function function_preview.length()
    return #function_preview._data
end

-- 
function function_preview.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function function_preview.indexOf(index)
    if index == nil or not function_preview._data[index] then
        return nil
    end

    return setmetatable({_raw = function_preview._data[index]}, mt)
end

--
function function_preview.get(id)
    
    return function_preview.indexOf(__index_id[id])
        
end

--
function function_preview.set(id, key, value)
    local record = function_preview.get(id)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function function_preview.index()
    return __index_id
end

return function_preview