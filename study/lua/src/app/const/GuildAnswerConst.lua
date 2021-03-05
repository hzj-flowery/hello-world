local GuildAnswerConst = {}

--宝石的状态
GuildAnswerConst.ANSWER_INIT = 1 --初始化值
GuildAnswerConst.ANSWER_ING = 2 --进行中
GuildAnswerConst.ANSWER_END = 3 --结束

GuildAnswerConst.QUESTION_NUM = 10

GuildAnswerConst.RANK_GUILD = 1
GuildAnswerConst.RANK_PERSON = 2

-- 新版答题
GuildAnswerConst.ANSWER_RANK_LAYER = "ANSWER_RANK_LAYER"
GuildAnswerConst.ANSWER_NODE = "ANSWER_NODE"
GuildAnswerConst.ANSWER_AVATAR_LAYER = "ANSWER_AVATAR_LAYER"

GuildAnswerConst.ANSWER_STATE_IDLE = "ANSWER_STATE_IDLE"
GuildAnswerConst.ANSWER_STATE_READY = "ANSWER_STATE_READY"
GuildAnswerConst.ANSWER_STATE_PLAYING = "ANSWER_STATE_PLAYING"
GuildAnswerConst.ANSWER_STATE_RESTING = "ANSWER_STATE_RESTING"
GuildAnswerConst.ANSWER_STATE_INIT = "ANSWER_STATE_INIT"

GuildAnswerConst.READY_SUCCESS = 1
GuildAnswerConst.NO_READY = 2

GuildAnswerConst.LEFT_SIDE = 0 -- 上边
GuildAnswerConst.RIGHT_SIDE = 1 -- 下边
GuildAnswerConst.FACE_RADIO = 0.5 -- 播放表情概率
GuildAnswerConst.FACE_TIME = 1 -- 表情持续时间
GuildAnswerConst.EFFECT_TIME = 1 -- 正确/错误特效持续时间
GuildAnswerConst.WAVE_MAX_NUMS = 10 -- 一波最大题数
GuildAnswerConst.TRUE_FACE = {1, 3, 4, 5, 6, 7, 16, 22, 26, 31, 36, 41, 48} -- 正确表情包
GuildAnswerConst.FALSE_FACE = {8, 10, 11, 12, 13, 14, 15, 28, 32, 33, 42, 44, 47} -- 错误表情包

return readOnly(GuildAnswerConst)
