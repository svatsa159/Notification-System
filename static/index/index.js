function saveAndRedirect(){
    var user = document.getElementsByName("u")[0].value
    localforage.setItem('user', user).then(function (value) {
        // Do other things once the value has been saved.
        // console.log(value);
    }).catch(function(err) {
        // This code runs if there were any errors
        // console.log(err);
    });
    setTimeout(function(){
        
        if(user=="admin"){
            window.location.href="/admin.html";
        }
        else{
            $.ajax({
                url: 'http://35.223.92.57:8001/log_alert/',
                type: 'POST',
                data: JSON.stringify({"logged_in":user}),
                success: function(data) {
                    // alert('success');
                    
                }
            });
            window.location.href="/process";
        }
        
    
        },200
        
    );
    
}
navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
     registration.unregister()
   } })