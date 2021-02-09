--
-- Author: zhanglinsen
-- Date: 2018-08-30 10:05:31
-- 组队常量
local GroupsConst = {}

--显示内容
GroupsConst.SHOW_LIST = 1 -- 组队活动列表
GroupsConst.SHOW_INFO = 2 -- 组队队伍信息

GroupsConst.MAX_PLAYER_SIZE = 3 --组队最多人数

--服务器 tips状态
GroupsConst.STATE_KICK_OUT = 1 --被踢出队伍
GroupsConst.STATE_REJECT_TRANSFER_LEADER = 2 --拒绝申请带队
GroupsConst.STATE_DISSOLVE = 3 --队伍被解散
GroupsConst.STATE_REJECT_APPLY = 4 --拒绝入队申请 
GroupsConst.STATE_REJECT_INVITE = 5 --xxx拒绝了您的组队邀请 
GroupsConst.STATE_AGREE_INVITE = 6 --xxx接受了您的组队邀请（不显示 只消邀请） 
GroupsConst.STATE_JOIN_GROUP = 7 --xxx成功加入队伍   
GroupsConst.STATE_JOIN_GROUP_LACK_TIME = 8 --xxx时间不足加入失败
GroupsConst.STATE_CUT_TIME = 9 --进入皇陵时间减少
GroupsConst.STATE_GET_LEADER_SUCCEED = 10 --您已成功接任队长
GroupsConst.STATE_SET_LEADER_SUCCEED = 11 --您已成功移交队长


--组队成员
GroupsConst.MEMBER = 0 --队员
GroupsConst.LEADER = 1 --队长
-- GroupsConst.OBSERVER = 2 --观察者


GroupsConst.INVITE = 1 --邀请
GroupsConst.APPLY = 2  --申请

GroupsConst.TAB_INVITE_TYPE_1 = 1 --邀请菜单  军团成员
GroupsConst.TAB_INVITE_TYPE_2 = 2 --邀请菜单  好友


GroupsConst.OK = 1 --同意       审批
GroupsConst.NO = 2 --拒绝       审批

GroupsConst.NORMAL_QUIT = 0    --队长退出类型 0:正常退出
GroupsConst.LEADER_DISSOLVE = 1 --队长退出类型 1：队长解散

--离开队伍原因
GroupsConst.OUTSIDE_REASON_1 = 1 --被踢出队伍,自己时间不足
GroupsConst.OUTSIDE_REASON_2 = 2 --队伍被解散,整个活动结束


--菜单相关处理

return readOnly(GroupsConst)