/*jshint esversion: 6 */

class ProjectManager {

    constructor() {

        // Create Model object for calculations
        //this.model = new DSS_model();

        // TEMP initialise problem - later remove for local storage check below
        this.initialiseProject();

        // // IF localStorage present, load storage, otherwise intialise problem
        // if (localStorage.getItem('problemData') != null) {
        //     this.loadLocal();
        // } else {
        //     // Create and initialise new data objects
        //     this.initialiseProject();
        // }
    }

    // Create new data object and initialise
    initialiseProject() {
        // Create empty copy of Problem data object and set this.project to it
        this.setBlankProject("TEST PROJECT NAME");

        console.log("EMPTY PROJECT IN INITIALISE");
        console.log(this.project);

    }

    // Create blank project and set this.project
    setBlankProject(projectName) {
        // Create blank project (deep copy clone) and name
        this.project = JSON.parse(JSON.stringify(Project));
        this.project.name = projectName;
        // Add single category
        this.addCategory("TEST CATEGORY");
    }
    // Return project data object
    getProject() {
        return this.project;
    }
    // Add cetegory with categoryName
    addCategory(categoryName) {
        // Create blank category (deep copy clone) and name
        let newCat = JSON.parse(JSON.stringify(Category));
        newCat.name = categoryName;
        // Push category to array and capture index
        let catSize = this.project.categories.push(newCat);
        // Add single Risk with weight = 100 (as new category need single Risk)
        let cat = this.getCategory(catSize-1);
        this.addRiskTo(cat, "TEST RISK", 100);
        // Return added category
        return cat;
    }
    // Remove last category
    removeCategory() {
        this.project.categories.pop();
    }
    // Return length of Categories array
    getCategoryLength() {
        return this.project.categories.length;
    }
    // Return category of ID
    getCategory(id) {
        return this.project.categories[id];
    }

    // Add risk to categoru with riskName and riskWeight
    addRiskTo(category, riskName, riskWeight) {
        // Create blank risk (deep copy clone), name and set weight
        let newRisk = JSON.parse(JSON.stringify(Risk));
        newRisk.name = riskName;
        newRisk.weight = riskWeight;
        // Push to risk array of selected category
        category.risks.push(newRisk);
        // Return added risk
        return newRisk;
    }
    // Remove last risk from category
    removeRiskFrom(category) {
        category.risks.pop();
    }

}
