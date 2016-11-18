var util = require("util");
var events = require("events"); // really not required, but here anyway

function Grammar(name){ // The grammar class (grammers are defined into this)
    this.options = []; // All the possible ors for each grammer (forex it could be a STRING or UNBREAKTEXT, those two are in options) 
    this.name = name; // The name/id of the grammar
    this.v = {"name": name}; // A "fake" grammar containing only the name and not the options for more efficient storage
}

Grammar.prototype.addOption = function(option){ // Add an option to a grammar
    this.options.push(option); // Add the option to the options array
};

function RecursiveParser(){ // The main recursive parser class
    this.grammars = {}; // A hashmap/dictionary/object containing all the ids: Grammar()s in this recursive parser
}

util.inherits(RecursiveParser, events.EventEmitter); // really not necessary, but whatever

RecursiveParser.prototype.grammar = function(name){ // Creates a grammar object and adds it to this recursiveparser's grammars object
    this.grammars[name] = new Grammar(name); // Creates a grammar object and adds it to this recursiveparser's grammars object
    return this.grammars[name]; // Returns the created object
};

RecursiveParser.prototype.setMainGrammar = function(grammar){ // Sets the "program" equivilant grammer
    this.main = grammar.name; // yeah
};

function checkPossibility(tokens, grammar, grammars){ // A poorly named function, attempts to parse a grammar type and returns false or the resulting cont
    // Inputs an array of the current tokens being parsed forex UNBREAKTEXT OPENPAREN STRING, the grammar to check, and the hashmap/object of grammars
    var ret = undefined; // the value the function will return
    // console.log("CHECKING GRAMMAR",grammar.name); // woo debug
    grammar.options.some(function(elm){ // loop over all the possible grammars a grammar has
        var tarr = tokens.slice(0);// duplicate the tokens array inorder to make sure that the parent tokens array and the tokens array for other loops is not modified
        var data = {"type": grammar.name, "is":"grammar", "cont": []}; // sets the base data (goes into a cont) for this grammar's result. Cont is where it's subitems go
        var exitall = false; // If true, this grammar did not succeed and the next one should be tried
        var result = (elm.some(function(tkn,i){ // Loop over all the tokens/grammars in the grammar's definition
            // console.log("CHECKING",tkn,i); // woo debug
            if(tkn.name){ // Checks if the next token to check for is actually a grammar.v
                var poss = checkPossibility(tarr, grammars[tkn.name], grammars); // if it is, recurse and get the result
                if(poss){ // if the result is successful
                    data.cont.push(poss.res); // push the result to the content array
                    tarr = poss.tarr; // instead of returning a number of times to shift the tarr, just set the tarr to theirs
                }else{ // otherwise this grammar is probably not what is next on the tokens array and try something else
                    exitall = true; // tell the outside loop to go to the next element
                    return "FAILURE"; // exit this loop with a failure ("failure" is a truthy type meaning it ends this function and exits the loop)
                }
            }else{ // If the next token to check for is not a grammar, it's probably a token.name and hope that it is
                if(tarr.length <= 0){ // Make sure that there are more tokens to check against (important because if there aren't and you try to access tarr[0].name it crashes with no name of undefined)
                    exitall = true; // the functions for failure
                    return "FAILURE"; // (as defined above)
                }
                // console.log("IS",tarr[0].name, tkn); // woo debug
                if(tarr[0].name == tkn){ // if the next tokens in the parsed thing is what it should be
                    data.cont.push({"type": tkn, "is": "token", "cont": tarr[0].cont}); // push a token to the content array
                    tarr.shift(); // move the array of tokens that come next forward one (this token doesn't have to be parsed again)
                }else{
                    exitall = true; // the functions for failure
                    return "FAILURE"; // (as defined above)
                }
            }
        }));
        if(exitall){return false;} // if the next possability for this grammar should be tried, return false (end this function without exiting the loop)
        if(!!result /*technically i dont need those !!s*/) return false; // this seems like it should do the same as exitall, but it didn't seem to work when I just had it so what am I doing wrong
        else ret = {"tarr": tarr, "res": data}; // This grammar could possibly be next, set the return value
        return "SUCCESS"; // and exit the loop
    });
    // console.log("SUCCEEDED WITH",!!ret, grammar.name); wooo debugg
    return ret; // return the resulting ret
}

RecursiveParser.prototype.parse = function(tokens){ // parse an array of tokens
    var out = checkPossibility(tokens, this.grammars[this.main], this.grammars); // check the tokens against the main grammar
    return out.res; // get only the res, not the tarr // just returns false on a failure, no errors (:()
};

module.exports = RecursiveParser; // set the exports to the recursive parser function