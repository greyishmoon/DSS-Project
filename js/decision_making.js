var problem;

$(document).ready(function() {
    console.log("ready!");

    // TODO - refactor to only create new project if one not loaded in local memory
    //	// Initialise Problem object
    problem = new Problem("EMPTY");
    console.log("prob name test: " + problem.title);

    // LISTENERS
    // Tab button LISTENERS
    $('.mdl-layout__tab').on('click', tabClicked);
    // ALTERNATIVES
    // Add row to alternative-table
    $('#add-alternative').on('click', addBlankAlternative);
    // Place first row
    addBlankAlternative();
    // Remove last row from alternative-table
    $('#remove-alternative').on('click', removeAlternative);
    // FACTORS
    // Add row to alternative-table
    $('#add-factor').on('click', addBlankFactor);
    // Place first row
    addBlankFactor();
    // Remove last row from alternative-table
    $('#remove-factor').on('click', removeFactor);
    // Input change listener - whenever focus leaves input update data object
    $('input').on('focusout', update);
    // SET LISTENERS ON DYNAMIC CONTENT
    setListeners();

    function inputChange(event) {
        console.log('INPUT CHANGE: ' + $(event.target).val());
    }

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
// Adds alternative with no title
function addBlankAlternative() {
    addAlternative('')
}

// TEMPLATE for row in alternative-table
const AlternativeRow = ({
    name
}) => `
  <tr>
    <td class="mdl-data-table__cell--non-numeric narrow">
      <div class="mdl-textfield mdl-js-textfield">
        <input class="mdl-textfield__input alternative" type="text" value="${name}">
        <label class="mdl-textfield__label">Alternative...</label>
      </div>
    </td>
  </tr>
`;

function addAlternative(alternativeName) {
    $('#alternative-table tbody').append([{
        name: alternativeName
    }, ].map(AlternativeRow));
    // Upgrade all added MDL elements
    upgradeMDL();
    // Reset listeners on all dynamic content
    setListeners();
}

// Remove last row from alternative-table
function removeAlternative() {
    removeLastRow("#alternative-table")
    // Reset listeners on all dynamic content
    setListeners();
}
//////////////// ALTERNATIVES ////////////////


////////////////// FACTORS ///////////////////
// Adds factor with no title
function addBlankFactor() {
    addFactor('')
}

// TEMPLATE for row in factors-table
const FactorRow = ({
    name
}) => `
  <tr>
    <td class="mdl-data-table__cell--non-numeric narrow">
      <div class="mdl-textfield mdl-js-textfield">
        <input class="mdl-textfield__input factor" type="text" value="${name}">
        <label class="mdl-textfield__label">Factor...</label>
      </div>
    </td>
  </tr>
`;

function addFactor(factorName) {
    $('#factors-table tbody').append([{
        name: factorName
    }, ].map(FactorRow));
    // Upfrade all added MDL elements
    upgradeMDL();
    // Reset listeners on all dynamic content
    setListeners();
}

// Remove last row from alternative-table
function removeFactor() {
    removeLastRow("#factors-table")
    // Reset listeners on all dynamic content
    setListeners();
}
/////////////////// FACTORS ///////////////////


/////////////////// UPDATE ////////////////////
// UPDATE DATA OBJECT WITH CURRENT FORM DATA
function update(event) {
    // TEMP note changed text
    //console.log('INPUT CHANGE: ' + $(event.target).val());

    // Capture title
    problem.title = $('#problem-title').val();
    // Capture Alternatives
    var altArray = [];
    $("#alternative-table tbody tr").each(function() {
      altArray.push($(this).find("input.alternative").val());
      problem.alternatives = altArray;
    });
    // Capture Factors
    var factArray = [];
    $("#factors-table tbody tr").each(function() {
      var inputVal = $(this).find("input.factor").val();
      factArray.push(new Factor(inputVal));
      problem.factors = factArray;
    });

    // TEMP print object to test-div
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
}
