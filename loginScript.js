function startListeningCaps(){
    input.addEventListener("keyup", function (event) {
        if (event.getModifierState("CapsLock")) {
            text.style.display = "block";
            console.log("hello");
        } else {
            text.style.display = "none"
        }
    });
  }

  function startListeningEnter(){
          // Execute a function when the user releases a key on the keyboard
    input.addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            loginButton();
        }
    });
  }

  function loginButton() {
    console.log("Login button pressed");

    //Get username and password values entered by user
    var userName = document.getElementById("txtUserName").value;
    var password = document.getElementById("txtPassword").value;
    var salt = result[0].salt;

    //Now hash the password
    var hashPass = new Hashes.MD5().hex(password + salt);
    //hashPass = "hello";
    var k; //k is used in loop below to find user
    var wrongPassword = true; //Set password as wrong by default
    console.log(hashPass);
    for (k in result) {
        if (userName == result[k].name && hashPass == result[k].password) {
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('role', result[k].role);
            wrongPassword = false;
            //Go to main page
            document.location.assign("index.html");
        }

    }
    if(wrongPassword == true){
        $('#alertLogin').show();
    }
}



        
function generateSalt(){
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  function userRegistered(){
    var salt = generateSalt();
    var password = document.getElementById("txtPassword").value;
    var passwordSalt = password+salt;
    var hashPass = new Hashes.MD5().hex(password + salt);
    $("#txtPassword").val(hashPass.toString());
    $("<input />").attr("type", "hidden")
          .attr("name", "salt")
          .attr("value", salt.toString())
          .appendTo("#registerForm");
  }
