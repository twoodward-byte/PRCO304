

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


// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
function drawChart(amount1, amount2) {
  try{
    var bracket = amount1;
    var sidewall = amount2;
  }catch{
    console.log("error")
  }

  // Create the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Topping');
  data.addColumn('number', 'Slices');
  console.log(bracket);
  data.addRows([
    ['Bracket #423', parseInt(bracket)],
    ['Sidewall #323', parseInt(sidewall)]
  ]);
  // Set chart options
  var options = {
    'title': 'Assembled part #32',
    'width': '100%',
    'height': 500
  };

  // Instantiate and draw our chart, passing in some options.
  var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}
function drawBasic() {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'X');
  data.addColumn('number', 'Product line 1');
  data.addRows([
    [0, 0], [1, 10], [2, 23], [3, 17], [4, 18], [5, 9],
    [6, 11], [7, 27], [8, 33], [9, 40], [10, 32], [11, 35],
    [12, 30], [13, 40], [14, 42], [15, 47], [16, 44], [17, 48],
    [18, 52], [19, 54], [20, 42], [21, 55], [22, 56], [23, 57],
    [24, 60], [25, 50], [26, 52], [27, 51], [28, 49], [29, 53],
    [30, 55], [31, 60], [32, 61], [33, 59], [34, 62], [35, 65],
    [36, 62], [37, 58], [38, 55], [39, 61], [40, 64], [41, 65],
    [42, 63], [43, 66], [44, 67], [45, 69], [46, 69], [47, 70],
    [48, 72], [49, 68], [50, 66], [51, 65], [52, 67], [53, 70],
    [54, 71], [55, 72], [56, 73], [57, 75], [58, 70], [59, 68],
    [60, 64], [61, 60], [62, 65], [63, 67], [64, 68], [65, 69],
    [66, 70], [67, 72], [68, 75], [69, 80]
  ]);
  var options = {
    title: "Items made over time",
    hAxis: {
      title: 'Time'
    },
    vAxis: {
      title: 'Items made'
    },
    curveType: 'function'
  };
  var chart = new google.visualization.LineChart(document.getElementById('line_chart_div'));
  chart.draw(data, options);
}

function loadNavbar(){
  $('#navDiv').load("navbar.html", function() {
    var pathname = window.location.pathname;
    $('.nav > li > a[href="' + pathname + '"]').parent().addClass('active');
});
}