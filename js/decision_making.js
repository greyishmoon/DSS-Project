/*jshint esversion: 6 */

var data; // Manager holding the Problem data object
// Ractive components
var ractiveTitle, ractiveAlternatives, ractiveFactors, ractiveData, ractiveSummary, ractiveFactorWeights, ractiveAggregatedBeliefs;

var minAltCount = 1; // Number of alternatives - limited >=1 <=6
var maxAltCount = 6;


$(document).ready(function() {

    // TODO - refactor to only create new project if one not loaded in local memory (or process this in constructor?)
    data = new ProblemManager();

    // TODO - refactor to only create new project if one not loaded in local memory
    //	// Initialise Problem object
    // problem = new Problem("EMPTY!!");



    // Initialse Ractive objects
    // TITLE TABLE
    ractiveTitle = new Ractive({
        target: '#target-title-table',
        template: '#template-title-table',
        data: data.problem
    });
    // ALTERNATIVES TABLE
    ractiveAlternatives = new Ractive({
        target: '#target-alternatives-table',
        template: '#template-alternatives-table',
        data: data.problem
    });
    // FACTORS TABLE
    ractiveFactors = new Ractive({
        target: '#target-factors-table',
        template: '#template-factors-table',
        data: data.problem
    });
    // DATA ENTRY TABLE
    ractiveData = new Ractive({
        target: '#target-data-table',
        template: '#template-data-table',
        data: data.problem
    });
    // SUMMARY TABLE
    ractiveSummary = new Ractive({
        target: '#target-summary-table',
        template: '#template-summary-table',
        data: data.problem
    });
    // FACTOR WEIGHTS TABLE
    ractiveFactorWeights = new Ractive({
        target: '#target-factor-weights-table',
        template: '#template-factor-weights-table',
        data: data.problem
    });
    // AGGREGATED BELIEFS TABLE
    ractiveAggregatedBeliefs = new Ractive({
        target: '#target-aggregated-beliefs-table',
        template: '#template-aggregated-beliefs-table',
        data: data.problem
    });

    // Run dynamic elements initialisation
    onProjectLoad();

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        console.log('File APIs SUPPORTED.');
    } else {
        alert('File saving is not fully supported in this browser.');
    }

});

///////////////////////// ON LOAD //////////////////////////
// Initialise listeners etc when project is loaded
function onProjectLoad() {
    // LISTENERS
    // Tab button LISTENERS
    $('.mdl-layout__tab').on('click', tabClicked);
    // ALTERNATIVES
    // Add alternative
    $('#add-alternative').on('click', addAlternative);
    // Remove last alternative
    $('#remove-alternative').on('click', removeAlternative);
    // Disable remove button on load if count <= min number
    if (data.getAltLength() <= minAltCount) {
        disableButton("#remove-alternative");
    }
    // FACTORS
    // Add factor
    $('#add-factor').on('click', addFactor);
    // Remove last factor
    $('#remove-factor').on('click', removeFactor);
    // Disable remove button on load if count <= min number
    if (data.getFactorLength() <= 1) {
        disableButton("#remove-factor");
    }

    // SET LISTENERS ON DYNAMIC CONTENT
    resetListeners();
    print();

    // FORCE CALCULATION OF EVEN FACTOR WEIGHTS ON RESULTS PAGE
    // ONLY to be run ONCE on initial project load
    data.forceFactorWeightsCalc();
    update();

}

//////////////////// DYNAIMC LISTENERS /////////////////////
// Remove and set listeners on dynamic content
function resetListeners() {
    // CRITERIA
    // Remove all listeners on input fields
    $('.add-criteria').off();
    $('.remove-criteria').off();
    $('input').off();
    $('input.summaryInput').off();

    // Add criteria to specific factor - use class not ID due to repeats
    $('.add-criteria').on('click', addCriteria);
    // Remove last criteria to specific factor
    $('.remove-criteria').on('click', removeCriteria);
    // Input change listener - whenever focus leaves input update data object
    $('input').on('focusout', update);
    // Input change listener - FOR INPUT CELLS ON RESULTS PAGE - to force data update
    $('input.summaryInput').on('focusout', updateData);
}
//////////////////// DYNAIMC LISTENERS /////////////////////

