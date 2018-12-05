/*jshint esversion: 6 */

var projectManager; // Manager holding the Problem data object
var project; // Link to project data
// Ractive components
var ractiveTitle, ractiveCategories, ractiveRisks, ractiveGrades, ractiveImpacts, ractiveRiskAssessment, ractiveSummary, ractiveResults;

var minCatCount = 1; // Number of categories - limited >=1 <=6
var maxCatCount = 6;
var minRiskCount = 1; // Number of risks - limited >=1 <=6
var maxRiskCount = 6;

var simTabClicked = false; // Temporarily records if tab click is being simulated by code - used to stop recursive loop when redirecting pages to highlight errors
var delayInMillisecondsForward = 10; // timer for simTabClicked reset
var delayInMillisecondsReset = 100; // timer for simTabClicked reset

// riskCharacteristicsGroupFault - Records if there are any incorrect group totals on Risk Characteristics data entry page
// Risk weights within each category should total 100
var riskCharacteristicsGroupFault = false;
// impactAssessmentGroupFault - Records if there are any incorrect group totals on Impact Assessment data entry page
// Risk weights within each category in each of the 3 areas should total 100
var impactAssessmentGroupFault = false;
// riskAssessmentGroupFault - Records if there are any incorrect group totals on Risk Assessment data entry page
// Area risk weights within each category should total 100
var riskAssessmentGroupFault = false;
// summaryWeightsFault - Records if there is an error in the aggregation weights on the Summary page
// Agregated category risk weights should total 100
var summaryWeightsFault = false
// resultsWeightsFault - Records if there is an error in the project weights on the Results page
// Area weights should total 100
var resultsWeightsFault = false

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
        target: '#target-risk-characteristics-table',
        template: '#template-risk-characteristics-table',
        data: projectManager.getProject()
    });
	// GRADES OF IMPACT TABLE
    ractiveGrades = new Ractive({
        target: '#target-grades-table',
        template: '#template-grades-table',
        data: projectManager.getProject()
    });
	// IMPACT ASSESSMENT TABLE (Degrees of Belief)
    ractiveImpacts = new Ractive({
        target: '#target-impact-assessment-table',
        template: '#template-impact-assessment-table',
        data: projectManager.getProject()
    });
    // RISK RISK ASSESSMENT PAGE
    ractiveRiskAssessment = new Ractive({
        target: '#target-risk-assessment-page',
        template: '#template-risk-assessment-page',
        data: projectManager.getProject()
    });
    // CATEGORY SUMMARY PAGE
    ractiveSummary = new Ractive({
        target: '#target-summary-page',
        template: '#template-summary-page',
        data: projectManager.getProject()
    });
    // CATEGORY SUMMARY PAGE
    ractiveResults = new Ractive({
        target: '#target-results-page',
        template: '#template-results-page',
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
    $('#printRiskAnalysisReportPDF').on('click', printRiskAnalysisReportPDF);
    // Save project button
    $('#saveProject').on('click', saveProject);
    // Reset project button
    $('#reset-button').on('click', resetProject);
    // Load example project button
    $('#loadExample-button').on('click', loadExampleProject);

    // TAB NAVIGATION
    // Next button on each tab to simulate click on tab
    $('.go-tab-1-btn').on('click', goTab1);
    $('.go-tab-2-btn').on('click', goTab2);
    $('.go-tab-3-btn').on('click', goTab3);
    $('.go-tab-4-btn').on('click', goTab4);
    $('.go-tab-5-btn').on('click', goTab5);
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
        setTimeout(goTab1, delayInMillisecondsForward);
    }// check for inconsistent data in Impact Assessment page and call Impact Assessment tab on delay
    if (impactAssessmentGroupFault) {
        setTimeout(goTab2, delayInMillisecondsForward);
    }
    // check for inconsistent data in Risk Assessment page and call Risk Assessment tab on delay
    if (riskAssessmentGroupFault) {
        setTimeout(goTab3, delayInMillisecondsForward);
    }
    // check for inconsistent data in Summary page and call Summary tab on delay
    if (summaryWeightsFault) {
        setTimeout(goTab4, delayInMillisecondsForward);
    }
    // check for inconsistent data in Results page and call Results tab on delay
    if (resultsWeightsFault) {
        setTimeout(goTab5, delayInMillisecondsForward);
    }

    updateData()
    scrollToTop();
}

// Stop infinite update loop created by forcing tab change due to group fault
function resetTabClick() {
    console.log("TIMER RESET");
    simTabClicked = false;
}

