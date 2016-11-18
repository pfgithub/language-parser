# Language Parser

`npm install language-parser --save`

## Usage

### Quickstart

There is a simple example project available in `examples/languageparser.js` if you don't understand anything

#### Require the module

    var TR = require("language-parser"); // Require the module
    var Tokenizer = TR.Tokenizer; // Get the tokenizer class
    var RecursiveParser = TR.RecursiveParser; // Get the recursive parser class

#### Create a tokenizer

    var tok = new Tokenizer();

#### Register some tokens

    tok.registerToken(/^\"([^\"]*)\"/, "STRING");
    tok.registerToken(/^\,/, "COMMA");
    tok.registerToken(/^./);
    
Make sure your regex starts at the beginning of the string (`^`)
An undefined name will ignore that token
Tokens check top to bottom

#### Create a parser

    var rec = new RecursiveParser();

#### Initilize some grammars

    var stringarr = rec.grammar("stringarr");
    
#### Define some grammars

    stringarr.addOption(["STRING", "COMMA", stringarr.v]);
    stringarr.addOption(["STRING"]);
    stringarr.addOption([]);
    
Make sure you use `grammarname.v` when recursively using grammars. It's not required, but may improve memory usage

#### Set the main grammar

    rec.setMainGrammar(stringarr)

A `program` will consist of a `stringarr`

#### Parse your thing

    rec.parse(tok.tokenize("INPUT"));
    
#### Understand the output

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
    
### Full Documentation

    wip