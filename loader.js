fetch(window.location.origin + "/docs.txt")
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
			var desc = arr[1].replaceAll("\n", "<br>");
			var example = arr[2].replaceAll("\n", "<br>");
			
			if (arr[3] != "")
			{
				additional = `<fieldset class="cmd_info"><legend class="cmd_legend l_additional">Additional information:</legend><span class="cmd_info_text">${arr[3]}</span></fieldset>`;
			}
			
			html += `<div id="_${arr[0]}_${link_helper}" class="cmd_div"><div class="cmd_top_div"><span class="command_name">${arr[0]}</span>`
				+ `<div class="cmd_desc">${desc}</div></div>`
				+ `<fieldset class="cmd_bg"><legend class="cmd_legend l_example">Example:</legend><span class="cmd_example">${example}</span></fieldset>`
				+ additional
				+ `</div>`;
				
			table.innerHTML += `<a href="#_${arr[0]}_${link_helper}">${arr[0]}</a>`;
			
			link_helper++;
			
		});
		
		document.getElementById("docs").innerHTML = html;
	})

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