export var MessageErrorConst = {
    RET_ERROR: 0,
    RET_OK: 1,
    RET_SERVER_MAINTAIN: 2,
    RET_NO_FIND_USER: 3,
    RET_LOGIN_REPEAT: 4,
    RET_USER_NAME_REPEAT: 5,
    RET_SERVER_USER_OVER_CEILING: 6,
    RET_LOGIN_BAN_USER: 7,
    RET_SERVER_NO_OPEN: 8,
    RET_SERVER_CLOSE_REGIST: 9,
    RET_LOGIN_TOKEN_TIME_OUT: 10,
    RET_VERSION_ERR: 11,
    RET_UUID_NOT_ACTIVATE: 12,
    RET_ACTIVATE_ALREADY_USE: 13,
    RET_ACTIVATE_INVALID: 14,
    RET_LOGIN_BAN_IP_ALL_SERVER: 25,
    RET_LOGIN_BAN_DEVICE_ALL_SERVER: 26,
    RET_LOGIN_NEED_VERYFY: 10503,
    RET_ITEM_NOT_EXIST: 1005,
    RET_FRAG_NOT_EXIST: 1006,
    RET_BATTLE_ERROR: 1007,
    RET_HERO_NOT_EXIST: 1008,
    RET_WRONG_TARGET: 1009,
    RET_HERO_LEVEL_EXCEED_LEAD: 1010,
    RET_MATERIALS_QUALITY_ERROR: 1011,
    RET_HERO_ONETEAM: 1012,
    RET_MATERIALS_HAVE_BEEN_UPGRADED: 1013,
    RET_EQUIP_NOT_EXIST: 1014,
    RET_ITEM_NOT_ENOUGH: 1015,
    RET_USER_LEVEL_ENOUGH: 1016,
    RET_USER_LEVEL_MAX: 1017,
    RET_USER_HERO_NOT_ENOUGH: 1018,
    RET_USER_HERO_DESTINY_DATA_ERR: 1019,
    RET_USER_HERO_DESTINY_CAN_NOT_ACTIVE: 1020,
    RET_USER_HERO_ON_TEAM: 1021,
    RET_TREASURE_UPGRADE_MAX_LEVEL: 1022,
    RET_TREASURE_REFINE_MAX_LEVEL: 1023,
    RET_TREASURE_HAS_DEVELOP: 1024,
    RET_CHAT_CONTENT_OUT_OF_LEN: 1025,
    RET_CHAT_HIGH_FREQUENCY: 1026,
    RET_BATTLE_CAN_NOT_FIND_SKILL: 1027,
    RET_CHAT_FORBID: 1028,
    RET_TERRITORY_JOIN_GUILD: 1029,
    RET_TERRITORY_RIOT_EXPLRE: 1030,
    RET_TERRITORY_RIOT: 1031,
    RET_TERRITORY_HERO_ON_PATROL: 1032,
    RET_ACT_CHECKIN_ALREADY: 1040,
    RET_ACT_DAILY_BOSS_NOT_EXIST: 1041,
    RET_EXPLORE_AGO_CHAPTER: 1042,
    RET_EXPLORE_CHAPTER: 1043,
    RET_IS_NOT_UP_TO_LEVEL: 2001,
    RET_IS_NOT_UP_TO_VIP_LEVEL: 2002,
    RET_HERO_BAG_FULL: 3001,
    RET_EQUIP_BAG_FULL: 3002,
    RET_TREASURE_BAG_FULL: 3003,
    RET_TINSTRUMENT_BAG_FULL: 3004,
    RET_CHAPTERBOX_REWARDED: 4001,
    RET_NOT_ENOUGH_CHAPTERBOX_STAR: 4002,
    RET_CHAPTER_STAGE_NO_EXISTS_STAR: 4003,
    RET_DAILY_DUNGEON_IS_NOT_OPEN_LEVEL: 40010,
    RET_DAILY_DUNGEON_IS_NOT_OPEN_TIME: 40011,
    RET_DAILY_DUNGEON_PRE_NOT_PASS: 40012,
    RET_DAILY_DUNGEON_NOT_ENOUGH_COUNT: 40013,
    RET_CHAPTER_STAGE_NO_COUNT: 7003,
    RET_CHAPTER_STAGE_STAR_NOT_ENOUGH: 7004,
    RET_RECRUIT_NO_TIME: 8000,
    RET_RECRUIT_NO_FREE: 8001,
    RET_RECRUIT_NO_ITEM: 8002,
    RET_RECRUIT_NO_REWARD: 8003,
    RET_RECRUIT_NO_GOLD: 8004,
    RET_RECRUIT_NO_HERO: 8005,
    RET_RECRUIT_NO_ALREADYGET: 8006,
    RET_RECRUIT_NO_POINT: 8007,
    RET_EQUIPMENT_NO_MAX_LEVEL: 8008,
    RET_NOT_ENOUGH_FRAG: 8009,
    RET_SHOP_BUY_COUNT_EXCEED_LIMIT: 8020,
    RET_SHOP_ITEM_NO_EXIST: 8021,
    RET_SHOP_TYPE_ERROR: 8022,
    RET_SHOP_REFRESH_TYPE_ERROR: 8023,
    RET_SHOP_REFRESH_FREE_ENOUGH: 8024,
    RET_SHOP_REFRESH_ITEM_ERROR: 8025,
    RET_SHOP_REFRESH_CNT_ENOUGH: 8026,
    RET_TOWER_TOPTOWER: 8050,
    RET_TOWER_ERROR: 8051,
    RET_TOWER_BOX_NO_GET: 8052,
    RET_TOWER_BOX_ERROR: 8053,
    RET_TOWER_BOX_GET: 8054,
    RET_TOWER_LAYER_ERROR: 8055,
    RET_TOWER_SURPRISE_ERROR: 8056,
    RET_TOWER_SURPRISE_WIN: 8057,
    RET_OFFICER_MAX: 8060,
    RET_OFFICER_RESOURCE_NOT_ENOUGH: 8061,
    RET_OFFICER_POWER_ERROR: 8063,
    RET_REPEATED_ORDER_ID: 8065,
    RET_DAILY_TASK_AWARD_NOT_CONDITION: 8070,
    RET_DAILY_TASK_AWARD_NOT_REPEAT: 8071,
    RET_REBEL_ARMY_NOTVAILD: 8075,
    RET_REBEL_ARMY_NOTPUBLIC: 8076,
    RET_REBEL_ARMY_NORESOURCE: 8077,
    RET_REBEL_ARMY_REWARD_GET: 8078,
    RET_REBEL_ARMY_REWARD_ERROR: 8079,
    RET_REBEL_ARMY_REWARD_OVER: 8080,
    RET_REBEL_ARMY_NOTGUILD: 8081,
    RET_REBEL_ARMY_NO_GUILD: 8082,
    RET_ARENA_RANK_LOCK: 8085,
    RET_ARENA_OPPFONENT_THAN_OWN_STRONG: 8086,
    RET_ARENA_NOT_ENOUGH_CNT: 8087,
    RET_ARENA_NOT_ENOUGH_RANK: 8088,
    RET_ARENA_REWARD_GET: 8089,
    RET_ACHIEVEMENT_AWARD_NOT_CONDITION: 8090,
    RET_GUILD_ALREADY_IN: 8095,
    RET_GUILD_NAME_INVALID: 8096,
    RET_GUILD_NAME_REPEATED: 8097,
    RET_GUILD_NOT_EXIST: 8098,
    RET_GUILD_MEMBER_NOT_EXIST: 8099,
    RET_GUILD_LEAVE_GUILD_24H_NOT_ALLOWED: 8100,
    RET_GUILD_MEMBER_APPLICATION_FULL: 8101,
    RET_GUILD_APPLATION_FULL: 8102,
    RET_GUILD_NOT_FOUND_APPLICATION: 8103,
    RET_GUILD_NO_PERMISSIONS: 8104,
    RET_GUILD_MEMBER_FULL: 8105,
    RET_GUILD_NOT_DISMISS: 8106,
    RET_GUILD_ALREADY_IMPEACH: 8107,
    RET_GUILD_PERMISSIONS_FULL: 8108,
    RET_GUILD_HELP_NO_ERROR: 8109,
    RET_GUILD_HELP_ID_ERROR: 8110,
    RET_GUILD_HELP_LOCK: 8111,
    RET_GUILD_HELP_GET_ALL: 8112,
    RET_GUILD_HELP_LIMIT: 8113,
    RET_GUILD_HELP_ACK_LIMIT: 8114,
    RET_GUILD_HELP_FINISH_CNT_ENOUGH: 8115,
    RET_GUILD_LEVEL_ENOUGH: 8116,
    RET_GUILD_DUNGEON_EXIST_ERROR: 8117,
    RET_GUILD_DUNGEON_CNT_ENOUGH: 8118,
    RET_GUILD_DUNGEON_ATK_CD: 8119,
    RET_GUILD_DUNGEON_SOURCE_ERROE: 8120,
    RET_GUILD_DUNGEON_TIME_CLOSE: 8121,
    RET_GUILD_DUNGEON_SOURCE_GET: 8122,
    RET_GUILD_TRAIN_TRAINING: 8139,
    RET_GUILD_TRAIN_INTERVAL: 8469,
    RET_MONTH_CARD_NOT_AVAILABLE: 8520,
    RET_MONTH_CARD_NOT_USE: 8521,
    RET_GUIDE_ID_LESS_OLD: 8200,
    RET_RESOURCE_NOT_ENOUGH: 10000,
    RET_RESOURCE_GOLD_NOT_ENOUGH: 10001,
    RET_RESOURCE_SILVER_NOT_ENOUGH: 10002,
    RET_RESOURCE_VIT_NOT_ENOUGH: 10003,
    RET_RESOURCE_SPIRIT_NOT_ENOUGH: 10004,
    RET_RESOURCE_EXP_NOT_ENOUGH: 10005,
    RET_RESOURCE_VIP_EXP_NOT_ENOUGH: 10006,
    RET_RESOURCE_REVERENCE_NOT_ENOUGH: 10007,
    RET_RESOURCE_CULTIVATION_NOT_ENOUGH: 10008,
    RET_RESOURCE_SOUL_NOT_ENOUGH: 10009,
    RET_RESOURCE_IRON_NOT_ENOUGH: 10010,
    RET_RESOURCE_WEIJIAO_NOT_ENOUGH: 10011,
    RET_RESOURCE_TIAOZHAN_NOT_ENOUGH: 10012,
    RET_RESOURCE_GONGXIAN_NOT_ENOUGH: 10013,
    RET_FIGHTS_MATCH_TIMEOUT: 10140,
    RET_FIGHTS_CANCEILMATCH_TIMEOUT: 10143,
    RET_FIGHTS_MATCH_FORBIT: 10146,
    RET_FIGHTS_SEASONREWARDS_GOT: 10147,
    RET_FIGHTS_RECONNECT_FIGHTSOVER: 10165,
    RET_RETURNSVR_NOT_QUALIFIED: 10171,
    RET_RETURNSVR_IS_FULL: 10172
};