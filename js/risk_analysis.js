/*jshint esversion: 6 */

var projectManager; // Manager holding the Problem data object
var project; // Link to project data
// Ractive components
var ractiveTitle, ractiveCategories, ractiveRisks;

var minCatCount = 1; // Number of categories - limited >=1 <=6
var maxCatCount = 6;
var minRiskCount = 1; // Number of risks - limited >=1 <=6
var maxRiskCount = 6;

var simTabClicked = false; // Temporarily records if tab click is being simulated by code - used to stop recursive loop when redirecting pages to highlight errors
var delayInMillisecondsForward = 10; // timer for simTabClicked reset
var delayInMillisecondsReset = 100; // timer for simTabClicked reset

// riskCharacteristicsGroupFault - Records if there are any incorrect group totals on risk Characteristics data entry page
// Risk weights within each category should total 100
var riskCharacteristicsGroupFault = false;
// impactAssessmentGroupFault - Records if there are any incorrect group totals on Impact Assessment data entry page
// Risk weights within each category should total 100
var impactAssessmentGroupFault = false;

$(document).ready(function() {

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        console.log('The File APIs SUPPORTED.');
    } else {
        alert('File saving is not fully supported in this browser.');
    }

    // projectManager that stores problem data
    projectManager = new ProjectManager();
    // create link to project data
    project = projectManager.getProject();



    // Initialse Ractive objects
    setRactives();

    // Run dynamic elements initialisation
    onProjectLoad();

});

///////////////////////// ON LOAD //////////////////////////
// Set ractive data bindings
function setRactives() {
    // Initialse Ractive objects
    // TITLE TABLE
    ractiveTitle = new Ractive({
        target: '#target-title-table',
        template: '#template-title-table',
        data: project
    });
    // CATEGORIES TABLE
    ractiveCategories = new Ractive({
        target: '#target-categories-table',
        template: '#template-categories-table',
        data: project
    });
    // RISKS TABLE
    ractiveRisks = new Ractive({
        target: '#target-risks-table',
        template: '#template-risks-table',
        data: project
    });
}

// Initialise listeners etc when project is loaded
function onProjectLoad() {
    // SET LISTENERS ON DYNAMIC CONTENT
    setListeners();

    update();

}
///////////////////////// ON LOAD //////////////////////////


//////////////////// DYNAMIC LISTENERS /////////////////////
// Set dynamic listeners
function setListeners() {
    // LISTENERS
    // PROJECT
    // Tab button LISTENERS
    $('.mdl-layout__tab').on('click', tabClicked);
    // PROJECT SETUP
    // Add category
    $('#add-category').on('click', addCategory);
    // Remove last category
    $('#remove-category').on('click', removeCategory);
    // Add risk to specific category - use class not ID due to repeats
    $('.add-risk').on('click', addRisk);
    // Remove last risk to specific category
    $('.remove-risk').on('click', removeRisk);
    // Input change listener - whenever focus leaves input update data object
    $('input').on('focusout', update);
    // Input change listener - FOR INPUT CELLS ON SUMMARY PAGE - to force data update
    $('input.summaryInput').on('focusout', updateData);

    // TAB NAVIGATION
    // Next button on each tab to simulate click on tab
    $('.go-tab-1-btn').on('click', goTab1);
    $('.go-tab-2-btn').on('click', goTab2);
    $('.go-tab-3-btn').on('click', goTab3);
    $('.go-tab-4-btn').on('click', goTab4);
    // Scroll to top buttons (if needed)
    $("#scroll-up-btn").click(scrollToTop);
}
// Remove and reset listeners on dynamic content
function resetListeners() {
    // RISKS
    // Remove all listeners on input fields
    $('.add-risk').off();
    $('.remove-risk').off();
    $('input').off();
    $('input.summaryInput').off();

	// Add risk to specific category - use class not ID due to repeats
    $('.add-risk').on('click', addRisk);
    // Remove last risk to specific category
    $('.remove-risk').on('click', removeRisk);
    // Input change listener - whenever focus leaves input update data object
    $('input').on('focusout', update);
    // Input change listener - FOR INPUT CELLS ON SUMMARY PAGE - to force data update
    $('input.summaryInput').on('focusout', updateData);
}

// Check all buttons and enable/disable based on conditions - called by update
function checkButtons() {
    // Project Setup page
    // Categories data entry
    let catLength = projectManager.getCategoryLength();
    // Enable add button
    if (catLength > 1) {
        enableButton("#add-category");
    }
    // Disable add button if count > min number
    if (catLength >= maxCatCount) {
        disableButton("#add-category");
    }
    // Enable remove button
    if (catLength > 1) {
        enableButton("#remove-category");
    }
    // Disable remove button if count <= min number
    if (catLength <= 1) {
        disableButton("#remove-category");
    }

}

//////////////////// DYNAMIC LISTENERS /////////////////////


////////////////// NAVIGATION /////////////////

