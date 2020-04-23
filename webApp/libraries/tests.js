suite("HTML tests", function() {
    test("Navbar present", function() {
        chai.assert($("#navDiv").length != 0, "Wrong number of divs in the page");
    });

    test("Page title present", function() {
        chai.assert($("#h1Index").length >0, "H1 Title element not in page");
    });

    test("navigation bar div present", function() {
        chai.assert($("#navDiv").length >0, "navdiv not present");
    });

});

suite("Javascript tests", function() {

    test("loadNavbar function in scripts.js exists", function() {
        chai.assert(typeof(loadNavbar, 'function'), "loadNavbar function does not exist");
    });
    
    test("drawBasic function in scripts.js exists", function() {
        chai.assert(typeof(drawBasic, 'function'), "drawBasic function does not exist");
    });

    test("logout function in scripts.js exists and readable", function(){
        chai.assert(typeof(logout, 'function'), "logout function does not exist");
    })
});