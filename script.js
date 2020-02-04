        //Sets session as logged out and reloads window to log user out
        function logout() {
            console.log("log out clicked");
            sessionStorage.setItem('loggedIn', 'false');
            document.location.reload();
        }