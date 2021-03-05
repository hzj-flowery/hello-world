local language={}

language["report_parse_title"]  = "战报解析"

language["txt_report_print_begin"] = "开始打印战报内容"

language["txt_report_print_end"] = "打印战报内容结束"

language["txt_report_fight_result_win"] = "战斗结果:胜利"

language["txt_report_fight_result_lose"] = "战斗结果:失败"

language["txt_report_fight_first_order"] = "$c901_#attackCountry#$ 阵营角色先出手"

language["txt_report_fight_units"] = "$c901_#country#$ 阵营:"

language["txt_report_fight_over"] = "[本场战斗结束，场上剩余角色]"

language["txt_report_fight_wave_num"] = "波次：$c901_#waveNum#$"

language["txt_report_fight_wave_index"] = "[ 第$c901_#waveIndex#$波战报信息：]"

-- 角色信息打印
-- 初始：普通角色
language["txt_report_fight_unit_init_info"] = "$c901_#unitCell#$号位: $c901_#unitName#$, 初始怒气 $c902_#unitAnger#$, 初始血量 $c903_#unitHp#$, 突破等级 $c901_#unitLevel#$, 界限等级 $c901_#limitLevel#$"
-- 初始：主角无变身卡
language["txt_report_fight_unit_init_info_main_1"] = "$c901_#unitCell#$号位主角: $c901_#unitName#$（无变身卡）, 初始怒气 $c902_#unitAnger#$, 初始血量 $c903_#unitHp#$, 突破等级 $c901_#unitLevel#$, 界限等级 $c901_#limitLevel#$"
-- 初始：主角有变身卡
language["txt_report_fight_unit_init_info_main_2"] = "$c901_#unitCell#$号位主角: $c901_#unitName#$(有变身卡$c901_#changeName#$), 初始怒气 $c902_#unitAnger#$, 初始血量 $c903_#unitHp#$, 突破等级 $c901_#unitLevel#$, 界限等级 $c901_#limitLevel#$"
-- 初始：神兽
language["txt_report_fight_pet_init_info"] = "第$c901_#petIndex#$个神兽是: $c901_#petName#$，神兽id是 $c901_#petId#$, 等级 $c901_#petLevel#$"
-- 最终：普通角色
language["txt_report_fight_unit_final_info"] = "$c901_#unitCell#$号位: $c901_#unitName#$, 最终怒气 $c902_#unitAnger#$, 最终血量 $c903_#unitHp#$,满血 $c903_#maxHp#$, 突破等级 $c901_#unitLevel#$, 界限等级 $c901_#limitLevel#$"
-- 最终：主角无变身卡
language["txt_report_fight_unit_final_info_main_1"] = "$c901_#unitCell#$号位主角： $c901_#unitName#$(无变身卡), 最终怒气 $c902_#unitAnger#$, 最终血量 $c903_#unitHp#$,满血 $c903_#maxHp#$, 突破等级 $c901_#unitLevel#$, 界限等级 $c901_#limitLevel#$"
-- 最终：主角有变身卡
language["txt_report_fight_unit_final_info_main_2"] = "$c901_#unitCell#$号位主角： $c901_#unitName#$，(有变身卡$c901_#changeName#$), 最终怒气 $c902_#unitAnger#$, 最终血量 $c903_#unitHp#$,满血 $c903_#maxHp#$, 突破等级 $c901_#unitLevel#$, 界限等级 $c901_#limitLevel#$"


-- 是否有神兽出场
language["txt_report_fight_no_pet"] = "本次战斗场上没有神兽出场"
language["txt_report_fight_have_pet"] = "本次战斗场上有神兽出场"
-- 左右没有神兽出场
language["txt_report_fight_no_pet_country"] = "本次战斗 $c901_#country#$ 阵营没有神兽出场"
-- 左右有神兽出场
language["txt_report_fight_pets"] = "本次战斗 $c901_#country#$ 阵营有神兽出场"

-- 战斗轮次
language["txt_report_fight_round"] = "[ 第 $c901_#roundIndex#$ 轮 第 $c901_#attackIndex#$ 次战斗信息开始打印 ]"
-- 战斗轮次-2
language["txt_report_fight_round_2"] = "行动完毕后 $c901_#country#$ 阵营 $c901_#cell#$ 号位，行动了 $c902_#moveStep#$ 次，剩余怒气 $c903_#leftAnger#$"


