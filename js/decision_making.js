/*jshint esversion: 6 */

var data; // Manager holding the Problem data object
// Ractive components
var ractiveTitle, ractiveAlternatives, ractiveCategorys, ractiveData, ractiveSummary, ractiveCategoryWeights, ractiveAggregatedBeliefs;

var minAltCount = 1; // Number of alternatives - limited >=1 <=6
var maxAltCount = 6;


$(document).ready(function() {

    // Datamanager that stores problem data
    dataManager = new ProblemManager();

    // Initialse Ractive objects
    setRactives();

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
// Set ractive data bindings
function setRactives() {
    // Initialse Ractive objects
    // TITLE TABLE
    ractiveTitle = new Ractive({
        target: '#target-title-table',
        template: '#template-title-table',
        data: dataManager.problem
    });
    // ALTERNATIVES TABLE
    ractiveAlternatives = new Ractive({
        target: '#target-alternatives-table',
        template: '#template-alternatives-table',
        data: dataManager.problem
    });
    // CATEGORIES TABLE
    ractiveCategorys = new Ractive({
        target: '#target-categories-table',
        template: '#template-categories-table',
        data: dataManager.problem
    });
    // DATA ENTRY TABLE
    ractiveData = new Ractive({
        target: '#target-data-table',
        template: '#template-data-table',
        data: dataManager.problem
    });
    // SUMMARY TABLE
    ractiveSummary = new Ractive({
        target: '#target-summary-table',
        template: '#template-summary-table',
        data: dataManager.problem
    });
    // CATEGORY WEIGHTS TABLE
    ractiveCategoryWeights = new Ractive({
        target: '#target-category-weights-table',
        template: '#template-category-weights-table',
        data: dataManager.problem
    });
    // AGGREGATED BELIEFS TABLE
    ractiveAggregatedBeliefs = new Ractive({
        target: '#target-aggregated-beliefs-table',
        template: '#template-aggregated-beliefs-table',
        data: dataManager.problem
    });
}

// Initialise listeners etc when project is loaded
function onProjectLoad() {
    // LISTENERS
    // PROJECT
    // Tab button LISTENERS
    $('.mdl-layout__tab').on('click', tabClicked);
    // PROBLEM SETUP
    // Add alternative
    $('#add-alternative').on('click', addAlternative);
    // Remove last alternative
    $('#remove-alternative').on('click', removeAlternative);
    // Disable remove button on load if count <= min number
    if (dataManager.getAltLength() <= minAltCount) {
        disableButton("#remove-alternative");
    }
    // DATA ENTRY
    // Add category
    $('#add-category').on('click', addCategory);
    // Remove last category
    $('#remove-category').on('click', removeCategory);
    // Disable remove button on load if count <= min number
    if (dataManager.getCategoryLength() <= 1) {
        disableButton("#remove-category");
    }
    // LOAD/SAVE PAGE
    // Reset project button
    $('#reset').on('click', resetProject);

    // TAB NAVIGATION
    // Next button on each tab to simulate click on tab
    $('#go-tab-1-btn').on('click', goTab1);
    $('#go-tab-2-btn').on('click', goTab2);
    // Scroll to top buttons (if needed)
    $("#scroll-up-btn").click(scrollToTop);

    // SET LISTENERS ON DYNAMIC CONTENT
    resetListeners();
    print();

    // FORCE CALCULATION OF EVEN CATEGORY WEIGHTS ON RESULTS PAGE
    // ONLY to be run ONCE on initial project load
    dataManager.forceCategoryWeightsCalc();
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

    // Add criteria to specific category - use class not ID due to repeats
    $('.add-criteria').on('click', addCriteria);
    // Remove last criteria to specific category
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
    dataManager.addAlternative('');
    // Disable add button if count >= max number
    if (dataManager.getAltLength() >= maxAltCount) {
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
    dataManager.removeAlternative();
    // Disable remove button if count <= min number
    if (dataManager.getAltLength() <= minAltCount) {
        disableButton("#remove-alternative");
    }
    // Enable add button
    enableButton("#add-alternative");
    // Update interface
    update();
}
//////////////// ALTERNATIVES ////////////////


////////////////// CATEGORIES ///////////////////
// Adds category with blank name
function addCategory() {
    // Add category to data model
    dataManager.addCategory('');
    // << IF LIMIT TO NUMBER OF CATEGORIES, ADD HERE
    // Enable remove button
    enableButton("#remove-category");
    // Update interface
    update();
}

// Remove last row from Categories array
function removeCategory() {
    // Remove last category from array
    dataManager.removeCategory();
    // Disable remove button if count <= min number
    if (dataManager.getCategoryLength() <= 1) {
        disableButton("#remove-category");
    }
    // Enable add button
    enableButton("#add-category");
    // Update interface
    update();
}
/////////////////// CATEGORIES ///////////////////

/////////////////// CRITERIA //////////////////
// Adds criterion with blank name
function addCriteria(event) {
    // Capture which category to add criteria too
    var categoryId = parseInt($(event.currentTarget).attr('data-id'));
    // Add criteria to data model
    console.log('category name: ' + dataManager.getCategory(0));
    dataManager.addCriterionTo(dataManager.getCategory(categoryId),'');
    // Update interface
    update();
}

// Remove last row from criteria array of relevent category object
function removeCriteria(event) {
    // Capture which category to add criteria too
    var categoryId = $(event.currentTarget).attr('data-id');
    // Remove last criteria from array
    dataManager.removeCriterionFrom(dataManager.getCategory(categoryId));
    // Update interface
    update();
}
/////////////////// CRITERIA //////////////////

////////////////// NAVIGATION /////////////////

// Simulate click on MDL tabs
// Problem Setup
function goTab0() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(0) span").click ();
}
// Data Entry
function goTab1() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(1) span").click ();
}
// Summary
function goTab2() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(2) span").click ();
}
// Results
function goTab3() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(3) span").click ();
}
// Instructions
function goTab4() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(4) span").click ();
}
// Save/Load
function goTab5() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(5) span").click ();
}

