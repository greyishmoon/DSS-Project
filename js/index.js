
$(document).ready(function () {
	console.log("ready!");


	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
		console.log('The File APIs SUPPORTED.');
	} else {
		alert('File saving is not fully supported in this browser.');
	}

});
