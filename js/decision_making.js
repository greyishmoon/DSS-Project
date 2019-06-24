/*jshint esversion: 6 */

var problemManager; // Manager holding the Problem data object
// Ractive components
var ractiveTitle, ractiveAlternatives, ractiveCategories, ractiveData, ractiveSummary, ractiveCategoryWeights, ractiveAggregatedBeliefs, ractiveDistributedIgnorance;

var minAltCount = 2; // Number of alternatives - limited >=2 <=5
var maxAltCount = 5;

var simTabClicked = false; // Temporarily records if tab click is being simulated by code - used to stop recursive loop when redirecting pages to highlight errors
var delayInMillisecondsForward = 10; // timer for simTabClicked reset
var delayInMillisecondsReset = 100; // timer for simTabClicked reset

// dataEntryGroupFault - Records if there are any incorrect group totals on data entry page ()
// Supplier weights for each criteria should not exceed 100
// criteria weights for a category should total 100
var dataEntryGroupFault = false;
// summaryWeightsFault - Records if there is an error in the aggregation weights on the summary page
// Agregated weights for all categories should total 100
var summaryWeightsFault = false

$(document).ready(function() {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        console.log('File APIs SUPPORTED.');
    } else {
        alert('File saving is not fully supported in this browser.');
    }

    // Run dynamic elements initialisation
    onProjectLoad();

});

///////////////////////// ON LOAD //////////////////////////
// Initialise listeners etc when project is loaded
function onProjectLoad() {
    // problemManager that stores problem data
    problemManager = new ProblemManager();

    // Initialse Ractive objects
    setRactives();

    // SET LISTENERS ON DYNAMIC CONTENT
    setListeners();

    // Load file from file selecter (unable to get JQuery change() to trigger)
    document.getElementById("fileSelector").onchange = function() {
        // Get file
        var fileToLoad = this.files[0];
        // Load file (callback to loadProject(JSON) below for validation)
        loadFileAsJSobject(fileToLoad, loadProject);
    };

    update();

}

// Set ractive data bindings
function setRactives() {
    // Initialse Ractive objects
    // TITLE TABLE
    ractiveTitle = new Ractive({
        target: '#target-title-table',
        template: '#template-title-table',
        data: problemManager.problem
    });
    // ALTERNATIVES TABLE
    ractiveAlternatives = new Ractive({
        target: '#target-alternatives-table',
        template: '#template-alternatives-table',
        data: problemManager.problem
    });
    // CATEGORIES TABLE
    ractiveCategories = new Ractive({
        target: '#target-categories-table',
        template: '#template-categories-table',
        data: problemManager.problem
    });
    // NOTES SETUP PAGE
    ractiveCategories = new Ractive({
        target: '#target-notes-setup-table',
        template: '#template-notes-setup-table',
        data: problemManager.problem
    });
    // DATA ENTRY TABLE
    ractiveData = new Ractive({
        target: '#target-data-table',
        template: '#template-data-table',
        data: problemManager.problem
    });
    // NOTES DATA ENTRY PAGE
    ractiveCategories = new Ractive({
        target: '#target-notes-data-entry-table',
        template: '#template-notes-data-entry-table',
        data: problemManager.problem
    });
    // SUMMARY TABLE
    ractiveSummary = new Ractive({
        target: '#target-summary-table',
        template: '#template-summary-table',
        data: problemManager.problem
    });
    // NOTES SUMMARY PAGE
    ractiveCategories = new Ractive({
        target: '#target-notes-summary-table',
        template: '#template-notes-summary-table',
        data: problemManager.problem
    });
    // CATEGORY WEIGHTS TABLE
    ractiveCategoryWeights = new Ractive({
        target: '#target-category-weights-table',
        template: '#template-category-weights-table',
        data: problemManager.problem
    });
    // AGGREGATED BELIEFS TABLE
    ractiveAggregatedBeliefs = new Ractive({
        target: '#target-aggregated-beliefs-table',
        template: '#template-aggregated-beliefs-table',
        data: problemManager.problem
    });
    // DISTRIBUTED IGNORANCE TABLE
    ractiveDistributedIgnorance = new Ractive({
        target: '#target-distributed-ignorance-table',
        template: '#template-distributed-ignorance-table',
        data: problemManager.problem
    });
    // NOTES RESULTS PAGE
    ractiveCategories = new Ractive({
        target: '#target-notes-results-table',
        template: '#template-notes-results-table',
        data: problemManager.problem
    });
}
///////////////////////// ON LOAD //////////////////////////


