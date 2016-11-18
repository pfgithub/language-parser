var util = require("util");
var events = require("events");

function Token(regexp, name){ // the token class (contains your registerTokens)
    this.regexp = regexp;
    this.name = name;
}

function Tokenizer(){ // the main tokenizer class
    this.tokens = [];
}

util.inherits(Tokenizer, events.EventEmitter); // to have the emit things

Tokenizer.prototype.registerToken = function(token,id){ // registers a token
    this.tokens.push(new Token(token,id)); // creates a new token and stores it in the array of all possible tokens
    return this; // Allows chaining of (new Tokenizer()).registerToken().registerToken()
};

Tokenizer.prototype.tokenize = function(string){ // Takes an input string and returns an array of {name: ,cont: }s
    var ans = []; // The resulting array to be returned
    var currString = string; // The text left in the string
    while(currString.length > 0){ // While there is still stuff to parse
        var result = this.tokens.some(function(token){ // forEach through all the tokens
            var res = token.regexp.exec(currString); // Check if this is the right token
            if(!res) return false; // If it isn't, continue the loop
            if(res[0].length > 0){ // If it is and has a match
                this.emit("token", token.name, res, function(name){ // Emit it
                    token.name = name;
                });
                this.emit("token"+token.name, res, function(name){ // Emit it again
                    token.name = name;
                });
                
                (token.name ? ans.push(
                    {"name":token.name,"cont":res} // Push the token to the token array
                ) : "");
                
                currString = currString.substring(res[0].length); // Remove the result from the string
                
                return res; // Res is a truthy value
            }
        }.bind(this)); // make sure you bind
        if(!result){
            throw new Error("No Token for `"+currString+"`"); // If it fails, error
        }
    }
    return ans;
};

module.exports = Tokenizer;