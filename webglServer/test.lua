local NetMessageDef_achievement = {}


----------Import------------- 

----------Beans------------- 
NetMessageDef_achievement.AchievementGoalBean = {
    {"int4", "cfgId"},--配置id
    {"int4", "goal"},--目标id
    {"int4", "curCount"},--当前进度
    {"int4", "state"},--状态 0未领取 1可领取 2已领取
}


----------Messages------------- 
--id:53001	type:toClient	desc:发送玩家成就信息	msg:MSG_SC_REP_ROLE_ACHIEVEMENT_INFO	handleMsg:handle_MSG_SC_REP_ROLE_ACHIEVEMENT_INFO
NetMessageDef_achievement.ResRoleAchievementInfoMessage = {
    {"list", "achievementList", {{"bean", "nil", NetMessageDef_achievement.AchievementGoalBean}}},--成就列表
    {"list", "summaryDrawRecordList", {{"int4", "nil"}}},--累计成就领取记录
}

--id:53002	type:toClient	desc:更新成就信息	msg:MSG_SC_REP_UPDATE_ACHIEVEMENT_INFO	handleMsg:handle_MSG_SC_REP_UPDATE_ACHIEVEMENT_INFO
NetMessageDef_achievement.ResUpdateAchievementInfoMessage = {
    {"int4", "cfgId"},--配置id
    {"int4", "goal"},--目标id
    {"int4", "curCount"},--当前进度
    {"int4", "state"},--状态 0未领取 1可领取 2已领取
}

--id:53003	type:toServer	desc:请求领取成就奖励	msg:MSG_SC_REQ_DRAW_ACHIEVEMENT_REWARD
NetMessageDef_achievement.ReqDrawAchievementRewardMessage = {
    {"int4", "cfgId"},--配置id
    {"int4", "type"},--领取类型 1成就goal奖励 2累计奖励
}

--id:53004	type:toClient	desc:返回累计奖励领取记录	msg:MSG_SC_REP_SUMMARY_DRAW_RECORD	handleMsg:handle_MSG_SC_REP_SUMMARY_DRAW_RECORD
NetMessageDef_achievement.ResSummaryDrawRecordMessage = {
    {"list", "summaryDrawRecordList", {{"int4", "nil"}}},--累计成就领取记录
}


return NetMessageDef_achievement
