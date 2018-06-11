/*jshint esversion: 6 */

var data; // Manager holding the Problem data object
// Ractive components
var ractiveTitle, ractiveAlternatives, ractiveCategorys, ractiveData, ractiveSummary, ractiveCategoryWeights, ractiveAggregatedBeliefs, ractiveDistributedIgnorance;

var minAltCount = 1; // Number of alternatives - limited >=1 <=6
var maxAltCount = 6;

var simTabClicked = false; // Temporarily records if tab click is being simulated by code - used to stop recursive loop when redirecting pages to hichlight errors
var delayInMillisecondsForward = 10; // timer for simTabClicked reset
var delayInMillisecondsReset = 100; // timer for simTabClicked reset

// dataEntryGroupFault - Records if there are any incorrect group totals on dta entry page ()
// Supplier weights for each criteria should not exceed 100
// criteria weights for a category should total 100
var dataEntryGroupFault = false;
// summaryWeightsFault - Records if there is an error in the aggregation weights on the summary page
// Agregated weights for all categories should total 100
var summaryWeightsFault = false

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
    // DISTRIBUTED IGNORANCE TABLE
    ractiveDistributedIgnorance = new Ractive({
        target: '#target-distributed-ignorance-table',
        template: '#template-distributed-ignorance-table',
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
    $('.go-tab-1-btn').on('click', goTab1);
    $('.go-tab-2-btn').on('click', goTab2);
    $('.go-tab-3-btn').on('click', goTab3);
    // Scroll to top buttons (if needed)
    $("#scroll-up-btn").click(scrollToTop);

    // SET LISTENERS ON DYNAMIC CONTENT
    resetListeners();

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

function jsfunction() {
    console.log(">>>>>>>>>>>>>>>>>>>>>>TAB FUNCTION <<<<<<<<<<<<<<<<");
}

// NAVIGATION
function tabClicked() {
    // If simulate tab click then return to break recursive loop - simTabClicked gets reset on a timer
    if (simTabClicked) {
        return;
    }
    // check for inconsistent data in Data Entry page and call Data Entry tab on delay
    if (dataEntryGroupFault) {
        setTimeout(goTab2, delayInMillisecondsForward);
    }
    // check for inconsistent data in Summary page and call Summary tab on delay
    if (summaryWeightsFault) {
        setTimeout(goTab3, delayInMillisecondsForward);
    }



    //window.scrollTo(0, 0);
    // TODO - TEMP ADDITION TO UPDATE DATA ON TAB CHANGE - MAY BE ABLE TO REMOVE IF NO PROBLEM CALLING DATA.UPDATE FROM THIS.UPDATE
    updateData()
    console.log("TAB CLICKED");
}

function resetTabClick() {
    console.log("TIMER RESET");
    simTabClicked = false;
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
    // Reset aggregated weights on Summary page
    dataManager.forceCategoryWeightsCalc();
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
    // Reset aggregated weights on Summary page
    dataManager.forceCategoryWeightsCalc();
    // Update interface
    update();
}
/////////////////// CATEGORIES ///////////////////

/////////////////// CRITERIA //////////////////
// Adds criterion with blank name
function addCriteria(event) {
    // Capture which category to add criteria too
    var categoryId = parseInt($(event.currentTarget).attr('data-id'));
    console.log("categoryId: " + categoryId);
    // Add criteria to data model
    console.log('category name: ' + dataManager.getCategory(0));
    dataManager.addCriterionTo(dataManager.getCategory(categoryId), '');
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
    $(".mdl-layout__tab:eq(0) span").click();
}
// Data Entry
function goTab1() {

    $(".mdl-layout__tab:eq(1) span").click();
}
// Summary
function goTab2() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    if (dataEntryGroupFault) {
        $(".mdl-layout__tab:eq(1) span").click();
        showDataEntryWarningDialogue();
    } else {
        $(".mdl-layout__tab:eq(2) span").click();
    }

}
// Results
function goTab3() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    if (summaryWeightsFault) {
        $(".mdl-layout__tab:eq(2) span").click();
        showSummaryWarningDialogue();
    } else {
        $(".mdl-layout__tab:eq(3) span").click();
    }
}
// Instructions
function goTab4() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(4) span").click();
}
// Save/Load
function goTab5() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(5) span").click();
}

