export class EventQueue{

        constructor(animState){
            this.objects = [];
            this.drainDisabled = false;
            this.animState = animState;
        }
        public start(entry) {
            this.objects.push(EventType.start);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        };
        public interrupt(entry) {
            this.objects.push(EventType.interrupt);
            this.objects.push(entry);
        };
        public end(entry) {
            this.objects.push(EventType.end);
            this.objects.push(entry);
            this.animState.animationsChanged = true;
        };
        public dispose(entry) {
            this.objects.push(EventType.dispose);
            this.objects.push(entry);
        };
        public complete(entry) {
            this.objects.push(EventType.complete);
            this.objects.push(entry);
        };
        public event(entry, event) {
            this.objects.push(EventType.event);
            this.objects.push(entry);
            this.objects.push(event);
        };
        public drain() {
            if (this.drainDisabled)
                return;
            this.drainDisabled = true;
            var objects = this.objects;
            var listeners = this.animState.listeners;
            for (var i = 0; i < objects.length; i += 2) {
                var type = objects[i];
                var entry = objects[i + 1];
                switch (type) {
                    case EventType.start:
                        if (entry.listener != null && entry.listener.start)
                            entry.listener.start(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].start)
                                listeners[ii].start(entry);
                        break;
                    case EventType.interrupt:
                        if (entry.listener != null && entry.listener.interrupt)
                            entry.listener.interrupt(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].interrupt)
                                listeners[ii].interrupt(entry);
                        break;
                    case EventType.end:
                        if (entry.listener != null && entry.listener.end)
                            entry.listener.end(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].end)
                                listeners[ii].end(entry);
                    case EventType.dispose:
                        if (entry.listener != null && entry.listener.dispose)
                            entry.listener.dispose(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].dispose)
                                listeners[ii].dispose(entry);
                        this.animState.trackEntryPool.free(entry);
                        break;
                    case EventType.complete:
                        if (entry.listener != null && entry.listener.complete)
                            entry.listener.complete(entry);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].complete)
                                listeners[ii].complete(entry);
                        break;
                    case EventType.event:
                        var event_3 = objects[i++ + 2];
                        if (entry.listener != null && entry.listener.event)
                            entry.listener.event(entry, event_3);
                        for (var ii = 0; ii < listeners.length; ii++)
                            if (listeners[ii].event)
                                listeners[ii].event(entry, event_3);
                        break;
                }
            }
            this.clear();
            this.drainDisabled = false;
        };
        public clear() {
            this.objects.length = 0;
        };
        return EventQueue;
    }