//////////////////// DYNAMIC LISTENERS /////////////////////
// Set dynamic listeners
function setListeners() {
    // LISTENERS
    // PROJECT
    // Tab button LISTENERS
    $('.mdl-layout__tab').on('click', tabClicked);
    // PROBLEM SETUP
    // Add alternative
    $('#add-alternative').on('click', addAlternative);
    // Remove last alternative
    $('#remove-alternative').on('click', removeAlternative);

    // DATA ENTRY
    // Add category
    $('#add-category').on('click', addCategory);
    // Remove last category
    $('#remove-category').on('click', removeCategory);

    // LOAD/SAVE PAGE
    // Print to PDF
    $('#printDecisionMakingReportPDF').on('click', printDecisionMakingReportPDF);

    // Save project button
    $('#saveProject').on('click', saveProject);

    // Reset project button
    $('#reset-button').on('click', resetProject);

    // Load example project button
    $('#loadExample-button').on('click', loadExampleProject);

    // TAB NAVIGATION
    // Next button on each tab to simulate click on tab
    $('.go-tab-0-btn').on('click', btnGoTab0);
    $('.go-tab-1-btn').on('click', btnGoTab1);
    $('.go-tab-2-btn').on('click', btnGoTab2);
    $('.go-tab-3-btn').on('click', btnGoTab3);
    // Scroll to top buttons (if needed)
    $("#scroll-up-btn").click(scrollToTop);
}
// Remove and reset listeners on dynamic content
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
    // Input change listener - FOR INPUT CELLS ON SUMMARY PAGE - to force data update
    $('input.summaryInput').on('focusout', updateData);
}

// Check all buttons and enable/disable based on conditions - called by update
function checkButtons() {
    // Problem Setup page
    // Alternatives data entry
    // Disable remove button on load if count <= min number
    if (problemManager.getAltLength() <= minAltCount) {
        disableButton("#remove-alternative");
    }
    // Enable remove button if count > minAltCount
    if (problemManager.getAltLength() > minAltCount) {
        enableButton("#remove-alternative");
    }
    // Disable add button if count >= max number
    if (problemManager.getAltLength() >= maxAltCount) {
        disableButton("#add-alternative");
        // Enable remove button
        enableButton("#remove-alternative");
    }
    // Enable add button if count < maxAltCount
    if (problemManager.getAltLength() < maxAltCount) {
        enableButton("#add-alternative");
    }
    // Categories data entry
    // << IF LIMIT TO NUMBER OF CATEGORIES, ADD HERE
    // Enable remove button
    if (problemManager.getCategoryLength() > 1) {
        enableButton("#remove-category");
    }
    // Disable remove button if count <= min number
    if (problemManager.getCategoryLength() <= 1) {
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
    // check for inconsistent data in Data Entry page and call Data Entry tab on delay
    if (dataEntryGroupFault) {
        setTimeout(goTab2, delayInMillisecondsForward);
    }
    // check for inconsistent data in Summary page and call Summary tab on delay
    if (summaryWeightsFault) {
        setTimeout(goTab3, delayInMillisecondsForward);
    }

    updateData();
    scrollToTop();
}

// Stop infinite update loop created by forcing tab change due to group fault
function resetTabClick() {
    console.log("TIMER RESET");
    simTabClicked = false;
}

// Simulate click on MDL tabs
// Problem Setup
function goTab0() {
    $(".mdl-layout__tab:eq(0) span").click();
}
// Data Entry
function goTab1() {

    $(".mdl-layout__tab:eq(1) span").click();
    scrollToTop();
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
        scrollToTop();
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
        scrollToTop();
    }
}
// Instructions
function goTab4() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(4) span").click();
    scrollToTop();
}
// Save/Load
function goTab5() {
    // alert("TEST");
    $(".mdl-layout__tab:eq(5) span").click();
    scrollToTop();
}

// Next and Back button functions - call data update then tab change
// Buttons to Problem Setup
function btnGoTab0() {
    updateData();
    goTab0();
    console.log("to Problem Setup");
}
// Buttons to Data Entry
function btnGoTab1() {
    updateData();
    goTab1();
    console.log("to Data Entry");
}

// Buttons to Summary
function btnGoTab2() {
    updateData();
    goTab2();
    console.log("to Summary");
}

// Buttons to Results
function btnGoTab3() {
    updateData();
    goTab3();
    console.log("to Results");
}


////////////////// NAVIGATION /////////////////

// NAVIGATION





//////////////// ALTERNATIVES ////////////////
// Adds alternative with blank name
function addAlternative() {
    // Add alternative to data model
    problemManager.addAlternative('');
    // Update interface
    update();
}