// Simulate click on MDL tabs
// Project Setup
function goTab0() {
    $(".mdl-layout__tab:eq(0) span").click();
}
// Risk Characteristics
function goTab1() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    $(".mdl-layout__tab:eq(1) span").click();
    scrollToTop();

    if (riskCharacteristicsGroupFault) {
        showRiskCharacteristicsWarningDialogue();
    }
}
// Impact Assessment
function goTab2() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    $(".mdl-layout__tab:eq(2) span").click();
    scrollToTop();

    if (impactAssessmentGroupFault) {
        showImpactAssessmentWarningDialogue();
    }

}
// Risk Assessment
function goTab3() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    $(".mdl-layout__tab:eq(3) span").click();
    scrollToTop();

    if (riskAssessmentGroupFault) {
        showRiskAssessmentWarningDialogue();
    }
}
// Summary
function goTab4() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    $(".mdl-layout__tab:eq(4) span").click();
    scrollToTop();

    if (summaryWeightsFault) {
        showSummaryWarningDialogue();
    }
}
// Results
function goTab5() {
    // set simTabClicked and timer to reset
    simTabClicked = true;
    setTimeout(resetTabClick, delayInMillisecondsReset);

    $(".mdl-layout__tab:eq(5) span").click();
    scrollToTop();

    if (resultsWeightsFault) {
        showResultsWarningDialogue();
    }
}
// Instructions
function goTab6() {
    $(".mdl-layout__tab:eq(6) span").click();
    scrollToTop();
}
// Save/Load
function goTab7() {
    $(".mdl-layout__tab:eq(7) span").click();
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
    ractiveRiskAssessment.update();
    ractiveSummary.update();
    ractiveResults.update();
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
    updateInterface();
}

// Save data to localStorage
function saveLocal() {
    projectManager.saveLocal();
}

/////////////////// UPDATE ////////////////////

// UPDATE DATA calculation - on tab change AND ractive changes on Results page
function updateData() {
    projectManager.update();
    update();
}

// Check group totals and alter table colours warning of problems
function updateInterface() {

    // record of weights errors on Risk Characteristics page (by category #)
    var riskCharacteristicsErrors = [];
    // record of risk weight errors on Impact Assessment page (by category # risk # and area #)
    var impactAssessmentErrors = [];
    // record of area weight errors on Risk Assessment page (by category #)
    var riskAssessmentErrors = [];

    // reset warning flags
    riskCharacteristicsGroupFault = false;
    impactAssessmentGroupFault = false;
    riskAssessmentGroupFault = false;
    summaryWeightsFault = false;
    resultsWeightsFault = false;



    // Check area risk weights in each category (RISK CHARACTERISTICS PAGE)- record problem categories
    riskCharacteristicsErrors = projectManager.checkriskCharacteristicsWeights();
    // reset all hlWarningRed cells to hlGreen
    $('.riskCharacteristic.hlWarningRed').addClass('hlGreen200').removeClass('hlWarningRed');
    // set cell colours for problem columns to red
    for (var i = 0; i < projectManager.getCategoryLength(); i++) {
        // If category number is present, set relevent cells to hlWarningRed
        if (jQuery.inArray(i, riskCharacteristicsErrors) !== -1) {
            $('.riskCharacteristic.category' + i).addClass('hlWarningRed').removeClass('hlGreen200');
        }
    }
    // set riskAssessmentGroupFault flag to TRUE if riskAssessmentErrors has recorded any problems
    if (riskCharacteristicsErrors.length > 0) {
        riskCharacteristicsGroupFault = true;
    }
    console.log(riskCharacteristicsErrors);

    // Check area risk weights in each category for each area (IMPACT ASSESSMENT PAGE)- record problem categories/risks/areas
    //      NOTE - impactAssessmentErrors structure:
    //      {category: #, risk: #, area: #}
    impactAssessmentErrors = projectManager.checkImpactAssessmentWeights();
    // reset all hlWarningRed cells to hlGreen
    $('.impactAssessment.hlWarningRed').addClass('hlGreen').removeClass('hlWarningRed');
    // set cell colours for problem columns to red
    for (var i = 0; i < impactAssessmentErrors.length; i++) {
        var fault = impactAssessmentErrors[i];
        // Set relevent cells to hlWarningRed
        $('.impactAssessment.category' + fault.category + '.risk' + fault.risk + '.area' + fault.area).addClass('hlWarningRed').removeClass('hlGreen')
    }
    // set impactAssessmentGroupFault flag to TRUE if riskAssessmentErrors has recorded any problems
    if (impactAssessmentErrors.length > 0) {
        impactAssessmentGroupFault = true;
    }

    // Check area risk weights in each category (RISK ASSESSMENT PAGE)- record problem categories
    riskAssessmentErrors = projectManager.checkRiskAssessmentWeights();
    // reset all hlWarningRed cells to hlGreen
    $('.riskAssessment.hlWarningRed').addClass('hlGreen').removeClass('hlWarningRed');
    // set cell colours for problem columns to red
    for (var i = 0; i < projectManager.getCategoryLength(); i++) {
        // Set relevent cells to hlWarningRed
        if (jQuery.inArray(i, riskAssessmentErrors) !== -1) {
            $('.riskAssessment.category' + i).addClass('hlWarningRed').removeClass('hlGreen');
        }
    }
    // set riskAssessmentGroupFault flag to TRUE if riskAssessmentErrors has recorded any problems
    if (riskAssessmentErrors.length > 0) {
        riskAssessmentGroupFault = true;
    }

    // check aggregation weights (SUMMARY PAGE) total - set summaryWeightsFault to TRUE if problem
    // (checkAggregatedWeightsOk() returns true if total 100 so negate)
    summaryWeightsFault = !projectManager.checkSummaryWeightsOk();
    // reset all hlWarningRed cells to hlGreen
    $('.summaryWeight.hlWarningRed').addClass('hlGreen').removeClass('hlWarningRed');
    // Set relevent cells to hlWarningRed
    if (summaryWeightsFault) {
        $('.summaryWeight').addClass('hlWarningRed').removeClass('hlGreen');
    }

    // check project weights (RESULTS PAGE) total 100 - set resultsWeightsFault to TRUE if problem
    // (checkAggregatedWeightsOk() returns true if total 100 so negate)
    resultsWeightsFault = !projectManager.checkResultsWeightsOk();
    // reset all hlWarningRed cells to hlGreen
    $('.resultsWeight.hlWarningRed').addClass('hlGreen').removeClass('hlWarningRed');
    // set cell colours for problem weights column to red
    if (resultsWeightsFault) {
        $('.resultsWeight').addClass('hlWarningRed').removeClass('hlGreen');
    }
}