// DIALOGUES
// Warning dialog for inconsistent data on Data Entry page
function showDataEntryWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nRows of criteria weights should NOT EXCEED 100 \nColumns of category weights must TOTAL 100 \nProblem groups highlighted in red'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    })
}
// Warning dialog for inconsistent data on Summary page
function showSummaryWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nThe aggregated category weights must TOTAL 100 \nProblem groups highlighted in red'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    })
}

// TODO complete scroll fix
// references https://codepen.io/mdlhut/pen/BNeoVa https://codepen.io/exam/pen/ZbvLPO
var scrollTo = function(top) {
    var content = $(".page-content");
    var target = top ? 0 : $(".page-content").height();
    content.stop().animate({
        scrollTop: target
    }, "slow");
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
    ractiveDistributedIgnorance.update();

    // TODO - remove
    dialog = $('dialog');

    // Upgrade all added MDL elements
    upgradeMDL();
    // Reset listeners on all dynamic content
    resetListeners();

    // Initiate save to localStorage on every data change
    saveLocal();

    // Log updated data object
    console.log(dataManager.problem);

    // Update interface - check group totals and alter table colours warning of problems
    updateInterface();

    // Test Print
    //print();
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

// Check group totals and alter table colours warning of problems
function updateInterface() {
    // record of criteria errors on Data Entry page (by category # and criteria #)
    var criteriaErrors = [];
    // record of category weight errors on Data Entry page (by category #)
    var categoryErrors = [];

    // reset warning flags
    dataEntryGroupFault = false;
    summaryWeightsFault = false;

    //      NOTES - forms of classes added to table cells
    //      Supplier weight rows
    //      ......... category# criteria# ............ (# numbered from 0)
    //      Category weight columns
    //      ......... category# weight ............ (# numbered from 0)
    //      Aggregated weight column
    //      ......... aggregatedWeight ............ (# numbered from 0)

    // Check supplier weights for each criteria - record problem groups
    criteriaErrors = dataManager.checkCriteriaWeights();

    // reset all criteria weights colours to green
    $('.criteriaReset').addClass('hlGreen').removeClass('hlWarningRed');

    // set cell colours for problem rows to red
    // loop over each error
    for (var i = 0; i < criteriaErrors.length; i++) {
        $('.category' + criteriaErrors[i].category + '.criteria' + criteriaErrors[i].criteria).addClass('hlWarningRed').removeClass('hlBlue');
    }

    // Check weights total for each category - record problem categories
    categoryErrors = dataManager.checkCategoryWeights();

    // set cell colours for problem columns to red
    for (var i = 0; i < dataManager.getCategoryLength(); i++) {
        // If category number is present, change category#.weight to red
        if (jQuery.inArray(i, categoryErrors) !== -1) {
            $('.category' + i + '.weight').addClass('hlWarningRed').removeClass('hlBlue');
        } else {
            $('.category' + i + '.weight').addClass('hlBlue').removeClass('hlWarningRed');
        }
    }

    // set dataEntryGroupFault flag to TRUE if criteriaErrors or categoryErrors have recorded any problems
    if (criteriaErrors.length > 0 || categoryErrors.length > 0) {
        dataEntryGroupFault = true;

    }
    console.log("dataEntryGroupFault: " + dataEntryGroupFault);

    // check aggregation weights total - set summaryWeightsFault to TRUE if problem
    // (checkAggregatedWeightsOk() returns true if total 100 so negate)
    summaryWeightsFault = !dataManager.checkAggregatedWeightsOk();

    // set cell colours for aggregation weights column to red
    if (summaryWeightsFault) {
        $('.aggregatedWeight').addClass('hlWarningRed').removeClass('hlGreen');
    } else {
        $('.aggregatedWeight.hlWarningRed').addClass('hlGreen').removeClass('hlWarningRed');
    }
}


/////////////////// UPDATE ////////////////////

//////////////// LOAD / SAVE //////////////////

// Reset project and clear all current data from memory and local Storage
function resetProject() {
    dataManager.resetProject();
    // Reset ractive bindings
    setRactives();
    // FORCE CALCULATION OF EVEN CATEGORY WEIGHTS ON RESULTS PAGE
    dataManager.forceCategoryWeightsCalc();
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
