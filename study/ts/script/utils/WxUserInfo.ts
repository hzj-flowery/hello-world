import { config } from "../config";

export class WxUserInfo {
    private userNickName: string = '';
    private userAvatarUrl: string = "";

    private userInfoButton: wx.UserInfoButton;

    private checkUserInfoSuccessHandler: Function;
    private checkUserInfoFailHandler: Function;
    private getUserInfoSuccessHandler: Function;

    public hasGetInfo: boolean = false;

    private static _instance: WxUserInfo;
    public static get instance(): WxUserInfo {
        if (!this._instance) {
            this._instance = new WxUserInfo();
        }
        return this._instance;
    }

    public getUserNickName(): string {
        return this.userNickName;
    }

    public getUserAvatarUrl(): string {
        return this.userAvatarUrl;
    }

    public setUserInfoSuccess(handler: Function) {
        this.getUserInfoSuccessHandler = handler;
    }

    public checkUserInfo(successHandler: Function, failHandler: Function) {
        if (window['wx'] == null) {
            return;
        }
        if (!wx.getSetting) {
            return;
        }

        this.checkUserInfoSuccessHandler = successHandler;
        this.checkUserInfoFailHandler = failHandler;
        wx.getSetting({
            success: this.getUserSettingSuccess.bind(this),
            fail: this.getUserSettingFail.bind(this)
        });
    }

    private getUserSettingSuccess(res) {
        console.log("getUserSettingSuccess:", res);
        if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
                withCredentials: true,
                success: this.getUserInfoSuccess.bind(this)
            });
        }
        else {
            if (this.checkUserInfoFailHandler != null) {
                this.checkUserInfoFailHandler();
            }
        }
    }

    private getUserSettingFail(res) {
        if (this.checkUserInfoFailHandler != null) {
            this.checkUserInfoFailHandler();
        }
    }

    private getUserInfoSuccess(res) {
        if (res.userInfo) {
            this.setUserInfo(res);
        }

        if (this.checkUserInfoSuccessHandler != null) {
            this.checkUserInfoSuccessHandler();
        }
    }

    private setUserInfo(res) {
        console.log("setUserInfo:", res);
        if (res && res.userInfo ) {
            this.hasGetInfo = true;
            this.userNickName = res.userInfo.nickName;
            this.userAvatarUrl = res.userInfo.avatarUrl;
        }
        if (this.getUserInfoSuccessHandler != null) {
            this.getUserInfoSuccessHandler();
        }
    }

    public createUserInfoButton(x: number, y: number, width: number, height: number) {
        if (window['wx'] == null) {
            return false;
        }
      
        let layawidth = config.CC_DESIGN_RESOLUTION.width;
        let layaheight = config.CC_DESIGN_RESOLUTION.height;
        let wxwidth = (wx.getSystemInfoSync() as any).windowWidth;
        let wxheight = (wx.getSystemInfoSync() as any).windowHeight;
        console.log("createUserInfoButton", {
            width: wxwidth / wxheight >= layawidth / layaheight ? width * wxheight / layaheight : width * wxheight / layaheight,
            height: wxwidth / wxheight >= layawidth / layaheight ? height * wxheight / layaheight : height * wxheight / layaheight,
            left: x * wxheight / layaheight,
            top: y * wxheight / layaheight,
             backgroundColor: '#ff0000'
        });
        if (wx.createUserInfoButton != null) {
            if (this.userInfoButton) {
                this.userInfoButton.destroy();
            }
            this.userInfoButton = wx.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                    width: wxwidth ,
                    height: wxheight ,
                    left: 0,
                    top: 0
                   // backgroundColor: '#ff0000'
                }
            })

            this.userInfoButton.onTap(this.setUserInfo.bind(this));
            this.userInfoButton.show();
        }
    }

    public showUserInfoButton() {
        if (this.userInfoButton == null) {
            return;
        }
        this.userInfoButton.show();
    }

    public hideUserInfoButton() {
        if (this.userInfoButton == null) {
            return;
        }
        this.userInfoButton.hide();
    }
}