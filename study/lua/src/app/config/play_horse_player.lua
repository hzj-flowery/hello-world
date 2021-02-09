--play_horse_player

-- key
local __key_map = {
  rank = 1,    --名次-int 
  weight = 2,    --权重-int 
  number = 3,    --每天最多出现次数-int 
  bubble_time = 4,    --准备中说话时间段1min-string 
  text_1 = 5,    --文本1-string 
  text_2 = 6,    --文本2-string 
  text_3 = 7,    --文本3-string 
  text_4 = 8,    --文本4-string 

}

-- data
local play_horse_player = {
    _data = {
        [1] = {1,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","战力代表我的实力！我将永远守护我的爱情、信仰和家人！","我第一那是我会玩！你们跟我冲一样的钱未必能打赢我！","谁赢？你们去看看战力榜谁第一！","不好意思，你们所有人，我都没放在眼里！",},
        [2] = {2,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","来来来，今天跑步比赛我肯定第一！","十大战力我第二！哈哈哈哈！","我不像某些人，我第二向来很低调！","并不是我想当主角，我就是主角！",},
        [3] = {3,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","好几次没选对了吧！今天选我肯定没错！","第二有什么好得意的，我第三马上就超过你！","兵家胜败真常事，卷甲重来未可知。","虽然认输不会死，但我死也不认输！",},
        [4] = {4,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","选我，你绝对不会后悔！","前三都这么霸气，我第四就低调一点。","说矿战一点都不好玩的，你还挖了这么久！","新玩法什么时候出，期待！",},
        [5] = {5,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","这么热闹，我讲几个笑话给大家助助兴怎么样。","每天都要提高战力，是我玩游戏的态度！","良禽择木而栖，贤臣择主而事。","当你蹲下再站起，听到膝盖发出声响，那你要注意了，这说明你的听力正常。",},
        [6] = {6,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","你说的没错！我不想默默无闻！","战力第六的我，觉得自己吉祥如意，萌萌哒~","水能载舟，亦可煮粥。","上盈其志，下务其功；悠悠黄河，吾其济乎！",},
        [7] = {7,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","某位大佬，你不是人造革，你是真的皮！","我这个人，脾气不好性子傲，吊儿郎当又爱笑。","我可能是盐吃多了，闲的总是想你。","一场比赛的时间，我没看比赛，一直在看你。",},
        [8] = {8,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","有些人讲的笑话太冷了。","我不想输给其他家伙！","会玩的，玩哪个阵营都很强；不会玩的，玩哪个阵营都在骂。","马上会开界限突破，到时候大家战力又能涨一波！",},
        [9] = {9,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","你们觉得大乔好看还是貂蝉好看？","为了排行榜第九，我每天都在努力提高战力！","他们都说我喜欢聊天，其实我只想和你聊天。","一吕二赵三典韦，四关五马六张飞。",},
        [10] = {10,1000,2,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","能上十大战力，我已经很开心了！","一二三四五，金木水火土，战力第十最靠谱！","智者务其实，愚者争虚名。","你们怎么玩的，战力都那么高？",},
        [11] = {11,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","难道你说我会输，我就不跑了吗？不试试我怎么会甘心！","所以，我要来...狠狠地…赢得这场比赛！","2018俄罗斯世界杯：阿根廷输给了冠亚军。","纷纷世事无穷尽，天数茫茫不可逃。",},
        [12] = {12,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","为比赛而热血，就算输了也无所谓！","魏延的眩晕减怒可好用了！","谁能告诉我，到底哪个阵营更厉害？","拼将一死酬知己，致令千秋仰义名。",},
        [13] = {13,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","如果我改了名字，你们还认识我是谁吗？","三国的时候有跑步比赛吗？","草堂春睡足，窗外日迟迟。","万事不由人做主，一心难与命争衡。",},
        [14] = {14,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","我想赢！","庞统突十很厉害，你们不知道吗？","小霸王孙策，打后排太厉害了！","一壶浊酒喜相逢，古今多少事，都付笑谈中。",},
        [15] = {15,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","真希望能够快点赢得这场比赛！","养个徐庶用来过主线，真是太爽了！","想赢吗？秘诀就是，选我吧！","强中自有强中手，用诈还逢识诈人。",},
        [16] = {16,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","等这么久才开赛，不如讲几个段子让大家乐一乐。","我要当欧皇！红将、红装碗里来！","骂托，可是游戏的一大乐趣。","独善其身尽日安，何须千古名不朽！",},
        [17] = {17,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","有没有豪来发个双倍红包呢！","多弄几个红色锦囊，我肯定能打败那家伙！","攒了好久水晶，终于可以换红色锦囊了！","黄口孺子，怎闻霹雳之声；病体樵夫，难听虎豹之吼。",},
        [18] = {18,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","能原谅女人谎言的才是真正的男人。","就你们话多，让我安安静静跑个比赛不行吗。","嘘！让我安安静静的想她一会。","你在干嘛？ 唯一的正确回答是 ：在和你聊天。",},
        [19] = {19,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","既不回头，何必不忘；既然无缘，何必誓言。","正经比赛，禁止逗比说话！","我爱你们所有人，前提是你们让我赢！","汝不识贤愚，是眼浊也；不读诗书，是口浊也；不纳忠言，是耳浊也。",},
        [20] = {20,500,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","除了我自己，我不允许任何人轻视我！","我是人，你不是我，所以你不是人。","琵琶精又来参加比赛？入场费赚了不少吧！","不通古今，是身浊也；不容诸侯，是腹浊也；常怀篡逆，是心浊也！",},
        [21] = {21,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","怎样才能华丽的赢比赛呢！","大丈夫生居天地间，岂能郁郁久居人下！","打败我的不是天真，而是天真热！","还不开始，有点无聊，要不一起骂骂策划！",},
        [22] = {22,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","即使需要耐心和等待……我也想拿十大战力！","家事国事天下事，开心玩游戏是大事！","豹子头也可以很开心！","自古骄兵多致败，从来轻敌少成功。",},
        [23] = {23,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","我只想依照我的信念做事，绝不后悔，不管现在将来都一样! ","山重水复疑无路，柳暗花明又一坑。","总说我嘴硬，其实我的内心很柔软善良。","腐草之萤光，怎及天心之皓月？",},
        [24] = {24,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","无论你玩的是什么阵容，好好玩，不会差！","蜀道难，难就难在背诵全文。","血染征袍透甲红，当阳谁敢与争锋！","马逢伯乐而嘶，人遇知己而死。",},
        [25] = {25,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","我要变得更快更高更强！","教训一个人，只需熟练掌握这两句： 1、下次做事之前多想想。 2、你想多了。","事事如意料之外，年年有余额不足！","我从未见过如此厚颜无耻之人。",},
        [26] = {26,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","天助自助者，你要你就能！","我攒着元宝准备弄红色锦囊呢！","天下大势，分久必合，合久必分。","前无去路，诸军何不死战？",},
        [27] = {27,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","想减肥的人每天都再吃，怎么可能成功呢？","遇到抬杠绕道走，离开杠精一声吼，心情若仍难平复，从一数到九十九。","被门夹过的核桃，还能补脑吗？","卧龙、凤雏二人得一，可安天下。",},
        [28] = {28,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","我决心拿第一！","天台挤不下了，往我心里挤挤。","每次开宝箱上电视，都感觉有人在偷窥我。","马骑赤兔行千里，刀偃青龙出五关。",},
        [29] = {29,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","暗自悲哀，不如立即行动。","遍寻不着，犹叹当年小蛮腰。空余恨，一身五花膘。","男人哭吧哭吧哭吧不是罪，再强的人也有权利去疲惫。","大丈夫处世，当努力建功立业，著鞭在先。",},
        [30] = {30,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","司马懿的风火轮再快，也比不上我！","说好的千年等一回，结果一小时到了胃。","你们知道吗，大乔、步练师、貂蝉都会唱歌！","欲除禽兽必先献身于禽兽。",},
        [31] = {31,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","荀彧有驱虎吞狼之计，我有脚下生风之能！","猫是种神奇的动物，无论你贫穷还是富贵，它都瞧不起你。","大都督太帅了，可惜很少来参加比赛！","生死无二志，丈夫何壮哉！",},
        [32] = {32,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","对酒当歌的人，跑步必输！","信不信我跳起来能打碎你的膝盖骨！","满地都是小乔变身卡，为什么呢？","大梦谁先觉，平生我自知！ ",},
        [33] = {33,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","郭嘉有只翱翔万里的鹰，但在这赛场上肯定没我跑得快！","你们都讲笑话，我来讲几个土味情话！","我发现一个小秘密，太史慈放技能用脚在拉弓！","运筹又遇强中手，斗智还逢意外人。",},
        [34] = {34,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","听说夏侯惇的刚烈反伤很厉害？但论跑步还是我第一！","通常情况下对自己发型不满意的人，永远不承认是脸的问题。","孙权孙策两兄弟，一个打后排一个打前排！","豫州当日叹孤穷，何幸南阳有卧龙！",},
        [35] = {35,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","曹仁是个门板怪，跑起步来我最帅！","说好的一日方休，没想到是夜以继日！","吕蒙运气好的时候能晕六个！","我和一程序员朋友借钱，他打给了我1024元，留言：凑个整。",},
        [36] = {36,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","主公快走，这样我就能拿第一了！","既然喝水都胖，那我干嘛不喝可乐？","甘宁扛着刀跑步的样子太逗了！","大丈夫处世，不能立功建业，几与草木同腐乎？",},
        [37] = {37,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","许褚的流星锤重八十斤，他肯定跑不快！","我的钱包鼓鼓的，里面装满了欠条。","孙坚是首回合自带无敌盾的男人！","青山不老，绿水长存。",},
        [38] = {38,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","张辽善于千里奔袭，我擅长跑步拿第一！","天残腿和让梨融，谁跑步最逗比呢？","孙尚香最美，输出也很爆炸！","能战当战，不能战当守，不能守当走，不能走当降，不能降当死耳！",},
        [39] = {39,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","三国四大美女中，我最喜欢甄姬！","多照照镜子，很多事情你就明白原因了。","陆逊配合孙策，很厉害哦！","谋事在人，成事在天。不可强也！ ",},
        [40] = {40,250,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","曹丕合击搂甄姬的腰，他肯定跑不快！","曾梦想仗剑走天涯，后来工作忙没去，因为一直玩游戏。","鲁肃也能眩晕减怒！","弦歌知雅意，杯酒谢良朋。",},
        [41] = {41,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","乐进的小短腿，没我跑得快！","只要是石头，到哪里都不会发光的。","左慈和诸葛，都是强控！","多言获利，不如默而无言。",},
        [42] = {42,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","人是铁，饭是钢！不吃饭怎么跑得快！","都是九年义务教育，你怎么就那么优秀呢。","貂蝉给吕布回四怒，曹操看了很受伤！","苍天如圆盖，陆地似棋局。 ",},
        [43] = {43,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","赵云抱着阿斗都能七进七出，速度肯定快！","我想变成阿斗，谁让他有国宝呢！","你们试试去打主线的董卓，痛不欲生！","兵在夜而不惊，将闻变而不乱",},
        [44] = {44,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","刘备以德服人，但没我跑得快啊！","发明“狗眼看人低”这句话的人，一定没有遇过猫。","有追击的武将都加强了，华雄也是！","自古以来，有兴必有废，有盛必有衰。",},
        [45] = {45,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","卧龙观星知天下事，今天比赛我第一！","宇宙不爆炸，床都懒得下；地球不重启，别想我早起。","贾诩的毒伤真炸天！","夫为将者，能去能就，能柔能刚；能进能退，能弱能强。",},
        [46] = {46,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","月英曾夸我是颖悟之人，还告诉我比赛赢第一的方法！","没有人知道谁是韭菜，都觉得自己跑得比镰刀快。","公孙瓒又晕又减怒，过图很好用！","万事俱备，只欠东风。",},
        [47] = {47,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","关二爷再厉害，也没我跑得快！","每每要放弃，又鬼使神差觉得自己还有戏，这把比赛请选我！","张角既能沉默别人，还不怕被别人沉默！","大丈夫只患功名不立，何患无妻？",},
        [48] = {48,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","百步穿杨，老当益壮，黄忠这么厉害却没人用，他会伤心的！","如果事与愿违，请记住，命运另有安排。","你去打于吉，有可能会中毒！","卿不负孤，孤亦必不负卿也。",},
        [49] = {49,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","马超不骑马，肯定没我快！","你永远不会发现，如果你永远地忘记了一件事。","突十的袁绍配合吕布，太厉害了！","识大体，弃细务，此乃君道。",},
        [50] = {50,100,1,"181,200|161,180|141,160|121,140|101,120|81,100|61,80|41,60|21,40|1,20","你看姜维手持金龙连弩，像不像比赛的发令官！","自古深情留不住，总是套路得人心。","袁术回怒又减怒，可媲美小乔！","幸运的我挤进了战力前五十！希望今天能拿第一！",},
    }
}

-- index
local __index_rank = {
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
    [39] = 39,
    [4] = 4,
    [40] = 40,
    [41] = 41,
    [42] = 42,
    [43] = 43,
    [44] = 44,
    [45] = 45,
    [46] = 46,
    [47] = 47,
    [48] = 48,
    [49] = 49,
    [5] = 5,
    [50] = 50,
    [6] = 6,
    [7] = 7,
    [8] = 8,
    [9] = 9,

}

-- metatable
local mt = { 
    __index = function(t, k) 
        assert(__key_map[k], "cannot find " .. k .. " in play_horse_player")
        return t._raw[__key_map[k]]
    end
}

-- 
function play_horse_player.length()
    return #play_horse_player._data
end

-- 
function play_horse_player.hasKey(k)
    if __key_map[k] == nil then
        return false
    else
        return true
    end
end

--
function play_horse_player.indexOf(index)
    if index == nil or not play_horse_player._data[index] then
        return nil
    end

    return setmetatable({_raw = play_horse_player._data[index]}, mt)
end

--
function play_horse_player.get(rank)
    
    return play_horse_player.indexOf(__index_rank[rank])
        
end

--
function play_horse_player.set(rank, tkey, nvalue)
    local record = play_horse_player.get(rank)
    if record then
        local keyIndex = __key_map[tkey]
        if keyIndex then
            record._raw[keyIndex] = nvalue
        end
    end
end

--
function play_horse_player.index()
    return __index_rank
end

return play_horse_player