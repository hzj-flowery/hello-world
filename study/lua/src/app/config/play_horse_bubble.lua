--play_horse_bubble

-- key
local __key_map = {
  rank = 1,    --名次-int 
  bubble_time = 2,    --说话时间低-string 
  probability = 3,    --说话概率-string 
  text_1 = 4,    --文本1-string 
  text_2 = 5,    --文本2-string 
  text_3 = 6,    --文本3-string 
  text_4 = 7,    --文本4-string 
  text_5 = 8,    --文本5-string 
  text_6 = 9,    --文本6-string 
  text_7 = 10,    --文本7-string 
  text_8 = 11,    --文本8-string 
  text_9 = 12,    --文本9-string 
  text_10 = 13,    --文本10-string 
  text_11 = 14,    --文本11-string 
  text_12 = 15,    --文本12-string 

}

-- data
local play_horse_bubble = {
    _data = {
        [1] = {1,"1,30|31,60|61,90","700|600|700","开局第一，稳拿第一。","你们就歇着吧，第一我来拿。","你们跑得太慢了，完全不是对手。","今天伙食不错，第一势在必得！","脚下生风，没听过吗？","是时候展现真正的实力了。","你们脚下灌铅了吗，真慢！","冲啊，101小姐姐快来给我加油吧！","前方就是终点，第一非我莫属。","我属兔子的，你们都属乌龟，哈哈哈哈！","都不用抢了，第一马上是我的了！","冲刺，胜利在向我召唤！",},
        [2] = {2,"1,30|31,60|61,90","700|600|700","开局跑这么快干嘛，省点力气冲刺！","让你一步，待我运功发力就追上你。","别嘚瑟了，我马上就能追上你！","跑完了去喝个小酒，听个小曲，怎么样？","我还没有使出全力呢。","今天不是你第一，就是我第二…","和第一就差一个身位，加把劲赶上去！","你看我这身材，肯定能拿个好名次！","除了第一，第二和第五好像没什么区别。","我不要当什么第二！","最后的奋力一搏，啊啊啊啊！","就差一点点，好不甘心啊！",},
        [3] = {3,"1,30|31,60|61,90","700|600|700","我就让一让你们，别得意太早。","我这叫保存体力，你们懂吗。","你们不看好我吗，我可能是黑马哟。","…跑步就跑步，你们废话真多！","赛场还有一半，论输赢还早。","别看不起我的凌波微步，马上就能追上你们。","前面的两个等等我！","有些人啊，自己跑不动，就怨别人。","前面的，我马上就能追上你！","加把劲，拿个第三也不错！","我才不要当第三，不行不行！","这一次输了没关系，下一次还有机会！",},
        [4] = {4,"1,30|31,60|61,90","700|600|700","不行不行，我怎么倒数第二了！","我身上装备重，等我脱掉几件就能追上来。","起步打滑了一下而已，待我后程发力。","别嫌我慢，我已经很努力了。","别看不起我，谁还没脚滑的时候。","前面的慢点，你们元宝掉了。","有句话叫后来居上，相信我。","狗策划，终点这么远，想累死我吗？","完了，感觉自己挤不进前三了，可恨。","啊啊啊啊，打死也不能当倒数第一。","马上到终点了，应该不用当最后一名。","人艰不拆，重在参与，呵呵哒！",},
        [5] = {5,"1,30|31,60|61,90","700|600|700","开始慢，不一定代表一直慢。","别看我现在第五，说不定最后我拿第一！","我可是练过的，别以为我跑不快。","今天伙食不错，吃太多了有点跑不动。","呼呼呼呼，好累跑不动了。","前面的都等等我！","早知道不夜夜笙歌了，感觉好乏力啊。","我也累，晚上回家一定要补个鸡腿！","昨晚谁给我下泻药了？脚好软，跑不动。","你们跑慢点，我要掉出屏幕了。","你们是不是吃了什么神药，跑这么快！","看什么看？我可是靠实力才跑到第五的！",},
    }
}

-- index
local __index_rank = {
    [1] = 1,
    [2] = 2,
    [3] = 3,
    [4] = 4,
    [5] = 5,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in play_horse_bubble")
        return t._raw[__key_map[k]]
    end
}

-- 
function play_horse_bubble.length()
    return #play_horse_bubble._data
end

-- 
function play_horse_bubble.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function play_horse_bubble.indexOf(index)
    if index == nil or not play_horse_bubble._data[index] then
        return nil
    end

    return setmetatable({_raw = play_horse_bubble._data[index]}, mt)
end

--
function play_horse_bubble.get(rank)
    
    return play_horse_bubble.indexOf(__index_rank[rank])
        
end

--
function play_horse_bubble.set(rank, key, value)
    local record = play_horse_bubble.get(rank)
    if record then
        local keyIndex = __key_map[key]
        if keyIndex then
            record._raw[keyIndex] = value
        end
    end
end

--
function play_horse_bubble.index()
    return __index_rank
end

return play_horse_bubble