// TODO complete scroll fix
// references https://codepen.io/mdlhut/pen/BNeoVa https://codepen.io/exam/pen/ZbvLPO
var scrollTo = function(top) {
  var content = $(".page-content");
  var target = top ? 0 : $(".page-content").height();
  content.stop().animate({ scrollTop: target }, "slow");
};

var scrollToTop = function() {
  scrollTo(true);
  console.log(("SCROLL UP"));
};

var scrollToBottom = function() {
  scrollTo(false);
};

////////////////// NAVIGATION /////////////////


/////////////////// UPDATE ////////////////////

// UPDATE ractive model to display changes, upgrade MDL elements and reset listeners
function update() {
    console.log("UPDATE");
    // Update ractive components
    ractiveTitle.update();
    ractiveAlternatives.update();
    ractiveCategorys.update();
    ractiveData.update();
    ractiveSummary.update();
    ractiveCategoryWeights.update();
    ractiveAggregatedBeliefs.update();

    // Update data object - initiates results calculations
    // TODO *** POTENTIALLY NEED TO MOVE TO TAB CLICKED TO AVOID RECURSIVE LOOP WITH RESULTS FORM CHANGING FROM DATA UPDATE
    //data.update();

    // Upgrade all added MDL elements
    upgradeMDL();
    // Reset listeners on all dynamic content
    resetListeners();

    // TODO - implement saving to local storage
    // Initiate save to localStorage on every data change
    saveLocal();

    // Log updated data object
    console.log(dataManager.problem);

    // Test Print
    print();
}

// Save data to localStorage
function saveLocal() {
    dataManager.saveLocal();
}

// UPDATE DATA calculation - on tab change AND ractive changes on Results page
function updateData() {
    dataManager.update();
    update();
}
/////////////////// UPDATE ////////////////////

//////////////// LOAD / SAVE //////////////////

// Reset project and clear all current data from memory and local Storage
function resetProject() {
    dataManager.resetProject();
    // Reset ractive bindings
    setRactives();
    update();
}


//////////////// LOAD / SAVE //////////////////

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
    output += '<br> Problem Title: ' + dataManager.problem.title;

    // alternatives
    dataManager.problem.alternatives.forEach(function(name, index) {
        output += '<br> Alternative ' + (index + 1) + ': ' + name;
    });

    // categories
    dataManager.problem.categories.forEach(function(category, index) {
        output += '<br><br> Category ' + (index + 1) + ': ' + category.name;
        // criteria
        category.criteria.forEach(function(criterion) {
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

}
