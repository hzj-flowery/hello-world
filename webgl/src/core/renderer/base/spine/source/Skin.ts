import { SkinEntry } from "./SkinEntry"
import { Slot } from "./Slot"
import { Attachment } from "./Attachment"
import { MeshAttachment } from "./MeshAttachment"
export class Skin{
public attachments:Array<any>;
public bones:any;
public constraints:Array<any>;
public name:any;

        constructor(name){
            this.attachments = new Array();
            this.bones = Array();
            this.constraints = new Array();
            if (name == null)
                throw new Error("name cannot be null.");
            this.name = name;
        }
        public setAttachment(slotIndex, name, attachment) {
            if (attachment == null)
                throw new Error("attachment cannot be null.");
            var attachments = this.attachments;
            if (slotIndex >= attachments.length)
                attachments.length = slotIndex + 1;
            if (!attachments[slotIndex])
                attachments[slotIndex] = {};
            attachments[slotIndex][name] = attachment;
        };
        public addSkin(skin) {
            for (var i = 0; i < skin.bones.length; i++) {
                var bone = skin.bones[i];
                var contained = false;
                for (var j = 0; j < this.bones.length; j++) {
                    if (this.bones[j] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.bones.push(bone);
            }
            for (var i = 0; i < skin.constraints.length; i++) {
                var constraint = skin.constraints[i];
                var contained = false;
                for (var j = 0; j < this.constraints.length; j++) {
                    if (this.constraints[j] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.constraints.push(constraint);
            }
            var attachments = skin.getAttachments();
            for (var i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
            }
        };
        public copySkin(skin) {
            for (var i = 0; i < skin.bones.length; i++) {
                var bone = skin.bones[i];
                var contained = false;
                for (var j = 0; j < this.bones.length; j++) {
                    if (this.bones[j] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.bones.push(bone);
            }
            for (var i = 0; i < skin.constraints.length; i++) {
                var constraint = skin.constraints[i];
                var contained = false;
                for (var j = 0; j < this.constraints.length; j++) {
                    if (this.constraints[j] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained)
                    this.constraints.push(constraint);
            }
            var attachments = skin.getAttachments();
            for (var i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                if (attachment.attachment == null)
                    continue;
                if (attachment.attachment instanceof MeshAttachment) {
                    attachment.attachment = attachment.attachment.newLinkedMesh();
                    this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
                }
                else {
                    attachment.attachment = attachment.attachment.copy();
                    this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
                }
            }
        };
        public getAttachment(slotIndex, name) {
            var dictionary = this.attachments[slotIndex];
            return dictionary ? dictionary[name] : null;
        };
        public removeAttachment(slotIndex, name) {
            var dictionary = this.attachments[slotIndex];
            if (dictionary)
                dictionary[name] = null;
        };
        public getAttachments() {
            var entries = new Array();
            for (var i = 0; i < this.attachments.length; i++) {
                var slotAttachments = this.attachments[i];
                if (slotAttachments) {
                    for (var name_4 in slotAttachments) {
                        var attachment = slotAttachments[name_4];
                        if (attachment)
                            entries.push(new SkinEntry(i, name_4, attachment));
                    }
                }
            }
            return entries;
        };
        public getAttachmentsForSlot(slotIndex, attachments) {
            var slotAttachments = this.attachments[slotIndex];
            if (slotAttachments) {
                for (var name_5 in slotAttachments) {
                    var attachment = slotAttachments[name_5];
                    if (attachment)
                        attachments.push(new SkinEntry(slotIndex, name_5, attachment));
                }
            }
        };
        public clear() {
            this.attachments.length = 0;
            this.bones.length = 0;
            this.constraints.length = 0;
        };
        public attachAll(skeleton, oldSkin) {
            var slotIndex = 0;
            for (var i = 0; i < skeleton.slots.length; i++) {
                var slot = skeleton.slots[i];
                var slotAttachment = slot.getAttachment();
                if (slotAttachment && slotIndex < oldSkin.attachments.length) {
                    var dictionary = oldSkin.attachments[slotIndex];
                    for (var key in dictionary) {
                        var skinAttachment = dictionary[key];
                        if (slotAttachment == skinAttachment) {
                            var attachment = this.getAttachment(slotIndex, key);
                            if (attachment != null)
                                slot.setAttachment(attachment);
                            break;
                        }
                    }
                }
                slotIndex++;
            }
        };
       
    }