// Remove last row from alternative array
function removeAlternative() {
    // Remove last alternative from array
    problemManager.removeAlternative();
    // Update interface
    update();
}
//////////////// ALTERNATIVES ////////////////


////////////////// CATEGORIES ///////////////////
// Adds category with blank name
function addCategory() {
    // Add category to data model
    problemManager.addCategory('');
    // Reset aggregated weights on Summary page
    problemManager.forceCategoryWeightsCalc();
    // Update interface
    update();
}

// Remove last row from Categories array
function removeCategory() {
    // Remove last category from array
    problemManager.removeCategory();
    // Reset aggregated weights on Summary page
    problemManager.forceCategoryWeightsCalc();
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
    console.log('category name: ' + problemManager.getCategory(0));
    problemManager.addCriterionTo(problemManager.getCategory(categoryId), '');
    // Update interface
    update();
}

// Remove last row from criteria array of relevent category object
function removeCriteria(event) {
    // Capture which category to add criteria too
    var categoryId = $(event.currentTarget).attr('data-id');
    // Remove last criteria from array
    problemManager.removeCriterionFrom(problemManager.getCategory(categoryId));
    // Update interface
    update();
}
/////////////////// CRITERIA //////////////////




/////////////////// UPDATE ////////////////////

// Update all ractive components - ADD NEW RACTIVES HERE
function updateRactives() {
    ractiveTitle.update();
    ractiveAlternatives.update();
    ractiveCategories.update();
    ractiveData.update();
    ractiveSummary.update();
    ractiveCategoryWeights.update();
    ractiveAggregatedBeliefs.update();
    ractiveDistributedIgnorance.update();
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
    console.log(problemManager.problem);

    // Check data entry buttons and enable/disable where necessary
    checkButtons();

    // Update interface - check group totals and alter table colours warning of problems
    updateInterface();
}

// Save data to localStorage
function saveLocal() {
    problemManager.saveLocal();
}

