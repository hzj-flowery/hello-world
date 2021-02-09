--拍卖数据常量
local AuctionConst = {}

AuctionConst.AC_TYPE_GUILD = 1 --军团拍卖
AuctionConst.AC_TYPE_WORLD = 2 --世界拍卖
AuctionConst.AC_TYPE_ARENA = 3 --阵营竞技
AuctionConst.AC_TYPE_TRADE = 4 --城池行商
AuctionConst.AC_TYPE_GM = 5 --更新拍卖
AuctionConst.AC_TYPE_PERSONAL_ARENA = 6 --个人竞技
AuctionConst.AC_TYPE_GUILDCROSS_WAR = 7 --跨服军图战
AuctionConst.AC_TYPE_MAX = 7 --拍卖页签最大类型

AuctionConst.BUTTON_TYPE_BUY = 2 --一口价
AuctionConst.BUTTON_TYPE_ADD = 1 --竞价

--全服拍卖子标签类型
AuctionConst.AC_ALLSERVER_OFFICIAL = 1 --官印
AuctionConst.AC_ALLSERVER_HEROS = 2 --武将
AuctionConst.AC_ALLSERVER_TREASURE = 3 --宝物
AuctionConst.AC_ALLSERVER_INSTRUMENT= 4 --神兵
AuctionConst.AC_ALLSERVER_SILKBAG = 5 --锦囊
AuctionConst.AC_ALLSERVER_HISTORYHERO = 6 --历代名将
AuctionConst.AC_ALLSERVER_OTHERS = 10 --其他

AuctionConst.AC_TYPE_GUILD_ID = 101 --军团BOSS拍卖
AuctionConst.AC_TYPE_GUILD_ANSWER_ID = 102 --月但评
AuctionConst.AC_TYPE_GUILD_DUNGEON_ID = 103 --军团副本拍卖
AuctionConst.AC_TYPE_COUNTRY_BOSS_ID = 104 -- 三国战记拍卖
AuctionConst.AC_TYPE_GUILD_WAR_ID = 105 -- 军团战
--AuctionConst.AC_TYPE_GUILD_WAR_TRADE = 106 -- 军团城池行商
AuctionConst.AC_TYPE_GUILD_MAX = 108 --军团拍卖最大id
AuctionConst.AC_TYPE_CROSS_WORLD_BOSS = 107 --跨服军团boss

AuctionConst.AC_TYPE_WORLD_ID = 201 --世界拍卖
AuctionConst.AC_TYPE_ARENA_ID = 301 -- 阵营竞技
AuctionConst.AC_TYPE_WAR_TRADE_ID = 401 --城池行商
AuctionConst.AC_TYPE_GM_ID = 501 --更新拍卖
AuctionConst.AC_TYPE_PERSONAL_ARENA_ID = 601--个人竞技
AuctionConst.AC_TYPE_GUILDCROSSWAR_ID = 106--跨服军团战

AuctionConst.AC_BOUNS_TYPE_LIST = {
    [AuctionConst.AC_TYPE_GUILD] = 1,
    [AuctionConst.AC_TYPE_ARENA] = 1,
    [AuctionConst.AC_TYPE_TRADE] = 1,
    [AuctionConst.AC_TYPE_PERSONAL_ARENA] = 1,
    [AuctionConst.AC_TYPE_GUILDCROSS_WAR] = 1,
}
--[[
--竞技拍卖子标签类型
AuctionConst.AC_ARENA_HEROS = 11 --武将
AuctionConst.AC_ARENA_INSTRUMENT= 12 --神兵
AuctionConst.AC_ARENA_TREASURE = 13 --宝物
AuctionConst.AC_ARENA_SILKBAG = 14 --锦囊
AuctionConst.AC_ARENA_OTHERS = 20 --其他
]]
return AuctionConst
