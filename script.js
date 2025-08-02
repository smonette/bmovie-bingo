/* globals Zepto */

// Convert url params string into object
function readParams(string) {
  if (string[0] === "?") {
    string = string.slice(1);
  }
  
  var pairs = string.split("&");
  return pairs.reduce(function(memo, pair) {
    var pieces = pair.split("=");
    memo[pieces[0]] = pieces[1];
    return memo;
  }, {});
}

// Thanks StackOverflow!
function shuffle(array) {
  var array = Array.from(array);
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Use the data to generate a new key. The key will represent which 
// data entry is placed in each cell. We do this by shuffling all
// the source data and selecting the first 24 items as our cell
// data. The source data indexes are looked up for the 24 items,
// and those index offsets are used for generating a two-char
// hexadecimal code to represent that selection.
function generateKey(data) {
  var key = [];
  var base = "A".charCodeAt(0);
  var shuffled = shuffle(data);
  
  for (var i = 0; i < 24; i++) {
    var index = data.indexOf(shuffled[i]);
    var hexcode = index.toString(16);
    if (hexcode.length == 1) {
      hexcode = "0" + hexcode;
    }
    key.push(hexcode);
  }
  
  return key;
}

Zepto(function($) {
  console.log("Ready!");
    
  $.getJSON("/cell-data.json", function(data) {
    var params = readParams(window.location.search);
    var key = params.key;

    // If the URL had no key, we need to generate a new one from the data
    if (key === undefined) {
      key = generateKey(data);
    } else {
      key = Array.from(key).reduce(function(result, value, index, array) {
        if (index % 2 === 0)
          result.push(array.slice(index, index + 2).join(''));
        return result;
      }, []);
    }
    
    // Parse key into list of selected data  
    var celldata = key.map(function(hexcode) {
      var index = parseInt(hexcode, 16);
      return data[index];
    });
    
    // Populate the cells
    $("td").forEach(function(cell) {
      // Ignore the free space
      if (cell.id === "free") {
        return;
      }
      
      $(cell).text(celldata.pop());
    });
    
    // Add share URL
    if (params.key === undefined) {
      $("#shareurl").val(window.location + "?key=" + key.join('')); 
    } else {
      $("#shareurl").val(window.location);
    }
    
  });
  
  
  // autosize cell heights
  var width = $("td").css('width');
  $("td").css("height", width);
  
});
