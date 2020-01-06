// Author: Jordan Menchen

var http = require("http");

const MINPORT = 5000;
const MAXPORT = 35000;

const REUNLINK = /^(\/(UNLINK)\/)+(([^a-z0-9]+[A-Z\/]*)*([\w]+)+([.](txt|html|mp3|jpg)))$/;
const RESIZE = /^(\/(SIZE)\/)+(([^a-z0-9]+[A-Z\/]*)*([\w]+)+([.](txt|html|mp3|jpg)))$/;
const REFETCH = /^(\/(FETCH)\/)+(([^a-z0-9]+[A-Z\/]*)*([\w]+)+([.](txt|html|mp3|jpg)))$/;

const WORKDIRECTORY = "./WEBSERVER/";
const VALIDEXT = [
    ["txt", "text/plain"],
    ["html", "text/html"],
    ["mp3", "audio/mp3"],
    ["jpg", "image/jpeg"]
];

//const PORT = randomPort(MAXPORT, MINPORT);

//Port for testing purposes
const PORT = 29;

function incoming(request, response) {
	var xurl = request.url;

	response.statusCode = 200;
    console.log("Incoming request with the URL: "+xurl);

    // Test the xurl with all regex to see if valid
    if ((REUNLINK.test(xurl)) || (RESIZE.test(xurl)) || (REFETCH.test(xurl))) {
        //response.write("User has successfully requested the URL: "+xurl);

        // If valid, test individually to see the action we want to perform
        if (REUNLINK.test(xurl)) {
            var filepath = xurl.match(REUNLINK)[3];
            doRemove(response, filepath, xurl);
        }
        else if (RESIZE.test(xurl)) {
            var filepath = xurl.match(RESIZE)[3];
            doSize(response, filepath, xurl);
        }
        else {
            var filepath = xurl.match(REFETCH)[3];
            var extension = xurl.match(REFETCH)[7];
            var headerVal = '';
            VALIDEXT.forEach(function(pair) {
                if (pair[0] === extension) {
                    headerVal = pair[1];
                }
            });
            doFetch(response, filepath, headerVal, xurl);
        }
    }
    // Else not a valid url
    else {
        response.statusCode = 403;
        console.log("INVALID URL: "+xurl);
        response.write("INVALID URL: "+xurl)
        response.end();
    }
}

// create a server, passing it the event function
var server = http.createServer(incoming);

// try to listen to incoming requests.
// each incoming request should invoke incoming()
try {
	server.on('error', function(e) {
		console.log("Error! "+e.code);
	}); // server.on()

	server.listen(PORT);
	console.log("Listening on http://localhost:" + PORT);
} catch (error) {
    //Error code 403
} // try

// Function that produces a random number between max and min
// Found online (https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript)
function randomPort(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function doRemove(response, filepath, xurl) {
    // Load the fs (filesystem) module
    var fs = require('fs');
    // First check if the file exists
    if (fs.existsSync(WORKDIRECTORY + filepath)) {
        // If the file exists, them remove it
        fs.unlink(WORKDIRECTORY + filepath, function(error) {
            // Print proper error messages if error occurs
            if (error) {
                response.statusCode = 403;
                console.log("ERROR: could not unlink file " + xurl);
                response.write("ERROR: could not unlink file " + xurl);
                response.end();
            }
            // else no error and confirm deletion
            else {
                response.setHeader('Content-Type', 'text/plain');
                console.log("UNLINK: the URL "+xurl+" was removed.");
                response.write("UNLINK: the URL "+xurl+" was removed.");
                response.end();
            }
        });
    }
    // Else file does not exist
    else {
        response.statusCode = 403;
        console.log("ERROR: could not unlink file " + xurl);
        response.write("ERROR: could not unlink file " + xurl);
        response.end();
    }
}

function doSize(response, filepath, xurl) {
    // Load the fs (filesystem) module
    var fs = require('fs');
    // First check if the file exists
    if (fs.existsSync(WORKDIRECTORY + filepath)) {
        // If file exists, then get the size
        fs.stat(WORKDIRECTORY + filepath, 'utf8', function(error, data) {
            // Print proper error messages for errors
            if (error) {
                response.statusCode = 403;
                console.log("ERROR: could not stat file " + xurl);
                response.write("ERROR: could not stat file " + xurl);
                response.end();
            }
            // else no errors, print out the size in bytes
            else {
                response.setHeader('Content-Type', 'text/plain');
                console.log("STAT: the URL "+xurl+" size is "+data.size);
                response.write("STAT: the URL "+xurl+" size is "+data.size);
                response.end();
            }
        });
    }
    // else the file does not exist
    else {
        response.statusCode = 403;
        console.log("ERROR: could not stat file " + xurl);
        response.write("ERROR: could not stat file " + xurl);
        response.end();
    }
}

function doFetch(response, filepath, headerVal, xurl) {
    // Load the fs (filesystem) module
    var fs = require('fs');
    // First check if the file exists
    if (fs.existsSync(WORKDIRECTORY + filepath)) {
        // if file exists, display its contents
        fs.readFile(WORKDIRECTORY + filepath, 'utf8', function(error, data) {
            // Print proper error messages for errors
            if (error) {
                response.statusCode = 403;
                console.log("ERROR: unable to fetch URL "+xurl);
                response.write("ERROR: unable to fetch URL "+xurl);
                response.end();
            }
            // else no errors, print out the contents
            else {
                response.setHeader('Content-Type', headerVal);
                console.log(data);
                response.write(data);
                response.end();
            }
        });
    }
    // else the file doesn't exist
    else {
        response.statusCode = 403;
        console.log("ERROR: unable to fetch URL "+xurl);
        response.write("ERROR: unable to fetch URL "+xurl);
        response.end();
    }
}
