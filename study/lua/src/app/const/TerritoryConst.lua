--领地常量
local TerritoryConst = {}

TerritoryConst.STATE_NONE = 0 --领地状态 无
TerritoryConst.STATE_LOCK = 1 -- 锁定
TerritoryConst.STATE_FIGHT = 2 -- 攻打
TerritoryConst.STATE_ADD   = 3 -- 添加
TerritoryConst.STATE_COUNTDOWN = 4 --倒计时
TerritoryConst.STATE_RIOT        = 5 --暴动
TerritoryConst.STATE_FINISH      = 6 --完成
TerritoryConst.STATE_ADDED       = 7 --已添加 


--巡逻中发生的暴动有领取、军团求助、已求助、超时、已领取五中状态。
TerritoryConst.RIOT_TAKE  = 1 --可领取
TerritoryConst.RIOT_HELP  = 2 --军团求助
TerritoryConst.RIOT_HELPED = 3 --已求助
TerritoryConst.RIOT_OVERTIME = 4 --超时
TerritoryConst.RIOT_TAKEN = 5 --已领取



TerritoryConst.PARTOL_TYPE_FINISH = 10 --巡逻结束
TerritoryConst.RIOT_TYPE_OPEN = 100 --暴动开始
TerritoryConst.RIOT_TYPE_OVER = 101 --暴动解决

TerritoryConst.TITLE_COLOR   = cc.c3b(0xb4,0x64,0x14)

return TerritoryConst
