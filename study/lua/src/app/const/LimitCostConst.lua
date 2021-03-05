--界限突破通用组件常量定义
local LimitCostConst = {}

LimitCostConst.HERO_LIMIT_COST = 1 -- 武将界限
LimitCostConst.EQUIPMENT_LIMIT_COST = 2 -- 装备界限

LimitCostConst.BREAK_LIMIT_UP = 0 -- 突破操作

LimitCostConst.LIMIT_COST_KEY_1 = 1 -- 第一类小球
LimitCostConst.LIMIT_COST_KEY_2 = 2 -- 第二类小球
LimitCostConst.LIMIT_COST_KEY_3 = 3 -- 第三类小球
LimitCostConst.LIMIT_COST_KEY_4 = 4 -- 第四类小球
LimitCostConst.LIMIT_COST_KEY_5 = 5 -- 第五类小球
LimitCostConst.LIMIT_COST_KEY_6 = 6 -- 第六类小球

LimitCostConst.LIMIT_UP_HERO = 1 -- 武将界限突破
LimitCostConst.LIMIT_UP_EQUIP = 2 -- 装备界限突破

LimitCostConst.MAX_SUIT_ID = 3001

LimitCostConst.RES_NAME = {
	[LimitCostConst.LIMIT_COST_KEY_1] = {
		imageButtom = {"img_limit_01", "img_limit_01"},
		imageFront = {"img_limit_gold_hero01a", "img_limit_gold_hero01a"},
		ripple = {"green", "green"},
		imageName = {"txt_limit_01", "txt_limit_01"},
		effectBg = {"effect_tujiegreen", "effect_tujiegreen"}, --背景特效
		moving = {"moving_tujieballgreen", "moving_tujieballgreen"},
		effectReceive = {"effect_tujiedianjigreen", "effect_tujiedianjigreen"}, --材料到达后的特效
		effectFull = {"effect_tujie_mannenglianggreen", "effect_tujie_mannenglianggreen"}, --材料满了的特效
		smoving = {"smoving_tujiehuangreen", "smoving_6in1tujiehuangreen"}
	},
	[LimitCostConst.LIMIT_COST_KEY_2] = {
		imageButtom = {"img_limit_02", "img_limit_02"},
		imageFront = {"img_limit_gold_hero02a", "img_limit_gold_hero02a"},
		ripple = {"blue", "blue"},
		imageName = {"txt_limit_02", "txt_limit_02"},
		effectBg = {"effect_tujieblue", "effect_tujieblue"},
		moving = {"moving_tujieballblue", "moving_tujieballblue"},
		effectReceive = {"effect_tujiedianjiblue", "effect_tujiedianjiblue"},
		effectFull = {"effect_tujie_mannengliangblue", "effect_tujie_mannengliangblue"},
		smoving = {"smoving_tujiehuanblue", "smoving_6in1tujiehuanblue"}
	},
	[LimitCostConst.LIMIT_COST_KEY_3] = {
		imageButtom = {"img_limit_03", "img_limit_03"},
		imageFront = {"img_limit_gold_hero05a", "img_limit_gold_hero05a"},
		ripple = {"purple", "purple"},
		imageName = {"txt_limit_03", "txt_limit_01d"},
		effectBg = {"effect_tujiepurple", "effect_tujiepurple"},
		moving = {"moving_tujieballpurple", "moving_tujieballpurple"},
		effectReceive = {"effect_tujiedianjipurple", "effect_tujiedianjipurple"},
		effectFull = {"effect_tujie_mannengliangpurple", "effect_tujie_mannengliangpurple"},
		smoving = {"smoving_tujiehuanpurple", "smoving_6in1tujiehuanpurple"}
	},
	[LimitCostConst.LIMIT_COST_KEY_4] = {
		imageButtom = {"img_limit_04", "img_limit_04"},
		imageFront = {"img_limit_gold_hero06a", "img_limit_gold_hero06a"},
		ripple = {"orange", "orange"},
		imageName = {"txt_limit_04", "txt_limit_02d"},
		effectBg = {"effect_tujieorange", "effect_tujieorange"},
		moving = {"moving_tujieballorange", "moving_tujieballorange"},
		effectReceive = {"effect_tujiedianjiorange", "effect_tujiedianjiorange"},
		effectFull = {"effect_tujie_mannengliangorange", "effect_tujie_mannengliangorange"},
		smoving = {"smoving_tujiehuanorange", "smoving_6in1tujiehuanorange"},
	},
	-- effect_tujieorange 通用
	-- moving_tujieballorange 通用
	-- effect_tujiedianjired
	-- effect_tujie_mannengliangorange 1
	-- smoving_tujiehuanorange
	[LimitCostConst.LIMIT_COST_KEY_5] = {
		imageButtom = {"", "img_limit_gold_hero03"},
		imageFront = {"", "img_limit_gold_hero03a"},
		ripple = {"", "red"},
		imageName = {"", "txt_limit_03c"},
		effectBg = {"", "effect_tujieorange"},
		moving = {"", "moving_tujieballred"},
		effectReceive = {"", "effect_tujiedianjired"},
		effectFull = {"", "effect_tujie_mannengliangred"},
		smoving = {"", "smoving_6in1tujiehuanred"}
	},
	[LimitCostConst.LIMIT_COST_KEY_6] = {
		imageButtom = {"", "img_limit_gold_hero04"},
		imageFront = {"", "img_limit_gold_hero04a"},
		ripple = {"", "yellow"},
		imageName = {"", "txt_limit_04c"},
		effectBg = {"", "effect_tujieorange"},
		moving = {"", "moving_tujieballyellow"},
		effectReceive = {"", "effect_tujiedianjiyellow"},
		effectFull = {"", "effect_tujie_mannengliangyellow"},
		smoving = {"", "smoving_6in1tujiehuanyellow"}
	}
}

LimitCostConst.FRON_RES={
	[LimitCostConst.LIMIT_UP_EQUIP]={
		[1]="",
		[2]="img_limit_02d",
		[3]="img_limit_03d",
		[4]="img_limit_04d",
	}
}

return readOnly(LimitCostConst)
