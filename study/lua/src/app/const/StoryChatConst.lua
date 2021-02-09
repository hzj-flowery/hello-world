local StoryChatConst = {}


StoryChatConst.TYPE_CHAPTER = 1         --进入stageview (战斗无关)
StoryChatConst.TYPE_BEFORE_FIGHT = 2    --战斗前
StoryChatConst.TYPE_WIN = 3             --胜利，战斗结束
StoryChatConst.TYPE_MONSTER_DIE = 4     --怪物死亡
StoryChatConst.TYPE_START_ATTACK = 5    --出手前
StoryChatConst.TYPE_ENTER_STAGE = 6     --登场后

return readOnly(StoryChatConst)