// UPDATE DATA calculation - on tab change AND ractive changes on Results page
function updateData() {
    problemManager.update();
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
    criteriaErrors = problemManager.checkCriteriaWeights();

    // reset all criteria weights colours to green
    $('.criteriaReset').addClass('hlGreen').removeClass('hlWarningRed');

    // set cell colours for problem rows to red
    // loop over each error
    for (var i = 0; i < criteriaErrors.length; i++) {
        $('.category' + criteriaErrors[i].category + '.criteria' + criteriaErrors[i].criteria).addClass('hlWarningRed').removeClass('hlBlue');
    }

    // Check weights total for each category - record problem categories
    categoryErrors = problemManager.checkCategoryWeights();
    // set cell colours for problem columns to red
    for (var i = 0; i < problemManager.getCategoryLength(); i++) {
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

    // check aggregation weights total - set summaryWeightsFault to TRUE if problem
    // (checkAggregatedWeightsOk() returns true if total 100 so negate)
    summaryWeightsFault = !problemManager.checkAggregatedWeightsOk();
    // set cell colours for aggregation weights column to red
    if (summaryWeightsFault) {
        $('.aggregatedWeight').addClass('hlWarningRed').removeClass('hlGreen');
    } else {
        $('.aggregatedWeight.hlWarningRed').addClass('hlGreen').removeClass('hlWarningRed');
    }
}


/////////////////// UPDATE ////////////////////

//////////// PRINT / LOAD / SAVE //////////////

// Print project reults to PDF
function printDecisionMakingReportPDF() {
    // Default values
    var TOP_MARGIN = 60;
    var LEFT_MARGIN = 55;

    // X and Y values of cursor - incerement Y for each line of text and set to bottom of table with pdf.autoTable.previous.finalY + Yincrement
    var pdfX = LEFT_MARGIN;
    var pdfY = TOP_MARGIN;
    var Yincrement = 20;
    var buffer = 20;
    var columnStyles = {}; // properties for dynamic column styles
    var resultsColumnStyles = {};
    var firstColumnWidth = 100;
    var dataColumnWidth = 67;
    var summaryColumnWidth = 80;
    var lastColumnWidth = 48;
    var tableFontSize = 8;
    var notesWidth = 485;

    // Generate new document
    // var pdf = new jsPDF('p', 'pt', 'a4');
    var pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
    });

    // Heading
    pdf.setFontStyle('bold');
    pdf.text("Decision Making Report", pdfX, pdfY);
    // Project name
    pdf.setFontStyle('normal');
    pdf.setFontSize(14);
    pdf.text("Project title: " + problemManager.problem.name, pdfX, pdfY += Yincrement);
    var today = new Date();
    var date = today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear();
    pdf.text("Report date: " + date, pdfX, pdfY += Yincrement);


    // NOTES - PROJECT SETUP PAGE
    columnStyles[0] = {
        columnWidth: notesWidth
    };

    // PRINT NOTES TABLE
    pdf.autoTable(['Project Setup Page Notes'],
    [[problemManager.problem.setupNotes]], {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak'
        },
        columnStyles: columnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Data inputs
    pdf.setFontStyle('bold');
    pdf.text("Data Inputs", pdfX, pdfY += Yincrement);

    // DATA ENTRY TABLES
    // Construct and print each category table
    var cats = problemManager.problem.categories;

    // generate array of alternatives to append to header row
    var alternativeNames = []; // array storing list of alternative names
    for (var i = 0; i < problemManager.problem.alternatives.length; i++) {
        alternativeNames.push(problemManager.problem.alternatives[i]);
        // set column widths for each alternative
        columnStyles[i + 1] = {
            columnWidth: dataColumnWidth
        };
    }

    // Complete first and last column widths
    columnStyles[0] = {
        columnWidth: firstColumnWidth
    };
    columnStyles[alternativeNames.length + 1] = {
        columnWidth: lastColumnWidth
    };

    // console.log("COLUMNSTYLES");
    // console.log(columnStyles);


    // Generate and print data input table for each category
    for (var i = 0; i < cats.length; i++) {
        // Temp store current working category
        var cat = cats[i];
        var rows = []; // stores array of rows

        // Construct header row
        var header = [];
        header.push(cat.name)
        // add alternatives
        header = header.concat(alternativeNames);
        // append with 'Weights'
        header.push('Weight');

        // generate row for each criteria
        for (var j = 0; j < cat.criteria.length; j++) {
            // Temp store current working criteria
            var crit = cat.criteria[j];
            var criteriaRow = []; // stores name, weights + category weights
            // Push criteria name
            criteriaRow.push(crit.name);
            // push weight for each alternative
            for (var k = 0; k < alternativeNames.length; k++) {
                criteriaRow.push(crit.alternativeWeights[k]);
            }
            // Push criteria weight for category
            criteriaRow.push(crit.weight);

            // push completed criteria row to rows results array for printing
            rows.push(criteriaRow);
        }

        // PRINT TABLE
        pdf.autoTable(header, rows, {
            startY: pdfY + Yincrement,
            showHeader: 'firstPage',
            tableWidth: 'wrap',
            margin: {
                left: pdfX
            },
            styles: {
                fontSize: tableFontSize,
                overflow: 'linebreak'
            },
            columnStyles: columnStyles
        });
        // Record bottom of table
        pdfY = pdf.autoTable.previous.finalY;



        // console.log("HEADER ROW - " + cat.name);
        // console.log(header);
        // console.log("FINAL ROWS - " + cat.name);
        // console.log(rows);
    }

    // NOTES - DATA ENTRY PAGE
    columnStyles[0] = {
        columnWidth: notesWidth
    };

    // PRINT NOTES TABLE
    pdf.autoTable(['Data Entry Page Notes'],
    [[problemManager.problem.dataEntryNotes]], {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak'
        },
        columnStyles: columnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;
    // Reset first column width for next table
    columnStyles[0] = {
        columnWidth: firstColumnWidth
    };




    // SUMMARY
    // new page
    pdf.addPage();
    // Reset pdfY for
    pdfY = TOP_MARGIN;
    pdf.setFontSize(16);
    pdf.text("Summary", pdfX, pdfY);

    // Agregated results table
    pdf.setFontSize(14);
    pdf.text("Aggregated Degrees of Belief", pdfX, pdfY += Yincrement);
    // Get data from HTML table
    var elem = document.getElementById("summary-table");
    var res = pdf.autoTableHtmlToJson(elem);

    // PRINT TABLE
    pdf.autoTable(res.columns, res.data, {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak'
        },
        columnStyles: columnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;

    // Assessment Agregation data inputs
    pdf.text("Category Weights", pdfX, pdfY += Yincrement + buffer);

    // header for table
    header = ["Category", "Weight"];
    rows = [];
    // construct rows - category name + weight
    for (var i = 0; i < cats.length; i++) {
        var row = [];
        row.push(cats[i].name);
        row.push(cats[i].weight);
        rows.push(row);
    }

    // PRINT TABLE
    pdf.autoTable(header, rows, {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak'
        },
        columnStyles: columnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // NOTES - SUMMARY PAGE
    columnStyles[0] = {
        columnWidth: notesWidth
    };

    // PRINT NOTES TABLE
    pdf.autoTable(['Summary Page Notes'],
    [[problemManager.problem.summaryNotes]], {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak'
        },
        columnStyles: columnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;
    // Reset first column width for next table
    columnStyles[0] = {
        columnWidth: firstColumnWidth
    };



    // RESULTS
    pdf.setFontSize(16);
    pdf.text("Results", pdfX, pdfY += Yincrement + buffer);

    //Set results column widths
    for (var i = 0; i < alternativeNames.length; i++) {
        // set column widths for each alternative
        resultsColumnStyles[i] = {
            columnWidth: summaryColumnWidth
        };
    }
    resultsColumnStyles[alternativeNames.length] = {
        columnWidth: 65
    };


    // Aggregated Degrees of Belief table
    pdf.text("Aggregated Degrees of Belief", pdfX, pdfY += Yincrement + buffer);

    var elem = document.getElementById("aggregated-beliefs-table");
    var res = pdf.autoTableHtmlToJson(elem);


    // PRINT TABLE
    pdf.autoTable(res.columns, res.data, {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: 10,
            overflow: 'linebreak'
        },
        columnStyles: resultsColumnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // Distributed Ignorance table
    pdf.text("Distributed Ignorance", pdfX, pdfY += Yincrement + buffer);

    elem = document.getElementById("distributed-ignorance-table");
    res = pdf.autoTableHtmlToJson(elem);

    // PRINT TABLE
    pdf.autoTable(res.columns, res.data, {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: 10,
            overflow: 'linebreak'
        },
        columnStyles: resultsColumnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;


    // NOTES - RESULTS PAGE
    columnStyles[0] = {
        columnWidth: notesWidth
    };

    // PRINT NOTES TABLE
    pdf.autoTable(['Results Page Notes'],
    [[problemManager.problem.resultsNotes]], {
        startY: pdfY + Yincrement,
        showHeader: 'firstPage',
        tableWidth: 'wrap',
        margin: {
            left: pdfX
        },
        styles: {
            fontSize: tableFontSize,
            overflow: 'linebreak'
        },
        columnStyles: columnStyles
    });
    // Record bottom of table
    pdfY = pdf.autoTable.previous.finalY;
    // Reset first column width for next table
    columnStyles[0] = {
        columnWidth: firstColumnWidth
    };



    // Genegrate footer on each page
    pdfSetFooter(pdf);

    pdf.save(problemManager.problem.name + ' Decision Making Report.pdf');

    showProjectPrintedDialogue(problemManager.problem.name);
}

// Sets footer on each page of pdf
function pdfSetFooter(pdfObject) {
    var number_of_pages = pdfObject.internal.getNumberOfPages()
    var pdf_pages = pdfObject.internal.pages
    var today = new Date();
    var date = today.getDate() + "/" + (today.getMonth()+1) + "/" + today.getFullYear();
    var myFooter = "Decision Making Report: " + problemManager.problem.name + ' - ' + date
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
    // Construct filename
    var fileName = 'DSS-Decision-Making-' + problemManager.problem.name + ".json"; //DSS-Problem
    // Save file
    saveOBJECTasJSONfile(problemManager.getProblem(), fileName);
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
    if (dataFromFile.type === 'decision_making') {
        // correct prooject type
        // Set data model to loaded data
        problemManager.setProblem(dataFromFile);
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
    problemManager.resetProject();
    // Reset ractive bindings
    setRactives();
    update();
    showProjectResetDialogue();
}

// Load example project
function loadExampleProject() {
    problemManager.loadExample();
    // Reset ractive bindings
    setRactives();
    update();
    showProjectExampleLoadedDialogue();
}


//////////////// LOAD / SAVE //////////////////

////////////////// DIALOGS ///////////////////

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
        text: 'Reselect a <b>DSS-Decision-Making-</b>&lt;ProjectTitle&gt;.json file:\nCurrent project unchanged'.split('\n').join('<br>'),
        negative: {
            title: 'Continue'
        }
    });
}
// Warning dialog for project load file fail
function showProjectLoadSuccessDialogue() {
    showDialog({
        title: 'Project loaded',
        text: '<b>' + problemManager.problem.title + '</b> project loaded successfuly',
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


////////////////// DIALOGS ///////////////////

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
  content.stop().animate({ scrollTop: target }, "fast");
};

var scrollToTop = function() {
  scrollTo(true);
};

var scrollToBottom = function() {
  scrollTo(false);
};

///////// GENERAL HELPER FUNCTIONS ////////////
