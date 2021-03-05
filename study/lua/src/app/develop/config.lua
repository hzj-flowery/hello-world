--
require "socket"
print = release_print
-- 开发模式
APP_DEVELOP_MODE = false

-- 不开启实名认证实名认证
NOT_REAL_NAME = true

-- 开启新手引导
CONFIG_TUTORIAL_ENABLE = false

--开启直接读假战报以及场景
CONFIG_READ_REPORT = true

--开启消息buff输出
CONFIG_OPEN_DUMP_MESSAGE = true

--是否隐藏战斗ui
CONFIG_HIDE_FIGHT_UI = false

-- 开启跳过战斗
CONFIG_JUMP_BATTLE_ENABLE = true

-- 开启假战报输出
CONFIG_FAKE_REPORT_ENABLE = true

-- 开启战斗调速
CONFIG_SHOW_SPEED_ADJUST = true

-- 开启剧情对话
CONFIG_SHOW_STORY_CHAT = true

-- 开启战斗伤害转换（万）
CONFIG_SHOW_BATTLEHURT_CONVERT = false

--
CONFIG_TUTORIAL_DARK_ALPHA = 127

--游历是否可以自由拖动地图
CONFIG_EXPLORE_FREE_MOVE = true

--node ref 引用计数检测(内存泄漏的相关)
ENABLE_RECORD_REF_COUNT = false

--node ref 引用计数检测(内存泄漏的相关)
ENABLE_LUA_AUTO_RELOAD = true

--虚拟跑马
FAKE_HORCE_RUN = false

--客户端强制不需要实名
-- NO_REAL_NAME = false

-- 测试充值地址
RECHARGE_TEST_URL_TEMPLATE = "http://url/platform/recharge?gameID=#gameID#&extension=#extension#&productID=#productID#&orderID=#orderID#&sign=#sign#&platformID=#platformID#&userName=#userName#&serverID=#serverID#&orderTime=#orderTime#&money=#money#&signType=md5&currency=RMB&channelID=#channelID#"
RECHARGE_TEST_URL = "10.235.200.100:9499"


-- 本地开发
-- 运营商
SPECIFIC_OP_ID = 1
-- SPECIFIC_OP_ID = 2       --ios & 永测
-- SPECIFIC_OP_ID = 3
-- SPECIFIC_OP_ID = 83
-- SPECIFIC_OP_ID = 90


-- 运营平台
SPECIFIC_GAME_OP_ID = 1000
-- SPECIFIC_GAME_OP_ID = 1004       --ios
-- SPECIFIC_GAME_OP_ID = 1001      --安卓&永测
-- SPECIFIC_GAME_OP_ID = 1006       --大蓝

-- 游戏id
SPECIFIC_GAME_ID = 1

-- 测试token
TOKEN_KEY = "9d4923d485d78a95503d7979173a2876"
-- TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8"   --ios&永测

-- GM配置文件
CONFIG_URL = "http://10.235.200.100:8787"
-- CONFIG_URL = "https://configmjz.sanguosha.com"       --ios
-- CONFIG_URL = "http://139.196.109.209:8080"      --永测
-- CONFIG_URL = "https://configmjzml.sanguosha.com"     --大蓝

-- 服务器列表
SERVERLIST_URL = "http://10.235.200.100:38434"
-- SERVERLIST_URL = "http://10.235.102.165:38434" -- mr liu
-- SERVERLIST_URL = "https://eaglemjz.sanguosha.com"       --ios
-- SERVERLIST_URL = "http://139.196.109.209:38434"     --用测
-- SERVERLIST_URL = "https://eaglemjzml.sanguosha.com"     --大蓝

-- 网关列表
GATEWAYLIST_URL = "http://10.235.200.100:38434"
-- GATEWAYLIST_URL = "http://10.235.102.165:38434"-- mr liu
-- GATEWAYLIST_URL = "https://eaglemjz.sanguosha.com"      --ios
-- GATEWAYLIST_URL = "http://139.196.109.209:38434"        --永测
-- GATEWAYLIST_URL = "https://eaglemjzml.sanguosha.com"    --大蓝

-- 角色列表
ROLELIST_URL = "http://10.235.200.100:10167"
-- ROLELIST_URL = "https://eaglemjz.sanguosha.com"       --ios
-- ROLELIST_URL = "https://lyrolemjz.sanguosha.com"        --大蓝
-- ROLELIST_URL = "https://rolemjz.sanguosha.com"

-- 回归资格检测
RETURN_SERVER_CHECK_URL = "http://10.235.200.100:10110" --官方
--RETURN_SERVER_CHECK_URL = "" --大蓝

--先锋
--[[
-- 运营商
SPECIFIC_OP_ID = 1

-- 运营平台
SPECIFIC_GAME_OP_ID = 2001

-- 游戏id
SPECIFIC_GAME_ID = 1

-- 测试token
TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8"

-- GM配置文件
CONFIG_URL = "123.206.106.195:8080"

-- 服务器列表
SERVERLIST_URL = "115.159.113.30:38434"

-- 网关列表
GATEWAYLIST_URL = "115.159.113.30:38434"
]]


-- --大蓝
-- SPECIFIC_OP_ID = 90

-- -- 运营平台
-- SPECIFIC_GAME_OP_ID = 1006

-- -- 游戏id
-- SPECIFIC_GAME_ID = 1

-- -- 测试token
-- TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8"

-- -- GM配置文件
-- CONFIG_URL = "http://106.14.242.139:8080"

-- -- 服务器列表
-- SERVERLIST_URL = "http://106.14.245.44:38434"

-- -- 网关列表
-- GATEWAYLIST_URL = "http://106.14.245.44:38434"

-- ROLELIST_URL = "https://lyrolemjz.sanguosha.com"



-- -- 运营商
-- SPECIFIC_OP_ID = 1

-- -- 运营平台
-- SPECIFIC_GAME_OP_ID = 1000

-- -- 游戏id
-- SPECIFIC_GAME_ID = 1

-- -- 测试token
-- TOKEN_KEY = "9d4923d485d78a95503d7979173a2876"

-- -- GM配置文件
-- CONFIG_URL = "10.225.136.223:8787"

-- -- 服务器列表
-- SERVERLIST_URL = "10.225.136.223:38434"

-- -- 网关列表
-- GATEWAYLIST_URL = "10.225.136.223:38434"

-- -- 阿里
-- -- 运营商
-- SPECIFIC_OP_ID = 2

-- -- 运营平台
-- SPECIFIC_GAME_OP_ID = 1001

-- -- 游戏id
-- SPECIFIC_GAME_ID = 1

-- -- 测试token
-- TOKEN_KEY = "31b751398deb6435f14adba54ae8a9b8"

-- -- GM配置文件
-- CONFIG_URL = "http://139.196.109.209:8080"

-- -- 服务器列表
-- SERVERLIST_URL = "http://139.196.109.209:38434"

-- -- 网关列表
-- GATEWAYLIST_URL = "http://139.196.109.209:38434"




local status, ret = pcall(function ()
    require("config.url")
end)
if not status then print(ret) end