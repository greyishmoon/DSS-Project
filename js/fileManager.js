// adapted from https://eligrey.com/demos/FileSaver.js/ + https://codepen.io/SpencerCooley/pen/JtiFL/

// Save project
function saveOBJECTasJSONfile(jsObject, fileName) {
    var jsonToSave = JSON.stringify(jsObject);
    var jsonToSaveAsBlob = new Blob([jsonToSave], {
        type: "application/json"
    });
    var jsonToSaveAsURL = window.URL.createObjectURL(jsonToSaveAsBlob);
    var fileNameToSaveAs = fileName;

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File!!!!!!!!!!!!!!";
    downloadLink.href = jsonToSaveAsURL;
    downloadLink.onclick = destroyClickedElement;
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

// Load project from file and return JS object to callback function
function loadFileAsJSobject(fileToLoad, callBack) {
    console.log("FILE LOAD");
    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) {
        var jsonFromFileLoaded = fileLoadedEvent.target.result;
        callBack(jsonFromFileLoaded);
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
}


function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}
