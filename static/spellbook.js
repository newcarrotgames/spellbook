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
		illustrationElem.setAttribute("class", "illustration-container");

		// create image placeholder element (loading animation)
		var imgBkgElem = document.createElement("div");
		imgBkgElem.setAttribute("class", "illustration-bkg");
		illustrationElem.appendChild(imgBkgElem);

		// add illustration container to scene element
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

			// add caption to illustration container
			illustrationElem.appendChild(captionElem);
		});

		post("/illustrate", sceneVars, (illustrateResponse) => {
			// create image element
			console.log(illustrateResponse);
			var imgElem = document.createElement("img");
			imgElem.setAttribute("src", illustrateResponse);
			imgElem.setAttribute("class", "illustration");
			imgElem.onload = () => {
				imgBkgElem.appendChild(imgElem);
			};
			
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
	inputElem.disabled = !inputElem.disabled;
}

function main() {
	// get initial scene
	getNextScene("", "");

	// press enter to take input
	document.getElementById("input").addEventListener("keyup", (event) => {
		if (event.code === "Enter")
			handleUserInput();
	});
}
