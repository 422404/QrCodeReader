class QrCodeReader {
    constructor() {
        this.canvas = null;
        this.context2d = null;
        this.video = null;
        this.ui = null;
        this.outOfBound = self.innerHeight + 10;
        this.scanning = false;
    }
    
    createView(defaultCamera /* 'front' or 'back' */, callback /* function(this, data) */) {
        var side;
        
        switch (defaultCamera) {
            case 'front':
                side = 'user';
                break;
                
            case 'back':
                side = 'environment';
                break;
                
            default:
                throw 'Param "defaultCamera" has to be either "front" or "back" !';
        }
        
        this.video = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.context2d = this.canvas.getContext('2d');
        this.ui = document.createElement('div');
        
        this.ui.style.width = '100%';
        this.ui.style.height = self.innerHeight + 'px';
        this.ui.style.backgroundColor = '#eeeeee';
        this.ui.style.borderRadius = '20px';
        this.ui.style.position = 'fixed';
        this.ui.style.top = this.outOfBound + 'px';
        this.ui.style.left = '0px';
        // this.ui.style.animationDuration = '0.5s'
        this.ui.style.zIndex = '9999';
        
        this.canvas.style.maxWidth = '80%';
        this.canvas.style.maxHeight = '80%';
        this.canvas.style.margin = '10px auto';
        this.canvas.style.borderRadius = '10px';
        
        this.ui.appendChild(this.canvas);
        document.body.appendChild(this.ui);
        
        var usermediaCallback = function (stream) {
            this.video.srcObject = stream;
            this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            this.video.play();
            this.scanning = true;
            requestAnimationFrame(this._tick.bind(this));
        }
        
        navigator.mediaDevices.getUserMedia(
            {
                video: {
                    facingMode: side
                }
            }
        ).then(usermediaCallback.bind(this));
    }
    
    show(mustShow) {
        if (mustShow || arguments.length == 0) {
            this.ui.style.top = '0px';
            this.scanning = true;
        }
        else {
            this.ui.style.top = this.outOfBound + 'px';
            this.scanning = false;
        }
    }
    
    destroy() {
        this.show(false);
        this.video.src = '';
        this.video.load();
        this.video = null;
        delete this.video;
        this.ui.remove();
    }
    
    _tick() {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA && this.scanning) {
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            this.context2d.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            var imageData = this.context2d.getImageData(0, 0, this.canvas.width, this.canvas.height);
            var code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                console.log(code.data);
                var obj = JSON.parse(code.data);
                if (obj.magic === 'PRODUCT_REF') {
                    alert('Product : ' + obj.productName, 'Ref : ' + obj.ref);
                }
            }
        }
        requestAnimationFrame(this._tick.bind(this));
    }
}

var a = new QrCodeReader;
a.createView('front');
a.show(true);