        //Sets session as logged out and reloads window to log user out
        function logout() {
            console.log("log out clicked");
            sessionStorage.setItem('loggedIn', 'false');
            document.location.reload();
        }
        
        function checkIfLoggedIn() {
            if (sessionStorage.loggedIn == "true") {
              console.log("user logged in")
            }
            else {
              document.location.assign("login.html");
            }
          }