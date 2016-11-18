var TR = require("../index"); // require("language-parser");
var Tokenizer = TR.Tokenizer;
var RecursiveParser = TR.RecursiveParser;

var tok = new Tokenizer(); // creates a new tokenizer

/*tok.registerToken(new RegExp(/^YOUR REGEXP/), TOKEN ID/NAME)*/ // IMPORTANT: your regexp must start at the beginning of the string
tok.registerToken(new RegExp(/^([A-Za-z][A-Za-z0-9]*)/), "UNBREAKTEXT"); // matches one word
tok.registerToken(new RegExp(/^\"([^\"]*)\"/), "STRING"); // "matches a string in quotes"
tok.registerToken(new RegExp(/^\(/), "OPENPAREN"); // ( matches an open parenthesis
tok.registerToken(new RegExp(/^\)/), "CLOSEPAREN"); // matches a ) parenthesis
tok.registerToken(new RegExp(/^\,/), "COMMA"); // matches a comma ,

tok.registerToken(new RegExp(/^./)/*, undefined*/); //This token is outputted to tok.on(token) and tok.on(tokenundefined), however is not included in the final arr // catches anything else and doesn't throw an error on an invalid character

tok.on("token", function(token, cont, overrite){
    console.log("token", token); // logs all tokens that are seen
    /*overrite(newName);*/ // overrites the token's name with this value (has not been tested, unsure if it works)
});

var rec = new RecursiveParser(); // creates a new recursive parser

var ARGUMENTS = rec.grammar("ARGUMENTS"); // a comma list of ARGUMENT,ARGUMENT,ARGUMENT...
var ARGUMENT = rec.grammar("ARGUMENT"); // a function or a string
var FUNCTION = rec.grammar("FUNCTION"); // functionName(ARGUMENTS)
var PARENTHESIS = rec.grammar("PARENTHESIS"); // (argument)

ARGUMENTS.addOption([ARGUMENT.v, "COMMA", ARGUMENTS.v]); // arguments can be ARGUMENT,ARGUMENTS (note that space tokens are ignored because their Token.name is undefined)
ARGUMENTS.addOption([ARGUMENT.v]); // arguments can be ARGUMENT
ARGUMENTS.addOption([]); // argumens can be nothing (this goes last to ensure that arguments are always all parsed instead of just skipping them)
ARGUMENT.addOption([FUNCTION.v]); // a an argument can be a function.v (.v is not required, but may save memory)
ARGUMENT.addOption(["STRING"]); // an argument can be a STRING
ARGUMENT.addOption([PARENTHESIS]); // an argument can be a parenthesis 
FUNCTION.addOption(["UNBREAKTEXT", "OPENPAREN", ARGUMENTS.v, "CLOSEPAREN"]); // a function is UNBREAKTEXT(ARGUMENTS)
PARENTHESIS.addOption(["OPENPAREN", ARGUMENT, "CLOSEPAREN"]); // a parenthesis is a (ARGUMENTS)

rec.setMainGrammar(ARGUMENTS.v); // defines a program grammar

var tokens = tok.tokenize('function("hi", ("bye")), function2(fn("hi", "hi2"), "hi3")');
// The result of the tokenization will be an array of tokens
// UNBREAKTEXT ( STRING , ( STRING ) ) , UNBREAKTEXT ( UNBREAKTEXT ( STRING , STRING ) , STRING )
console.log(JSON.stringify(rec.parse(tokens))); // Parse the tokenized array and convert it into this format:
/*
OBJECT:
    a GRAMMAR or a TOKEN

GRAMMARS: 
    {
        "type": "GRAMMARNAME",
        "is": "grammar",
        "cont": [
            array of objects
        ]
    }

TOKENS:
    {
        "type": "TOKENNAME",
        "is": "token",
        "cont": [
            array of regexp.exec(string) results (0th is while capture, 1-... is capture group n)
        ]
    }
    
OUTPUT: A grammar

*/