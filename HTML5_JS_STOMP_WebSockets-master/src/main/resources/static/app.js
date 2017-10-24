var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    var can = null;
    var rect = null;
    var ctx = null;
    var stompClient = null;
    var id = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            /*stompClient.subscribe('/topic/newpoint.'+id, function (eventbody) {
                //alert(JSON.parse(eventbody.body).x+""+JSON.parse(eventbody.body).y);
                        ctx.beginPath();
                        ctx.arc(JSON.parse(eventbody.body).x, JSON.parse(eventbody.body).y, 1, 0, 2 * Math.PI);
                        ctx.stroke();
            });*/
            stompClient.subscribe('/topic/newpoint.'+id, function (eventbody) {
                //alert(JSON.parse(eventbody.body).x+""+JSON.parse(eventbody.body).y);
                        ctx.beginPath();
                        ctx.arc(JSON.parse(eventbody.body).x, JSON.parse(eventbody.body).y, 1, 0, 2 * Math.PI);
                        ctx.stroke();
            });
            stompClient.subscribe('/topic/newpolygon.'+id, function (eventbody) {
                    
                    ctx.fillStyle = 'black';
                    for (var i = 0; i < JSON.parse(eventbody.body).length; i++) {
                        if (i === 0) {
                        ctx.moveTo(JSON.parse(eventbody.body)[i].x, JSON.parse(eventbody.body)[i].y);
                        }
                        ctx.lineTo(JSON.parse(eventbody.body)[i].x, JSON.parse(eventbody.body)[i].y);
                        }
                        ctx.closePath();
                        ctx.fill();
                //alert(JSON.parse(eventbody.body).x+""+JSON.parse(eventbody.body).y);
                 
            });
        });

    };
    
    

    return {

        init: function () {
            can = document.getElementById("canvas");
            ctx = canvas.getContext('2d');
            
            rect = canvas.getBoundingClientRect();
            //websocket connection
            
            if (window.PointerEvent) {
                    canvas.addEventListener("pointerdown", function(event){
                        //alert('pointerdown at ' + (event.clientX - rect.left)+ ',' + (event.clientY - rect.top)+' :capturaDePuntos');
                        var pt = new Point(event.clientX - rect.left,event.clientY - rect.top);
                        stompClient.send("/topic/newpoint."+id, {}, JSON.stringify(pt));
                        //stompClient.send("/topic/newpolygon."+id, {}, JSON.stringify(pt)); 
                        stompClient.send("/app/newpoint."+id, {}, JSON.stringify(pt));  
                    });   
                   
                } 
        },
        
        suscribir: function (numId){
            id= numId;
            connectAndSubscribe();
            
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt)); 
            
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();