// NAVIGATION
function tabClicked() {
    window.scrollTo(0, 0);
    // TODO - TEMP ADDITION TO UPDATE DATA ON TAB CHANGE - MAY BE ABLE TO REMOVE IF NO PROBLEM CALLING DATA.UPDATE FROM THIS.UPDATE
    updateData()
    console.log("TAB CLICKED");
}


//////////////// ALTERNATIVES ////////////////
// Adds alternative with blank name
function addAlternative() {
    // Add alternative to data model
    data.addAlternative('');
    // Disable add button if count >= max number
    if (data.getAltLength() >= maxAltCount) {
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
    data.removeAlternative();
    // Disable remove button if count <= min number
    if (data.getAltLength() <= minAltCount) {
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
function addFactor() {
    // Add factor to data model
    data.addFactor('');
    // << IF LIMIT TO NUMBER OF FACTORS, ADD HERE
    // Enable remove button
    enableButton("#remove-factor");
    // Update interface
    update();
}

// Remove last row from factors array
function removeFactor() {
    // Remove last factor from array
    data.removeFactor();
    // Disable remove button if count <= min number
    if (data.getFactorLength() <= 1) {
        disableButton("#remove-factor");
    }
    // Enable add button
    enableButton("#add-factor");
    // Update interface
    update();
}
/////////////////// FACTORS ///////////////////

/////////////////// CRITERIA //////////////////
// Adds criterion with blank name
function addCriteria(event) {
    // Capture which factor to add criteria too
    var factorId = parseInt($(event.currentTarget).attr('data-id'));
    // Add criteria to data model
    console.log('factor name: ' + data.getFactor(0));
    data.addCriterionTo(data.getFactor(factorId),'');
    // Update interface
    update();
}

// Remove last row from criteria array of relevent factor object
function removeCriteria(event) {
    // Capture which factor to add criteria too
    var factorId = $(event.currentTarget).attr('data-id');
    // Remove last criteria from array
    data.removeCriterionFrom(data.getFactor(factorId));
    // Update interface
    update();
}
/////////////////// CRITERIA //////////////////


/////////////////// UPDATE ////////////////////

// UPDATE ractive model to display changes, upgrade MDL elements and reset listeners
function update() {
    console.log("UPDATE");
    // Update ractive components
    ractiveTitle.update();
    ractiveAlternatives.update();
    ractiveFactors.update();
    ractiveData.update();
    ractiveSummary.update();
    ractiveFactorWeights.update();
    ractiveAggregatedBeliefs.update();

    // Update data object - initiates results calculations
    // TODO *** POTENTIALLY NEED TO MOVE TO TAB CLICKED TO AVOID RECURSIVE LOOP WITH RESULTS FORM CHANGING FROM DATA UPDATE
    //data.update();

    // Upgrade all added MDL elements
    upgradeMDL();
    // Reset listeners on all dynamic content
    resetListeners();

    // TODO - implement saving to local storage

    // Test Print
    print();
}

// UPDATE DATA calculation - on tab change AND ractive changes on Results page
function updateData() {
    data.update();
}
/////////////////// UPDATE ////////////////////



///////// GENERAL HELPER FUNCTIONS ////////////

// Upgrade all MDL components after adding content
function upgradeMDL() {
    // componentHandler.upgradeDom('MaterialCheckbox');
    // componentHandler.upgradeDom('MaterialTextfield');
    componentHandler.upgradeDom();
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
    output += '<br> Problem Title: ' + data.problem.title;

    // alternatives
    data.problem.alternatives.forEach(function(name, index) {
        output += '<br> Alternative ' + (index + 1) + ': ' + name;
    });

    // factors
    data.problem.factors.forEach(function(factor, index) {
        output += '<br><br> Factor ' + (index + 1) + ': ' + factor.name;
        // criteria
        factor.criteria.forEach(function(criterion) {
            output += '<br> &nbsp;&nbsp; Criterion name: ' + criterion.name;
            output += '<br> &nbsp;&nbsp; Criterion weight: ' + criterion.weight;
            altWeightString = '<br> &nbsp;&nbsp; &nbsp;&nbsp; Alt weights: ';
            // Alternative weights for Criterion
            criterion.alternativeWeights.forEach(function(weight) {
                altWeightString += weight + ", ";
            });
            output += altWeightString;
        });
    });


    $('.test-div').html(output);

    console.log(data.problem);
}
