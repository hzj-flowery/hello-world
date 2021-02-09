local HorseRaceConst = {}

HorseRaceConst.BLOCK_WIDTH = 40
HorseRaceConst.BLOCK_HEIGHT = 40

HorseRaceConst.MAP_MAX_HEIGHT = 16  --16格

HorseRaceConst.BLOCK_TYPE_START = 1         --起点
HorseRaceConst.BLOCK_TYPE_MAP = 2           --地形
HorseRaceConst.BLOCK_TYPE_OBSTRUCTION = 3   --障碍
HorseRaceConst.BLOCK_TYPE_REWARD = 4        --奖励
HorseRaceConst.BLOCK_TYPE_FINAL = 5         --终点

HorseRaceConst.CONFIG_TYPE_MAP = 1          --地图
HorseRaceConst.CONFIG_TYPE_MAP_BG = 2       --地图远景

HorseRaceConst.MAP_COUNT = 6        --总共及张图

return readOnly(HorseRaceConst)