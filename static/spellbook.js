let previousSceneGlobal = "";

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

function getNextScene(previousScene, userPrompt) {
	let sceneVars = {
		previousScene: previousScene,
		userPrompt: userPrompt
	};
	post("/scene", sceneVars, (sceneResponse) => {
		var sceneElem = document.createElement("div");
		sceneElem.setAttribute("class", "scene");
		sceneElem.innerHTML = sceneResponse;
		previousSceneGlobal = sceneResponse;
		// add to content
		document.getElementById("content").appendChild(sceneElem);
		let vars = {
			scene: sceneResponse
		};
		post("/setting", vars, (settingResponse) => {
			let vars = {
				setting: settingResponse
			};
			post("/illustrate", vars, (illustrateResponse) => {
				var imgElem = document.createElement("img");
				imgElem.setAttribute("src", illustrateResponse);
				imgElem.setAttribute("height", "400");
				imgElem.setAttribute("width", "300");
				imgElem.setAttribute("alt", "settingResponse");
				sceneElem.prepend(imgElem);
			});
		});
	});
}

function main() {
	// get("/scene", (initialSceneResponse) => {
	// 	var sceneElem = document.createElement("div");
	// 	sceneElem.innerHTML = initialSceneResponse;
	// 	// add to content
	// 	document.getElementById("content").appendChild(sceneElem);
	// 	let vars = {
	// 		scene: initialSceneResponse
	// 	};
	// 	post("/setting", vars, (settingResponse) => {
	// 		let vars = {
	// 			setting: settingResponse
	// 		};
	// 		post("/illustrate", vars, (illustrateResponse) => {
	// 			var imgElem = document.createElement("img");
	// 			imgElem.setAttribute("src", illustrateResponse);
	// 			imgElem.setAttribute("height", "400");
	// 			imgElem.setAttribute("width", "300");
	// 			imgElem.setAttribute("alt", "settingResponse");
	// 			sceneElem.prepend(imgElem);
	// 		});
	// 	});
	// });

	// get initial scene
	getNextScene("", "");

	document.getElementById("go").addEventListener("click", (event) => {
		let userPrompt = document.getElementById("input").value;
		getNextScene(previousSceneGlobal, userPrompt);
	});
}
