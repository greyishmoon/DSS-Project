var problem; // Problem data object
// Ractive components
var ractiveTitle, ractiveAlternatives, ractiveFactors;
var minAltCount = 1; // Number of alternatives - limited >=1 <=6
var maxAltCount = 6;


$(document).ready(function() {
    console.log("ready!");

    // TODO - refactor to only create new project if one not loaded in local memory
    //	// Initialise Problem object
    problem = new Problem("EMPTY!!");


    // Initialse Ractive objects
    // TITLE TABLE
    ractiveTitle = new Ractive({
        target: '#target-title-table',
        template: '#template-title-table',
        data: problem
    });
    // ALTERNATIVES TABLE
    ractiveAlternatives = new Ractive({
        target: '#target-alternatives-table',
        template: '#template-alternatives-table',
        data: problem
    });
    // FACTORS TABLE
    ractiveFactors = new Ractive({
        target: '#target-factors-table',
        template: '#template-factors-table',
        data: problem
    });



    // LISTENERS
    // Tab button LISTENERS
    $('.mdl-layout__tab').on('click', tabClicked);
    // ALTERNATIVES
    // Add row to alternative-table
    $('#add-alternative').on('click', addAlternative);
    // Remove last row from alternative-table
    $('#remove-alternative').on('click', removeAlternative);
    // Disable remove button on load
    disableButton("#remove-alternative");
    // FACTORS
    // Add row to alternative-table
    $('#add-factor').on('click', addBlankFactor);
    // Place first row
    //addBlankFactor();
    // Remove last row from alternative-table
    $('#remove-factor').on('click', removeFactor);
    // Disable remove button on load
    disableButton("#remove-factor");
    // Input change listener - whenever focus leaves input update data object
    $('input').on('focusout', update);
    // SET LISTENERS ON DYNAMIC CONTENT
    setListeners();
    print();

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        console.log('File APIs SUPPORTED.');
    } else {
        alert('File saving is not fully supported in this browser.');
    }

});

//////////////////// DYNAIMC LISTENERS /////////////////////
// Remove and set listeners on dynamic content
function setListeners() {
    // Remove all listeners on input fields
    $('input').off();
    // Input change listener - whenever focus leaves input update data object
    $('input').on('focusout', update);
}
//////////////////// DYNAIMC LISTENERS /////////////////////

// NAVIGATION
function tabClicked() {
    window.scrollTo(0, 0);
    console.log("TAB CLICKED");
}


//////////////// ALTERNATIVES ////////////////
// Adds alternative with blank name
function addAlternative() {
    // Add alternative to data model
    problem.addAlternative('add alt');
    // Disable add button if count >= max number
    if (problem.alternatives.length >= maxAltCount) {
        disableButton("#add-alternative");
    }
    // Enable remove button
    enableButton("#remove-alternative");
    // Update interface
    update();
}

// Remove last row from alternative array
function removeAlternative() {
    // Remove last alternative from array
    problem.removeAlternative();
    // Disable remove button if count <= min number
    if (problem.alternatives.length <= minAltCount) {
        disableButton("#remove-alternative");
    }
    // Enable add button
    enableButton("#add-alternative");
    // Update interface
    update();
}
//////////////// ALTERNATIVES ////////////////


////////////////// FACTORS ///////////////////
// Adds factor with blank name
function addBlankFactor() {
    // Add factor to data model
    problem.addFactor('add Fact');
    // << IF LIMIT TO NUMBER OF FACTORS, ADD HERE
    // Enable remove button
    enableButton("#remove-factor");
    // Update interface
    update();
}

// Remove last row from factors array
function removeFactor() {
    // Remove last factor from array
    problem.removeFactor();
    // Disable remove button if count <= min number
    if (problem.factors.length <= 1) {
        disableButton("#remove-factor");
    }
    // Enable add button
    enableButton("#add-factor");
    // Update interface
    update();
}
/////////////////// FACTORS ///////////////////


/////////////////// UPDATE ////////////////////

// UPDATE ractive model to display changes, upgrade MDL elements and reset listeners
function update() {
    console.log("UPDATE");
    // Update ractive components
    ractiveTitle.update();
    ractiveAlternatives.update();
    ractiveFactors.update();
    // Upgrade all added MDL elements
    upgradeMDL();
    // Reset listeners on all dynamic content
    setListeners();

    // Test Print
    print();
}




/////////////////// UPDATE ////////////////////



///////// GENERAL HELPER FUNCTIONS ////////////

// Remove last row in tableID table
function removeLastRow(tableID) {
    $(tableID + ' tbody tr:last').remove();
}

// Upgrade all MDL components after adding content
function upgradeMDL() {
    componentHandler.upgradeDom('MaterialCheckbox');
    componentHandler.upgradeDom('MaterialTextfield');
}

// Enable MDL button using buttonID
function enableButton(buttonID) {
    // enable HTML button
    $(buttonID).attr("disabled", false);
    // enable MDL styling
    // $(buttonID).removeClass("mdl-button--disabled")
    // //
    // componentHandler.upgradeElement($(buttonID));
}

// Disable MDL button using buttonID
function disableButton(buttonID) {
    var button = document.getElementById('remove-alternative');
    //var button = $(buttonID);
    //   // enable HTML button
    $(buttonID).attr("disabled", true);
    //   // enable MDL styling
    //   button.addClass("mdl-button--disabled")
    //   //
    //   componentHandler.upgradeElement(button);
}
///////// GENERAL HELPER FUNCTIONS ////////////


///////// DEBUG FUNCTIONS /////////////

// Print data object to test-div
function print() {
    var output = '';
    output += '<br> Problem Title: ' + problem.title;
    // alternatives
    for (i = 0; i < problem.alternatives.length; i++) {
        output += '<br> Alternative ' + (i + 1) + ': ' + problem.alternatives[i];
    }
    // factors
    for (i = 0; i < problem.factors.length; i++) {
        output += '<br> Factor ' + (i + 1) + ': ' + problem.factors[i].name;
    }


    $('#test-div').html(output);

    console.log(problem);
}
