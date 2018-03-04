
var project;

$(document).ready(function () {
	console.log("ready!");

	// TODO - refactor to only create new project if one not loaded in local memory
	//	// Initialise Project object
	project = new Project("EMPTY");
console.log("proj name test: " + project.name);

	// CATEGORY TABLE
	// Add initial row automatically
	//TODO - refactor this to load function - needs to have values if project already loaded
	addBlankCategory();
	// LISTENERS
	// Tab button LISTENERS
	$('.mdl-layout__tab').on('click', tabClicked);
	// Add row to category-table
	$('#add-category').on('click', addBlankCategory);
	// Remove checked rows from category-table
	$('#delete-categories').on('click', removeCategories);
	// TODO - amend this to capture any change and update data model
	// Capture data entered into main project page
	// $('#submit-project-data').on('click', submit);

	// RISK TABLES

	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
		console.log('The File APIs SUPPORTED.');
	} else {
		alert('File saving is not fully supported in this browser.');
	}

});

// NAVIGATION
function tabClicked() {
	window.scrollTo(0, 0);
	console.log("TAB CLICKED");
}


// FUNCTION: Add blank category row to category-table
// Row template
const CategoryRow = ({
    title
}) => `
  <tr>
    <td class='mdl-data-table__cell--non-numeric'>
      <div class='mdl-textfield mdl-js-textfield'>
        <input class='mdl-textfield__input' type='text' id='project-title' value='${title}'>
        <label class='mdl-textfield__label' for='project-title'>Risk Category...</label>
      </div>
    </td>
    <td class='mdl-data-table__cell--center'>
      <label class='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select'>
      <input type='checkbox' class='mdl-checkbox__input' name='categorySelect'/>
      </label>
    </td>
  </tr>
`;

// Adds category with no title - used for adding on.click event
function addBlankCategory() {
	console.log('addBlankCategory');
	addCategory('')
}

// Adds category insrting name into
function addCategory(title) {

	var categoryRow = "<tr><td class='mdl-data-table__cell--non-numeric'><div class='mdl-textfield mdl-js-textfield'><input class='mdl-textfield__input' type='text' id='project-title' value=''><label class='mdl-textfield__label' for='project-title'>Risk Category...</label></div></td><td class='mdl-data-table__cell--center'><label class='mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect mdl-data-table__select'><input type='checkbox' class='mdl-checkbox__input' name='categorySelect'/></label></td></tr>";

    $('#category-table tbody').append(categoryRow);


	// $('#category-table tbody').html([{
    //         title: title
    //     },
    //     {
    //         title: 'Test 2'
    //     },
    // ].map(CategoryRow).join(''));

	// Required to register check boxes with MDL after dynamic loading
	componentHandler.upgradeDom('MaterialCheckbox');
	componentHandler.upgradeDom('MaterialTextfield');

	//TODO - TESTING - REMOVE
	update();
}

// FUNCTION: Remove all checked category rows from category-table
function removeCategories() {
	var tableBody = $("#category-table");

	var rowCount = $("#category-table tbody tr").length;

	var rowCount2 = $("#category-table tbody tr").length;

	var rowCount = 0;
	$("#category-table tbody").find('input[name="categorySelect"]').each(function () {
		if ($(this).is(":checked")) {
			$(this).parents("tr").remove();
			// Print which row numbers are checked - 0 as 1st row
			// TODO ?? Use to remove category blocks from Risk Categories tab ??
			console.log(rowCount);
		}
		rowCount++;
	});
}

// FUNCTION: Capture form data to project object
function update() {
	console.log("Update called");
	// NOTE: VALIDATION REQUIRED (prompt for input if empty)
	project.name = $('#project-title').val();
	// NOTE: VALIDATION REQUIRED (prompt for input if empty)
	project.cost = $('#project-cost').val();

	// Iterate over table and look for 'category' inputs
	// reset catagories
	project.categories = [];
	// NOTE: VALIDATION REQUIRED (prompt for input if empty)
	$("#category-table tbody").find('input[id="category"]').each(function () {

		// push value of inputs found to categories array
		// NOTE: later change this to categories object (name)
		project.categories.push($(this).val());
	});

	// TEST print project data
	printProject();
}


function printProject() {

	var printout = "TEMP... project data printout...<br>"
	printout += "<br>project.name: " + project.name;
	printout += "<br>project.cost: " + project.cost;
	project.categories.forEach(function(element) {
		printout += "<br>project.category: " + element;
	});

	var length = project.categories.length;
	console.log(length);

	$("#test-div").html(printout);
}