-- 神兽发起攻击
language["txt_report_fight_battle_pet_start"] = "本次攻击由 $c901_#petCountry#$ 阵营$c901_#petName#$发起，使用技能 $c901_#skillId#$ 对 $c901_#targetNum#$ 个目标使用技能"
language["txt_report_fight_battle_pet_damage"] = "本次攻击由 $c901_#petCountry#$ 阵营$c901_#petName#$发起，使用技能 $c901_#skillId#$ 对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位目标，造成 $c902_#damage1#$ 伤害，实际伤害 $c902_#damage2#$ 剩余血量 $c903_#leftHp#$"
language["txt_report_fight_battle_pet_treat"] = "本次攻击由 $c901_#petCountry#$ 阵营$c901_#petName#$发起，使用技能 $c901_#skillId#$ 对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位目标，加血 $c903_#damage1#$ ，实际加血 $c903_#damage2#$ 剩余血量 $c903_#leftHp#$"

-- 角色发起攻击
language["txt_report_fight_battle_unit_start"] = "本次攻击由 $c901_#attackCountry#$ 阵营 $c901_#attackCell#$ 号位发起，攻击方式是 $c901_#attackTypeName#$ ，技能id是 $c901_#skillId#$ ，攻击完成自己 $c901_#aliveName#$"
language["txt_report_fight_battle_unit_start_2"] = "追击：由 $c901_#attackCountry#$ 阵营 $c901_#attackCell#$ 号位发起，攻击方式是 $c901_#attackTypeName#$ ，技能id是 $c901_#skillId#$ ，攻击完成自己 $c901_#aliveName#$"
language["txt_report_fight_battle_unit_start_6"] = "被动攻击：由 $c901_#attackCountry#$ 阵营 $c901_#attackCell#$ 号位发起，攻击方式是 $c901_#attackTypeName#$ ，技能id是 $c901_#skillId#$ ，攻击完成自己 $c901_#aliveName#$"


-- 角色无法行动
language["txt_report_fight_battle_unit_start_fail"] = "$c901_#country1#$ 阵营 $c901_#cell1#$ 号位角色，无法行动，因为有buff $c904_#buffId#$ (由 $c901_#country2#$ 阵营 $c901_#cell2#$ 号位触发)"
language["txt_report_fight_battle_unit_start_fail_pet"] = "$c901_#country1#$ 阵营 $c901_#cell1#$ 号位角色，无法行动，因为有buff $c904_#buffId#$ (由 $c901_#country2#$ 阵营神兽触发)"


