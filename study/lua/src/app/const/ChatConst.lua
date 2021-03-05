--聊天常量
--@Author:Conley
local ChatConst = {}

ChatConst.CHANNEL_ALL = 5
--综合频道
ChatConst.CHANNEL_SYSTEM = 4
ChatConst.CHANNEL_WORLD = 1
ChatConst.CHANNEL_PRIVATE = 2
ChatConst.CHANNEL_GUILD = 3
ChatConst.CHANNEL_TEAM = 6
ChatConst.CHANNEL_CROSS_SERVER = 7
ChatConst.CHANNEL_MAX = 7
ChatConst.CHANNEL_MIN = 1

ChatConst.CHANNEL_PNGS = {
    "img_voice_shijie",
    "img_voice_haoyou",
    "img_voice_juntuan",
    "img_voice_xitong2",
    "img_voice_shijie",
    "img_voice_qintombo",
    "img_voice_kuafu",
}

ChatConst.CHANNEL_VOICE_PNGS = {"img_chat04", "img_chat04", "img_chat03", "img_chat04", "img_chat04", "img_chat05", "img_chat04"}

ChatConst.MAX_MSG_CACHE_NUM = {50, 50, 50, 50, 50, 50, 50} --聊天最大缓存数量
ChatConst.MAX_MINI_MSG_CACHE_NUM = 4 --聊天最大缓存数量

ChatConst.SHOW_TIME_LABEL_BLANK = 60 * 10
--聊天时间显示间隔10分钟
ChatConst.SHOW_TIME_LABEL_MSG_NUM = 10
--超过10条消息没有显示聊天时间时会显示

ChatConst.MSG_STATUS_UNREAD = 0
--消息未读
ChatConst.MSG_STATUS_READED = 1
--消息已读

ChatConst.PARAM_CHAT_WORLD_ACCEPT_MSG_LEVEL = 1
--接受世界频道信息等级
ChatConst.PARAM_CHAT_WORLD_SEND_MSG_LEVEL = 2
--世界发言等级
ChatConst.PARAM_CHAT_WORLD_INTERVAL = 3
--世界发言间隔
ChatConst.PARAM_CHAT_GUILD_INTERVAL = 4 --军团发言间隔
ChatConst.PARAM_CHAT_TEAM_INTERVAL = 4 --队伍发言间隔
ChatConst.PARAM_CHAT_VOICE_LENGTH = 5
-- 语音长度
ChatConst.PARAM_CHAT_TEXT_LENGTH = 6 -- 文本信息单条长度
ChatConst.PARAM_CHAT_PRIVATE_SEND_MSG_LEVEL = 7
--私聊频道发言等级
ChatConst.PARAM_CHAT_SYSTEM_MSG_NUM = 8
--系统消息显示条数
ChatConst.PARAM_CHAT_VOICE_MIN_TIME = 10
--语音聊天最低时长
ChatConst.PARAM_CHAT_GUILD_SEND_MSG_LEVEL = 11
--军团频道发言等级
ChatConst.PARAM_CHAT_SEND_MSG_NUM_DAILY = 12
--低V低等级全服发言限制
ChatConst.PARAM_CHAT_SEND_MSG_VIP_LEVEL = 13
--全服聊天解限制的VIP等级
ChatConst.PARAM_CHAT_SEND_MSG_ROLE_LEVEL = 14
--全服聊天解限制的角色等级
ChatConst.PARAM_CHAT_PRIVATE_CHAT_LEVEL = 16
--私聊频道发言等级
ChatConst.PARAM_CHAT_QIN_WORLD_CD = 19 --聊天世界频道组队邀请CD
ChatConst.PARAM_CHAT_QIN_GUILD_CD = 20 --聊天军团频道组队邀请CD

--跨服频道发言等级
ChatConst.PARAM_CHAT_CROSS_SERVER_LEVEL = 21

ChatConst.LIMIT_FLAG_LEVLE = 1
--等级限制标记
ChatConst.LIMIT_FLAG_NO_GANG = 2
--没有加入军团限制标记
ChatConst.LIMIT_FLAG_NO_COUNT = 3
--聊天次数限制
ChatConst.LIMIT_FLAG_CROSS_SERVER = 4 --跨服聊天时间结束

ChatConst.UNREAD_MSG_MAX_SHOW_NUM = 99
--未读消息的最大显示数

ChatConst.CHAT_SETTING_NAME = "chatSetting" --聊天设置

ChatConst.SETTING_KEY_RECEPT_WORLD = 1 --主界面接受世界频道缓存KEY
ChatConst.SETTING_KEY_AUTO_VOICE_WORLD = 2
--自动播放世界频道语音缓存KEY
ChatConst.SETTING_KEY_AUTO_VOICE_GANG = 3
--自动播放军团频道语音缓存KEY
ChatConst.SETTING_KEY_AUTO_VOICE_PRIVATE = 4
--自动播放私聊频道语音缓存KEY
ChatConst.SETTING_KEY_RECEPT_SYSTEM = 5
--主界面接受系统频道缓存KEY
ChatConst.SETTING_KEY_RECEPT_CROSS_SERVER = 6
--主界面接受跨服频道缓存KEY
ChatConst.SETTING_KEY_AUTO_VOICE_CROSS_SERVER = 7
--自动播放跨服频道语音缓存KEY

ChatConst.SETTING_CHECK_BOX_DEFAULT = {1, 1, 1, 1, 1} --复选框设置默认值，1是选中

ChatConst.MAX_FACE_NUM = 50
--聊天表情数

ChatConst.MSG_TYPE_TEXT = 1
--文本消息
ChatConst.MSG_TYPE_VOICE = 2
--语音消息
ChatConst.MSG_TYPE_EVENT = 3
--邀请消息

ChatConst.CD_TYPE_COMMON = 1 --cd时间在频道下还按类型分，文本、语音属此类
ChatConst.CD_TYPE_EVENT = 2 --邀请类型

ChatConst.CREATE_TEAM_ROLL_NOTICE_ID = 1000 --组队消息文本ID
ChatConst.CREATE_TEAM_IN_FIGHT_ROLL_NOTICE_ID = 1007 --组队消息文本ID,已战斗

ChatConst.CHAT_TITLE_OFFSET = 68   -- 标题偏移量

ChatConst.IMAGE_CHANNEL_WIDTH = 70
ChatConst.IMAGE_CHANNEL_HEIGHT = 28
ChatConst.IMAGE_CHANNEL_SCALE = 0.85
return readOnly(ChatConst)
