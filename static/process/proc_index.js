const check = () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('No Service Worker support!')
    }
    if (!('PushManager' in window)) {
      throw new Error('No Push API Support!')
    }
    
    
  }
  const registerServiceWorker = async () => {
    const swRegistration = await navigator.serviceWorker.register("/static/process/service.js")
    return swRegistration
  }
  const requestNotificationPermission = async () => {
    const permission = await window.Notification.requestPermission()
    // value of permission can be 'granted', 'default', 'denied'
    // granted: user has accepted the request
    // default: user has dismissed the notification permission popup by clicking on x
    // denied: user has denied the request.
    if (permission !== 'granted') {
      throw new Error('Permission not granted for Notification')
    }
    else{
      console.log("cc");
    }
  }
  const main = async () => {
    check()
    const swRegistration = await registerServiceWorker()
    const permission = await requestNotificationPermission()
    
  }
  main(); //we will not call main in the beginning.
  // importScripts('localforage.min.js');
  const socket = io("http://35.223.92.57:8080/");
  socket.on("message",function(data){
    // document.getElementById("logs").innerHTML+=data+"<br/>";
    // console.log(data);
    
   color = (JSON.parse(data));

   if(color["color"]=="red"){
     $("#btn").css("background-color","red");
     $("#btn").html("Couldn't Start!")
     $("#btn").css("color","white")
   }
   else if(color["color"]=="green"){
    $("#btn").css("background-color","green");
    $("#btn").html("Stop")
    $("#btn").css("color","white")
    document.getElementById("left").classList.remove("right-anim");
    document.getElementById("left").classList.add("left-anim");
    document.getElementById("left").innerHTML='<img src="/static/process/icon.png" style="position: relative; width:60%; left:20%; top : 5%">';
   }
   else if(color["color"]=="white"){
    document.getElementById("left").classList.add("right-anim");
    document.getElementById("left").classList.remove("left-anim");
    $("#btn").css("background-color","white");
    $("#btn").html("Start")
    $("#btn").css("color","black")
   }
    // var notif=$('<div class="not">'+data+'</div>')
    // $("#notif").append(notif)
    // var perst=$('<div class="closas" id="closas"><div class="close" onclick=""></div><div class="messages">'+data+'</div></div>')
    // $("#di").append(perst)

 });
  localforage.getItem("user").then(function (value) {
    // Do other things once the value has been saved.
    // console.log(value);
    socket.emit("user", value);
}).catch(function(err) {
    // This code runs if there were any errors
    // console.log(err);
});
  
  function close(self){
    $(self.parent).fadeOut();
  }
  function process() {
    if(document.getElementById("btn").innerHTML=="Start"||document.getElementById("btn").innerHTML=="Couldn't Start!"){
      $("#btn").html("Starting Up.....");
    $("#btn").css("background-color","white");
    $("#btn").css("color","black");
    var user;
    // var user = document.getElementsByName("u")[0].value
    localforage.getItem('user').then(function (value) {
        // Do other things once the value has been saved.
        console.log(value);
        user = value;
        data = JSON.stringify({"logged_in":user,"stop":"false"})
        console.log(data);
        
        $.ajax({

          url : 'http://35.223.92.57:4000/notify/',
          type : 'POST',
          data : data,
          success : function(data) {              
             console.log(data);
             
          },
          
          });
    }).catch(function(err) {
        // This code runs if there were any errors
        // console.log(err);
        
    });
    }
    else if(document.getElementById("btn").innerHTML=="Stop"){
      $("#btn").html("Stopping");
    $("#btn").css("background-color","white");
    $("#btn").css("color","black");
    document.getElementById("left").innerHTML="";
    document.getElementById("left").classList.add("right-anim");
    document.getElementById("left").classList.remove("left-anim");
      var user;
    // var user = document.getElementsByName("u")[0].value
    localforage.getItem('user').then(function (value) {
        // Do other things once the value has been saved.
        console.log(value);
        user = value;
        data = JSON.stringify({"logged_in":user,"stop":"true"})
        console.log(data);
        
        $.ajax({

          url : 'http://35.223.92.57:4000/notify/',
          type : 'POST',
          data : data,
          success : function(data) {              
             console.log(data);
             
          },
          
          });
    }).catch(function(err) {
        // This code runs if there were any errors
        // console.log(err);
        
    });

    }
    
    
    // console.log(data);
    
    
    }
    
  