-- 角色受伤
language["txt_report_fight_battle_unit_damage_1"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标造成 $c902_#damage1#$ 点伤害，目标实际受到伤害 $c902_#damage2#$ 剩余血量 $c903_#leftHp#$"
language["txt_report_fight_battle_unit_damage_2"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标造成 $c902_#damage1#$ 点暴击伤害，目标实际受到伤害 $c902_#damage2#$ 剩余血量 $c903_#leftHp#$"
language["txt_report_fight_battle_unit_damage_5"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标造成伤害被吸收，目标实际受到伤害 $c902_#damage2#$ 剩余血量 $c903_#leftHp#$"

-- 角色治疗
language["txt_report_fight_battle_unit_treat"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标进行治疗，回复了 $c903_#damage1#$ 血量，实际回复 $c903_#damage2#$ 剩余血量 $c903_#leftHp#$"

-- 类别1，桃园结义；后面可以扩展
language["txt_report_fight_battle_add_target_damage_1"] = "攻击对 $c901_#targetCell1#$ 号位目标造成的伤害分摊到 $c901_#targetCell2#$ 号位目标，分摊伤害 $c902_#damage1#$ ，实际分摊伤害 $c902_#damage2#$ ,分摊目标剩余血量 $c903_#leftHp#$"

-- 攻击失败
language["txt_report_fight_battle_unit_damage_fail_1"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标没有造成伤害，因为目标 闪避了"
language["txt_report_fight_battle_unit_damage_fail_3"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标没有造成伤害，因为目标 招架了"
language["txt_report_fight_battle_unit_damage_fail_4"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标没有造成伤害，因为目标 无敌了"
language["txt_report_fight_battle_unit_damage_fail_5"] = "对 $c901_#targetCountry#$ 阵营 $c901_#enemyCell#$ 号位目标没有造成伤害，因为攻击效果被 吸收了"


-- 怒气变化
language["txt_report_fight_battle_anger_change_1"] = "对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位目标减少怒气 $c902_#angerValue#$ 剩余怒气 $c903_#leftAnger#$ 点"
language["txt_report_fight_battle_anger_change_2"] = "对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位目标增加怒气 $c903_#angerValue#$ 剩余怒气 $c903_#leftAnger#$ 点"


-- 攻击完成，加buff
language["txt_report_fight_battle_add_buff"] = "对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位目标添加buff，buffId $c904_#effectId#$ ，buff由 $c901_#attackCountry#$ 阵营 $c901_#attackCell#$ 号位触发，buff持续 $c901_#round#$ 回合"
language["txt_report_fight_battle_add_buff_pet"] = "对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位目标添加buff，buffId $c904_#effectId#$ ，buff由 $c901_#attackCountry#$ 阵营神兽触发，buff持续 $c901_#round#$ 回合"


-- 攻击完成，移除buff
language["txt_report_fight_battle_del_buf"] = "攻击完成，清除 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位目标的buff效果, 待清除的buffId： $c904_#effectId#$"


-- 全局buff
language["txt_report_fight_battle_effects_1"] = "因为 $c901_#attackCountry#$ 阵营 $c901_#attackCell#$ 号位附加的buffId $c904_#buffId#$ ，引起 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位减少血量 $c902_#damage1#$ ，实际减少 $c902_#damage2#$ ，剩余血量 $c903_#leftHp#$"
language["txt_report_fight_battle_effects_2"] = "因为 $c901_#attackCountry#$ 阵营 $c901_#attackCell#$ 号位附加的buffId $c904_#buffId#$ ，引起 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位回复血量 $c903_#damage1#$ ，实际回复 $c903_#damage2#$ ，剩余血量 $c903_#leftHp#$"
language["txt_report_fight_battle_effects_no_hurt"] = "本次攻击 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位附加的buffId $c904_#buffId#$ 生效了。"


language["txt_report_fight_battle_effects_pet_1"] = "因为 $c901_#attackCountry#$ 阵营神兽 $c901_#petName#$ (神兽id $c901_#petId#$ ) 的技能 $c901_#skillId#$ 对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位造成 $c902_#damage1#$ 点伤害，实际伤害 $c902_#damage2#$，剩余血量 $c903_#leftHp#$"
language["txt_report_fight_battle_effects_pet_2"] = "因为 $c901_#attackCountry#$ 阵营神兽 $c901_#petName#$ (神兽id $c901_#petId#$ ) 的技能 $c901_#skillId#$ 对 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号位回复 $c903_#damage1#$ 点血量，实际回复 $c903_#damage2#$，剩余血量 $c903_#leftHp#$"


-- 角色引起的buff掉血
language["txt_report_fight_buff_effects_1"] = "本次攻击前 $c901_#attackCountry#$ 阵营 $c902_#targetCell#$ 号位角色，因为buff $c904_#buffId#$ ( $c901_#buffAttackCountry#$ 号阵营 $c901_#buffAttackCell#$ 号位添加，剩余 $c901_#buffLeftNum#$ 次) 掉血 $c902_#damage1#$, 实际掉血 $c902_#damage2#$ 剩余血量 $c903_#leftHp#$"
-- 神兽引起的buff掉血
language["txt_report_fight_buff_effects_pets_1"] = "本次攻击前 $c901_#attackCountry#$ 阵营 $c901_#targetCell#$ 号位角色，因为buff $c904_#buffId#$ ( $c901_#buffAttackCountry#$ 号阵营神兽添加，剩余 $c901_#buffLeftNum#$ 次) 掉血 $c902_#damage1#$, 实际掉血 $c902_#damage2#$ 剩余血量 $c903_#leftHp#$"
language["txt_report_fight_buff_effects_2"] = "本次攻击前 $c901_#attackCountry#$ 阵营 $c901_#targetCell#$ 号位角色，因为buff $c904_#buffId#$ ( $c901_#buffAttackCountry#$ 号阵营 $c901_#buffAttackCell#$ 号位添加，剩余 $c901_#buffLeftNum#$ 次) 加血 $c903_#damage1#$, 实际加血 $c903_#damage2#$ 剩余血量 $c903_#leftHp#$"


-- 攻击前移除得buff状态
language["txt_report_fight_del_buff_before"] = "本次攻击前 $c901_#attackCountry#$ 阵营 $c901_#targetCell#$ 号位角色，移除自身buff $c904_#buffId#$ "

-- 第一次攻击，移除buff状态
language["txt_report_fight_del_buff_middle"] = "本次攻击前 $c901_#attackCountry#$ 阵营 $c901_#attackCell#$ 号位角色先移除 $c901_#targetCountry#$ 阵营 $c901_#targetCell#$ 号角色的buff, buff id 是 $c904_#buffId#$ "


language["txt_report_fight_drop_reward"] = "获得奖励 $c901_#rewardStr#$ "

language["txt_report_fight_isAlive"] = "存活"
language["txt_report_fight_not_isAlive"] = "死亡"
language["txt_report_fight_continue"] = "持续"
language["txt_report_fight_not_continue"] = "非持续"
language["txt_report_fight_resist"] = "抵抗成功"
language["txt_report_fight_not_resist"] = "抵抗失败"

language["txt_report_fight_attack_way_1"] = "普通攻击"
language["txt_report_fight_attack_way_2"] = "技能攻击"
language["txt_report_fight_attack_way_3"] = "合击攻击"
language["txt_report_fight_attack_way_4"] = "被动攻击"

language["txt_report_fight_pet_name"] = "神兽"

return language
