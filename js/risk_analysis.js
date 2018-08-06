/*jshint esversion: 6 */

var projectManager; // Manager holding the Problem data object
var project; // Link to project data
// Ractive components
var ractiveTitle, ractiveCategories, ractiveRisks, ractiveGrades, ractiveImpacts;

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
        data: projectManager.getProject()
    });
    // CATEGORIES TABLE
    ractiveCategories = new Ractive({
        target: '#target-categories-table',
        template: '#template-categories-table',
        data: projectManager.getProject()
    });
    // RISKS TABLE
    ractiveRisks = new Ractive({
        target: '#target-risks-table',
        template: '#template-risks-table',
        data: projectManager.getProject()
    });
	// GRADES OF IMPACT TABLE
    ractiveGrades = new Ractive({
        target: '#target-grades-table',
        template: '#template-grades-table',
        data: projectManager.getProject()
    });
	// DEGREES OF BELIEF IMPACT TABLE
    ractiveImpacts = new Ractive({
        target: '#target-impacts-table',
        template: '#template-impacts-table',
        data: projectManager.getProject()
    });
}

// Initialise listeners etc when project is loaded
function onProjectLoad() {

    // projectManager that stores project data
    projectManager = new ProjectManager();

    // Initialse Ractive objects
    setRactives();
    // Set listeners on dynamic content
    setListeners();
    // Call update
    update();

}
///////////////////////// ON LOAD //////////////////////////


//////////////////// DYNAMIC LISTENERS /////////////////////
// Set dynamic listeners
function setListeners() {
    // LISTENERS
    // TAB CLICK LISTENER
    $('.mdl-layout__tab').on('click', tabClicked);

	// TABLE CELL LISTENERS
	// Input change listener - whenever focus leaves input update data object
    $('input').on('focusout', update);
    // Input change listener - FOR INPUT CELLS ON SUMMARY PAGE - to force data update
    $('input.summaryInput').on('focusout', updateData);

    // PROJECT SETUP PAGE
    // Add category
    $('#add-category').on('click', addCategory);
    // Remove last category
    $('#remove-category').on('click', removeCategory);

	// RISK CHARACTERISTICS PAGE
    // Add risk to specific category - use class not ID due to repeats
    $('.add-risk').on('click', addRisk);
    // Remove last risk to specific category
    $('.remove-risk').on('click', removeRisk);

	// LOAD/SAVE PAGE
    // Print to PDF
    $('#printPDF').on('click', printPDF);
    // Save project button
    $('#saveProject').on('click', saveProject);
    // Reset project button
    $('#reset-button').on('click', resetProject);
    // TODO - remove for production - emergency reset button emergency-reset
    $('.emergency-reset').on('click', resetProject);
    // Load example project button
    $('#loadExample-button').on('click', loadExampleProject);

    // TAB NAVIGATION
    // Next button on each tab to simulate click on tab
    $('.go-tab-1-btn').on('click', goTab1);
    $('.go-tab-2-btn').on('click', goTab2);
    $('.go-tab-3-btn').on('click', goTab3);
    $('.go-tab-4-btn').on('click', goTab4);
    // Scroll to top buttons (if needed)
    $("#scroll-up-btn").click(scrollToTop);

    // Load file from file selecter listener (unable to get JQuery change() to trigger)
    document.getElementById("fileSelector").onchange = function() {
        // Get file
        var fileToLoad = this.files[0];
        // Load file (callback to loadProject(JSON) below for validation)
        loadFileAsJSobject(fileToLoad, loadProject);
    };
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

    updateData()
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
	ractiveGrades.update();
	ractiveImpacts.update();
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
    saveLocal();

    // Log updated data object
    console.log(projectManager.getProject());

    // Check data entry buttons and enable/disable where necessary
    checkButtons();

    // Update interface - check group totals and alter table colours warning of problems
    // updateInterface();
}

