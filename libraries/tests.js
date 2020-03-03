suite("HTML tests", function() {
    test("Navbar present", function() {
        chai.assert($("#navDiv").length != 0, "Wrong number of divs in the page");
    });

    test("Button to submit adding new item present", function() {
        chai.assert($("#btnSubmitItem").length > 0, "Btn submit button not in DOM");
    });

    test("Page title present", function() {
        chai.assert($("#h1Title").length >0, "H1 Title element not in page");
    });

    test("Main table present", function() {
        chai.assert($("#itemTable").length >0, "Table not present");
    });

    test("Deleted alert present", function() {
        chai.assert($("#alertDelete").length >0, "Deleted alert not present");
    });
    
    test("Added alert present", function() {
        chai.assert($("#alertAdded").length >0, "Added alert not present");
    });


});

suite("Javascript tests", function() {
    test("URL variable in scripts.js is a string", function() {
        chai.assert(typeof(url, 'string'), "URL variable not a string");
    });
    test("connection variable in scripts.js exists", function() {
        chai.assert(typeof(connection, 'WebSocket'), "connection variable does not exist");
    });
    test("addNewItem function in scripts.js exists", function() {
        chai.assert(typeof(addNewItem, 'function'), "addNewItem function does not exist");
    });
    test("append_json function in scripts.js exists", function() {
        chai.assert(typeof(append_json, 'function'), "append_json function does not exist");
    });
});