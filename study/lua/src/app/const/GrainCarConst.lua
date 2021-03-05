local GrainCarConst = {}

--镖车参数配置
GrainCarConst.GRAINCAR_WEEK	     	= 1		-- 3|5|7	    每周几开启	     				
GrainCarConst.GRAINCAR_OPEN	     	= 2		-- 22|00	    活动开始时间 时|分
GrainCarConst.GRAINCAR_CLOSE	    = 3		-- 22|30	    活动结束时间  时|分
GrainCarConst.GRAINCAR_ROUTE	    = 4		-- 4|00	        粮车路线生成时间 时|分
GrainCarConst.GRAINCAR_COPPER_STOP	= 5	    -- 20	        粮车铜矿停留时间 秒
GrainCarConst.GRAINCAR_SILVER_STOP	= 6	    -- 45	        粮车银矿停留时间 秒
GrainCarConst.GRAINCAR_GOLD_STOP	= 7		-- 60	        粮车金矿停留时间 秒
GrainCarConst.GRAINCAR_MOVING_TIME	= 8	    -- 10	        粮车移动时间（2个矿间）秒
GrainCarConst.GRAINCAR_DONATE_COST	= 9	    -- 5|13|2000	粮车捐献消耗 军团贡献
GrainCarConst.GRAINCAR_DONATE_EXP	= 10	-- 2000	        捐献获得升级经验	     				
GrainCarConst.GRAINCAR_ATTACK_TIMES	= 11	-- 3	     	攻击粮车可以获得奖励次数	     				
GrainCarConst.GRAINCAR_ATTACK_BONUS	= 12	-- 5|13|200	    攻击粮车获得奖励 军团贡献
GrainCarConst.GRAINCAR_ATTACK_CD	= 13	-- 5	     	攻击粮车间隔 秒
GrainCarConst.GRAINCAR_ATTACK_HURT	= 14	-- 10	     	每次攻击粮车损失耐久度	     				
GrainCarConst.GRAINCAR_DAMAGE_BONUS	= 15	-- 50	     	粮车损毁获得奖励百分比	     				
GrainCarConst.GRAINCAR_PROTECT_1    = 16	-- 10|20	    当大于等于x名本军团成员和粮车在1个矿点中时，矿车受攻击时损失的耐久值减少x%	     				
GrainCarConst.GRAINCAR_PROTECT_2	= 17	-- 20|40	    当大于等于x名本军团成员和粮车在1个矿点中时，矿车受攻击时损失的耐久值减少x%	     				
GrainCarConst.GRAINCAR_PROTECT_3	= 18	-- 30|60	    当大于等于x名本军团成员和粮车在1个矿点中时，矿车受攻击时损失的耐久值减少x%
GrainCarConst.GRAINCAR_MAX_NUM	    = 19	-- 100  	    同屏显示最大人数
GrainCarConst.GRAINCAR_SHOW	        = 20	-- 600  	    展示时间
GrainCarConst.GRAINCAR_LOSE	        = 21	-- 2  	        攻击粮车损失多少兵力
GrainCarConst.GRAINCAR_SHOW_HERO    = 22	-- 101|102|201  护镖的avatar
GrainCarConst.GRAINCAR_SHOW_SHAME   = 23	-- 50400        活动结束后，显示死亡粮车的时间
GrainCarConst.GRAINCAR_LEVEL_UP     = 26	-- 5            捐献5人次后才能发车

GrainCarConst.GRAIN_EMERGENCY_CLOSE = 10396 --紧急关闭


GrainCarConst.AUTH_ADMIN            = 0     --仅管理可见
GrainCarConst.AUTH_ALL              = 1     --全军团可见

GrainCarConst.MAX_CAR_AVATAR        = 50    --最多多少车在矿战主界面
GrainCarConst.MAX_CORPSE_EACH_LEVEL = 3     --某个矿里 一个等级，最多多少尸体



GrainCarConst.MINE_COLOR_GOLD       = 5     -- 金矿
GrainCarConst.MINE_COLOR_SILVER     = 4     -- 银矿
GrainCarConst.MINE_COLOR_COPPER     = 3     -- 铜矿


GrainCarConst.ROUTE_STOP_COUNT_MAX  = 12    -- 粮车路线站点最大数

GrainCarConst.ATTACK_CD             = 5     -- 攻击间隔

GrainCarConst.MAX_LEVEL             = 5     -- 最大等级


GrainCarConst.CAR_STATUS_UNKNOW = -1
GrainCarConst.CAR_STATUS_IDLE = 0
GrainCarConst.CAR_STATUS_RUN = 1

GrainCarConst.ACT_STATGE_GENERATED = 0  --粮车生成
GrainCarConst.ACT_STATGE_OPEN = 1       --开始
GrainCarConst.ACT_STATGE_CLOSE = 2      --活动结束

-- GrainCarConst.CAR_TITLE = {
--     [1] = "txt_escort01_liangche",
--     [2] = "txt_escort01_muniu",
--     [3] = "txt_escort01_liuma",
--     [4] = "txt_escort01_muniu",
--     [5] = "txt_escort01_liuma",
-- }


return readOnly(GrainCarConst)