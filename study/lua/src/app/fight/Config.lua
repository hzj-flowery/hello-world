local config = {}

--	战斗速度
config.SPEED_DOUBLE_1 = 1.1
config.SPEED_DOUBLE_2 = 1.3
config.SPEED_DOUBLE_3 = 1.55
config.SPEED_DOUBLE_4 = 1.8

config.s = 0
config.cellWidth = 55
config.distance = 1300
config.offsetX = {286, 482, 853, 1094}
config.offsetY = {258, 136, 0}
config.getcellpos = function(self, line, row, posFix)
    local fix = posFix or 1
    local offsetX = self.offsetX[line] * fix
    local offsetY = self.offsetY[row]
    local startPos = cc.p(offsetX, -self.offsetY[2])
    local endPos = cc.p(0, -self.offsetY[2] + self.distance)
    local positionDelta = cc.pSub(endPos, startPos)
    local t = offsetY / self.distance
    -- local change = cc.pMul(positionDelta, t)
    local p = cc.pAdd(startPos, cc.pMul(positionDelta, t))
    if line == 1 or line == 4 then
        p.y = p.y - 1
    end
    return p.x, p.y, 1 - t
end
config.speed = 15
config.jumpSpeed = 50
config.rows = {
    {1 - config.offsetY[1] / config.distance},
    {1 - config.offsetY[2] / config.distance},
    {1}
}

config.cells = {
    {
        {config:getcellpos(1, 1, -1)}, --1
        {config:getcellpos(1, 2, -1)}, --2
        {config:getcellpos(1, 3, -1)}, --3
        {config:getcellpos(2, 1, -1)}, --4
        {config:getcellpos(2, 2, -1)}, --5
        {config:getcellpos(2, 3, -1)}, --6
        {config:getcellpos(3, 1, -1)}, --7
        {config:getcellpos(3, 2, -1)}, --8
        {config:getcellpos(3, 3, -1)}, --9
        {config:getcellpos(4, 1, -1)}, --10
        {config:getcellpos(4, 2, -1)}, --11
        {config:getcellpos(4, 3, -1)} --12
    },
    {
        {config:getcellpos(1, 1)}, --1
        {config:getcellpos(1, 2)}, --2
        {config:getcellpos(1, 3)}, --3
        {config:getcellpos(2, 1)}, --4
        {config:getcellpos(2, 2)}, --5
        {config:getcellpos(2, 3)}, --6
        {config:getcellpos(3, 1)}, --7
        {config:getcellpos(3, 2)}, --8
        {config:getcellpos(3, 3)}, --9
        {config:getcellpos(4, 1)}, --10
        {config:getcellpos(4, 2)}, --11
        {config:getcellpos(4, 3)} --12
    }
}

config.getScale = function(y)
    local p = 1 - (y + config.offsetY[2]) / (config.distance * 4)
    --print("config.getScale", y, p)
    return p
end

--
config.campLeft = 1
config.campRight = 2

config.getIdlePosition = function(camp, cell)
    return config.cells[camp][cell][1], config.cells[camp][cell][2]
end

config.PetEnterPos = {
    [config.campLeft] = {-320, -20},
    [config.campRight] = {320, -20}
}

config.getPetEnterPosition = function(camp)
    return config.PetEnterPos[camp]
end

config.interval = 1 / 30

config.drawRefLine = false

config.ZORDER_BLACK_LAYER = 2000 --黑屏的zorder
config.ZORDER_SKILL_UNIT = 3000 --释放技能时候人物提高到的zorder
config.SHOW_TIME = 1 --战斗前展示时间
config.SKILL_NAME_MOVE_TIME = 0.2 --战斗技能弹字上飘时间
config.SKILL_NAME_STAY_TIME = 0.3 --战斗技能头顶停留时间
config.UNIT_TALK_SHOW_TIME = 4 --战斗喊话显示时长
config.UNIT_TALK_Z_ORDER = 4000 --说话的zorder
config.BLACK_LAYER_ALPHA = 0.65 --技能黑屏的透明度
config.SHOW_IDLE2 = false --是否表现蓄力idle2
config.SHOW_BUFF_PRE_ATTACK_TIME = 0.2 --战斗前展示buff的时间
config.SHOW_JUMP_ROUND = 3 --第n回合开始显示跳过

config.SLOW_ACTION_RET = 0.3 --慢动作的速率
config.SLOW_SCREEN_TIME = 0.06 --慢动作闪频时间
config.END_DELAY_TIME = 0.1 --胜负已决到结算出来的时间

config.FIRST_FIRST_TIME = {1.7} --第一场战斗入场间隔
config.FIRST_SHOW_STAGEID = 202 --第一场战斗展示的stageId
config.FIRST_LAST_WALK = 206 --最后一个走进场的
config.XINGCAI_WAIT_TIME = 1 --星彩进场后等待的时间
config.JUMP_IN_WAIT_TIME = 0.5

config.GAME_GROUND_FIX = 87

config.HURT_TYPE_SHANBI = 1
config.HURT_TYPE_BAOJI = 2
config.HURT_TYPE_ZHAOJIA = 3
config.HURT_TYPE_WUDI = 4
config.HURT_TYPE_XISHOU = 5

