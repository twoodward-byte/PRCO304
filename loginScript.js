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


function getUserSalt(username, data) {
    for (i = 0; i < result.length; i++) {
        if (result[i].user == username) {
            return result[i].salt;
        }
    }
}

function checkUserUnique(username){
    var unique = true;
    for (i = 0; i < result.length; i++) {
        if (result[i].user == username) {
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
    //Find correct user's salt in database
    var salt = getUserSalt(userName, result);
    //Now hash the password with the correct salt
    var hashPass = new Hashes.MD5().hex(password + salt);
    var k; //k is used in loop below to find user
    var wrongPassword = true; //Set password as wrong by default
    console.log(hashPass);
    for (k in result) { //For each user in the database
        if (userName == result[k].user && hashPass == result[k].password) { //Check if the username and password match up
            sessionStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('role', result[k].role);
            wrongPassword = false;
            //Go to main page
            document.location.assign("index.html");
        }
    }
    if (wrongPassword == true) {
        $('#alertLogin').show();
    }
}

//Generates a random salt
function generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}


function userRegistered() {
    var userName = $("#txtUserName").val();
    if (checkUserUnique(userName)){
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
        document.location.assign("login.html");
    }

}
