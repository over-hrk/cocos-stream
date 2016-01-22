
cc.Node.prototype.runActionAsync = function(action, stream){
    stream.runActionWrapper(this,action);    
};

var AsyncStream = function(){
    
    this.streamID = AsyncStream.prototype.streamID++;
    this.actionlist = [];
    this.actionCnt = 0;
    this.idle = true;
    
    var check  = new cc.CallFunc(function(){
        this.idle = false;
        this.actionCnt--;
        cc.log("done action in streamID =", this.streamID, ", size =", this.actionCnt);
        if(this.actionCnt>0){
            var next = this.actionlist.shift();
            switch(next.label){
                case "runAction":
                    cc.log("Exec action=" ,next.action.__instanceId, "(sream=", this.streamID,")");
                    next.target.runAction(next.action);
                    break;
                case "eventRecord":
                    next.action.execute();
                    break;
                case "eventWait":
                    next.action.execute();
                    break;
                default:
                    cc.log("Invalid event lavel");
                    break;
            }
        }else{
            this.idle = true;
        }
    }, this);
    
    this.runActionWrapper = function(target,action){
        
        var wrapperAction = new cc.Sequence([action,check]);
        
        this.actionlist.push({ label : "runAction", target : target, action : wrapperAction });
        this.actionCnt++;
        cc.log("Add action to streamID =", this.streamID, ", size =", this.actionCnt);
        cc.log("Schedule action=", wrapperAction.__instanceId, "(sream=", this.streamID,")");
        if(this.idle){ 
            // todo:
            this.actionCnt++;
            cc.log("Add action to streamID =", this.streamID, ", size =", this.actionCnt);
            check.execute();
        }
    };
    
    this.eventRecordWrapper = function(event){
        
        var wrapperAction = new cc.CallFunc(function(){
            event._recordAction.execute();
            if( event.callbacks.length > 0 ){
                event.runCallbacks();
            }
            check.execute();
        }, this);
        
        this.actionlist.push({ label : "eventRecord", action : wrapperAction });
        this.actionCnt++;
        cc.log("Add action to streamID =", this.streamID, ", size =", this.actionCnt);
        
        if(this.idle){ 
            // todo:
            this.actionCnt++;
            cc.log("Add action to streamID =", this.streamID, ", size =", this.actionCnt);
            check.execute();
        }
    };
    
    this.eventWaitWrapper = function(event){
        
        var wrapperAction = new cc.CallFunc(function(){
            if( StreamEvent.prototype.isRecorded(event.eventID) ){
                check.execute();
            }else{
                event.addCallback(function(){
                    check.execute();
                });
            }
        });
        
        this.actionlist.push({ label : "eventWait", action : wrapperAction });
        this.actionCnt++;
        
        if(this.idle){ 
            // todo:
            this.actionCnt++;
};

AsyncStream.prototype = {
    streamID : 0
};

var StreamEvent = function(){
    var proto = StreamEvent.prototype;
    this.eventID = proto.eventID++;
    proto.recordedList[this.eventID] = false; 
    this.callbacks = [];
    
    this._recordAction = new cc.CallFunc(function(){
        var proto = StreamEvent.prototype;
        if( !proto.isRecorded(this.eventID)){
            proto.recordedList[this.eventID] = true;
        }
        cc.log("Record event ", proto.recordedList);
    }, this);
    
    this.record = function(stream){
        stream.eventRecordWrapper(this);
    };
    
    this.addCallback = function(callback){
        this.callbacks.push(callback);
    };
    
    this.runCallbacks = function(){
        for(var key in this.callbacks ){
            this.callbacks[key]();
        }
    };
    
    this.wait = function(stream){
        stream.eventWaitWrapper(this);
    };
};

StreamEvent.prototype = {
    eventID : 0,
    recordedList : {},
    isRecorded : function(id){
        return !!StreamEvent.prototype.recordedList[id];
    }
};

var HelloWorldLayer = cc.LayerColor.extend({
    sprite:null,
    ctor:function () {
        //////////////////////////////
        // 1. super init first
        this._super(cc.color(128,128, 128,128));

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask the window size
        var size = cc.winSize;

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        var helloLabel = new cc.LabelTTF("Hello World", "Arial", 38);
        // position the label on the center of the screen
        helloLabel.x = size.width / 2;
        helloLabel.y = size.height / 2 + 200;
        // add the label as a child to this layer
        this.addChild(helloLabel, 5);

        // add "HelloWorld" splash screen"
        this.sprite = new cc.Sprite(res.HelloWorld_png);
        this.sprite.attr({
            x: size.width / 2,
            y: size.height / 2
        });
        this.addChild(this.sprite, 0);
        
        

        var koma_b = new cc.Sprite(res.koma_blk);
        koma_b.attr({
            x: 50,
            y: 50,
            scaleX : 50 / koma_b.width,
            scaleY : 50 / koma_b.height
        });
        this.addChild(koma_b ,0);
        
        var koma_r = new cc.Sprite(res.koma_red);
        koma_r.attr({
            x: 200,
            y: 100,
            scaleX : 50 / koma_b.width,
            scaleY : 50 / koma_b.height
        });
        this.addChild(koma_r ,0);
        
        // stream
        var strm1 = new AsyncStream();
        var strm2 = new AsyncStream();
        var strm3 = new AsyncStream();
        var event1 = new StreamEvent();
        var event2 = new StreamEvent();
        
        var mov = new cc.MoveTo(1, cc.p(200,30));
        koma_r.runActionAsync(mov, strm1);
        
        var mov2 = new cc.MoveTo(1, cc.p(100,150));
        koma_b.runActionAsync(mov2, strm1);
        
        var mov3 = new cc.MoveTo(1, cc.p(300,150));
        koma_r.runActionAsync(mov3, strm1);
        event1.record(strm1); // mov3の完了後にevent1がRecordされる
        
        var mov4 = new cc.MoveTo(0.5, cc.p(400,200));
        koma_b.runActionAsync(mov4,strm2);
        event2.record(strm2); // mov2の完了後にevent2がRecordされる
        
        var jumps = [];
        jumps[0] = cc.JumpBy.create(0.30, cc.p(30,-50), 50,1);
        jumps[1] = cc.JumpBy.create(0.25, cc.p(30,  0), 40,1);
        jumps[1] = cc.JumpBy.create(0.20, cc.p(20,  0), 30,1);
        jumps[2] = cc.JumpBy.create(0.10, cc.p(10,  0),  5,1);
        jumps[3] = cc.JumpBy.create(0.10, cc.p( 5,  0),  2,1);
        var jumpMotion = cc.Sequence.create(jumps);
        event1.wait(strm3); // event1がRecordされるのを待つ
        event2.wait(strm3); // event2がRecordされるのを待つ
        koma_b.runActionAsync(jumpMotion,strm3);
        
        return true;
    }
});

var HelloWorldScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new HelloWorldLayer();
        this.addChild(layer);
    }
});