config.BUFF_REBORN_ID = 2309
config.REBOEN_EFFECT = "sp_4020029"

config.SCALE_ACTOR = 0.8 --战斗spine缩放
config.PET_SHADOW_SCALE = 2.7

--深受战斗cutin
config.PET_SKILL_ANIM = {
    "moving_shenshouzhandou_left",
    "moving_shenshouzhandou_right"
}

config.PET_COLOR_BG = {
    [1] = "",
    [2] = "",
    [3] = "blue",
    [4] = "purple",
    [5] = "orange",
    [6] = "red"
}

--写死一波技能字体，到时候改
config.PANDA_SKILL_ANIM = {
    "moving_shenshouzhandou_left_xiongmao",
    "moving_shenshouzhandou_right_xiongmao"
}

config.LU_SKILL_ANIM = {
    "moving_shenshouzhandou_left_lu",
    "moving_shenshouzhandou_right_lu"
}

config.LIEHUOHU_SKILL_ANIM = {
    "moving_shenshouzhandou_left_liehuohu",
    "moving_shenshouzhandou_right_liehuohu"
}

config.QINGLUAN_SKILL_ANIM = {
    "moving_shenshouzhandou_left_qingluan",
    "moving_shenshouzhandou_right_qingluan"
}

config.QINGLONG_SKILL_ANIM = {
    "moving_shenshouzhandou_left_qinglong",
    "moving_shenshouzhandou_right_qinglong"
}

config.XUANWU_SKILL_ANIM = {
    "moving_shenshouzhandou_left_xuanwu",
    "moving_shenshouzhandou_right_xuanwu"
}

config.GOUKUN_SKILL_ANIM = {
    "moving_shenshouzhandou_left_kun",
    "moving_shenshouzhandou_right_kun"
}

config.BAIHU_SKILL_ANIM = {
    "moving_shenshouzhandou_left_baihu",
    "moving_shenshouzhandou_right_baihu"
}

config.QILIN_SKILL_ANIM = {
    "moving_shenshouzhandou_left_qilin",
    "moving_shenshouzhandou_right_qilin"
}

config.NEED_PET_SHOW = false --是否需要神兽开场跳入展示
config.petIdlePos = {
    [config.campLeft] = {-1000, 50},
    [config.campRight] = {1000, 50}
}
config.getPetIdlePosition = function(camp)
    return config.petIdlePos[camp]
end

config.HURT_TYPE_TAOYUAN = 99
config.HEAL_TYPE_TAOYUAN = 99

config.MARK = {
    [1] = "sp_18taoyuan"
}

--删除buff时候产生的效果类型
-- 1:加血 2:减血 3:加怒 4:减怒
config.REMOVE_BUFF_TYPE = {
    -- ["addHp"] = 1,
    -- ["removeAnger"] = 2,
    [1] = {name = "addHp", configId = 0, addType = 2},
    [2] = {name = "DecHp", configId = 0, addType = 1},
    [3] = {name = "addAnger", configId = 2108, addType = 2, buffRes = "sp_15nuqijia"},
    [4] = {name = "removeAnger", configId = 2109, addType = 1, buffRes = "sp_16nuqijian"}
}

-- config.BUFF_POS_HEAD = 1
-- config.BUFF_POS_MIDDLE = 2
-- config.BUFF_POS_FOOT = 3

-- config.BUFF_TYPE_HEAD = 1
-- config.BUFF_TYPE_BODY = 2
--0普通 1桃园结义 2分摊伤害 3溢出伤害治疗 4溢出治疗
config.ADD_HURT_ID = {
    [1] = 99,
    [2] = 100,
    [3] = 99,
    [4] = 99
}
config.getAddHurtId = function(id)
    if config.ADD_HURT_ID[id] then
        return config.ADD_HURT_ID[id]
    end
    return 0
end

config.FLASH_BUFF_ID = 2376
config.FLASH_BUFF_ID2 = 2485

config.getFlashAction = function(country)
    local camp = country
    if camp == 0 then
        camp = math.random(1, 4)
    end
    return config.FLASH_ACTION[camp]
end

config.FLASH_ACTION = {
    [1] = "wei",
    [2] = "shu",
    [3] = "wu",
    [4] = "qun"
}

config.HISTORY_SKILL_ANIM = {
    -- --紫色品质播放动画
    -- [4] =
    -- {
    -- 	"moving_lidaimingjiang_chuchangleft",
    -- 	"moving_lidaimingjiang_chuchangright",
    -- },
    -- -- 橙色品质播放动画
    -- [5] =
    -- {
    -- 	"moving_lidaimingjiang_chuchangleft_orange",
    -- 	"moving_lidaimingjiang_chuchangright_orange",
    -- }
    --紫色品质播放动画

    [4] = "moving_lidaimingjiang_chuchang",
    -- 橙色品质播放动画
    [5] = "moving_lidaimingjiang_chuchang"
}

config.getHistoryAnimShow = function(quality)
    return config.HISTORY_SKILL_ANIM[quality]
end

config.NORMAL_ATTACK = 1
config.PET_ATTACK = 2
config.HISTORY_ATTACK = 3

config.HP_TEST_ON = false --是否开启战斗制定单位血量输出
config.HP_TEST_ID = 103 --开启指定战斗血量输出制定id

return config
