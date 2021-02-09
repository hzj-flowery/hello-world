import { Skeleton } from "./Skeleton"
import { Color } from "./Color"
import { Attachment } from "./Attachment"
export class Slot{
public deform:Array<any>;
public data:any;
public bone:any;
public color:any;
public darkColor:any;
public attachment:any;
public attachmentTime:any;

        constructor(data, bone){
            this.deform = new Array();
            if (data == null)
                throw new Error("data cannot be null.");
            if (bone == null)
                throw new Error("bone cannot be null.");
            this.data = data;
            this.bone = bone;
            this.color = new Color();
            this.darkColor = data.darkColor == null ? null : new Color();
            this.setToSetupPose();
        }
        public getSkeleton() {
            return this.bone.skeleton;
        };
        public getAttachment() {
            return this.attachment;
        };
        public setAttachment(attachment) {
            if (this.attachment == attachment)
                return;
            this.attachment = attachment;
            this.attachmentTime = this.bone.skeleton.time;
            this.deform.length = 0;
        };
        public setAttachmentTime(time) {
            this.attachmentTime = this.bone.skeleton.time - time;
        };
        public getAttachmentTime() {
            return this.bone.skeleton.time - this.attachmentTime;
        };
        public setToSetupPose() {
            this.color.setFromColor(this.data.color);
            if (this.darkColor != null)
                this.darkColor.setFromColor(this.data.darkColor);
            if (this.data.attachmentName == null)
                this.attachment = null;
            else {
                this.attachment = null;
                this.setAttachment(this.bone.skeleton.getAttachment(this.data.index, this.data.attachmentName));
            }
        };
       
    }
