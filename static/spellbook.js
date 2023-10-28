let previousSceneGlobal = "";
let storyGlobal	= "";

function get(url, callback) {
	console.log("get: " + url);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			callback(this.responseText);
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
}

function post(url, vars, callback) {
	console.log("post: " + url);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			callback(this.responseText);
		}
	};
	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.send(JSON.stringify(vars));
}

function filterSettingResponse(settingResponse) {
	let res = settingResponse.replace(/scene: /gi, "");
	res = res.replace(/setting: /gi, "");
	return res;
}

function getNextScene(previousScene, userPrompt) {
	// disable input while waiting for response
	toggleInput();

	let sceneVars = {
		previousScene: previousScene,
		userPrompt: userPrompt
	};

	// create scene element
	var sceneElem = document.createElement("div");
	sceneElem.setAttribute("class", "scene");
	sceneElem.innerHTML = "Loading...";

	// add to content
	document.getElementById("content").appendChild(sceneElem);

	post("/scene", sceneVars, (sceneResponse) => {
		sceneElem.innerHTML = sceneResponse;
		previousSceneGlobal = sceneResponse;
		
		// summarize the story and display the results
		let summarizeVars = {
			scene: sceneResponse
		};
		post("/summarize", summarizeVars, (summarizeResponse) => {
			storyGlobal += summarizeResponse;
		});

		// create image and caption container element
		var illustrationElem = document.createElement("div");
		illustrationElem.setAttribute("class", "illustration");

		// create image element
		var imgElem = document.createElement("img");
		imgElem.setAttribute("src", "/static/images/black.png");
		imgElem.setAttribute("height", "400");
		imgElem.setAttribute("width", "300");
		illustrationElem.appendChild(imgElem);

		// add to scene element
		sceneElem.prepend(illustrationElem);

		let sceneVars = {
			scene: sceneResponse
		};

		post("/setting", sceneVars, (settingResponse) => {
			settingResponse = filterSettingResponse(settingResponse);

			// create caption element
			var captionElem = document.createElement("div");
			captionElem.setAttribute("class", "caption");
			captionElem.innerHTML = settingResponse;
			illustrationElem.appendChild(captionElem);

			// set alt text for image
			imgElem.setAttribute("alt", settingResponse);
		});

		post("/illustrate", sceneVars, (illustrateResponse) => {
			imgElem.setAttribute("src", illustrateResponse);
			// make input available again
			toggleInput();
		});
	});
}

function handleUserInput() {
	let userPrompt = document.getElementById("input").value;
	document.getElementById("input").value = "";
	getNextScene(storyGlobal + " " + previousSceneGlobal, userPrompt);
}

function toggleInput() {
	var inputElem = document.getElementById("input");
	var goButton = document.getElementById("go");
	inputElem.disabled = !inputElem.disabled;
	goButton.disabled = !goButton.disabled;
}

function main() {
	// get initial scene
	getNextScene("", "");

	// add event listener to go button
	document.getElementById("go").addEventListener("click", (event) => {
		handleUserInput();
	});

	document.getElementById("input").addEventListener("keyup", (event) => {
		if (event.code === "Enter")
			handleUserInput();
	});
}
