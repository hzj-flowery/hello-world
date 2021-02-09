export class FightConfig {
    //战斗速度
    public static readonly SPEED_DOUBLE_1 = 1.1
    public static readonly SPEED_DOUBLE_2 = 1.3
    public static readonly SPEED_DOUBLE_3 = 1.55
    public static readonly SPEED_DOUBLE_4 = 1.8

    public static readonly s = 0
    public static readonly cellWidth = 55
    public static readonly distance = 1300
    public static readonly offsetX = [286, 482, 853, 1094];
    public static readonly offsetY = [258, 136, 0]

    public static getcellpos(line: number, row: number, posFix?: number): number[] {
        let fix = posFix || 1;
        let offsetX = this.offsetX[line - 1] * fix;
        let offsetY = this.offsetY[row - 1];
        let t = offsetY / this.distance;
        let px = offsetX + (-offsetX * t);
        let py = -this.offsetY[1] + (this.distance * t);
        if (line == 1 || line == 4)
            py = py - 1
        return [px, py, 1 - t];
    }
    public static readonly speed = 15
    public static readonly jumpSpeed = 50
    public static readonly rows = [
        1 - FightConfig.offsetY[0] / FightConfig.distance,
        1 - FightConfig.offsetY[1] / FightConfig.distance,
        1
    ]

    public static readonly cells: number[][][] = [
        [
            FightConfig.getcellpos(1, 1, -1),
            FightConfig.getcellpos(1, 2, -1),
            FightConfig.getcellpos(1, 3, -1),

            FightConfig.getcellpos(2, 1, -1),
            FightConfig.getcellpos(2, 2, -1),
            FightConfig.getcellpos(2, 3, -1),

            FightConfig.getcellpos(3, 1, -1),
            FightConfig.getcellpos(3, 2, -1),
            FightConfig.getcellpos(3, 3, -1),

            FightConfig.getcellpos(4, 1, -1),
            FightConfig.getcellpos(4, 2, -1),
            FightConfig.getcellpos(4, 3, -1),

        ],
        [
            FightConfig.getcellpos(1, 1),
            FightConfig.getcellpos(1, 2),
            FightConfig.getcellpos(1, 3),

            FightConfig.getcellpos(2, 1),
            FightConfig.getcellpos(2, 2),
            FightConfig.getcellpos(2, 3),

            FightConfig.getcellpos(3, 1),
            FightConfig.getcellpos(3, 2),
            FightConfig.getcellpos(3, 3),

            FightConfig.getcellpos(4, 1),
            FightConfig.getcellpos(4, 2),
            FightConfig.getcellpos(4, 3),
        ]
    ]

    public static getScale(y) {
        let p = 1 - (y + FightConfig.offsetY[1]) / (FightConfig.distance * 4)
        //print("public static readonly getScale", y, p)
        return p
    }

    //
    public static readonly campLeft = 1
    public static readonly campRight = 2

    public static getIdlePosition(camp, cell): number[] {
        return [FightConfig.cells[camp - 1][cell - 1][0], FightConfig.cells[camp - 1][cell - 1][1]];
    }

    public static readonly PetEnterPos =
        [
            [-320, -20],
            [320, -20],
        ]

    public static getPetEnterPosition(camp) {
        return FightConfig.PetEnterPos[camp - 1]
    }

    public static readonly interval = 1 / 30

    public static readonly drawRefLine = false

    public static readonly ZORDER_BLACK_LAYER = 2000	//黑屏的zorder
    public static readonly ZORDER_SKILL_UNIT = 3000		//释放技能时候人物提高到的zorder
    public static readonly SHOW_TIME = 1		//战斗前展示时间
    public static readonly SKILL_NAME_MOVE_TIME = 0.2	//战斗技能弹字上飘时间
    public static readonly SKILL_NAME_STAY_TIME = 0.3	//战斗技能头顶停留时间
    public static readonly UNIT_TALK_SHOW_TIME = 4		//战斗喊话显示时长
    public static readonly UNIT_TALK_Z_ORDER = 4000		//说话的zorder
    public static readonly BLACK_LAYER_ALPHA = 0.65		//技能黑屏的透明度
    public static readonly SHOW_IDLE2 = false			//是否表现蓄力idle2
    public static readonly SHOW_BUFF_PRE_ATTACK_TIME = 0.2		//战斗前展示buff的时间
    public static readonly SHOW_JUMP_ROUND = 3			//第n回合开始显示跳过

    public static readonly SLOW_ACTION_RET = 0.3		//慢动作的速率
    public static readonly SLOW_SCREEN_TIME = 0.06		//慢动作闪频时间
    public static readonly END_DELAY_TIME = 0.1			//胜负已决到结算出来的时间

    public static readonly FIRST_FIRST_TIME = [1.7]		//第一场战斗入场间隔
    public static readonly FIRST_SHOW_STAGEID = 202		//第一场战斗展示的stageId
    public static readonly FIRST_LAST_WALK = 206		//最后一个走进场的
    public static readonly XINGCAI_WAIT_TIME = 1	//星彩进场后等待的时间
    public static readonly JUMP_IN_WAIT_TIME = 0.5

    public static readonly GAME_GROUND_FIX = 87

    public static readonly HURT_TYPE_SHANBI = 1
    public static readonly HURT_TYPE_BAOJI = 2
    public static readonly HURT_TYPE_ZHAOJIA = 3
    public static readonly HURT_TYPE_WUDI = 4
    public static readonly HURT_TYPE_XISHOU = 5

    public static readonly BUFF_REBORN_ID = 2309
    public static readonly REBOEN_EFFECT = "sp_4020029"

    public static readonly SCALE_ACTOR = 0.4		//战斗spine缩放
    public static readonly PET_SHADOW_SCALE = 2.7

    //深受战斗cutin
    public static readonly PET_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left",
            "moving_shenshouzhandou_right",
        ]

    public static readonly PET_COLOR_BG =
        [
            "",
            "",
            "blue",
            "purple",
            "orange",
            "red",
        ]


    //写死一波技能字体，到时候改
    public static readonly PANDA_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_xiongmao",
            "moving_shenshouzhandou_right_xiongmao",
        ]

    public static readonly LU_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_lu",
            "moving_shenshouzhandou_right_lu",
        ]

    public static readonly LIEHUOHU_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_liehuohu",
            "moving_shenshouzhandou_right_liehuohu",
        ]

    public static readonly QINGLUAN_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_qingluan",
            "moving_shenshouzhandou_right_qingluan",
        ]

    public static readonly QINGLONG_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_qinglong",
            "moving_shenshouzhandou_right_qinglong",
        ]

    public static readonly XUANWU_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_xuanwu",
            "moving_shenshouzhandou_right_xuanwu",
        ]

    public static readonly GOUKUN_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_kun",
            "moving_shenshouzhandou_right_kun",
        ]

    public static readonly BAIHU_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_baihu",
            "moving_shenshouzhandou_right_baihu",
        ]

    public static readonly QILIN_SKILL_ANIM =
        [
            "moving_shenshouzhandou_left_qilin",
            "moving_shenshouzhandou_right_qilin",
        ]

    public static readonly NEED_PET_SHOW = false		//是否需要神兽开场跳入展示
    public static readonly petIdlePos =
        [
            [- 1000, 50],
            [1000, 50],
        ]
    public static getPetIdlePosition(camp) {
        return FightConfig.petIdlePos[camp - 1]
    }

    public static readonly HURT_TYPE_TAOYUAN = 99
    public static readonly HEAL_TYPE_TAOYUAN = 99

    public static readonly MARK =
        [
            "sp_18taoyuan",
        ]

    //删除buff时候产生的效果类型
    //1: 加血 2: 减血 3: 加怒 4: 减怒
    public static readonly REMOVE_BUFF_TYPE: any[] =
        [
            //["addHp"] = 1,
            //["removeAnger"] = 2,
            { name: "addHp", configId: 0, addType: 2 },
            { name: "DecHp", configId: 0, addType: 1 },
            { name: "addAnger", configId: 2108, addType: 2, buffRes: "sp_15nuqijia" },
            { name: "removeAnger", configId: 2109, addType: 1, buffRes: "sp_16nuqijian" },
        ]

    //public static readonly BUFF_POS_HEAD = 1
    //public static readonly BUFF_POS_MIDDLE = 2
    //public static readonly BUFF_POS_FOOT = 3

    //public static readonly BUFF_TYPE_HEAD = 1
    //public static readonly BUFF_TYPE_BODY = 2
    //0普通 1桃园结义 2分摊伤害 3溢出伤害治疗 4溢出治疗
    public static readonly ADD_HURT_ID =
        [
            99,
            100,
            99,
            99,
        ]
    public static getAddHurtId(id) {
        if (FightConfig.ADD_HURT_ID[id - 1])
            return FightConfig.ADD_HURT_ID[id - 1]
        return 0
    }

    public static readonly FLASH_BUFF_ID = 2376
    public static readonly FLASH_BUFF_ID2 = 2485;

    public static getFlashAction(country) {
        let camp = country;
        if (camp == 0)
            camp = Math.floor(Math.random() * 4) + 1;
        return FightConfig.FLASH_ACTION[camp - 1];
    }

    public static readonly FLASH_ACTION =
        [
            "wei",
            "shu",
            "wu",
            "qun",
        ]

    public static readonly HISTORY_SKILL_ANIM =
        [
            //紫色品质播放动画
            [],
            [],
            [],

            [
                "moving_lidaimingjiang_chuchang",
              //  "moving_lidaimingjiang_chuchangright",
            ],
            //橙色品质播放动画
            [
                "moving_lidaimingjiang_chuchang",
           //     "moving_lidaimingjiang_chuchangright_orange",
            ]
        ]

    public static getHistoryAnimShow(quality, camp?) {
        return FightConfig.HISTORY_SKILL_ANIM[quality - 1][0]
    }


    public static readonly NORMAL_ATTACK = 1
    public static readonly PET_ATTACK = 2
    public static readonly HISTORY_ATTACK = 3

    public static readonly HP_TEST_ON = false   //是否开启战斗制定单位血量输出
    public static readonly HP_TEST_ID = 103     //开启指定战斗血量输出制定id
}