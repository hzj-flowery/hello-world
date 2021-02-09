local FightSignalConst =
{
    SIGNAL_FINISH_WAVE = "finish_wave",			--结束波次
    SIGNAL_START_WAVE = "start_cg",				--开始波次
    SIGNAL_IN_COMBINE = "in_combine_skill",		--合击技能中
    SIGNAL_OUT_COMBINE = "out_combine_skill",		--出了合击技能
    SIGNAL_DROP_ITEM = "drop_item",				--掉落物品
    SIGNAL_ROUND_START = "round_start",			--回合开始
    SIGNAL_START_ATTACK = "start_attack",			--开始攻击
    SIGNAL_HURT_VALUE = "hurt_value",				--伤害数值
    SIGNAL_ATTACK_FINISH = "attack_finish",		--攻击结束
    SIGNAL_RUN_MAP_FINISH = "finish_run_map",		--跑图完成
    SIGNAL_CHECK_LEAD = "check_lead",				--检查引导
    SIGNAL_PLAY_COMBINE_FLASH = "combine_flash",	--播放合击flash
    SIGNAL_UNIT_DIE = "unit_die",					--人物死亡
    SIGNAL_JUMP_TALK = "jump_talk",				--入场后的对话
    SIGNAL_SHOW_ENDCG = "show_endcg",				--播放胜负已分
    SIGNAL_JUMP_WAVE = "jump_wave",				--跳过波次
    SIGNAL_DO_FINAL_SLOW = "do_final_slow",		--最后慢动作
    SIGNAL_PLAY_PET_SKILL = "play_pet_skill",		--播放神兽技能

    SIGNAL_SHOW_HERO_END = "show_hero_end",         --播放玩英雄展示
    SIGNAL_STORY_OPEN_CHAT_END = "story_open_chat_end",        --剧情(入场)对话对话结束
    SIGNAL_SPEED_ANIM_END = "speed_anim_end",       --播放动画完成
    SIGNAL_UNIT_CHAT_END = "unit_chat_end",         --武将对话完成
    SIGNAL_ATTACK_CHECK_CHAT = "attack_check_chat", --攻击前检查攻击者对话
    SIGNAL_COMBINE_SHOW_END = "combine_show_end",   --合计播放完动画
    SIGNAL_FIGHT_END = "fight_end",         --战斗结束

    SIGNAL_FIGHT_ADD_HURT = "fight_add_hurt",       --战斗收击
    SIGNAL_ADD_HURT_END = "add_hurt_end",           --增加手机结束

    SIGNAL_HISTORY_SHOW = "fight_history_show",             --历代名将开始show
    SIGNAL_HISTORY_SHOW_END = "fight_history_show_end",     --历代名将show结束
    SIGNAL_HISTORY_BUFF = "fight_history_buff",             --历代名将上buff

    SIGNAL_ROUND_BUFF_CHECK = "round_buff_check",           --回合buff检查
}

return FightSignalConst