function tabClicked() {
    // If simulate tab click then return to break recursive loop - simTabClicked gets reset on a timer
    if (simTabClicked) {
        return;
    }
    // check for inconsistent data in Risk Characteristics page and call Risk Characteristics tab on delay
    if (riskCharacteristicsGroupFault) {
        setTimeout(goTab2, delayInMillisecondsForward);
    }
    // check for inconsistent data in Summary page and call Summary tab on delay
    // if (impactAssessmentGroupFault) {
    //     setTimeout(goTab3, delayInMillisecondsForward);
    // }

    //updateData()
    console.log("TAB CLICKED");
    scrollToTop();
}

// Simulate click on MDL tabs
// Project Setup
function goTab0() {
    $(".mdl-layout__tab:eq(0) span").click();
}
// Risk Characteristics
function goTab1() {

    $(".mdl-layout__tab:eq(1) span").click();
    scrollToTop();
}
// Impact Assessment
function goTab2() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    if (riskCharacteristicsGroupFault) {
        $(".mdl-layout__tab:eq(1) span").click();
        showDataEntryWarningDialogue();
    } else {
        $(".mdl-layout__tab:eq(2) span").click();
        scrollToTop();
    }

}
// Results
function goTab3() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    if (impactAssessmentGroupFault) {
        $(".mdl-layout__tab:eq(2) span").click();
        showSummaryWarningDialogue();
    } else {
        $(".mdl-layout__tab:eq(3) span").click();
        scrollToTop();
    }
}
// Summary
function goTab4() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(4) span").click();
    scrollToTop();
}
// Instructions
function goTab5() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(5) span").click();
    scrollToTop();
}
// Save/Load
function goTab6() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(6) span").click();
    scrollToTop();
}
// Reset simTabClicked
function resetTabClick() {
    console.log("TIMER RESET");
    simTabClicked = false;
}

////////////////// NAVIGATION /////////////////


/////////////////// UPDATE ////////////////////

// Update all ractive components - ADD NEW RACTIVES HERE
function updateRactives() {
    ractiveTitle.update();
    ractiveCategories.update();
    ractiveRisks.update();
}

// UPDATE ractive model to display changes, upgrade MDL elements and reset listeners
function update() {
    console.log("UPDATE");
    // Update ractive components
    updateRactives();

    // Upgrade all added MDL elements
    upgradeMDL();
    // Reset listeners on all dynamic content
    resetListeners();

    // Initiate save to localStorage on every data change
    //saveLocal();

    // Log updated data object
    console.log(project);

    // Check data entry buttons and enable/disable where necessary
    checkButtons();

    // Update interface - check group totals and alter table colours warning of problems
    //updateInterface();
}

// UPDATE DATA calculation - on tab change AND ractive changes on Results page
function updateData() {
    projectManager.update();
    update();
}
/////////////////// UPDATE ////////////////////


////////////////// CATEGORIES ///////////////////
// Adds category with blank name
function addCategory() {
    // Add category to data model
    projectManager.addCategory('');
    // Reset aggregated weights on Summary page
    //projectManager.forceCategoryWeightsCalc();
    // Update interface
    update();
    // Scroll page down
    scrollToBottom();
}

// Remove last row from Categories array
function removeCategory() {
    // Remove last category from array
    projectManager.removeCategory();
    // Reset aggregated weights on Summary page
    //projectManager.forceCategoryWeightsCalc();
    // Update interface
    update();
}
/////////////////// CATEGORIES ///////////////////


///////////////////// RISKS /////////////////////
// Adds risk with blank name to category
function addRisk(event) {
    // Capture which category to add criteria too
    var categoryId = parseInt($(event.currentTarget).attr('data-id'));
    console.log("categoryId: " + categoryId);
    // Add criteria to data model
    console.log('category name: ' + projectManager.getCategory(0));
    projectManager.addRiskTo(projectManager.getCategory(categoryId), '',0);
    // Update interface
    update();
}

// Remove last row from risk array of relevent category object
function removeRisk(event) {
    // Capture which category to add criteria too
    var categoryId = $(event.currentTarget).attr('data-id');
    // Remove last criteria from array
    projectManager.removeRiskFrom(projectManager.getCategory(categoryId));
    // Update interface
    update();
}
///////////////////// RISKS /////////////////////


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
}

// Disable MDL button using buttonID
function disableButton(buttonID) {
    $(buttonID).attr("disabled", true);
}

// SCROLL FUNCTIONS
// Force scroll up using scrollToTop();
// Force scroll down using scrollToBottom();
var scrollTo = function(top) {
    var content = $(".mdl-layout__content");
    var target = top ? 0 : $(".page-content").height();
    content.stop().animate({
        scrollTop: target
    }, "fast");
};

var scrollToTop = function() {
    scrollTo(true);
};

var scrollToBottom = function() {
    scrollTo(false);
};

///////// GENERAL HELPER FUNCTIONS ////////////
