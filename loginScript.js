//const e = require("express");

function startListeningCaps() {
    input.addEventListener("keyup", function (event) {
        if (event.getModifierState("CapsLock")) {
            text.style.display = "block";
            console.log("hello");
        } else {
            text.style.display = "none"
        }
    });
}

function startListeningEnter() {
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

//MAKE this self contained function getting user list through argument
function getUserSalt(username, data) {
    for (i = 0; i < data.length; i++) {
        if (data[i].user == username) {
            return data[i].salt;
        }
    }
}

function checkUserUnique(username, users){
    var unique = true;
    for (i = 0; i < users.length; i++) {
        if (users[i].user == username) {
            unique = false;
        }
    }
    return unique;
}

function loginButton() {

    //Get username entered
    var userName = $("#txtUserName").val();
    //Get password entered
    var password = $("#txtPassword").val();
    //window.location.reload();
    //Find correct user's salt in database
    $.ajax({
        type: "GET",
        url: '/users',
        dataType: 'text',
       // data: params,
        success: function (data) {
            var users = JSON.parse(data);
            var salt = getUserSalt(userName, users);
                //Now hash the password with the correct salt
    var hashPass = new Hashes.MD5().hex(password + salt);
    var k; //k is used in loop below to find user
    var wrongPassword = true; //Set password as wrong by default
    var notApproved;
    console.log(hashPass);
    for (k in users) { //For each user in the database
        if (userName == users[k].user && hashPass == users[k].password) { //Check if the username and password match up
            wrongPassword = false;
            if(users[k].status == "approved"){
                sessionStorage.setItem('loggedIn', 'true');
                sessionStorage.setItem('role', users[k].role);
                //wrongPassword = false;
                //Go to main page
                document.location.assign("index.html");
            }
            else{
                notApproved = true;
            }
        }
    }

    if (wrongPassword == true) {
        $('#alertLogin').show();
    }
    if(notApproved == true){
        $('#alertApproved').show();
    }
        },
        error: function(req, err){ console.log('my message' + err);
        },
    });
    

}

//Generates a random salt
function generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


function userRegistered() {
    var userName = $("#txtUserName").val();
    if (checkUserUnique(userName)){ //If desired username is unique
        var salt = generateSalt(); //Generate random salt
        var password = $("#txtPassword").val(); //Get password
        var passwordSalt = password + salt;
        var hashPass = new Hashes.MD5().hex(password + salt); //Hash password for security
        $("#txtPassword").val(hashPass.toString()); //Store hashed password on form
        $("<input />").attr("type", "hidden") //Store salt on form
            .attr("name", "salt")
            .attr("value", salt.toString())
            .appendTo("#registerForm");
    }
    else{
        //Go back to login page
        document.location.assign("login.html");
    }

}