////////////////// CATEGORIES ///////////////////
// Adds category with blank name
function addCategory() {
    // Add category to data model
    projectManager.addCategory('', 0);
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
function printRiskAnalysisReportPDF() {
    // Project
    var project = projectManager.project;
    // Default values
    var TOP_MARGIN = 60;
    var LEFT_MARGIN = 40;

    // X and Y values of cursor - incerement Y for each line of text and set to bottom of table with pdf.autoTable.previous.finalY + Yincrement
    var pdfX = LEFT_MARGIN;
    var pdfY = TOP_MARGIN;
    var Yincrement = 20;
    var buffer = 20;
    var columnStyles = {}; // properties for dynamic column styles
    var resultsColumnStyles = {};
    var firstColumnWidth = 150;
    var dataColumnWidth = 67;
    var summaryColumnWidth = 80;
    var lastColumnWidth = 48;
    var tableFontSize = 8;

    var header = [];    // stores array of header rows
    var headerRow = []; // for generation of header row
    var body = [];      // stores array of body rows
    var bodyRow = [];   // for generation og body rows

    // Generate new document
    // var pdf = new jsPDF('p', 'pt', 'a4');
    var pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    // Heading
    pdf.setFontStyle('bold');
    pdf.text("Risk Analysis Report", pdfX, pdfY);
    // Project name
    pdf.setFontStyle('normal');
    pdf.setFontSize(14);
    pdf.text("Project title: " + project.name, pdfX, pdfY += Yincrement);
    var today = new Date();
    var date = today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear();
    pdf.text("Report date: " + date, pdfX, pdfY += Yincrement);

    // Data inputs
    pdf.setFontStyle('bold');
    pdf.text("Data Inputs - Risk Characteristics", pdfX, pdfY += Yincrement);

    // DATA ENTRY - RISK CHARACTERISTICS TABLES
    // Construct and print each category table
    var cats = project.categories;

    // Generate fix header row for table for occurance, coefficient, controllability, dependency and risk weight
    var fixedHeader = [];
    fixedHeader.push({content: 'Likelihood of\nOccurrence', styles: {halign: 'center'}});
    fixedHeader.push({content: 'Coefficient of\nProject Features', styles: {halign: 'center'}});
    fixedHeader.push({content: 'Controllability', styles: {halign: 'center'}});
    fixedHeader.push({content: 'Dependency', styles: {halign: 'center'}});
    fixedHeader.push({content: 'Risk Weight', styles: {halign: 'center'}});

    // Generate and print data input table for each category
    for (var i = 0; i < cats.length; i++) {
        // Temp store current working category
        var cat = cats[i];
        header = [];
        headerRow = [];
        body = [];

        // Construct header row
        headerRow = [];
        headerRow.push(cat.name + ' Risks');
        // add fixedHeader
        header.push(headerRow.concat(fixedHeader));

        // generate row for each risk
        for (var j = 0; j < cat.risks.length; j++) {
            // Temp store current working risk
            var risk = cat.risks[j];
            bodyRow = []; // stores name and inputs for risk row
            // Push risk name
            bodyRow.push(risk.name);
            // push inputs for each row
            // Likelihood of Occurrence
            bodyRow.push({content: risk.occurrence, styles: {halign: 'center'}});
            // Coefficient of Project Features
            bodyRow.push({content: risk.coefficient, styles: {halign: 'center'}});
            // Controllability
            bodyRow.push({content: risk.controllability, styles: {halign: 'center'}});
            // Dependency
            bodyRow.push({content: risk.dependency, styles: {halign: 'center'}});
            // Risk weight for category
            bodyRow.push({content: risk.weight, styles: {halign: 'center'}});

            // push completed criteria row to rows results array for printing
            body.push(bodyRow);
        }

        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',

            },
            columnStyles: {
                0: {cellWidth: firstColumnWidth},
            }
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;

    }

    // DATA ENTRY - IMPACT ASSESSMENT TABLES
    // new page
    pdf.addPage();
    // Reset pdfY for
    pdfY = TOP_MARGIN;
    pdf.setFontSize(16);
    pdf.text("Data Inputs - Impact Assessment", pdfX, pdfY);

    // Grade of Impact table
    pdf.setFontSize(14);
    pdf.text("Grades of Impact", pdfX, pdfY += Yincrement);

    // Construct Header
    header = [];
    headerRow = [];
    headerRow.push('');                        // empty element
    headerRow.push({content: 'Grade 1', styles: {halign: 'center'}});
    headerRow.push({content: 'Grade 2', styles: {halign: 'center'}});
    headerRow.push({content: 'Grade 3', styles: {halign: 'center'}});
    header.push(headerRow);

    // Construct rows (single element of rows - add grades array from project)
    body = [];
    var bodyRow = [];
    bodyRow.push('Grade percentages');          // 1st element
    bodyRow.push({content: project.grades[0], styles: {halign: 'center'}});       // 3 values for project grades
    bodyRow.push({content: project.grades[1], styles: {halign: 'center'}});       // 3 values for project grades
    bodyRow.push({content: project.grades[2], styles: {halign: 'center'}});       // 3 values for project grades
    body.push(bodyRow);

    // Set first column width (narrower)
    columnStyles[0] = {
        columnWidth: 100
    };

    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',

        },
        columnStyles: {
            0: {cellWidth: 100},
        }
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Degrees of Belief table
    pdf.setFontSize(14);
    pdf.text("Degrees of Belief", pdfX, pdfY += Yincrement + buffer);

    // Generate and print data input table for each category
    for (var i = 0; i < cats.length; i++) {
        // Temp store current working category
        var cat = cats[i];
        header = [];

        body = [];

        // Construct first header row
        headerRow = [];
        headerRow.push(cat.name + ' Risks');
        headerRow.push({content: '  Project Cost  ', colSpan: 3, styles: {halign: 'center'}});
        headerRow.push({content: 'Project Duration', colSpan: 3, styles: {halign: 'center'}});
        headerRow.push({content: 'Project Quality ', colSpan: 3, styles: {halign: 'center'}});
        header.push(headerRow);
                console.log(headerRow);

        // Construct second header row
        headerRow = [];
        headerRow.push('');             // empty element
        // Add 3 lots of grade percentages
        for (var j = 0; j < 3; j++) {
            for (var k = 0; k < 3; k++) {
                headerRow.push({content: project.grades[k]+'%', styles: {halign: 'center'}});
            }
        }
        header.push(headerRow);


        // generate row for each risk
        for (var j = 0; j < cat.risks.length; j++) {
            // Temp store current working risk
            var risk = cat.risks[j];
            bodyRow = []; // stores name and inputs for risk row
            // Push risk name
            bodyRow.push(risk.name);
            // push inputs for each trio og grade percentages
            // Project cost
            for (var k = 0; k < 3; k++) {
                bodyRow.push({content: risk.costImpact[k], styles: {halign: 'center'}});
            }
            // Project Duration
            for (var k = 0; k < 3; k++) {
                bodyRow.push({content: risk.durationImpact[k], styles: {halign: 'center'}});
            }
            // Project Quality
            for (var k = 0; k < 3; k++) {
                bodyRow.push({content: risk.qualityImpact[k], styles: {halign: 'center'}});
            }


            // push completed criteria row to rows results array for printing
            body.push(bodyRow);
        }

        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',

            },
            columnStyles: {
                0: {cellWidth: firstColumnWidth},
            }
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;

    }

    // RISK ASSESSMENT PAGE
    // new page
    pdf.addPage();
    // Reset pdfY for
    pdfY = TOP_MARGIN;
    pdf.setFontSize(16);
    pdf.text("Risk Assessment", pdfX, pdfY);

    // Set Column Styles for 3 cell tables for Risk Assessment tables
    var narrow3CellTableColumnStyles = {
        0: {cellWidth: 175},
        1: {cellWidth: 50},
        2: {cellWidth: 50},
        3: {cellWidth: 50},
    }

    // Loop for each category
    for (var i = 0; i < cats.length; i++) {
        // Temp store current working category
        var cat = cats[i];

        // Category title for each group of tables
        pdf.setFontSize(14);
        pdf.text(cat.name + " Risk Category", pdfX, pdfY += Yincrement);

        // Aggregated Risk Assessment TABLE
        header = [];
        body = [];

        // Construct first header row
        headerRow = [];
        headerRow.push('Aggregated Risk Assessment');
        headerRow.push({content: '  Project Cost  ', colSpan: 4, styles: {halign: 'center'}});
        headerRow.push({content: 'Project Duration', colSpan: 4, styles: {halign: 'center'}});
        headerRow.push({content: 'Project Quality ', colSpan: 4, styles: {halign: 'center'}});
        header.push(headerRow);

        // Construct second header row
        headerRow = [];
        headerRow.push('');             // empty element
        // Add 3 lots of grade percentages
        for (var j = 0; j < 3; j++) {
            headerRow.push('0%');             // 0% element
            for (var k = 0; k < 3; k++) {
                headerRow.push({content: project.grades[k]+'%', styles: {halign: 'center'}});
            }
        }
        header.push(headerRow);


        // generate row for data
        bodyRow = []; // stores name and data row
        // Push row title
        bodyRow.push('Degrees of Belief');
        // Loop over category beliefs ( [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] )
        for (var j = 0; j < cat.Beliefs.length; j++) {
            // loop over 4 beleif values in each grade
            for (var k = 0; k < cat.Beliefs[j].length; k++) {
                // push data for 0% and each trio of grade percentages
                bodyRow.push({content: toPercent(cat.Beliefs[j][k]), styles: {halign: 'center'}});

            }
        }
        // push completed row to rows results array for printing
        body.push(bodyRow);


        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',

            },
            columnStyles: {
                0: {cellWidth: firstColumnWidth},
            }
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;



        // Unassigned Degrees of Belief TABLE
        header = [];
        body = [];

        // Construct first header row
        headerRow = [];
        headerRow.push('Unassigned Degrees of Belief');
        headerRow.push({content: '  Project Cost  ', styles: {halign: 'center'}});
        headerRow.push({content: 'Project Duration', styles: {halign: 'center'}});
        headerRow.push({content: 'Project Quality ', styles: {halign: 'center'}});
        header.push(headerRow);

        // generate row for data
        bodyRow = []; // stores name and data row
        // Push row title
        bodyRow.push('Ignorance');
        // Loop over ignorance
        for (var j = 0; j < cat.Ignorance.length; j++) {
            // push data for each grade
            bodyRow.push({content: toPercent(cat.Ignorance[j]), styles: {halign: 'center'}});
        }
        // push completed row to rows results array for printing
        body.push(bodyRow);

        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            tableWidth: 'wrap',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',

            },
            columnStyles: narrow3CellTableColumnStyles
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;


        // Objective Weights TABLE
        header = [];
        body = [];

        // Construct first header row
        headerRow = [];
        headerRow.push('Objective Weights');
        headerRow.push({content: '  Project Cost  ', styles: {halign: 'center'}});
        headerRow.push({content: 'Project Duration', styles: {halign: 'center'}});
        headerRow.push({content: 'Project Quality ', styles: {halign: 'center'}});
        header.push(headerRow);

        // generate row for data
        bodyRow = []; // stores name and data row
        // Push row title
        bodyRow.push('Category Risk Weights');
        // Loop over AreaWeights
        for (var j = 0; j < cat.AreaWeights.length; j++) {
            // push data for each area
            bodyRow.push({content: cat.AreaWeights[j], styles: {halign: 'center'}});
        }
        // push completed row to rows results array for printing
        body.push(bodyRow);

        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            tableWidth: 'wrap',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',

            },
            columnStyles: narrow3CellTableColumnStyles
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;


        // Assessment of CATEGORY Risks TABLE
        header = [];
        body = [];

        // Construct first header row
        headerRow = [];
        headerRow.push('Assessment of ' + cat.name + ' Risks');
        headerRow.push({content: '0%', styles: {halign: 'center'}});
        for (var k = 0; k < 3; k++) {
            headerRow.push({content: project.grades[k]+'%', styles: {halign: 'center'}});
        }
        headerRow.push({content: 'Ignorance', styles: {halign: 'center'}});
        header.push(headerRow);

        // generate row for data
        bodyRow = []; // stores name and data row
        // Push row title
        bodyRow.push('Degrees of Belief');
        // Loop over AreaWeights
        for (var j = 0; j < cat.Beliefs_cat.length; j++) {
            // push data for each area
            bodyRow.push({content: toPercent(cat.Beliefs_cat[j]), styles: {halign: 'center'}});
        }
        // push data for Ignorance_cat
        bodyRow.push({content: toPercent(cat.Ignorance_cat), styles: {halign: 'center'}});
        // push completed row to rows results array for printing
        body.push(bodyRow);

        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            tableWidth: 'wrap',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',

            },
            columnStyles: {
                0: {cellWidth: 175},
                1: {cellWidth: 40},
                2: {cellWidth: 40},
                3: {cellWidth: 40},
                4: {cellWidth: 40},
            }
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;


        // Risk Range for CATEGORY TABLE
        header = [];
        body = [];

        // Construct first header row
        headerRow = [];
        headerRow.push('Risk Range for  ' + cat.name + ' Category');
        headerRow.push({content: 'Minimum', styles: {halign: 'center'}});
        headerRow.push({content: 'Maximum', styles: {halign: 'center'}});
        headerRow.push({content: 'AVERAGE', styles: {halign: 'center'}});
        header.push(headerRow);

        // generate row for data
        bodyRow = []; // stores name and data row
        // Push row title
        bodyRow.push('Risk Levels');
        // Loop over RiskLevels_cat
        for (var j = 0; j < cat.RiskLevels_cat.length; j++) {
            // push data for each range
            bodyRow.push({content: toPercent(cat.RiskLevels_cat[j]), styles: {halign: 'center'}});
        }
        // push completed row to rows results array for printing
        body.push(bodyRow);

        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            tableWidth: 'wrap',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',

            },
            columnStyles: narrow3CellTableColumnStyles
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;



        // Potential cost impact on project TABLE
        header = [];
        body = [];

        // Construct first header row
        headerRow = [];
        headerRow.push('Potential cost impact on project');
        headerRow.push({content: 'Amount', styles: {halign: 'center'}});
        header.push(headerRow);

        // generate row for data
        bodyRow = []; // stores name and data row
        // Push row title
        bodyRow.push('Potential impact');
        // Puch impact on project value
        bodyRow.push({content: '£' + Math.round( cat.costImpact_cat * 100 ) / 100, styles: {halign: 'center'}});

        // push completed row to rows results array for printing Math.round( percent * 10 ) / 10;
        body.push(bodyRow);

        // Print table
        pdf.autoTable({
            startY: pdfY + Yincrement,
            head: header,
            body: body,
            showHeader: 'firstPage',
            tableWidth: 'wrap',
            //tableWidth: 'wrap',       // Use to limit table width
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak',
            },
            columnStyles: narrow3CellTableColumnStyles
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;

    }



    // SUMMARY PAGE
    // new page
    pdf.addPage();
    // Reset pdfY for
    pdfY = TOP_MARGIN;
    pdf.setFontSize(16);
    pdf.text("Summary", pdfX, pdfY);

    // Grade of Impact table
    pdf.setFontSize(14);
    pdf.text("Assessment aggregation on a Project Objective Level", pdfX, pdfY += Yincrement);


    // Category weights TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Categories');
    headerRow.push({content: 'Weight', styles: {halign: 'center'}});
    header.push(headerRow);

    // Loop over categories
    // Generate and print data input table for each category
    for (var i = 0; i < cats.length; i++) {
        // Temp store current working category
        var cat = cats[i];

        // generate row for data
        bodyRow = []; // stores name and data row
        // Push row title
        bodyRow.push(cat.name);
        // Puch impact on project value
        bodyRow.push({content: cat.CategoryWeight, styles: {halign: 'center'}});

        // push completed row to rows results array for printing Math.round( percent * 10 ) / 10;
        body.push(bodyRow);

    }

    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',
        },
        columnStyles: narrow3CellTableColumnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;




    // Project Risk Summary TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Project Risk Summary');
    headerRow.push({content: '  Project Cost  ', colSpan: 4, styles: {halign: 'center'}});
    headerRow.push({content: 'Project Duration', colSpan: 4, styles: {halign: 'center'}});
    headerRow.push({content: 'Project Quality ', colSpan: 4, styles: {halign: 'center'}});
    header.push(headerRow);

    // Construct second header row
    headerRow = [];
    headerRow.push('');             // empty element
    // Add 3 lots of grade percentages
    for (var j = 0; j < 3; j++) {
        headerRow.push('0%');             // 0% element
        for (var k = 0; k < 3; k++) {
            headerRow.push({content: project.grades[k]+'%', styles: {halign: 'center'}});
        }
    }
    header.push(headerRow);


    // generate row for data
    bodyRow = []; // stores name and data row
    // Push row title
    bodyRow.push('Degrees of Belief');
    // Loop over project beliefs (Beliefs_obj [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]] )
    for (var j = 0; j < project.Beliefs_obj.length; j++) {
        // loop over 4 beleif values in each grade
        for (var k = 0; k < project.Beliefs_obj[j].length; k++) {
            // push data for 0% and each trio of grade percentages
            bodyRow.push({content: toPercent(project.Beliefs_obj[j][k]), styles: {halign: 'center'}});

        }
    }
    // push completed row to rows results array for printing
    body.push(bodyRow);


    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',

        },
        columnStyles: {
            0: {cellWidth: firstColumnWidth},
        }
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Unassigned Degrees of Belief TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Unassigned Degrees of Belief');
    headerRow.push({content: '  Project Cost  ', styles: {halign: 'center'}});
    headerRow.push({content: 'Project Duration', styles: {halign: 'center'}});
    headerRow.push({content: 'Project Quality ', styles: {halign: 'center'}});
    header.push(headerRow);

    // generate row for data
    bodyRow = []; // stores name and data row
    // Push row title
    bodyRow.push('Ignorance');
    // Loop over ignorance
    for (var j = 0; j < project.Ignorance_obj.length; j++) {
        // push data for each grade
        bodyRow.push({content: toPercent(project.Ignorance_obj[j]), styles: {halign: 'center'}});
    }
    // push completed row to rows results array for printing
    body.push(bodyRow);

    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',

        },
        columnStyles: narrow3CellTableColumnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Risk Range for all Areas TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Risk Range for all Areas');
    headerRow.push({content: '  Project Cost  ', styles: {halign: 'center'}});
    headerRow.push({content: 'Project Duration', styles: {halign: 'center'}});
    headerRow.push({content: 'Project Quality ', styles: {halign: 'center'}});
    header.push(headerRow);

    // generate row for data
    bodyRow = []; // stores name and data row

    // Create row for Minimum risk
    // Push row title
    bodyRow.push('Minimum risk');
    // Loop over risk levels (RiskLevels_obj: [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
    for (var i = 0; i < 3; i++) {
        // push data for each grade
        bodyRow.push({content: toPercent(project.RiskLevels_obj[i][0]), styles: {halign: 'center'}});
    }
    // push completed row to rows results array for printing
    body.push(bodyRow);

    bodyRow = []; // stores name and data row
    // Create row for Maximum risk
    // Push row title
    bodyRow.push('Maximum risk');
    // Loop over risk levels (RiskLevels_obj: [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
    for (var i = 0; i < 3; i++) {
        // push data for each grade
        bodyRow.push({content: toPercent(project.RiskLevels_obj[i][1]), styles: {halign: 'center'}});
    }
    // push completed row to rows results array for printing
    body.push(bodyRow);

    bodyRow = []; // stores name and data row
    // Create row for Average risk
    // Push row title
    bodyRow.push('Average risk');
    // Loop over risk levels (RiskLevels_obj: [[0, 0, 0], [0, 0, 0], [0, 0, 0]])
    for (var i = 0; i < 3; i++) {
        // push data for each grade
        bodyRow.push({content: toPercent(project.RiskLevels_obj[i][2]), styles: {halign: 'center'}});
    }
    // push completed row to rows results array for printing
    body.push(bodyRow);

    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',

        },
        columnStyles: narrow3CellTableColumnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;



    // RESULTS PAGE
    // new page
    pdf.addPage();
    // Reset pdfY for
    pdfY = TOP_MARGIN;
    pdf.setFontSize(16);
    pdf.text("Results", pdfX, pdfY);

    pdf.setFontSize(14);
    pdf.text("Aggregation risk assessment results on the project as a whole", pdfX, pdfY += Yincrement);


    // Project weights TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Objective Weights');
    headerRow.push({content: '  Project Cost  ', styles: {halign: 'center'}});
    headerRow.push({content: 'Project Duration', styles: {halign: 'center'}});
    headerRow.push({content: 'Project Quality ', styles: {halign: 'center'}});
    header.push(headerRow);

    // generate row for data
    bodyRow = []; // stores name and data row
    // Push row title
    bodyRow.push('Objective Risk Weights');
    // Loop over AreaWeights
    for (var i = 0; i < project.ProjectWeights.length; i++) {
        // push data for each area
        bodyRow.push({content: project.ProjectWeights[i], styles: {halign: 'center'}});
    }
    // push completed row to rows results array for printing
    body.push(bodyRow);

    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',

        },
        columnStyles: narrow3CellTableColumnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;



    // Risk Assessment on Project TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Risk Assessment on Project');
    headerRow.push({content: '0%', styles: {halign: 'center'}});
    for (var k = 0; k < 3; k++) {
        headerRow.push({content: project.grades[k]+'%', styles: {halign: 'center'}});
    }
    header.push(headerRow);

    // generate row for data
    bodyRow = []; // stores name and data row
    // Push row title
    bodyRow.push('Degrees of Belief');
    // Loop over Beliefs_proj
    for (var i = 0; i < project.Beliefs_proj.length; i++) {
        // push data for each area
        bodyRow.push({content: toPercent(project.Beliefs_proj[i]), styles: {halign: 'center'}});
    }
    // push completed row to rows array for printing
    body.push(bodyRow);

    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',

        },
        columnStyles: {
            0: {cellWidth: 175},
            1: {cellWidth: 52},
            2: {cellWidth: 52},
            3: {cellWidth: 52},
            4: {cellWidth: 52},
        }
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Risk Range for Project TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Risk Range for Project');
    headerRow.push({content: 'Minimum', styles: {halign: 'center'}});
    headerRow.push({content: 'Maximum', styles: {halign: 'center'}});
    headerRow.push({content: 'AVERAGE', styles: {halign: 'center'}});
    header.push(headerRow);

    // generate row for data
    bodyRow = []; // stores name and data row
    // Push row title
    bodyRow.push('Risk Levels');
    // Loop over RiskLevels_cat
    for (var i = 0; i < project.RiskLevels_proj.length; i++) {
        // push data for each range
        bodyRow.push({content: toPercent(project.RiskLevels_proj[i]), styles: {halign: 'center'}});
    }
    // push completed row to rows results array for printing
    body.push(bodyRow);

    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',

        },
        columnStyles: {
            0: {cellWidth: 175},
            1: {cellWidth: 70},
            2: {cellWidth: 70},
            3: {cellWidth: 70},
        }
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Potential cost impact on project TABLE
    header = [];
    body = [];

    // Construct first header row
    headerRow = [];
    headerRow.push('Potential cost impact on project');
    headerRow.push({content: 'Amount', styles: {halign: 'center'}});
    header.push(headerRow);

    // generate row for data
    bodyRow = []; // stores name and data row
    // Push row title
    bodyRow.push('Potential impact');
    // Puch impact on project value
    bodyRow.push({content: '£' + Math.round( project.costImpact_proj * 100 ) / 100, styles: {halign: 'center'}});

    // push completed row to rows results array for printing Math.round( percent * 10 ) / 10;
    body.push(bodyRow);

    // Print table
    pdf.autoTable({
        startY: pdfY + Yincrement,
        head: header,
        body: body,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        //tableWidth: 'wrap',       // Use to limit table width
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak',
        },
        columnStyles: narrow3CellTableColumnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Genegrate footer on each page
    pdfSetFooter(pdf);

    // Save report
    pdf.save(project.name + ' Risk Analysis Report.pdf');

    // Show dialogue
    showProjectPrintedDialogue(project.name);
}

