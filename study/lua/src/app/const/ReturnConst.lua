--老玩家回归数据常量
local ReturnConst = {}

ReturnConst.LEVEL_UP_TYPE            = 1 --等级直升活动
ReturnConst.DAILY_ACTIVITY_TYPE      = 2 --每日豪礼活动
ReturnConst.PRIVILEGE_ACTIVITY_TYPE  = 3 --回归特权活动
ReturnConst.DISCOUNT_ACTIVITY_TYPE   = 4 --回归打折活动
ReturnConst.GIFT_ACTIVITY_TYPE       = 5 --回归礼包


ReturnConst.PRIVILEGE_DAILY_CHALLANGE     = 1  --日常副本
ReturnConst.PRIVILEGE_TOWER               = 2  --过关斩将
ReturnConst.PRIVILEGE_DAILY_STAGE         = 3  --普通副本
ReturnConst.PRIVILEGE_ELITE_CHAPTER       = 4  --精英副本
ReturnConst.PRIVILEGE_FAMOUS_CHAPTER      = 5  --名将副本
ReturnConst.PRIVILEGE_TRAVEL              = 6  --游历
ReturnConst.PRIVILEGE_GUILD_CONTRIBUTION  = 7  --军团祭祀和今日军团声望双倍
ReturnConst.PRIVILEGE_DAILY_SIGN          = 8  --每日签到
ReturnConst.PRIVILEGE_WUGUFENGDENG        = 9  --五谷丰登
ReturnConst.PRIVILEGE_DAILY_TASK          = 10 --每日任务


-- cell
ReturnConst.RETURN_LIST_CELL = {
    [ReturnConst.DAILY_ACTIVITY_TYPE] = require("app.scene.view.return.ReturnDailyActivityCell"),
    [ReturnConst.PRIVILEGE_ACTIVITY_TYPE] = require("app.scene.view.return.ReturnPrivilegeCell"),
    [ReturnConst.DISCOUNT_ACTIVITY_TYPE] = require("app.scene.view.return.ReturnDiscountCell"),
    [ReturnConst.GIFT_ACTIVITY_TYPE] = require("app.scene.view.return.ReturnGiftsCell"),
}

return ReturnConst