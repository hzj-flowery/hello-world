local NativeConst = {}

--
NativeConst.STATUS_SUCCESS 					= 0
NativeConst.STATUS_FAILED 					= 1
NativeConst.STATUS_ERROR 					= 2
NativeConst.STATUS_CANCEL 					= 3
NativeConst.STATUS_PROCESS 					= 4

-- 初始化
NativeConst.NETWORK_TYPE_RESTRICTED 		= 101 --  网络受限
NativeConst.NETWORK_TYPE_NOTRESTRICTED 		= 102 --  网络不受限

-- 初始化
NativeConst.INIT_TYPE_SUCCESS 				= 1000 -- 检查到有版本更新
NativeConst.INIT_TYPE_FAILED 				= 1001 -- 检查到没有版本更新

-- 检查版本
NativeConst.CHECK_VERSION_TYPE_NEW 			= 1200 -- 检查到有版本更新
NativeConst.CHECK_VERSION_TYPE_WITHOUT_NEW 	= 1201 -- 检查到没有版本更新
NativeConst.CHECK_VERSION_TYPE_WITHOUT 		= 1202 -- 没有版本更新接口

-- 注销弹窗类型
NativeConst.LOGOUT_TYPE_UNKNOWN 			= 1300 -- 注销弹窗类型，由于某种原因未知
NativeConst.LOGOUT_TYPE_UNAVAILABLE 		= 1301 -- 渠道SDK没有提供注销接口，默认注销成功
NativeConst.LOGOUT_TYPE_NO_DIALOG 			= 1302 -- 渠道SDK有注销接口，注销时不会弹出是否注销的选择界面
NativeConst.LOGOUT_TYPE_HAS_DIALOG 			= 1303 -- 渠道SDK存在注销接口，注销时弹出注销选择确认界面

-- 注销之后是否打开登录界面
NativeConst.LOGOUT_HAS_LOGIN_UNKNOWN 		= 1400 -- 注销后是否打开登录界面，由于某种原因未知
NativeConst.LOGOUT_HAS_LOGIN 				= 1401 -- 注销后会打开登录界面
NativeConst.LOGOUT_HAS_LOGIN_NO 			= 1402 -- 注销后不会打开登录界面

--
NativeConst.EXIT_TYPE_UNKOWN 				= 1500 	--退出弹窗类型，未知
NativeConst.EXIT_TYPE_UNAVAILABLE			= 1501 	--渠道SDK没有提供退出接口
NativeConst.EXIT_TYPE_NO_DIALOG 			= 1502 	--渠道SDK有退出接口，退出时不会弹出退出对话框界面
NativeConst.EXIT_TYPE_HAS_DIALOG 			= 1503 	--渠道SDK存在退出接口，退出时弹出退出选择界面

--
NativeConst.SHARE_TYPE_WECHAT_SESSION		= 1	--分享至微信好友
NativeConst.SHARE_TYPE_WECHAT_TIMELINE		= 2	--分享至微信朋友圈
NativeConst.SHARE_TYPE_WECHAT_FAVORITE		= 3	--分享至微信收藏
NativeConst.SHARE_TYPE_QQ_SESSION			= 4	--分享至QQ好友
NativeConst.SHARE_TYPE_QZONE				= 5	--分享至QQ空间

--
NativeConst.ID_TYPE_YOUNG                   = 1 --实名认证的时候未满18岁

-- 
NativeConst.SDKAgentVersion 				= "NativeAgentVersion"
NativeConst.SDKCheckVersionResult 			= "SDKCheckVersionResult"
NativeConst.SDKLoginResult 					= "SDKLoginResult"
NativeConst.SDKLogoutResult 				= "SDKLogoutResult"
NativeConst.SDKExitResult 					= "SDKExitResult"
NativeConst.SDKPayResult 					= "SDKPayResult"
NativeConst.SDKShareResult					= "SDKShareResult"
NativeConst.SDKIdResult                     = "SDKIdResult"


return NativeConst