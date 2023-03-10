keywords = [];
types = [];

fetch("./data/keywords.txt").then(res => res.text()).then((data) => { keywords = JSON.parse(data); });

fetch("./data/types.txt").then(res => res.text()).then((data) => { types = JSON.parse(data); });

fetch("./data/docs.txt")
	.then(res => res.text())
	.then((data) => {
		
		// 1. Parse the docs file
		// 2. Append all Nodes to the docs
		
		var parsed = parse(data);
		
		var html = "";
		var table = document.getElementById("commands");
		var link_helper = 0;
		
		parsed.forEach(arr => {
			
			var additional = "";
			var desc = arr[1].toString().replaceAll("\n", "<br>");
			var example = arr[2];
			
			if (arr[3] != "")
			{
				additional = `<fieldset class="cmd_info"><legend class="cmd_legend l_additional">Additional information:</legend><span class="cmd_info_text">${arr[3]}</span></fieldset>`;
			}
			
			html += `<div id="_${arr[0]}_${link_helper}" class="cmd_div"><div class="cmd_top_div"><span class="command_name">${arr[0]}</span>`
				+ `<div class="cmd_desc">${desc}</div></div>`
				+ `<fieldset class="cmd_bg"><legend class="cmd_legend l_example">Example:</legend><span class="cmd_example">${syntaxHighlight(example).replaceAll("\n", "<br>")}</span></fieldset>`
				+ additional
				+ `</div>`;
				
			table.innerHTML += `<a href="#_${arr[0]}_${link_helper}">${arr[0]}</a>`;
			
			link_helper++;
			
		});
		
		document.getElementById("docs").innerHTML = html;
	})

function containsOnlyNumbers(str) {
  return /^\d+$/.test(str);
}
function syntaxHighlight(source)
{
	// keywords, types
	
	// - Token builder
	var tokens = [];
	var str = "";
	var prev = "";
	var inString = false;
	for (var i = 0; i < source.length; i++)
	{
		var c = source[i];
		
		if (c == "'") 
		{
			tokens.push(str);
			str = "";
			
			inString = !inString;
		}
		
		if (inString) str += c;
		else
		{
			if (c == " ")
			{
				tokens.push(str);
				str = "";
			}
			else if (c == "\n")
			{
				tokens.push(str);
				tokens.push("\n");
				str = "";
			}
			else if (c != "'") str += c;
		}
		
		if (i == source.length - 1)
		{
			tokens.push(str);
			str = "";
		}
	}
	
	// now color them!
	str = "";
	
	tokens.forEach(token => {
		
		var includesKeywords = keywords.includes(token);
		var includesTypes = types.includes(token);
		var includesNumber = containsOnlyNumbers(token);
		var includeBooleans = token == "true" || token = "false";
		
		if (!token.startsWith("'"))
		{
		
			if (includesKeywords) str += '<span class="sh_keyword">';
			if (includesTypes) str += '<span class="sh_type">';
			if (includesNumber) str += '<span class="sh_number">';
			if (includeBooleans) str += '<span ass="sh_boolean">';
		
			str += token;
		
			if (includesKeywords || includesTypes || includesNumber || includeBooleans) str += "</span>";
		
		}
		else // if its string
		{
			str += '<span class="sh_string">';
			str += token;
			str += "'</span>";
		}
		
		str += " ";
		
	});
	
	return str;
}

function parseArgsLength(source, needle)
{
	var num = "";
	var i = needle;
	for (var i = needle + 1; i < source.length; i++)
	{
		if (source[i] == "!") break;
		else num += source[i];
	}
	
	return parseInt(num) - 1;
}

function parse(source) // returns an array of tokens
{
	var isComment = false;
	var isInString = false;
	var prev = "";
	
	var lineArr = [];
	var totalArr = [];
	var currentStr = "";
	
	var argsPerLine = 2; // 3 since (n + 1)
	var currentArgsPerLine = 0;
	
	var needle = source.indexOf("!");
	
	var shouldParseLength = false;
	
	if ((needle - 1) != -1)
	{
		if (source[needle - 1] == "\n")
		shouldParseLength = true;
	}
	else if (needle == 0) shouldParseLength = true;
	
	if (shouldParseLength) argsPerLine = parseArgsLength(source, needle);
	
	
	for (var i = 0; i < source.length; i++)
	{
		var c = source[i];
		
		// ---[ Comment making ]-----------------------------
		if (isComment)
		{
			if (c != "\n") continue;
			else isComment = false;
		}
		else if (c == "#") isComment = true;
		// --------------------------------------------------
		
		// ---[ String making ]------------------------------
		if (isInString)
		{
			if (c == "\"" && prev != "\\") 
			{
				isInString = false;
				lineArr.push(currentStr);
				currentStr = "";
				
				if (currentArgsPerLine >= argsPerLine)
				{
					currentArgsPerLine = 0;
					totalArr.push(lineArr);
					lineArr = [];
				}
				else currentArgsPerLine++;
			}
			else {
				if (c == "\\" && prev == "\\") currentStr += "\\";
				else if (c != "\\") currentStr += c;
			}
		}
		else if (c == "\"") isInString = true;
		// --------------------------------------------------
		
		prev = c;
	}
	
	return totalArr;
}
