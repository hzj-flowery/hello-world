--
-- Author: hedili
-- Date: 2018-05-04 15:57:29
-- 种树常量
local HomelandConst = {}
local TypeConvertHelper = require("app.utils.TypeConvertHelper")
local DataConst = require("app.const.DataConst")
HomelandConst.HOMELAND_TREE_DEFAULT_LEVEL = 1 --子树默认等级，方便策划调试

HomelandConst.SHOW_ALL_BUFF = 1
HomelandConst.SHOW_ONE_BUFF = 2

HomelandConst.SELF_TREE = 1
HomelandConst.FRIEND_TREE = 2

HomelandConst.DLG_MAIN_TREE = 1
HomelandConst.DLG_SUB_TREE  = 2

HomelandConst.DLG_FRIEND_MAIN_TREE  = 3
HomelandConst.DLG_FRIEND_SUB_TREE  = 4


HomelandConst.MAIN_TREE_POSITION = cc.p(0,0)

HomelandConst.MAX_SUB_TREE = 6

HomelandConst.MAX_SUB_TREE_TYPE6 = 6 --玲珑玉块

HomelandConst.SUB_TREE_POSITION =
{
    [1] = cc.p(0,0),
    [2] = cc.p(0,0),
    [3] = cc.p(0,0),
    [4] = cc.p(0,0),
    [5] = cc.p(0,0),
    [6] = cc.p(0,0),
}

--祈福类型
HomelandConst.TREE_BUFF_TYPE_1 = 1 --立即生效
HomelandConst.TREE_BUFF_TYPE_2 = 2 --次数生效
HomelandConst.TREE_BUFF_TYPE_3 = 3 --持续生效

--祈福Buff
HomelandConst.TREE_BUFF_IDS = {
    TREE_BUFF_ID_1 = 1, --先秦皇陵，获得先秦皇陵#value#分钟活动时间
    TREE_BUFF_ID_4 = 4, --全服答题，今日全服答题答错免死#times#次
    TREE_BUFF_ID_5 = 5, --军团试炼，军团试炼战斗失败不消耗次数（持续#times#小时）
    TREE_BUFF_ID_7 = 7, --军团试炼，今日军团试炼胜利军团贡献增加#value#%#times#次
    TREE_BUFF_ID_8 = 8, --军团战，卷土重来
    TREE_BUFF_ID_9 = 9, --军团战，兵贵神速
    TREE_BUFF_ID_10 = 10, --军团战，兵强马壮
    TREE_BUFF_ID_11 = 11, --军团战，削铁如泥
    TREE_BUFF_ID_12 = 12, --军团BOSS，军团BOSS抢夺次数+#value#次（持续#times#小时）
    TREE_BUFF_ID_13 = 13, --军团BOSS，军团BOSS中抢夺积分增加#value#%（持续#times#小时）
    TREE_BUFF_ID_14 = 14, --金蝉脱壳
    TREE_BUFF_ID_15 = 15, --万箭齐发
    TREE_BUFF_ID_16 = 16, --华容道，华容道赌注上限为#value#张支持券（持续#times#小时）
    TREE_BUFF_ID_17 = 17, --矿战，矿战中移动不消耗粮草#times#次
    TREE_BUFF_ID_18 = 18, --矿战，前#times#个粮草价格降低降低#value#%
    TREE_BUFF_ID_19 = 19, --矿战，前#times#个攻击令价格降低#value#%
    TREE_BUFF_ID_20 = 20, --浴血奋战
    TREE_BUFF_ID_23 = 23, --南蛮入侵，南蛮入侵中神孟获发现概率增加#value#%（持续#times#小时）
    TREE_BUFF_ID_24 = 24, --道法自然，变幻无穷。作为非破招/破招阵营，能对蓄力状态下的跨服BOSS造成50%的伤害/额外伤害。
}

--需要延迟飘字的Buff
HomelandConst.TREE_BUFF_DELAY_TIP = {
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_5] = true,
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_7] = true,
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_13] = true,
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_14] = true,
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_15] = true,
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_20] = true,
    [HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_24] = true,
}

--某类东西对应的buffBaseId
HomelandConst.TREE_BUFF_BASE_ID_MAP = {
    [TypeConvertHelper.TYPE_RESOURCE] = {
        [DataConst.RES_ARMY_FOOD] = HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_18,
        [DataConst.RES_MINE_TOKEN] = HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_19,
    },
    [TypeConvertHelper.TYPE_ITEM] = {
        [DataConst.ITEM_SUPPORT_TICKET] = HomelandConst.TREE_BUFF_IDS.TREE_BUFF_ID_16,
    },
}

--对应某个type、value的神树buffBaseId
function HomelandConst.getBuffBaseId(type, value)
    local typeInfo = HomelandConst.TREE_BUFF_BASE_ID_MAP[type] or {}
    local buffBaseId = typeInfo[value]
    return buffBaseId
end

function HomelandConst.getBuffKeyWithBaseId(baseId)
    local key = nil
	for k, id in pairs(HomelandConst.TREE_BUFF_IDS) do
		if id == baseId then
			key = k
			break
		end
	end
    assert(key, string.format( "HomelandConst.TREE_BUFF_IDS can not find id = %d", buffBaseId))
    return key
end

--解锁神树祈福的等级
function HomelandConst.getUnlockPrayLevel()
	local Config = require("app.config.tree_info")
    local len = Config.length()
    for i = 1, len do
        local info = Config.indexOf(i)
        if info.prayer_times > 0 then
            return info.id
        end
    end
    return 0
end

--某个buffBaseId是否需要延迟飘字
function HomelandConst.isDelayShowTip(buffBaseId)
    if HomelandConst.TREE_BUFF_DELAY_TIP[buffBaseId] == true then
        return true
    else
        return false
    end
end

return readOnly(HomelandConst)