print("app.init")

-- 定义颜色
cc.exports.Colors					= require("app.utils.Color")

-- 多语言
cc.exports.Lang						= require("app.lang.Lang")

-- 资源路径
cc.exports.Path						= require("app.utils.Path")

-- 事件
cc.exports.SignalConst 				= require("app.const.SignalConst")

-- 协议ID
cc.exports.MessageIDConst 			= require("app.const.MessageIDConst")

-- 协议ID名字绑定
cc.exports.MessageConst 			= require("app.const.MessageConst")

-- 协议错误ID
cc.exports.MessageErrorConst 		= require("app.const.MessageErrorConst")

-- 功能
cc.exports.FunctionConst 			= require("app.const.FunctionConst")

--全面屏管理类
cc.exports.G_ResolutionManager 		= require("app.manager.ResolutionManager").new()

-- cocos通知层，最顶层
cc.exports.G_TopLevelNode 			= require("yoka.node.TopLevelNode"):create()

-- 等待菊花，屏蔽触摸
cc.exports.G_WaitingMask 			= require("app.ui.WaitingMask").new()

-- 触摸特效
cc.exports.G_TouchEffect 			= require("app.ui.TouchEffect").new()

-- socket
cc.exports.G_SocketManager 			= require("app.manager.SocketManager").new()

-- 全局事件
cc.exports.G_SignalManager 			= require("app.manager.SignalManager").new()

-- 本地信息存储
cc.exports.G_StorageManager 		= require("app.manager.StorageManager").new()

-- 场景管理
cc.exports.G_SceneManager 			= require("app.scene.SceneManager").new()

-- 配置参数
cc.exports.G_ConfigManager 			= require("app.manager.ConfigManager").new()

-- 网关列表
cc.exports.G_GatewayListManager 	= require("app.manager.GatewayListManager").new()

-- 服务器列表
cc.exports.G_ServerListManager 		= require("app.manager.ServerListManager").new()

--已有角色服列表
cc.exports.G_RoleListManager 	    = require("app.manager.RoleListManager").new()

-- 网络管理
cc.exports.G_NetworkManager 		= require("app.network.NetworkManager").new()

--
cc.exports.G_VoiceAgent 			= require("app.agent.VoiceAgent").new()

-- 原生平台
cc.exports.G_NativeAgent 			= require("app.agent.NativeAgent").new()

-- 平台统一管理
cc.exports.G_GameAgent 				= require("app.agent.GameAgent").new()

-- 服务器时间
cc.exports.G_ServerTime             = require("app.manager.ServerTimeManager").new()

-- 玩家数据
cc.exports.G_UserData  				= require("app.data.UserData").new()

-- 飘动提示
cc.exports.G_Prompt                 = require("app.ui.prompt.PromptManager").new()

-- 自动回复（体力，精力等）管理
cc.exports.G_RecoverMgr             = require("app.manager.RecoverManager").new()

--flash特效管理器
cc.exports.G_EffectGfxMgr			= require("app.manager.EffectGfxManager")

--spine管理
cc.exports.G_SpineManager 			= require("app.manager.SpineManager").new()

--audio管理
cc.exports.G_AudioManager 			= require("app.manager.AudioManager").new()

--
cc.exports.G_TutorialManager        = require("app.scene.view.tutorial.TutorialManager").new()

--跑马灯
cc.exports.G_RollNoticeService 	    = require("app.scene.view.rollnotice.RollNoticeService").new()

--服务管理器
cc.exports.G_ServiceManager 	    = require("app.manager.ServiceManager").new()

-- 本地推送
cc.exports.G_NotifycationManager 	= require("app.manager.NotifycationManager").new()


-- 弹幕
cc.exports.G_BulletScreenManager    = require("app.manager.BulletScreenManager").new()

--语音管理器
cc.exports.G_VoiceManager 			= require("app.manager.VoiceManager").new()

--武将语音
cc.exports.G_HeroVoiceManager		 = require("app.manager.HeroVoiceManager").new()

--抢红包
cc.exports.G_GuildSnatchRedPacketServe 	    = require("app.scene.view.guild.GuildSnatchRedPacketServe").new()

--参数ID
cc.exports.G_ParameterIDConst = require("app.const.ParameterIDConst")

--场景ID
cc.exports.G_SceneIdConst = require("app.const.SceneIdConst")

--矿战通知
cc.exports.G_MineNoticeService = require("app.scene.view.mineCraft.MineNoticeService").new()

--防沉迷通知
cc.exports.G_RealNameService = require("app.scene.view.system.RealNameService").new()


