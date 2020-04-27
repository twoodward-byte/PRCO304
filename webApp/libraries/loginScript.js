//Listens for the enter key on specified element. If pressed, executes specified function
function startListeningEnter(element, func) {
    element.addEventListener("keyup", function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            func();
        }
    });
}

//Returns the salt of the username present in the specified data parameter
function getUserSalt(username, data) {
    for (i = 0; i < data.length; i++) {
        if (data[i].user == username) {
            return data[i].salt;
        }
    }
}

function checkUserUnique(username, users) {
    var unique = true;
    for (i = 0; i < users.length; i++) {
        if (users[i].user == username) {
            unique = false;
        }
    }
    return unique;
}

//Turns caps lock alert on or off depending on users caps lock key status
//Element: The element to monitor
//Alert: the alert to toggle
function startListeningCaps(element, alert) {
    element.addEventListener("keyup", function (event) {
        if (event.getModifierState("CapsLock")) {
            alert.show();
        } else {
            alert.hide();
        }
    });
}

function loginButton() {
    //Get username entered
    var userName = $("#txtUserName").val();
    //Get password entered
    var password = $("#txtPassword").val();
    var params = {
        user: userName,
        password: password
    }
    $.ajax({
        type: "POST",
        url: '/login',
        // dataType: 'text',
        data: params,
        success: function (data) {
            // users = JSON.parse(data);
            console.log("success logging in");
            if (data.success == true) {
                console.log("redirecting");
                window.location.assign("/index");
            }
            
            else if(data.success == "waiting"){
                console.log("User not approved");
                $('#alertLogin').html("User not approved");
                $('#alertLogin').show();
            }
            // window.location.reload();
        },
        error: function (data) {
            if (data.responseJSON.success == false) {
                console.log("Not authorised");
                $("#alertLogin").show();
            }
        },
        fail: function(e){
            console.log("Failed");
        } 
    })    
}

//Generates a random salt
function generateSalt() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

//Make this more self contained
function userRegistered() {
    var userName = $("#txtUserName").val();
    if (checkUserUnique(userName)) { //If desired username is unique
        var salt = generateSalt(); //Generate random salt
        var password = $("#txtPassword").val(); //Get password
        var passwordSalt = password + salt; //Add salt
        var hashPass = new Hashes.MD5().hex(password + salt); //Hash password for security
        $("#txtPassword").val(hashPass.toString()); //Store hashed password on form
        $("<input />").attr("type", "hidden") //Store salt on form - Could be converted to ajax for simplicity
            .attr("name", "salt")
            .attr("value", salt.toString())
            .appendTo("#registerForm");
    }
    else {
        //Go back to login page
        document.location.assign("login.html");
    }
}

//Event handler function for register button click event
async function registerBtnClick() {
    var status = await registerUser($('#txtUserName').val(),
        $('#txtPassword').val(), $('#txtPassword2').val());
    switch (status) { //Perform different tasks depending on status of registration
        case "notUnique":
            $('#alertUnique').show();
            break;
        case "success": //Registration successful
            $('#alertRegister').show(); //Success registering alert
            resetInputFields();
            break;
        case "passwordNotMatch":
            $('#alertPassword').show();
            break;
        case "passwordEmpty":
            $('#alertPasswordEmpty').show();
            break;
        case "emailInvalid":
            $('#alertEmail').show();
            resetInputFields();
            break;
        default:
            $('#alertRegister').show(); //Success registering alert
            resetInputFields();
            break;
    }
}

//Returns true if parameter is a valid email
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

//Registers user with specified username and password
async function registerUser(username, password, password2) {
    if (validateEmail(username)) { //If email valid
        if (!passwordEmpty(password)) {
            if (passwordMatch(password, password2)) { //If passwords match
                var params = {
                    user: username, password: password, status: "waiting"
                };
                var result = await $.ajax({
                    type: "POST",
                    url: "/register2",
                    data: params,
                });
                if (result.unique == false) return "notUnique";
                if (result.success == true) return "success";
            }
            else { return "passwordNotMatch" } //Passwords don't match
        } else {
            //password empty
            return "passwordEmpty";
        }
    }
    else { //Email not valid
        return "emailInvalid";
    }
}

//Returns true if parameters match
function passwordMatch(password1, password2) {
    if (password1 == password2) {
        return true;
    }
    else {
        return false;
    }
}

function passwordEmpty(password) {
    if (password == "") {
        return true;
    }
}