// Save data to localStorage
function saveLocal() {
    projectManager.saveLocal();
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


///////////// PRINT / LOAD / SAVE ///////////////

// Print project reults to PDF
function printPDF() {
	console.log("PRINT PDF - TO BE IMPLEMENTED");
}

// Save project data model (JS object) as JSON file to local file system
function saveProject() {
    let saveProject = projectManager.getProject();
    // Construct filename
    let fileName = 'DSS-Risk-Analysis-' + saveProject.name; //DSS-Problem
    // Save file
    saveOBJECTasJSONfile(saveProject, fileName);
    showProjectSavedDialogue(fileName);
}

// Load project selected in file selector window
function loadProject(JSONfromFile) {
    // test for incorrect file type by catching JSON parse
    try {
        var dataFromFile = JSON.parse(JSONfromFile)
    } catch (e) {
        // Incorrect file type
        console.log("Load fail: Not JSON file");
        showProjectLoadFileFailDialogue();
        return null;
    }

    // Check for valid project type
    if (dataFromFile.type === 'risk_analysis') {
        // correct prooject type
        // Set data model to loaded data
        projectManager.setProject(dataFromFile);
        // Reset ractive bindings
        setRactives();
        // Update to initiate save to localStorage
        update();
        showProjectLoadSuccessDialogue();
    } else {
        // incorrect project type
        console.log("Load fail: Incorrect project type");
        showProjectLoadTypeFailDialogue();
    }
}

// Reset project and clear all current data from memory and local Storage
function resetProject() {
	projectManager.resetProject();
    // Reset ractive bindings
    setRactives();
    update();
    showProjectResetDialogue();
}

// Load example project
function loadExampleProject() {
	projectManager.loadExample();
	// reset link to project data
    project = projectManager.getProject();
    // Reset ractive bindings
    setRactives();
    // Update to initiate save to localStorage
    update();
    showProjectExampleLoadedDialogue();
}

///////////// PRINT / LOAD / SAVE ///////////////


/////////////////// DIALOGS ////////////////////

// Warning dialog for inconsistent data on Data Entry page
function showDataEntryWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nRows of criteria weights should NOT EXCEED 100 \nColumns of category weights must TOTAL 100 \nProblem groups highlighted in red'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for inconsistent data on Summary page
function showSummaryWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nThe aggregated category weights must TOTAL 100 \nProblem groups highlighted in red.'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project printed
function showProjectPrintedDialogue(name) {
    showDialog({
        title: 'Report PDF generated',
        text: 'Report saved as <b>' + name + ' Decision Making Report.pdf</b> to your browsers <b>DOWNLOADS</b> folder.'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project saved
function showProjectSavedDialogue(fileName) {
    showDialog({
        title: 'Project saved',
        text: 'Project saved as <b>' + fileName + '.json</b> to your browsers <b>DOWNLOADS</b> folder \n\n <b>Manually move .json file to permenant location for storage.</b>'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project load file fail
function showProjectLoadFileFailDialogue() {
    showDialog({
        title: 'WARNING: Incorrect file type',
        text: 'Reselect a <b>.json</b> file type:\nCurrent project unchanged'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project load file fail
function showProjectLoadTypeFailDialogue() {
    showDialog({
        title: 'WARNING: Incorrect project type',
        text: 'Reselect a <b>DSS-Risk-Analysis-</b>&lt;ProjectTitle&gt;.json file:\nCurrent project unchanged'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project load file fail
function showProjectLoadSuccessDialogue() {
    showDialog({
        title: 'Project loaded',
        text: '<b>' + projectManager.getProject().name + '</b> project loaded successfuly',
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project reset
function showProjectResetDialogue() {
    showDialog({
        title: 'Project Reset',
        text: 'Project has been successfuly reset'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    })
}
// Warning dialog for example project loaded
function showProjectExampleLoadedDialogue() {
    showDialog({
        title: 'Example Project Loaded',
        text: 'Example project has been successfuly loaded'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    })
}

/////////////////// DIALOGS ////////////////////


////////// GENERAL HELPER FUNCTIONS /////////////

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