// Sets footer on each page of pdf
function pdfSetFooter(pdfObject) {
    var number_of_pages = pdfObject.internal.getNumberOfPages()
    var pdf_pages = pdfObject.internal.pages
    var today = new Date();
    var date = today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear();
    var myFooter = "Risk Analysis Report: " + projectManager.project.name + ' - ' + date
    // Iterate over pages, not including 1st page
    for (var i = 2; i < pdf_pages.length; i++) {
        // We are telling our pdfObject that we are now working on this page
        pdfObject.setPage(i)
        // Set small grey font
        pdfObject.setFontSize(8);
        pdfObject.setTextColor(145, 145, 145);
        // print title
        pdfObject.text(myFooter, 40, 30)
        // print page number
        pdfObject.text('Page: ' + i, 520, 30)
    }
}

// Save project data model (JS object) as JSON file to local file system
function saveProject() {
    let saveProject = projectManager.getProject();
    // Construct filename
    let fileName = 'DSS-Risk-Analysis-' + saveProject.name + ".json"; //DSS-Problem
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
// Warning dialog for inconsistent data on Risk Characteristics page
function showRiskCharacteristicsWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nColumns of risk weights must TOTAL 100\nProblem groups highlighted in red'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for inconsistent data on Impact Assessment page
function showImpactAssessmentWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nRows of risk weights should NOT EXCEED 100 for each area\nProblem groups highlighted in red'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for inconsistent data on Risk Assessment page
function showRiskAssessmentWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nThe objective weights for each category must TOTAL 100 \nProblem groups highlighted in red.'.split('\n').join('<br>'),
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
// Warning dialog for inconsistent data on Results page
function showResultsWarningDialogue() {
    showDialog({
        title: 'WARNING: Inconsistent data',
        text: 'Elements on this page need correcting: \nThe aggregated project weights must TOTAL 100 \nProblem groups highlighted in red.'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project printed
function showProjectPrintedDialogue(name) {
    showDialog({
        title: 'Report PDF generated',
        text: 'Report saved as <b>' + name + ' Risk Analysis Report.pdf</b> to your browsers <b>DOWNLOADS</b> folder.'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project saved
function showProjectSavedDialogue(fileName) {
    showDialog({
        title: 'Project saved',
        text: 'Project saved as <b>' + fileName + '</b> to your browsers <b>DOWNLOADS</b> folder \n\n <b>Manually move .json file to permenant location for storage.</b>'.split('\n').join('<br>'),
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

// Convert value from calculations (x.xxxxxx) to percentage to 1dp (xx.x)
function toPercent(value) {
    var percent = value * 100;
    var rounded = Math.round( percent * 10 ) / 10;
    return rounded;
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
